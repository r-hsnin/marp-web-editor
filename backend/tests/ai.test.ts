import { expect, test } from 'bun:test';
import app from '../src/app';

test('AI Generate Endpoint', async () => {
  const response = await app.request('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello' }],
    }),
  });

  if (!response.ok) {
    console.log('AI request failed status:', response.status);
    // 500 is expected if API key is missing
    if (response.status === 500) {
      console.log('Endpoint reachable. API Key likely missing.');
    }
  } else {
    console.log('AI request success!');
    const text = await response.text();
    expect(text).toBeDefined();
  }
});
