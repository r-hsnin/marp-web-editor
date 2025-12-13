import app from './app.js';

const port = Number(Bun.env.PORT) || 3001;
console.log(`Server is running on ${Bun.env.APP_BASE_URL || `http://localhost:${port}`}`);

export default {
  fetch: app.fetch,
  port,
  idleTimeout: 60, // Increase timeout for AI generation (default is usually 10-30s)
};
