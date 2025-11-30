import { openai } from '@ai-sdk/openai';
import { zValidator } from '@hono/zod-validator';
import { streamText } from 'ai';
import { Hono } from 'hono';
import { generateSchema } from '../schemas/ai';

const aiRoute = new Hono();

aiRoute.post('/generate', zValidator('json', generateSchema), async (c) => {
  const { messages } = c.req.valid('json');

  try {
    const result = streamText({
      model: openai('gpt-4o'),
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI generation error:', error);
    return c.json({ error: 'Failed to generate response' }, 500);
  }
});

export default aiRoute;
