import { getPool } from '../models/db.js';
import { decryptField } from '../utils/crypto.js';
import { findAgentsByUserId } from './agentService.js';

const pool = getPool();

function decryptBuf(buf: unknown): string | null {
  if (!buf) return null;
  if (Buffer.isBuffer(buf)) return decryptField(buf);
  return null;
}

export interface DashboardAgent {
  id: string;
  name: string;
  handle: string;
  created_at: string;
}

export interface DashboardData {
  agents: DashboardAgent[];
  account: {
    email: string | null;
    has_password: boolean;
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
  const email = decryptBuf(me.email_ciphertext);

  const allAgents = await findAgentsByUserId(userId);
  const agents: DashboardAgent[] = allAgents.map((a) => ({
    id: a.id,
    name: a.agent_name,
    handle: `${a.agent_name}@agentsmem`,
    created_at: toIsoString(a.created_at),
  }));

  return {
    agents,
    account: {
      email,
      has_password: Boolean(me.password_hash),
    },
  };
}
