import { access, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Hono } from 'hono';

const app = new Hono();

const TEMPLATES_DIR = resolve(process.cwd(), 'templates');

const isValidTemplateName = (name: string): boolean => {
  return /^[a-zA-Z0-9_\-]+$/.test(name);
};

app.get('/', async (c) => {
  try {
    const templatesPath = join(TEMPLATES_DIR, 'templates.json');
    await access(templatesPath);
    const content = await readFile(templatesPath, 'utf-8');
    const templates = JSON.parse(content);
    return c.json({ templates });
  } catch (error) {
    console.error('Failed to list templates:', error);
    return c.json({ templates: [] });
  }
});

app.get('/:name', async (c) => {
  const templateName = c.req.param('name');

  if (!isValidTemplateName(templateName)) {
    return c.text('Invalid template name', 400);
  }

  const templatePath = join(TEMPLATES_DIR, `${templateName}.md`);

  try {
    await access(templatePath);
    const content = await readFile(templatePath, 'utf-8');

    // Rewrite relative image paths to absolute backend URLs
    // This ensures images in templates (like ./images/shika_senbei.png)
    // are displayed correctly in the frontend editor.
    const processedContent = content.replace(/\.\/images\//g, 'http://localhost:3001/api/images/');

    return c.text(processedContent, 200, {
      'Content-Type': 'text/markdown',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    return c.text('Template not found', 404);
  }
});

export default app;
