import type { Request, Response } from 'express';
import { registerAgent, findAgentByName, isValidAgentName } from '../services/agentService.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { agent_name: agentName } = req.body as { agent_name?: string };
    if (!agentName || typeof agentName !== 'string' || !agentName.trim()) {
      res.status(400).json({
        error: 'agent_name is required',
        hint: 'Include {"agent_name": "YourUniqueName"} in the request body',
      });
      return;
    }
    const normalizedAgentName = agentName.trim();
    if (!isValidAgentName(normalizedAgentName)) {
      res.status(400).json({
        error: 'Invalid agent name',
        hint: 'Use 3-32 characters: letters, numbers, underscores, or hyphens',
      });
      return;
    }
    const existing = await findAgentByName(normalizedAgentName);
    if (existing) {
      res.status(409).json({
        error: 'Agent name already registered',
        hint: 'Choose a different agent_name and retry',
      });
      return;
    }
    const result = await registerAgent(normalizedAgentName);
    res.status(201).json(result);
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
