import { type CoreMessage, stepCountIs, streamText } from 'ai';
import { aiModel } from '../config.js';
import { getMarpGuidelineTool } from '../tools.js';

export const generalAgent = {
  async run(messages: CoreMessage[], context: string) {
    const result = streamText({
      model: aiModel,
      system: `You are a helpful assistant for a Marp presentation editor.
Answer questions, discuss content, and provide feedback about the presentation.
Do NOT generate or modify slides directly - just have a conversation.

AVAILABLE TOOLS:
- getMarpGuideline: Get best practices for a topic (slide-structure, formatting, best-practices, themes)

Use getMarpGuideline when user asks about Marp syntax, themes, or best practices.
When referring to slides, use 1-based numbering (Slide 1, Slide 2, etc.).

Current Presentation:
${context}`,
      messages,
      tools: {
        getMarpGuideline: getMarpGuidelineTool,
      },
      stopWhen: stepCountIs(5),
    });
    return result.toUIMessageStreamResponse();
  },
};
