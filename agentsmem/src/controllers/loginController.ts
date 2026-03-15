import type { Request, Response } from 'express';
import { findUsersByEmail, verifyPassword } from '../services/userService.js';
import { signSession, setSessionCookie } from '../services/sessionService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /login — email + password only (one user may have multiple agents; login is by email). */
export async function login(req: Request, res: Response): Promise<void> {
  const { email: emailInput, password } = req.body as { email?: string; password?: string };

  if (!emailInput || typeof emailInput !== 'string' || !emailInput.trim()) {
    res.status(400).json({ error: 'email is required' });
    return;
  }
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'password is required' });
    return;
  }

  const email = emailInput.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'invalid email' });
    return;
  }

  const users = await findUsersByEmail(email);
  if (users.length === 0) {
    res.status(401).json({ error: 'invalid credentials' });
    return;
  }
  if (users.length > 1) {
    res.status(500).json({ error: 'internal error', hint: 'Duplicate email in database' });
    return;
  }

  const user = users[0];
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    res.status(401).json({ error: 'invalid credentials' });
    return;
  }

  const token = signSession({ userId: user.id, agentId: user.agent_id });
  setSessionCookie(token, res);
  res.status(200).json({ message: 'Logged in', redirect: '/dashboard' });
}
