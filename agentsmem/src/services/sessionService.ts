import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const COOKIE_NAME = 'agentsmem_session';
const COOKIE_MAX_AGE_DAYS = 30;

export interface SessionPayload {
  userId: string;
  agentId: string;
  iat?: number;
  exp?: number;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: `${COOKIE_MAX_AGE_DAYS}d` }
  );
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(): { name: string; maxAge: number; httpOnly: boolean; secure: boolean; sameSite: 'lax' } {
  return {
    name: COOKIE_NAME,
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
  };
}

export function setSessionCookie(token: string, res: import('express').Response): void {
  const opts = getSessionCookieOptions();
  res.cookie(opts.name, token, {
    maxAge: opts.maxAge,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: '/',
  });
}

export function clearSessionCookie(res: import('express').Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export { COOKIE_NAME as SESSION_COOKIE_NAME };
