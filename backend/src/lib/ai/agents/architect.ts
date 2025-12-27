import { type CoreMessage, stepCountIs, streamText } from 'ai';
import { aiModel } from '../config.js';
import { buildSystemPrompt } from '../promptBuilder.js';
import { proposePlanTool } from '../tools.js';

export const architectAgent = {
  async run(messages: CoreMessage[], context: string, _theme?: string) {
    const systemPrompt = buildSystemPrompt('architect', context);

    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages,
      tools: {
        propose_plan: proposePlanTool,
      },
      stopWhen: stepCountIs(5),
    });
    return result.toUIMessageStreamResponse();
  },
};
