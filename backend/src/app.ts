import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { type Env, pinoLogger } from 'hono-pino';
import { logger } from './lib/logger.js';
import aiRoute from './routes/ai.js';
import exportRoute from './routes/export.js';
import imagesRoute from './routes/images.js';
import templatesRoute from './routes/templates.js';
import themesRoute from './routes/themes.js';

const app = new Hono<Env>();

// Logging middleware
app.use(pinoLogger({ pino: logger }));

// Configure CORS
app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Agent-Intent'],
  }),
);

// Serve static images (for themes)
app.use(
  '/api/static/*',
  cors(),
  serveStatic({
    root: './images',
    rewriteRequestPath: (path) => path.replace(/^\/api\/static\//, ''),
  }),
);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app
  .route('/api/export', exportRoute)
  .route('/api/ai', aiRoute)
  .route('/api/themes', themesRoute)
  .route('/api/templates', templatesRoute)
  .route('/api/images', imagesRoute);

export default app;
