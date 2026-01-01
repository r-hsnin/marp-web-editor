import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { Env } from 'hono-pino';
import { type ExportFormat, marpConverter } from '../lib/marp.js';
import { exportSchema } from '../schemas/export.js';

const exportRoute = new Hono<Env>();

exportRoute.post('/', zValidator('json', exportSchema), async (c) => {
  const { markdown, format, theme } = c.req.valid('json');
  const startTime = Date.now();

  try {
    const buffer = await marpConverter.convert({
      markdown,
      format: format as ExportFormat,
      theme,
    });

    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      html: 'text/html',
      png: 'image/png',
      jpg: 'image/jpeg',
    };

    c.header('Content-Type', contentTypes[format]);
    c.header('Content-Disposition', `attachment; filename="presentation.${format}"`);

    c.var.logger.info({ format, theme, durationMs: Date.now() - startTime }, 'Export completed');
    return c.body(buffer as unknown as ArrayBuffer);
  } catch (error) {
    c.var.logger.error({ err: error, format, theme }, 'Export failed');
    return c.json({ error: 'Failed to generate export' }, 500);
  }
});

export default exportRoute;
