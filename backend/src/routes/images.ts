import { createReadStream, existsSync } from 'node:fs';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { storage } from '../lib/storage/index.js';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const imagesRoute = new Hono();

// POST /api/images - アップロード
imagesRoute.post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: 'Invalid file type. Allowed: PNG, JPEG, GIF, WebP' }, 400);
  }

  if (file.size > MAX_SIZE) {
    return c.json({ error: 'File too large. Max 5MB' }, 400);
  }

  try {
    const result = await storage.upload(file);
    return c.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// GET /api/images/:id - 配信
imagesRoute.get('/:id', async (c) => {
  const id = c.req.param('id');
  const filePath = storage.getPath(id);

  if (!filePath || !existsSync(filePath)) {
    return c.json({ error: 'Not found' }, 404);
  }

  const ext = id.split('.').pop()?.toLowerCase();
  const contentType =
    ext === 'png'
      ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'gif'
          ? 'image/gif'
          : ext === 'webp'
            ? 'image/webp'
            : 'application/octet-stream';

  c.header('Content-Type', contentType);
  c.header('Cache-Control', 'public, max-age=31536000');

  return stream(c, async (s) => {
    const readable = createReadStream(filePath);
    for await (const chunk of readable) {
      await s.write(chunk);
    }
  });
});

export default imagesRoute;
