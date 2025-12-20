import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';
import { proposePlanTool } from '../tools.js';

export const architectAgent = {
  async run(messages: CoreMessage[], context: string) {
    const result = streamText({
      model: aiModel,
      system: `You are the Architect Agent.
Your goal is to design the structure of a presentation based on the user's request.

CRITICAL INSTRUCTION:
- Use the \`propose_plan\` tool to propose presentation structure.
- Provide a brief conversational response alongside the tool call.
- When referring to slides, use 1-based numbering (Slide 1, Slide 2, etc.).

Current Context:
${context}`,
      messages,
      tools: {
        propose_plan: proposePlanTool,
      },
    });
    return result.toUIMessageStreamResponse();
  },
};
