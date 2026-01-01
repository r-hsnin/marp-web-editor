import app from './app.js';
import { logger } from './lib/logger.js';

const port = Number(Bun.env.PORT) || 3001;
const url = Bun.env.APP_BASE_URL || `http://localhost:${port}`;
logger.info({ port, url, env: Bun.env.NODE_ENV || 'development' }, 'Server started');

export default {
  fetch: app.fetch,
  port,
  idleTimeout: 60, // Increase timeout for AI generation (default is usually 10-30s)
};
