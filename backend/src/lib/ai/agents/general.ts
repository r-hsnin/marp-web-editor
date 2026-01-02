import { type ModelMessage, streamText } from 'ai';
import { getRequiredModel, providerOptions } from '../config.js';
import { buildSystemPrompt } from '../promptBuilder.js';

export const generalAgent = {
  async run(messages: ModelMessage[], context: string, theme?: string) {
    const systemPrompt = buildSystemPrompt('general', context, theme);

    const result = streamText({
      model: getRequiredModel(),
      system: systemPrompt,
      messages,
      providerOptions,
    });
    return result.toUIMessageStreamResponse();
  },
};
