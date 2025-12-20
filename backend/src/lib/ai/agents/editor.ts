import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';
import { proposeEditTool } from '../tools.js';

export const editorAgent = {
  async run(messages: CoreMessage[], context: string, targetSlide?: number) {
    const result = streamText({
      model: aiModel,
      system: `You are the Editor Agent.
Your goal is to refine existing slides based on user feedback.

CRITICAL INSTRUCTION:
- If the user requests a change that requires modifying the slide content, you MUST use the \`propose_edit\` tool.
- DO NOT call \`propose_edit\` if there are no actual changes to make.
- DO NOT just output the markdown in plain text.
- Provide a brief conversational response (e.g., "I've updated the slide for you.") alongside the tool call.
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
