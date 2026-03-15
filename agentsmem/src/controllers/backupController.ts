import { createHash } from 'crypto';
import type { Response } from 'express';
import type { SessionAuthenticatedRequest } from '../middleware/sessionAuth.js';
import { createBackup, findBackupByFileIdForUser, listBackupsForUser } from '../services/backupService.js';

function isMd5(value: string): boolean {
  return /^[a-f0-9]{32}$/i.test(value);
}

function toBuffer(body: unknown): Buffer | null {
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }
  return null;
}

function normalizeHeaderValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }
  return value?.trim() || null;
}

export async function uploadBackup(req: SessionAuthenticatedRequest, res: Response): Promise<void> {
  try {
    const ciphertextMd5 = normalizeHeaderValue(req.headers['x-ciphertext-md5']);
    if (!ciphertextMd5 || !isMd5(ciphertextMd5)) {
      res.status(400).json({ error: 'x-ciphertext-md5 header is required and must be a 32-character hex md5' });
      return;
    }

    const blob = toBuffer(req.body);
    if (!blob) {
      res.status(400).json({ error: 'binary request body is required' });
      return;
    }

    const computedMd5 = createHash('md5').update(blob).digest('hex');
    if (computedMd5 !== ciphertextMd5.toLowerCase()) {
      res.status(400).json({
        error: 'ciphertext md5 mismatch',
        expected: ciphertextMd5.toLowerCase(),
        actual: computedMd5,
      });
      return;
    }

    const filePath = normalizeHeaderValue(req.headers['x-file-path']) ?? '/backup.bin';
    const fileName = normalizeHeaderValue(req.headers['x-file-name']) ?? null;
    const contentType = normalizeHeaderValue(req.headers['content-type']) ?? 'application/octet-stream';

    const result = await createBackup({
      userId: req.userId!,
      agentId: req.agentId!,
      fileName,
      filePath,
      ciphertextMd5: computedMd5,
      contentType,
      blob,
    });

    if (result.alreadyExisted) {
      res.status(200).json({ status: 'ok', backup: result.summary, already_backed_up: true });
      return;
    }
    res.status(201).json({ status: 'ok', backup: result.summary });
  } catch (error) {
    console.error('Upload backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listBackups(req: SessionAuthenticatedRequest, res: Response): Promise<void> {
  try {
    const limit = parseInt(String(req.query.limit ?? ''), 10) || undefined;
    const offset = parseInt(String(req.query.offset ?? ''), 10) || undefined;
    const result = await listBackupsForUser(req.userId!, { limit, offset });
    res.json({ items: result.items, total: result.total });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function downloadBackup(req: SessionAuthenticatedRequest, res: Response): Promise<void> {
  try {
    const fileId = String(req.params.file_id ?? '').trim();
    if (!fileId) {
      res.status(400).json({ error: 'file_id is required' });
      return;
    }

    const backup = await findBackupByFileIdForUser(req.userId!, fileId);
    if (!backup) {
      res.status(404).json({ error: 'backup not found' });
      return;
    }

    const safeFileName = backup.file_name.replace(/[^A-Za-z0-9._-]/g, '_');
    res.setHeader('Content-Type', backup.content_type || 'application/octet-stream');
    res.setHeader('Content-Length', String(backup.blob_data.length));
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName || 'backup.bin'}"`);
    res.setHeader('X-Ciphertext-Md5', backup.ciphertext_md5);
    res.setHeader('X-File-Path', backup.file_path);
    res.send(backup.blob_data);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
