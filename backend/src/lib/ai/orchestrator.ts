import { type CoreMessage, generateObject } from 'ai';
import { z } from 'zod';
import { architectAgent } from './agents/architect.js';
import { editorAgent } from './agents/editor.js';
import { generalAgent } from './agents/general.js';
import { writerAgent } from './agents/writer.js';
import { aiModel } from './config.js';

export const IntentSchema = z.object({
  intent: z.enum(['architect', 'writer', 'editor', 'general_chat']),
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

- architect: When the user wants to plan a new presentation or restructure an existing one. (e.g., "Create a slide deck about AI", "Add a section about history")
- writer: When the user wants to generate specific slide content based on a plan. (e.g., "Write the content for slide 3", "Generate the introduction")
- editor: When the user wants to modify existing slides. (e.g., "Make slide 2 shorter", "Change the title of slide 5", "Fix the typo")
- general_chat: When the user asks a general question or greets you.

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
      case 'writer':
        response = await writerAgent.run(messages, context, normalizedTargetSlide);
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
