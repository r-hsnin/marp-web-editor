import { generateObject, type ModelMessage } from 'ai';
import { z } from 'zod';
import { architectAgent } from './agents/architect.js';
import { editorAgent } from './agents/editor.js';
import { generalAgent } from './agents/general.js';
import { getRequiredModel } from './config.js';

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
        system: `You are the Orchestrator of a presentation slide generator.
Your job is to analyze the user's request and route it to the correct specialist agent.

- architect: When the user wants to plan or discuss presentation structure WITHOUT making changes. (e.g., "What should I include?", "Suggest an outline")
- editor: When the user wants to create, modify, add, or delete slides. (e.g., "Add a slide", "Edit slide 2", "Write content for slide 3", "Make it shorter", "Create slides about X")
- general_chat: When the user asks a general question or greets you.

IMPORTANT: If the user wants to actually CREATE or MODIFY content, use "editor". Use "architect" only for planning discussions.

Current Context:
${context}
`,
        messages,
        schema: IntentSchema,
      });

      console.log(`[Orchestrator] Intent: ${intent}, Theme: ${theme}`);

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
      console.error('[Orchestrator] Error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: 'AI processing failed', details: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
