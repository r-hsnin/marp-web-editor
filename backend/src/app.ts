import { Hono } from 'hono';
import { cors } from 'hono/cors';
import aiRoute from './routes/ai';
import exportRoute from './routes/export';

const app = new Hono();

// Configure CORS
app.use('/*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

const routes = app.route('/api/export', exportRoute).route('/api/ai', aiRoute);

export type AppType = typeof routes;
export default app;
