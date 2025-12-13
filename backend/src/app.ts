import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import aiRoute from './routes/ai.js';
import exportRoute from './routes/export.js';
import templatesRoute from './routes/templates.js';
import themesRoute from './routes/themes.js';

const app = new Hono();

// Configure CORS
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

// Serve static images
app.use(
  '/api/images/*',
  cors(),
  serveStatic({
    root: './images',
    rewriteRequestPath: (path) => path.replace(/^\/api\/images\//, ''),
  }),
);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

const routes = app
  .route('/api/export', exportRoute)
  .route('/api/ai', aiRoute)
  .route('/api/themes', themesRoute)
  .route('/api/templates', templatesRoute);

export type AppType = typeof routes;
export default app;
