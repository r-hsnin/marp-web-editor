import { access, readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Hono } from 'hono';
import { isValidName } from '../lib/validation.js';

const app = new Hono();

const THEMES_DIR = resolve(process.cwd(), 'themes');

app.get('/', async (c) => {
  try {
    const files = await readdir(THEMES_DIR);
    const themes = files
      .filter((file) => file.endsWith('.css'))
      .map((file) => file.replace(/\.css$/, ''));
    return c.json({ themes });
  } catch (error) {
    console.error('Failed to list themes:', error);
    return c.json({ themes: [] });
  }
});

app.get('/:name', async (c) => {
  const themeName = c.req.param('name');

  if (!isValidName(themeName)) {
    return c.text('Invalid theme name', 400);
  }

  const themePath = join(THEMES_DIR, `${themeName}.css`);

  try {
    await access(themePath);
    const css = await readFile(themePath, 'utf-8');

    // Rewrite relative image paths to absolute backend URLs
    // This allows the frontend to load images correctly while keeping the CSS file
    // utilizing relative paths for local Marp CLI export compatibility.
    const baseUrl = Bun.env.APP_BASE_URL || '';
    const processedCss = css.replace(/\.\.\/images\//g, `${baseUrl}/api/static/`);

    return c.text(processedCss, 200, {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch (error) {
    console.error(`Failed to load theme ${themeName}:`, error);
    return c.text('Theme not found', 404);
  }
});

export default app;
