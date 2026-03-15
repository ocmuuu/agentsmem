import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { getPool } from '../models/db.js';
import type { Agent } from '../models/agent.js';
import { encryptField, decryptField, hashForLookup } from '../utils/crypto.js';

const pool = getPool();
const AGENT_NAME_REGEX = /^[A-Za-z0-9_-]{3,32}$/;

function randomApiKey(): string {
  return randomBytes(32).toString('hex');
}

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function isApiKeyMatch(agent: Agent, apiKey: string): boolean {
  return agent.api_key_hash === hashApiKey(apiKey.trim());
}

export async function registerAgent(agentName: string): Promise<{ agent_name: string; api_key: string }> {
  const id = uuidv4();
  const apiKey = randomApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  const agentNameHash = hashForLookup(agentName);
  const agentNameCiphertext = encryptField(agentName);
  await pool.execute(
    'INSERT INTO agents (id, agent_name_hash, agent_name_ciphertext, api_key_hash) VALUES (?, ?, ?, ?)',
    [id, agentNameHash, agentNameCiphertext, apiKeyHash]
  );
  return { agent_name: agentName, api_key: apiKey };
}

function rowToAgent(r: import('mysql2').RowDataPacket): Agent {
  const agentNameCiphertext = r.agent_name_ciphertext;
  const agent_name =
    agentNameCiphertext && Buffer.isBuffer(agentNameCiphertext)
      ? decryptField(agentNameCiphertext)
      : String(r.agent_name_ciphertext ?? '');
  return {
    id: r.id,
    user_id: r.user_id ?? null,
    agent_name,
    api_key_hash: r.api_key_hash,
    created_at: r.created_at,
  };
}

export async function findAgentById(id: string): Promise<Agent | null> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, user_id, agent_name_ciphertext, api_key_hash, created_at FROM agents WHERE id = ?',
    [id]
  );
  if (rows.length === 0) return null;
  return rowToAgent(rows[0]);
}

export async function findAgentByApiKey(apiKey: string): Promise<Agent | null> {
  const apiKeyHash = hashApiKey(apiKey);
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, user_id, agent_name_ciphertext, api_key_hash, created_at FROM agents WHERE api_key_hash = ?',
    [apiKeyHash]
  );
  if (rows.length === 0) return null;
  return rowToAgent(rows[0]);
}

export async function findAgentByName(agentName: string): Promise<Agent | null> {
  const agentNameHash = hashForLookup(agentName);
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, user_id, agent_name_ciphertext, api_key_hash, created_at FROM agents WHERE agent_name_hash = ?',
    [agentNameHash]
  );
  if (rows.length === 0) return null;
  return rowToAgent(rows[0]);
}

/** Resolve "agent_name" or "agent_name@agentsmem" to plain agent name. */
export function normalizeAgentIdentifier(input: string): string {
  const s = input.trim();
  const suffix = '@agentsmem';
  if (s.toLowerCase().endsWith(suffix)) {
    return s.slice(0, -suffix.length).trim();
  }
  return s;
}

export function isValidAgentName(agentName: string): boolean {
  return AGENT_NAME_REGEX.test(agentName);
}

export async function linkAgentToUser(agentId: string, userId: string): Promise<void> {
  await pool.execute('UPDATE agents SET user_id = ? WHERE id = ?', [userId, agentId]);
}

export async function findAgentsByUserId(userId: string): Promise<Agent[]> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, user_id, agent_name_ciphertext, api_key_hash, created_at FROM agents WHERE user_id = ? ORDER BY created_at ASC',
    [userId]
  );
  return rows.map((r) => rowToAgent(r));
}
