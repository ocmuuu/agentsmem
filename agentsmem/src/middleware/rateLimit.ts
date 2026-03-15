import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { config } from '../config.js';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: true,
  handler: (_req: Request, res: Response) => {
    const retryAfter = res.getHeader('Retry-After');
    const retryAfterSeconds = retryAfter ? Number(retryAfter) : Math.ceil(config.rateLimit.windowMs / 1000);
    res.status(429).json({
      error: 'Rate limit exceeded',
      hint: `Wait ${retryAfterSeconds} seconds before retrying`,
      retry_after_seconds: retryAfterSeconds,
    });
  },
});
