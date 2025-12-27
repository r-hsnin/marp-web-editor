import { type CoreMessage, stepCountIs, streamText } from 'ai';
import { aiModel } from '../config.js';
import { buildSystemPrompt } from '../promptBuilder.js';
import { proposeEditTool, proposeInsertTool, proposeReplaceTool } from '../tools.js';

export const editorAgent = {
  async run(messages: CoreMessage[], context: string, theme?: string, targetSlide?: number) {
    const systemPrompt = buildSystemPrompt('editor', context, theme);

    const result = streamText({
      model: aiModel,
      system: `${systemPrompt}\n\nTarget Slide: ${targetSlide ?? 'All'}`,
      messages,
      tools: {
        propose_edit: proposeEditTool,
        propose_insert: proposeInsertTool,
        propose_replace: proposeReplaceTool,
      },
      stopWhen: stepCountIs(5),
    });
    return result.toUIMessageStreamResponse();
  },
};
