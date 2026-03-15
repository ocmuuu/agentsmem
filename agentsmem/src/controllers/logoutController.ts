import type { Request, Response } from 'express';
import { clearSessionCookie } from '../services/sessionService.js';

export async function logout(_req: Request, res: Response): Promise<void> {
  clearSessionCookie(res);
  res.status(200).json({ status: 'ok' });
}
