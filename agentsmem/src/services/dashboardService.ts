import { getPool } from '../models/db.js';
import { listBackupsForUser } from './backupService.js';
import { decryptField } from '../utils/crypto.js';

const pool = getPool();

function decryptBuf(buf: unknown): string | null {
  if (!buf) return null;
  if (Buffer.isBuffer(buf)) return decryptField(buf);
  return null;
}

export interface DashboardData {
  agent: {
    id: string;
    name: string;
    handle: string;
  };
  account: {
    email: string | null;
    has_password: boolean;
  };
  backups: {
    items: import('../models/backup.js').BackupSummary[];
    total: number;
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

export async function getDashboardForAgent(agentId: string): Promise<DashboardData> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    `SELECT
       a.id,
       a.agent_name_ciphertext,
       u.id AS user_id,
       u.email_ciphertext,
       u.password_hash
     FROM agents a
     JOIN users u ON a.user_id = u.id
     WHERE a.id = ?`,
    [agentId]
  );

  if (rows.length === 0) {
    throw new Error('AGENT_NOT_FOUND');
  }

  const me = rows[0];
  const userId = me.user_id as string;
  const agentName = decryptBuf(me.agent_name_ciphertext) ?? '';
  const email = decryptBuf(me.email_ciphertext);
  const agentPayload = {
    id: me.id,
    name: agentName,
    handle: `${agentName}@agentsmem`,
  };
  const accountPayload = {
    email,
    has_password: Boolean(me.password_hash),
  };
  const backupResult = await listBackupsForUser(userId, { limit: 50 });

  return {
    agent: agentPayload,
    account: accountPayload,
    backups: { items: backupResult.items, total: backupResult.total },
  };
}
