import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getPool } from '../models/db.js';
import type { User } from '../models/user.js';
import { encryptField, decryptField, hashForLookup } from '../utils/crypto.js';

const pool = getPool();
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createUser(params: {
  agentId: string;
  email: string | null;
  password: string;
}): Promise<User> {
  const id = uuidv4();
  const passwordHash = await hashPassword(params.password);
  const normalizedEmail = params.email ? params.email.trim().toLowerCase() : null;
  const emailHash = normalizedEmail ? hashForLookup(normalizedEmail) : null;
  const emailCiphertext = normalizedEmail ? encryptField(normalizedEmail) : null;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      'INSERT INTO users (id, agent_id, email_hash, email_ciphertext, is_claimed, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [id, params.agentId, emailHash, emailCiphertext, 1, passwordHash]
    );
    await conn.execute('UPDATE agents SET user_id = ? WHERE id = ?', [id, params.agentId]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
  const user = await findUserById(id);
  if (!user) throw new Error('createUser: insert succeeded but findUserById returned null');
  return user;
}

function rowToUser(r: import('mysql2').RowDataPacket): User {
  const emailCiphertext = r.email_ciphertext;
  const email =
    emailCiphertext && Buffer.isBuffer(emailCiphertext) ? decryptField(emailCiphertext) : null;
  return {
    id: r.id,
    agent_id: r.agent_id,
    email,
    is_claimed: r.is_claimed,
    password_hash: r.password_hash,
    created_at: r.created_at,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, agent_id, email_ciphertext, is_claimed, password_hash, created_at FROM users WHERE id = ?',
    [id]
  );
  if (rows.length === 0) return null;
  return rowToUser(rows[0]);
}

export async function findUserByAgentId(agentId: string): Promise<User | null> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, agent_id, email_ciphertext, is_claimed, password_hash, created_at FROM users WHERE agent_id = ?',
    [agentId]
  );
  if (rows.length === 0) return null;
  return rowToUser(rows[0]);
}

/** Find the user linked to an agent via agents.user_id (works for any agent, not just the primary). */
export async function findUserForAgent(agentId: string): Promise<User | null> {
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    `SELECT u.id, u.agent_id, u.email_ciphertext, u.is_claimed, u.password_hash, u.created_at
     FROM users u INNER JOIN agents a ON a.user_id = u.id
     WHERE a.id = ?`,
    [agentId]
  );
  if (rows.length === 0) return null;
  return rowToUser(rows[0]);
}

export async function findUsersByEmail(email: string): Promise<User[]> {
  const normalized = email.trim().toLowerCase();
  const emailHash = hashForLookup(normalized);
  const [rows] = await pool.execute<import('mysql2').RowDataPacket[]>(
    'SELECT id, agent_id, email_ciphertext, is_claimed, password_hash, created_at FROM users WHERE email_hash = ?',
    [emailHash]
  );
  return rows.map((r) => rowToUser(r));
}

export async function updateUserEmail(userId: string, email: string | null): Promise<void> {
  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const emailHash = normalizedEmail ? hashForLookup(normalizedEmail) : null;
  const emailCiphertext = normalizedEmail ? encryptField(normalizedEmail) : null;
  await pool.execute(
    'UPDATE users SET email_hash = ?, email_ciphertext = ? WHERE id = ?',
    [emailHash, emailCiphertext, userId]
  );
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  await pool.execute(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, userId]
  );
}

export async function updatePasswordForAllByEmail(email: string, password: string): Promise<number> {
  const normalized = email.trim().toLowerCase();
  const emailHash = hashForLookup(normalized);
  const passwordHash = await hashPassword(password);
  const [result] = await pool.execute<import('mysql2').ResultSetHeader>(
    'UPDATE users SET password_hash = ? WHERE email_hash = ?',
    [passwordHash, emailHash]
  );
  return result.affectedRows;
}
