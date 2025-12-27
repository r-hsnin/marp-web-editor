import { type CoreMessage, stepCountIs, streamText } from 'ai';
import { aiModel } from '../config.js';
import { buildSystemPrompt } from '../promptBuilder.js';

export const generalAgent = {
  async run(messages: CoreMessage[], context: string, _theme?: string) {
    const systemPrompt = buildSystemPrompt('general', context);

    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages,
      stopWhen: stepCountIs(5),
    });
    return result.toUIMessageStreamResponse();
  },
};
