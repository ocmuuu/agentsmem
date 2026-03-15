import { basename } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../models/db.js';
import type { BackupDownload, BackupSummary } from '../models/backup.js';
import { encryptField, decryptField } from '../utils/crypto.js';

const pool = getPool();

function normalizeString(value: string | undefined | null, fallback: string): string {
  const trimmed = String(value ?? '').trim();
  return trimmed || fallback;
}

function decryptBuf(buf: unknown): string {
  if (buf && Buffer.isBuffer(buf)) return decryptField(buf);
  return '';
}

function backupRowToSummary(row: import('mysql2').RowDataPacket): BackupSummary {
  const content_type =
    decryptBuf(row.content_type_ciphertext) || 'application/octet-stream';
  return {
    id: row.id,
    file_id: row.file_id,
    user_id: row.user_id,
    agent_id: row.agent_id,
    agent_name: decryptBuf(row.agent_name_ciphertext),
    file_name: decryptBuf(row.file_name_ciphertext),
    file_path: decryptBuf(row.file_path_ciphertext),
    ciphertext_md5: row.ciphertext_md5,
    file_size_bytes: Number(row.file_size_bytes),
    content_type,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
  };
}

export function resolveBackupFileName(fileName: string | undefined | null, filePath: string): string {
  const normalizedPath = normalizeString(filePath, '/');
  const leaf = basename(normalizedPath);
  return normalizeString(fileName, leaf === '/' ? 'backup.bin' : leaf || 'backup.bin');
}

/** Find an existing backup for this agent with the same ciphertext MD5 (avoid duplicate uploads). */
export async function findExistingBackupByAgentAndMd5(
  agentId: string,
  ciphertextMd5: string
): Promise<BackupSummary | null> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    `SELECT
       b.id,
       b.file_id,
       b.user_id,
       b.agent_id,
       a.agent_name_ciphertext,
       b.file_name_ciphertext,
       b.file_path_ciphertext,
       b.ciphertext_md5,
       b.file_size_bytes,
       b.content_type_ciphertext,
       b.timestamp
     FROM backups b
     JOIN agents a ON a.id = b.agent_id
     WHERE b.agent_id = ? AND b.ciphertext_md5 = ?
     ORDER BY b.timestamp DESC
     LIMIT 1`,
    [agentId, ciphertextMd5.toLowerCase()]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return backupRowToSummary(row);
}

export type CreateBackupResult = { summary: BackupSummary; alreadyExisted: boolean };

