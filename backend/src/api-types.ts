import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { generateSchema } from './schemas/ai.js';
import { exportSchema } from './schemas/export.js';
export type { ExportFormat } from './schemas/export.js';

const app = new Hono();

// Define routes structure with dummy handlers for type inference only.
// This avoids pulling in backend-only dependencies (like puppeteer, openai) into the frontend.
const routes = app
  .route(
    '/api/export',
    new Hono().post('/', zValidator('json', exportSchema), (_c) => {
      // Simulating the return type of the actual handler
      return _c.body(null as unknown as ArrayBuffer);
    }),
  )
  .route(
    '/api/ai',
    new Hono().post('/generate', zValidator('json', generateSchema), (_c) => {
      // Simulating the return type of streamText(...).toTextStreamResponse()
      return new Response();
    }),
  )
  .route(
    '/api/themes',
    new Hono()
      .get('/', (_c) => {
        return _c.json({ themes: [] as string[] });
      })
      .get('/:name', (_c) => {
        return _c.text('', 200, { 'Content-Type': 'text/css' });
      }),
  )
  .route(
    '/api/templates',
    new Hono()
      .get('/', (_c) => {
        return _c.json({
          templates: [] as {
            id: string;
            name: string;
            description: string;
            icon: string;
          }[],
        });
      })
      .get('/:name', (_c) => {
        return _c.text('', 200, { 'Content-Type': 'text/markdown' });
      }),
  );

export type AppType = typeof routes;
