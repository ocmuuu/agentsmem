import type { Request, Response } from 'express';
import { findAgentByApiKey } from '../services/agentService.js';
import { findUserForAgent, updatePasswordForAllByEmail } from '../services/userService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /reset-password — reset password using email + api_key (no session required). */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const {
      api_key: apiKey,
      email,
      password,
      password_confirm: passwordConfirm,
    } = req.body as {
      api_key?: string;
      email?: string;
      password?: string;
      password_confirm?: string;
    };

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      res.status(400).json({ error: 'api_key is required' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ error: 'email is required', hint: 'Provide the email used when claiming the account' });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      res.status(400).json({ error: 'invalid email' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' });
      return;
    }
    if (password !== passwordConfirm) {
      res.status(400).json({ error: 'password confirm does not match' });
      return;
    }

    const agent = await findAgentByApiKey(apiKey.trim());
    if (!agent) {
      res.status(401).json({ error: 'invalid api_key' });
      return;
    }

    const user = await findUserForAgent(agent.id);
    if (!user) {
      res.status(404).json({ error: 'agent not claimed', hint: 'The agent must be claimed before you can reset the password' });
      return;
    }

    if (!user.email || user.email.toLowerCase() !== normalizedEmail) {
      res.status(401).json({ error: 'email does not match', hint: 'The email must match the one used when claiming the account' });
      return;
    }

    const affected = await updatePasswordForAllByEmail(normalizedEmail, password);
    res.status(200).json({ status: 'ok', message: 'Password reset successfully', accounts_updated: affected });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'internal error' });
  }
}
