import { generateObject, type ModelMessage } from 'ai';
import { z } from 'zod';
import { logger } from '../logger.js';
import { architectAgent } from './agents/architect.js';
import { editorAgent } from './agents/editor.js';
import { generalAgent } from './agents/general.js';
import { getRequiredModel, providerOptions } from './config.js';

const IntentSchema = z.object({
  intent: z.enum(['architect', 'editor', 'general_chat']),
});

export const orchestrator = {
  async run(messages: ModelMessage[], context: string, theme?: string): Promise<Response> {
    try {
      // 1. Analyze Intent
      const {
        object: { intent },
      } = await generateObject({
        model: getRequiredModel(),
        system: `You are the Orchestrator of a Marp presentation editor.
Your role is to analyze the user's intent and route their request to the most appropriate specialist agent.

## Available Agents

### architect
The Architect helps users plan and structure their presentations before creating content.
Route here when the user wants to:
- Discuss what to include in their presentation
- Get advice on presentation structure or flow
- Plan an outline before writing slides

Example inputs:
- "AIについてのプレゼンを作りたいんだけど、どう構成すればいい？"
- "What should I include in a presentation about machine learning?"
- "5分のプレゼンに何枚スライドが必要？"

### editor
The Editor creates and modifies actual slide content.
Route here when the user wants to:
- Create new slides with specific content
- Edit, shorten, or improve existing slides
- Add or insert slides at specific positions

Example inputs:
- "機械学習についてのスライドを3枚作成して"
- "スライド2を短くして"
- "Create slides about AI"

### general_chat
The General agent handles conversations and questions.
Route here when the user:
- Greets or makes small talk
- Asks questions about Marp syntax or features
- Needs help understanding the tool

Example inputs:
- "こんにちは"
- "カードレイアウトの使い方を教えて"

## Decision Guidelines

1. Focus on USER'S INTENT, not the topic:
   - "Create slides about AI" → editor (wants to CREATE)
   - "Tell me about AI" → general_chat (wants INFORMATION)
   - "I want to make a presentation about AI, how should I structure it?" → architect (wants to PLAN)

2. Look for action keywords:
   - 作成/作って/書いて → editor
   - 構成/計画/どうすれば → architect
   - 教えて/What is → general_chat

3. When in doubt between architect and editor:
   - Specific slide count or "作成して" → editor
   - Exploring or asking for advice → architect

Current Context:
${context}
`,
        messages,
        schema: IntentSchema,
        providerOptions,
      });

      // 2. Route to Specialist
      let response: Response;

      switch (intent) {
        case 'architect':
          response = await architectAgent.run(messages, context);
          break;
        case 'editor':
          response = await editorAgent.run(messages, context, theme);
          break;
        default:
          response = await generalAgent.run(messages, context, theme);
          break;
      }

      // 3. Add Intent Header for Frontend UI
      response.headers.set('X-Agent-Intent', intent);
      return response;
    } catch (error) {
      logger.error({ err: error }, 'AI processing failed');
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: 'AI processing failed', details: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
