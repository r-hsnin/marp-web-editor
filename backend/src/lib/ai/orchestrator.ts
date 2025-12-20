import { type CoreMessage, generateObject } from 'ai';
import { z } from 'zod';
import { architectAgent } from './agents/architect.js';
import { editorAgent } from './agents/editor.js';
import { generalAgent } from './agents/general.js';
import { aiModel } from './config.js';

export const IntentSchema = z.object({
  intent: z.enum(['architect', 'editor', 'general_chat']),
  targetSlide: z.number().nullish().describe('The slide number to edit, if applicable'),
});

export type Intent = z.infer<typeof IntentSchema>;

export const orchestrator = {
  async run(messages: CoreMessage[], context: string): Promise<Response> {
    const lastMessage = messages[messages.length - 1];

    // 1. Analyze Intent
    const {
      object: { intent, targetSlide },
    } = await generateObject({
      model: aiModel,
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

    console.log(`[Orchestrator] Intent: ${intent}, TargetSlide: ${targetSlide}`);

    // 2. Route to Specialist
    let response: Response;
    const normalizedTargetSlide = targetSlide ?? undefined;

    switch (intent) {
      case 'architect':
        response = await architectAgent.run(messages, context);
        break;
      case 'editor':
        response = await editorAgent.run(messages, context, normalizedTargetSlide);
        break;
      default:
        response = await generalAgent.run(messages, context);
        break;
    }

    // 3. Add Intent Header for Frontend UI
    response.headers.set('X-Agent-Intent', intent);
    return response;
  },
};
