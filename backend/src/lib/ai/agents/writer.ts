import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';

export const writerAgent = {
  async run(messages: CoreMessage[], context: string, targetSlide?: number) {
    const result = await streamText({
      model: aiModel,
      system: `You are the Writer Agent.
Your goal is to write the full content of the presentation in Marp Markdown format.
Follow these rules:
1. Use '---' to separate slides.
2. Use Marp directives like '<!-- theme: default -->' at the top if starting a new deck.
3. If targetSlide is specified, focus on that slide (but context might be the whole deck).

Current Context:
${context}

Target Slide: ${targetSlide ?? 'All'}`,
      messages,
    });
    return result.toUIMessageStreamResponse();
  },
};
