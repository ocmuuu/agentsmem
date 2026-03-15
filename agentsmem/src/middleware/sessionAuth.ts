import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import { findAgentById, findAgentByApiKey } from '../services/agentService.js';
import { findUserById, findUserForAgent } from '../services/userService.js';
import { SESSION_COOKIE_NAME, verifySession } from '../services/sessionService.js';

export type SessionAuthenticatedRequest = Request & {
  userId?: string;
  agentId?: string;
  agentName?: string;
};

function getCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const part of cookies) {
    const [rawName, ...rawValueParts] = part.trim().split('=');
    if (rawName !== name) continue;
    const rawValue = rawValueParts.join('=');
    return rawValue ? decodeURIComponent(rawValue) : '';
  }

  return null;
}

export async function requireSession(
  req: SessionAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = getCookieValue(req.headers.cookie, SESSION_COOKIE_NAME);
  if (!token) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const session = verifySession(token);
  if (!session) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const [user, agent] = await Promise.all([
    findUserById(session.userId),
    findAgentById(session.agentId),
  ]);

  if (!user || !agent || agent.user_id !== user.id) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  req.userId = user.id;
  req.agentId = agent.id;
  req.agentName = agent.agent_name;
  next();
}

/** Accept either session cookie or Authorization: Bearer <api_key>. Used for upload, list, download. */
export async function requireSessionOrApiKey(
  req: SessionAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = getCookieValue(req.headers.cookie, SESSION_COOKIE_NAME);
  if (token) {
    const session = verifySession(token);
    if (session) {
      const [user, agent] = await Promise.all([
        findUserById(session.userId),
        findAgentById(session.agentId),
      ]);
      if (user && agent && agent.user_id === user.id) {
        req.userId = user.id;
        req.agentId = agent.id;
        req.agentName = agent.agent_name;
        return next();
      }
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.slice(7).trim();
    const agent = await findAgentByApiKey(apiKey);
    if (agent) {
      const user = await findUserForAgent(agent.id);
      if (user) {
        req.userId = user.id;
        req.agentId = agent.id;
        req.agentName = agent.agent_name;
        return next();
      }
      res.status(401).json({
        error: 'agent not claimed',
        hint: 'Use POST /api/v1/claim with agent name, API key, email, and password to claim the account first',
      });
      return;
    }
  }

  res.status(401).json({
    error: 'unauthorized',
    hint: 'Use session cookie (after login) or Authorization: Bearer YOUR_API_KEY',
  });
}
