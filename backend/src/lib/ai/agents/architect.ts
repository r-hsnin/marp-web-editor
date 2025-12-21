import { type CoreMessage, stepCountIs, streamText } from 'ai';
import { aiModel } from '../config.js';
import { getMarpGuidelineTool, proposePlanTool } from '../tools.js';

export const architectAgent = {
  async run(messages: CoreMessage[], context: string) {
    const result = streamText({
      model: aiModel,
      system: `You are the Architect Agent.
Your goal is to design the structure of a presentation based on the user's request.

AVAILABLE TOOLS:
- propose_plan: Propose presentation structure
- getMarpGuideline: Get best practices for a topic (slide-structure, formatting, best-practices, themes)

INSTRUCTIONS:
- Use getMarpGuideline when user asks about Marp syntax, themes, or best practices
- Use propose_plan to propose presentation structure
- Provide a brief conversational response alongside tool calls
- When referring to slides, use 1-based numbering (Slide 1, Slide 2, etc.)

Current Context:
${context}`,
      messages,
      tools: {
        propose_plan: proposePlanTool,
        getMarpGuideline: getMarpGuidelineTool,
      },
      stopWhen: stepCountIs(5),
    });
    return result.toUIMessageStreamResponse();
  },
};
