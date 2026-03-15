import 'dotenv/config';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readEncryptionKey(): Buffer {
  const keyHex = process.env.AGENTSMEM_ENCRYPTION_KEY ?? '';
  if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
    throw new Error('AGENTSMEM_ENCRYPTION_KEY must be a 64-character hex string');
  }
  return Buffer.from(keyHex, 'hex');
}

function readSkillVersion(): string {
  const envVersion = process.env.AGENTSMEM_SKILL_VERSION?.trim();
  if (envVersion) return envVersion;

  const skillJsonPath = join(__dirname, '../../public/skill.json');
  const raw = readFileSync(skillJsonPath, 'utf-8');
  const parsed = JSON.parse(raw) as { version?: string };
  if (!parsed.version || typeof parsed.version !== 'string') {
    throw new Error('public/skill.json is missing a valid version field');
  }
  return parsed.version.trim();
}

export const config = {
  port: parseInt(process.env.PORT ?? '3011', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306', 10),
    user: process.env.DB_USER ?? 'reachuser',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'agentsmem',
  },

  rateLimit: {
    windowMs: 60 * 1000,
    max: 100,
  },

  /** Secret for signing session JWT. Set AGENTSMEM_JWT_SECRET in production. */
  jwtSecret: process.env.AGENTSMEM_JWT_SECRET ?? 'dev-secret-change-in-production',
  /** Base URL for links in emails (e.g. https://agentsmem.com). */
  appBaseUrl: process.env.AGENTSMEM_APP_BASE_URL ?? 'http://localhost:3010',
  /** Current published skill version. */
  skillVersion: readSkillVersion(),
  /** Application-layer encryption for sensitive data (e.g. user email). */
  encryption: {
    key: readEncryptionKey(),
    keyVersion: parseInt(process.env.AGENTSMEM_ENCRYPTION_KEY_VERSION ?? '1', 10),
    encoding: 'base64',
  },
} as const;
