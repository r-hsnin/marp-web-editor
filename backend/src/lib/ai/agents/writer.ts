import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';
import { proposeEditTool, proposePlanTool } from '../tools.js';

export const writerAgent = {
  async run(messages: CoreMessage[], context: string, targetSlide?: number) {
    const result = streamText({
      model: aiModel,
      system: `You are the Writer Agent.
Your goal is to write the full content of the presentation in Marp Markdown format.

CRITICAL INSTRUCTION:
- To generate or modify slides, you MUST use the provided tools.
- Use \`propose_plan\` for outlining new decks or major restructuring.
- Use \`propose_edit\` for writing specific slide content.
- DO NOT just stream raw markdown.

Current Context:
${context}

Target Slide: ${targetSlide ?? 'All'}`,
      messages,
      tools: {
        propose_plan: proposePlanTool,
        propose_edit: proposeEditTool,
      },
    });
    return result.toUIMessageStreamResponse();
  },
};
