import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';

export const architectAgent = {
  async run(messages: CoreMessage[], context: string) {
    const result = await streamText({
      model: aiModel,
      system: `You are the Architect Agent.
Your goal is to design the structure of a presentation based on the user's request.
Generate a JSON object containing the plan.
Output format: {"plan": [{"title": "...", "summary": "..."}]}

Current Context:
${context}`,
      messages,
    });
    return result.toUIMessageStreamResponse();
  },
};
