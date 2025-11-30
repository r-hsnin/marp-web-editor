import { expect, test } from 'bun:test';
import fs from 'node:fs';
import app from '../src/app';

test('Export Endpoint', async () => {
  const response = await app.request('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      markdown: '# Test Slide\n\n---\n\n## Page 2',
      format: 'pdf',
    }),
  });

  expect(response.ok).toBe(true);

  const buffer = await response.arrayBuffer();
  fs.writeFileSync('test.pdf', Buffer.from(buffer));
  console.log('Export success: test.pdf created');
  expect(buffer.byteLength).toBeGreaterThan(0);
}, 30000);
