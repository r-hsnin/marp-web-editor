import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';
import { proposeEditTool } from '../tools.js';

export const writerAgent = {
  async run(messages: CoreMessage[], context: string, targetSlide?: number) {
    const result = streamText({
      model: aiModel,
      system: `You are the Writer Agent.
Your goal is to write the full content of the presentation in Marp Markdown format.

CRITICAL INSTRUCTION:
- To generate or modify slides, you MUST use the \`propose_edit\` tool.
- DO NOT call \`propose_edit\` if there are no actual changes to make.
- DO NOT just stream raw markdown.
- When referring to slides in your response, use 1-based numbering (Slide 1, Slide 2, etc.).

Current Context:
${context}

Target Slide: ${targetSlide ?? 'All'}`,
      messages,
      tools: {
        propose_edit: proposeEditTool,
      },
    });
    return result.toUIMessageStreamResponse();
  },
};
