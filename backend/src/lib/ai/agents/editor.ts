import { type ModelMessage, stepCountIs, streamText } from 'ai';
import { getRequiredModel, providerOptions } from '../config.js';
import { buildSystemPrompt } from '../promptBuilder.js';
import { proposeEditTool, proposeInsertTool, proposeReplaceTool } from '../tools.js';

export const editorAgent = {
  async run(messages: ModelMessage[], context: string, theme?: string) {
    const systemPrompt = buildSystemPrompt('editor', context, theme);

    const result = streamText({
      model: getRequiredModel(),
      system: systemPrompt,
      messages,
      tools: {
        propose_edit: proposeEditTool,
        propose_insert: proposeInsertTool,
        propose_replace: proposeReplaceTool,
      },
      stopWhen: stepCountIs(5),
      providerOptions,
    });
    return result.toUIMessageStreamResponse();
  },
};
