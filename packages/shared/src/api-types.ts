import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

// Schemas
export const exportSchema = z.object({
  markdown: z.string(),
  format: z.enum(['pdf', 'pptx', 'html', 'png', 'jpg']),
  theme: z.string().optional(),
});

export type ExportFormat = z.infer<typeof exportSchema>['format'];

export const generateSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    }),
  ),
});

export const chatSchema = z.object({
  messages: z.array(z.any()),
  context: z.string().default(''),
});

// Template type
export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: 'manual' | 'template';
  theme?: string;
}

// Hono RPC type definition
const app = new Hono();

const routes = app
  .route(
    '/api/export',
    new Hono().post('/', zValidator('json', exportSchema), (_c) => {
      return _c.body(null as unknown as ArrayBuffer);
    }),
  )
  .route(
    '/api/ai',
    new Hono()
      .post('/generate', zValidator('json', generateSchema), (_c) => {
        return new Response();
      })
      .post('/chat', zValidator('json', chatSchema), (_c) => {
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
        return _c.json({ templates: [] as Template[] });
      })
      .get('/:name', (_c) => {
        return _c.text('', 200, { 'Content-Type': 'text/markdown' });
      }),
  );

export type AppType = typeof routes;
