import { type CoreMessage, streamText } from 'ai';
import { getRequiredModel } from '../config.js';
import { buildSystemPrompt } from '../promptBuilder.js';

export const generalAgent = {
  async run(messages: CoreMessage[], context: string, theme?: string) {
    const systemPrompt = buildSystemPrompt('general', context, theme);

    const result = streamText({
      model: getRequiredModel(),
      system: systemPrompt,
      messages,
    });
    return result.toUIMessageStreamResponse();
  },
};
