import { access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Hono } from 'hono';
import { logger } from '../lib/logger.js';
import { isValidName } from '../lib/validation.js';

const app = new Hono();

const TEMPLATES_DIR = resolve(process.cwd(), 'templates');

app.get('/', async (c) => {
  try {
    const templatesPath = join(TEMPLATES_DIR, 'templates.json');
    await access(templatesPath);
    const content = await readFile(templatesPath, 'utf-8');
    const templates = JSON.parse(content);
    return c.json({ templates });
  } catch (error) {
    logger.warn({ err: error }, 'Failed to list templates');
    return c.json({ templates: [] });
  }
});

app.get('/:name', async (c) => {
  const templateName = c.req.param('name');

  if (!isValidName(templateName)) {
    return c.text('Invalid template name', 400);
  }

  const templatePath = join(TEMPLATES_DIR, `${templateName}.md`);

  try {
    await access(templatePath);
    const content = await readFile(templatePath, 'utf-8');

    // Rewrite relative image paths to absolute backend URLs
    // This ensures images in templates (like ./images/shika_senbei.png)
    // are displayed correctly in the frontend editor.
    const baseUrl = Bun.env.APP_BASE_URL || '';
    const processedContent = content.replace(/\.\/images\//g, `${baseUrl}/api/static/`);

    return c.text(processedContent, 200, {
      'Content-Type': 'text/markdown',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (error) {
    logger.warn({ template: templateName, err: error }, 'Failed to load template');
    return c.text('Template not found', 404);
  }
});

export default app;