export async function createBackup(params: {
  userId: string;
  agentId: string;
  fileName?: string | null;
  filePath?: string | null;
  ciphertextMd5: string;
  contentType?: string | null;
  blob: Buffer;
}): Promise<CreateBackupResult> {
  const normalizedMd5 = params.ciphertextMd5.toLowerCase();
  const existing = await findExistingBackupByAgentAndMd5(params.agentId, normalizedMd5);
  if (existing) {
    return { summary: existing, alreadyExisted: true };
  }

  const backupId = uuidv4();
  const blobId = uuidv4();
  const fileId = uuidv4();
  const filePath = normalizeString(params.filePath, `/${resolveBackupFileName(params.fileName, '/')}`);
  const fileName = resolveBackupFileName(params.fileName, filePath);
  const contentType = normalizeString(params.contentType, 'application/octet-stream');
  const filePathCiphertext = encryptField(filePath);
  const fileNameCiphertext = encryptField(fileName);
  const contentTypeCiphertext = encryptField(contentType);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      'INSERT INTO backup_blobs (id, storage_provider, blob_data) VALUES (?, ?, ?)',
      [blobId, 'db', params.blob]
    );
    await conn.execute(
      `INSERT INTO backups (
         id, user_id, agent_id, blob_id, file_id, file_name_ciphertext, file_path_ciphertext,
         ciphertext_md5, file_size_bytes, content_type_ciphertext
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        backupId,
        params.userId,
        params.agentId,
        blobId,
        fileId,
        fileNameCiphertext,
        filePathCiphertext,
        normalizedMd5,
        params.blob.length,
        contentTypeCiphertext,
      ]
    );
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const summary = await findBackupSummaryByFileId(params.userId, fileId);
  if (!summary) {
    throw new Error('BACKUP_CREATE_FAILED');
  }
  return { summary, alreadyExisted: false };
}

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 200;

export async function listBackupsForUser(
  userId: string,
  opts?: { limit?: number; offset?: number; agentId?: string }
): Promise<{ items: BackupSummary[]; total: number }> {
  const limit = Math.min(Math.max(opts?.limit ?? DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT);
  const offset = Math.max(opts?.offset ?? 0, 0);
  const agentId = opts?.agentId;

  const whereClause = agentId
    ? 'WHERE b.user_id = ? AND b.agent_id = ?'
    : 'WHERE b.user_id = ?';
  const whereParams = agentId ? [userId, agentId] : [userId];

  const [[countRow]] = await pool.execute<import('mysql2').RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM backups b ${whereClause}`,
    whereParams
  );
  const total = Number(countRow.total);

  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    `SELECT
       b.id,
       b.file_id,
       b.user_id,
       b.agent_id,
       a.agent_name_ciphertext,
       b.file_name_ciphertext,
       b.file_path_ciphertext,
       b.ciphertext_md5,
       b.file_size_bytes,
       b.content_type_ciphertext,
       b.timestamp
     FROM backups b
     JOIN agents a ON a.id = b.agent_id
     ${whereClause}
     ORDER BY b.timestamp DESC, b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...whereParams, limit, offset]
  );

  return { items: rows.map((row) => backupRowToSummary(row)), total };
}

export async function findBackupSummaryByFileId(
  userId: string,
  fileId: string
): Promise<BackupSummary | null> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    `SELECT
       b.id,
       b.file_id,
       b.user_id,
       b.agent_id,
       a.agent_name_ciphertext,
       b.file_name_ciphertext,
       b.file_path_ciphertext,
       b.ciphertext_md5,
       b.file_size_bytes,
       b.content_type_ciphertext,
       b.timestamp
     FROM backups b
     JOIN agents a ON a.id = b.agent_id
     WHERE b.user_id = ? AND b.file_id = ?
     LIMIT 1`,
    [userId, fileId]
  );
  if (rows.length === 0) return null;
  return backupRowToSummary(rows[0]);
}

export async function findBackupByFileIdForUser(
  userId: string,
  fileId: string
): Promise<BackupDownload | null> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    `SELECT
       b.id,
       b.file_id,
       b.user_id,
       b.agent_id,
       a.agent_name_ciphertext,
       b.file_name_ciphertext,
       b.file_path_ciphertext,
       b.ciphertext_md5,
       b.file_size_bytes,
       b.content_type_ciphertext,
       b.timestamp,
       bb.blob_data
     FROM backups b
     JOIN agents a ON a.id = b.agent_id
     JOIN backup_blobs bb ON bb.id = b.blob_id
     WHERE b.user_id = ? AND b.file_id = ?
     LIMIT 1`,
    [userId, fileId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    ...backupRowToSummary(row),
    blob_data: Buffer.isBuffer(row.blob_data) ? row.blob_data : Buffer.from(row.blob_data),
  };
}

/** Delete a backup by file_id for the given user. Returns true if deleted, false if not found. */
export async function deleteBackupByFileId(userId: string, fileId: string): Promise<boolean> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, blob_id FROM backups WHERE user_id = ? AND file_id = ? LIMIT 1',
    [userId, fileId]
  );
  if (rows.length === 0) return false;

  const blobId = rows[0].blob_id as string;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM backups WHERE user_id = ? AND file_id = ?', [userId, fileId]);
    await conn.execute('DELETE FROM backup_blobs WHERE id = ?', [blobId]);
    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
