import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { zValidator } from '@hono/zod-validator';
import { convertToModelMessages, type ModelMessage } from 'ai';
import { Hono } from 'hono';
import type { Env } from 'hono-pino';
import { orchestrator } from '../lib/ai/orchestrator.js';
import { formatToolOutput } from '../lib/ai/toolFormatter.js';
import { chatSchema } from '../schemas/ai.js';

function isAIAvailable(): boolean {
  const modelId = Bun.env.AI_MODEL || '';
  if (!modelId) return false;

  const [provider] = modelId.split(':');

  switch (provider) {
    case 'openai':
      return !!Bun.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!Bun.env.ANTHROPIC_API_KEY;
    case 'google':
      return !!Bun.env.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'bedrock':
      return !!Bun.env.AWS_ACCESS_KEY_ID || existsSync(join(homedir(), '.aws', 'credentials'));
    case 'openrouter':
      return !!Bun.env.OPENROUTER_API_KEY;
    default:
      return false;
  }
}

/**
 * Convert tool-call/tool-result messages to text format for LLM compatibility.
 */
function flattenToolHistory(messages: ModelMessage[]): ModelMessage[] {
  const result: ModelMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.role === 'assistant' && Array.isArray(msg.content)) {
      const toolCalls = msg.content.filter((p) => p.type === 'tool-call');
      const textParts = msg.content.filter((p) => p.type === 'text');

      if (toolCalls.length > 0) {
        const nextMsg = messages[i + 1];
        if (nextMsg?.role === 'tool' && Array.isArray(nextMsg.content)) {
          const toolTexts = toolCalls.map((tc) => {
            const toolResult = nextMsg.content.find(
              (tr) => tr.type === 'tool-result' && tr.toolCallId === tc.toolCallId,
            );
            const rawOutput =
              toolResult?.output?.type === 'json'
                ? toolResult.output.value
                : toolResult?.output?.value || '';
            return formatToolOutput(tc.toolName, rawOutput);
          });

          result.push({
            role: 'assistant',
            content: [...textParts, { type: 'text', text: toolTexts.join('\n\n') }],
          });
          i++;
          continue;
        }
      }
    }

    result.push(msg);
  }

  return result;
}

const aiRoute = new Hono<Env>();

// GET /api/ai/status - AI 機能の利用可否
aiRoute.get('/status', (c) => {
  return c.json({ available: isAIAvailable() });
});

aiRoute.post('/chat', zValidator('json', chatSchema), async (c) => {
  const { messages, context, theme } = c.req.valid('json');

  try {
    const modelMessages = await convertToModelMessages(messages);
    const flattenedMessages = flattenToolHistory(modelMessages);
    return await orchestrator.run(flattenedMessages, context, theme);
  } catch (error) {
    c.var.logger.error({ err: error }, 'AI processing failed');
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
