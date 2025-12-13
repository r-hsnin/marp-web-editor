import { openai } from '@ai-sdk/openai';
import { zValidator } from '@hono/zod-validator';
import { streamText } from 'ai';
import { Hono } from 'hono';
import { orchestrator } from '../lib/ai/orchestrator.js';
import { chatSchema, generateSchema } from '../schemas/ai.js';

const aiRoute = new Hono();

aiRoute.post('/generate', zValidator('json', generateSchema), async (c) => {
  const { messages } = c.req.valid('json');

  try {
    const result = streamText({
      model: openai('gpt-4o'),
      // biome-ignore lint/suspicious/noExplicitAny: Temporary fix for type mismatch
      // Manual mapping for /generate as well
      // biome-ignore lint/suspicious/noExplicitAny: Input is loosely typed JSON
      messages: (messages as any[]).map((m: any) => ({
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
    // biome-ignore lint/suspicious/noExplicitAny: Input is loosely typed JSON
    const coreMessages = (messages as any[]).map((m): any => {
      let content: string;
      
      // Handle UIMessage format with parts array
      if (m.parts && Array.isArray(m.parts)) {
        content = m.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
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
  } catch (error: any) {
    console.error('AI chat error:', error);
    return c.json({ 
        error: 'Failed to process chat request', 
        details: error.message || String(error) 
    }, 500);
  }
});

export default aiRoute;
