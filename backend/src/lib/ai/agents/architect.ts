import { type ModelMessage, stepCountIs, streamText } from 'ai';
import { getRequiredModel, providerOptions } from '../config.js';
import { buildSystemPrompt } from '../promptBuilder.js';
import { proposePlanTool, proposeReviewTool } from '../tools.js';

export const architectAgent = {
  async run(messages: ModelMessage[], context: string) {
    const systemPrompt = buildSystemPrompt('architect', context);

    const result = streamText({
      model: getRequiredModel(),
      system: systemPrompt,
      messages,
      tools: {
        propose_plan: proposePlanTool,
        propose_review: proposeReviewTool,
      },
      stopWhen: stepCountIs(5),
      providerOptions,
    });
    return result.toUIMessageStreamResponse();
  },
};
