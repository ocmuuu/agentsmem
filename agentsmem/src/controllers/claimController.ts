import type { Request, Response } from 'express';
import { findAgentByName, normalizeAgentIdentifier, isApiKeyMatch, linkAgentToUser } from '../services/agentService.js';
import { findUserForAgent, createUser, findUsersByEmail, verifyPassword } from '../services/userService.js';
import { signSession, setSessionCookie } from '../services/sessionService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isDuplicateEntryError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}

/** POST /claim — agent + api_key + email + password + password_confirm */
export async function claimByApiKey(req: Request, res: Response): Promise<void> {
  const { agent: agentInput, api_key: apiKey, email, password, password_confirm: passwordConfirm } = req.body as {
    agent?: string;
    api_key?: string;
    email?: string;
    password?: string;
    password_confirm?: string;
  };

  if (!agentInput || typeof agentInput !== 'string' || !agentInput.trim()) {
    res.status(400).json({ error: 'agent is required' });
    return;
  }
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    res.status(400).json({ error: 'api_key is required' });
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
  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ error: 'email is required', hint: 'Dashboard login is by email only' });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    res.status(400).json({ error: 'invalid email' });
    return;
  }

  const agentName = normalizeAgentIdentifier(agentInput);
  const agent = await findAgentByName(agentName);
  if (!agent) {
    res.status(404).json({ error: 'agent not found' });
    return;
  }
  if (!isApiKeyMatch(agent, apiKey)) {
    res.status(401).json({ error: 'invalid api_key' });
    return;
  }

  const existingLinkedUser = await findUserForAgent(agent.id);
  if (existingLinkedUser) {
    res.status(409).json({ error: 'agent already claimed' });
    return;
  }

  const usersWithEmail = await findUsersByEmail(normalizedEmail);

  if (usersWithEmail.length > 0) {
    const existingUser = usersWithEmail[0];
    const passwordOk = await verifyPassword(password, existingUser.password_hash);
    if (!passwordOk) {
      res.status(401).json({
        error: 'email already in use',
        hint: 'This email is already linked to another agent. Provide the existing account password to link this agent to the same account. If you forgot the password, reset it at https://agentsmem.com/reset-password',
      });
      return;
    }
    await linkAgentToUser(agent.id, existingUser.id);
    const token = signSession({ userId: existingUser.id, agentId: agent.id });
    setSessionCookie(token, res);
    res.status(201).json({
      message: 'Agent linked to existing account',
      agent_name: agent.agent_name,
    });
    return;
  }

  let user;
  try {
    user = await createUser({
      agentId: agent.id,
      email: normalizedEmail,
      password,
    });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      res.status(409).json({
        error: 'email already in use',
        hint: 'This email is already linked to another agent. Provide the existing account password to link this agent to the same account.',
      });
      return;
    }
    throw error;
  }

  const token = signSession({ userId: user.id, agentId: agent.id });
  setSessionCookie(token, res);
  res.status(201).json({
    message: 'Claimed successfully',
    agent_name: agent.agent_name,
  });
}
