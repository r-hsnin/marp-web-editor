import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';

export const editorAgent = {
  async run(messages: CoreMessage[], context: string, targetSlide?: number) {
    const result = await streamText({
      model: aiModel,
      system: `You are the Editor Agent.
Your goal is to refine existing slides based on user feedback.
You can rewrite the content, fix typos, or adjust the tone.
Output the modified Markdown.

Current Context:
${context}

Target Slide: ${targetSlide ?? 'All'}`,
      messages,
    });
    return result.toUIMessageStreamResponse();
  },
};
