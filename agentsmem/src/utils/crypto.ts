import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { config } from '../config.js';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;

/** Encrypt plaintext; returns IV + ciphertext + authTag as single buffer (base64-encoded in DB). */
export function encryptField(plaintext: string): Buffer {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, config.encryption.key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]);
}

/** Decrypt buffer produced by encryptField. */
export function decryptField(ciphertext: Buffer): string {
  if (ciphertext.length < IV_LEN + AUTH_TAG_LEN) {
    throw new Error('ciphertext too short');
  }
  const iv = ciphertext.subarray(0, IV_LEN);
  const tag = ciphertext.subarray(ciphertext.length - AUTH_TAG_LEN);
  const data = ciphertext.subarray(IV_LEN, ciphertext.length - AUTH_TAG_LEN);
  const decipher = createDecipheriv(ALGO, config.encryption.key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data).toString('utf8') + decipher.final('utf8');
}

/** SHA-256 hex for lookup/unique index (email, agent_name). */
export function hashForLookup(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
