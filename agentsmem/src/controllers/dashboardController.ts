import type { Response } from 'express';
import type { SessionAuthenticatedRequest } from '../middleware/sessionAuth.js';
import { getDashboardForAgent } from '../services/dashboardService.js';
import { findUserById, findUsersByEmail, updateUserEmail, updateUserPassword, verifyPassword } from '../services/userService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getDashboard(req: SessionAuthenticatedRequest, res: Response): Promise<void> {
  try {
    const agentId = req.agentId!;
    const data = await getDashboardForAgent(agentId);
    res.json(data);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateDashboardEmail(req: SessionAuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      email,
      current_password: currentPassword,
      password,
      password_confirm: passwordConfirm,
    } = req.body as {
      email?: string;
      current_password?: string;
      password?: string;
      password_confirm?: string;
    };

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ error: 'email is required' });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      res.status(400).json({ error: 'invalid email' });
      return;
    }

    const user = await findUserById(req.userId!);
    if (!user) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    const usersWithEmail = await findUsersByEmail(normalizedEmail);
    if (usersWithEmail.some((candidate) => candidate.id !== user.id)) {
      res.status(409).json({
        error: 'email already in use',
        hint: 'Use a different email address or log in with the existing agent account',
      });
      return;
    }

    if (user.password_hash) {
      if (!currentPassword || typeof currentPassword !== 'string') {
        res.status(400).json({ error: 'current password is required' });
        return;
      }
      const ok = await verifyPassword(currentPassword, user.password_hash);
      if (!ok) {
        res.status(401).json({ error: 'invalid password' });
        return;
      }
    } else {
      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({ error: 'password must be at least 6 characters' });
        return;
      }
      if (password !== passwordConfirm) {
        res.status(400).json({ error: 'password confirm does not match' });
        return;
      }
      await updateUserPassword(user.id, password);
    }

    await updateUserEmail(user.id, normalizedEmail);
    res.json({ status: 'ok', email: normalizedEmail });
  } catch (error) {
    console.error('Update dashboard email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateDashboardPassword(req: SessionAuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      current_password: currentPassword,
      password,
      password_confirm: passwordConfirm,
    } = req.body as {
      current_password?: string;
      password?: string;
      password_confirm?: string;
    };

    const user = await findUserById(req.userId!);
    if (!user) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    if (!user.password_hash) {
      res.status(400).json({ error: 'no password set', hint: 'Set a password first via the update email endpoint' });
      return;
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      res.status(400).json({ error: 'current password is required' });
      return;
    }
    const ok = await verifyPassword(currentPassword, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: 'invalid password' });
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

    await updateUserPassword(user.id, password);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Update dashboard password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

