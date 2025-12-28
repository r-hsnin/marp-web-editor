import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { openai } from '@ai-sdk/openai';
import { zValidator } from '@hono/zod-validator';
import { streamText } from 'ai';
import { Hono } from 'hono';
import { orchestrator } from '../lib/ai/orchestrator.js';
import { chatSchema, generateSchema } from '../schemas/ai.js';

function isAIAvailable(): boolean {
  const provider = Bun.env.AI_PROVIDER || '';
  switch (provider) {
    case 'openai':
      return !!Bun.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!Bun.env.ANTHROPIC_API_KEY;
    case 'google':
      return !!Bun.env.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'bedrock':
      return !!Bun.env.AWS_ACCESS_KEY_ID || existsSync(join(homedir(), '.aws', 'credentials'));
    default:
      return false;
  }
}

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

// GET /api/ai/status - AI 機能の利用可否
aiRoute.get('/status', (c) => {
  return c.json({ available: isAIAvailable() });
});

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
  const { messages, context, theme } = c.req.valid('json');

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

    return await orchestrator.run(coreMessages, context, theme);
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
