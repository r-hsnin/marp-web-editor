import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { generateSchema } from './schemas/ai';
import { exportSchema } from './schemas/export';
export type { ExportFormat } from './schemas/export';

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
  );

export type AppType = typeof routes;
