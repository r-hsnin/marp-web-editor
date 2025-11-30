import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { type ExportFormat, marpConverter } from '../lib/marp';
import { exportSchema } from '../schemas/export';

const exportRoute = new Hono();

exportRoute.post('/', zValidator('json', exportSchema), async (c) => {
  console.log('Received export request');
  const { markdown, format } = c.req.valid('json');
  console.log(`Exporting format: ${format}`);

  try {
    const buffer = await marpConverter.convert({
      markdown,
      format: format as ExportFormat,
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

    return c.body(buffer as unknown as ArrayBuffer);
  } catch (error) {
    console.error('Export error:', error);
    return c.json({ error: 'Failed to generate export' }, 500);
  }
});

export default exportRoute;
