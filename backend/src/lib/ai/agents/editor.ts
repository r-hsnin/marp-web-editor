import { type CoreMessage, streamText } from 'ai';
import { aiModel } from '../config.js';
import { proposeAddTool, proposeEditTool } from '../tools.js';

export const editorAgent = {
  async run(messages: CoreMessage[], context: string, targetSlide?: number) {
    const result = streamText({
      model: aiModel,
      system: `You are the Editor Agent.
Your goal is to create, modify, and manage slides based on user requests.

AVAILABLE TOOLS:
- \`propose_edit\`: Modify a single existing slide
- \`propose_add\`: Add new slides OR replace all slides

HOW TO USE propose_add:
- To ADD slides: set replaceAll=false, insertAfter=index where to insert
- To REPLACE ALL slides (create new deck): set replaceAll=true
- newMarkdown can contain --- to create multiple slides at once

CRITICAL INSTRUCTIONS:
- Use \`propose_edit\` for single slide modifications
- Use \`propose_add\` with replaceAll=false to add new slides
- Use \`propose_add\` with replaceAll=true when user wants to create a new presentation or replace everything
- Provide a brief conversational response alongside tool calls
- When referring to slides, use 1-based numbering (Slide 1, Slide 2, etc.)

Current Context:
${context}

Target Slide: ${targetSlide ?? 'All'}`,
      messages,
      tools: {
        propose_edit: proposeEditTool,
        propose_add: proposeAddTool,
      },
    });
    return result.toUIMessageStreamResponse();
  },
};
