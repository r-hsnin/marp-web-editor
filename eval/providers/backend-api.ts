import type {
  ApiProvider,
  CallApiContextParams,
  ProviderOptions,
  ProviderResponse,
} from 'promptfoo';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

interface ParsedResponse {
  intent?: string;
  toolCalls: ToolCall[];
  textContent: string;
}

/**
 * Parse UI Message Stream (SSE format) from backend API
 */
function parseUIMessageStream(text: string): ParsedResponse {
  const result: ParsedResponse = {
    toolCalls: [],
    textContent: '',
  };

  const lines = text.split('\n');
  const toolInputs = new Map<string, { name: string; input: Record<string, unknown> }>();
  const textDeltas: string[] = [];

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6);
    if (data === '[DONE]') break;

    try {
      const parsed = JSON.parse(data);

      switch (parsed.type) {
        case 'text-delta':
          textDeltas.push(parsed.delta || '');
          break;
        case 'tool-input-available':
          toolInputs.set(parsed.toolCallId, {
            name: parsed.toolName,
            input: parsed.input,
          });
          break;
      }
    } catch {
      // Skip non-JSON lines
    }
  }

  result.textContent = textDeltas.join('');
  result.toolCalls = Array.from(toolInputs.values()).map((t) => ({
    name: t.name,
    args: t.input,
  }));

  return result;
}

/**
 * Backend API Provider for Promptfoo
 * Calls the actual backend /api/ai/chat endpoint
 */
export default class BackendApiProvider implements ApiProvider {
  private providerId: string;

  constructor(options: ProviderOptions) {
    this.providerId = options.id || 'backend-api';
  }

  id(): string {
    return this.providerId;
  }

  async callApi(prompt: string, context?: CallApiContextParams): Promise<ProviderResponse> {
    const vars = context?.vars || {};
    const userMessage = (vars.userMessage as string) || prompt;
    const slideContext = (vars.context as string) || '';
    const theme = vars.theme as string | undefined;
    const history = vars.history as Array<{ role: string; content: string }> | undefined;

    // Build messages array with optional history (UIMessage format)
    const messages = [
      ...(history || []).map((h) => ({
        id: crypto.randomUUID(),
        role: h.role,
        parts: [{ type: 'text', text: h.content }],
        createdAt: new Date().toISOString(),
      })),
      {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: userMessage }],
        createdAt: new Date().toISOString(),
      },
    ];

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          context: slideContext,
          theme,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `API error ${response.status}: ${errorText}` };
      }

      // Get intent from header
      const intent = response.headers.get('X-Agent-Intent') || undefined;

      // Parse streaming response
      const text = await response.text();
      const parsed = parseUIMessageStream(text);
      parsed.intent = intent;

      return {
        output: JSON.stringify(parsed),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
