import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { apiRateLimiter } from './middleware/rateLimit.js';
import apiRoutes from './routes/api.js';

const app = express();

app.use(cors({
  origin: config.nodeEnv === 'production'
    ? [config.appBaseUrl]
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(apiRateLimiter);

app.use('/api/v1', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`AgentsMem server listening on port ${config.port}`);
});
