import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';

export const generalAgent = {
  async run(messages: CoreMessage[], context: string) {
    const result = streamText({
      model: aiModel,
      system: `You are a helpful assistant for a Marp presentation editor.
Answer questions, discuss content, and provide feedback about the presentation.
Do NOT generate or modify slides directly - just have a conversation.
When referring to slides, use 1-based numbering (Slide 1, Slide 2, etc.).

Current Presentation:
${context}`,
      messages,
    });
    return result.toUIMessageStreamResponse();
  },
};
