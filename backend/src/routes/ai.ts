import { openai } from '@ai-sdk/openai';
import { zValidator } from '@hono/zod-validator';
import { streamText } from 'ai';
import { Hono } from 'hono';
import { orchestrator } from '../lib/ai/orchestrator.js';
import { chatSchema, generateSchema } from '../schemas/ai.js';

interface MessagePart {
  type: string;
  text?: string;
}

interface InputMessage {
  role: string;
  content?: string | unknown;
  parts?: MessagePart[];
}

const aiRoute = new Hono();

aiRoute.post('/generate', zValidator('json', generateSchema), async (c) => {
  const { messages } = c.req.valid('json');

  try {
    const result = streamText({
      model: openai('gpt-4o'),
      messages: (messages as InputMessage[]).map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      })),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI generation error:', error);
    return c.json({ error: 'Failed to generate response' }, 500);
  }
});

aiRoute.post('/chat', zValidator('json', chatSchema), async (c) => {
  const { messages, context } = c.req.valid('json');

  try {
    console.log('Received chat request messages count:', messages.length);

    // Convert UIMessage format (parts array) to CoreMessage format (content string)
    const coreMessages = (messages as InputMessage[]).map((m) => {
      let content: string;

      // Handle UIMessage format with parts array
      if (m.parts && Array.isArray(m.parts)) {
        content = m.parts
          .filter(
            (part): part is MessagePart & { text: string } =>
              part.type === 'text' && typeof part.text === 'string',
          )
          .map((part) => part.text)
          .join('');
      }
      // Handle legacy format with content string
      else if (typeof m.content === 'string') {
        content = m.content;
      }
      // Fallback
      else {
        content = JSON.stringify(m.content || m);
      }

      return {
        role: m.role as 'user' | 'assistant' | 'system',
        content: content,
      };
    });

    return await orchestrator.run(coreMessages, context);
  } catch (error) {
    console.error('AI chat error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return c.json(
      {
        error: 'Failed to process chat request',
        details: message,
      },
      500,
    );
  }
});

export default aiRoute;
