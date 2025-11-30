import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', async (c) => {
  try {
    // Resolve path to frontend/public/themes relative to this file
    // this file: backend/src/routes/themes.ts
    // target: frontend/public/themes
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const themesDir = resolve(__dirname, '../../../frontend/public/themes');

    const files = await readdir(themesDir);

    const themes = files
      .filter((file) => file.endsWith('.css'))
      .map((file) => file.replace(/\.css$/, ''));

    return c.json({ themes });
  } catch (error) {
    console.error('Failed to list themes:', error);
    // Return empty list on error (e.g. directory not found)
    return c.json({ themes: [] });
  }
});

export default app;
