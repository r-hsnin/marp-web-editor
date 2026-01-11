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

const ORCHESTRATOR_PROMPT = `<role>
You are the Orchestrator of a Marp presentation editor.
Analyze the user's intent and route to the appropriate specialist agent.
</role>

<agents>
<agent name="architect">
Help users plan and structure presentations before creating content.
Route here when the user wants to:
- Discuss what to include in their presentation
- Get advice on presentation structure or flow
- Plan an outline before writing slides
</agent>

<agent name="editor">
Create and modify actual slide content.
Route here when the user wants to:
- Create new slides with specific content
- Edit, shorten, or improve existing slides
- Add or insert slides at specific positions
</agent>

<agent name="general_chat">
Handle conversations and questions.
Route here when the user:
- Greets or makes small talk
- Asks questions about Marp syntax or features
- Needs help understanding the tool
</agent>
</agents>

<decision_rules>
1. Focus on USER'S INTENT, not the topic:
   - "Create slides about AI" → editor (wants to CREATE)
   - "Tell me about AI" → general_chat (wants INFORMATION)
   - "How should I structure my AI presentation?" → architect (wants to PLAN)

2. Action keywords:
   - 作成/作って/書いて/追加/編集/短く → editor
   - 構成/計画/どうすれば/アドバイス → architect
   - 教えて/使い方/What is/How do I → general_chat

3. When ambiguous between architect and editor:
   - Specific slide count or explicit "作成して" → editor
   - Exploring or asking for advice → architect
</decision_rules>

<examples>
<example input="AIについてのプレゼンを作りたいんだけど、どう構成すればいい？" output="architect" />
<example input="機械学習についてのスライドを3枚作成して" output="editor" />
<example input="スライド2を短くして" output="editor" />
<example input="カードレイアウトの使い方を教えて" output="general_chat" />
<example input="こんにちは" output="general_chat" />
<example input="5分のプレゼンに何枚スライドが必要？" output="architect" />
</examples>`;

export const orchestrator = {
  async run(messages: ModelMessage[], context: string, theme?: string): Promise<Response> {
    try {
      const {
        object: { intent },
      } = await generateObject({
        model: getRequiredModel(),
        system: `${ORCHESTRATOR_PROMPT}

<current_context>
${context}
</current_context>`,
        messages,
        schema: IntentSchema,
        providerOptions,
      });

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
