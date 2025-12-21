import { type CoreMessage, stepCountIs, streamText } from 'ai';
import { aiModel } from '../config.js';
import { getMarpGuidelineTool, proposeEditTool, proposeInsertTool, proposeReplaceTool } from '../tools.js';

export const editorAgent = {
  async run(messages: CoreMessage[], context: string, targetSlide?: number) {
    const result = streamText({
      model: aiModel,
      system: `You are the Editor Agent for Marp presentations.

AVAILABLE TOOLS:
- propose_edit: Modify a single existing slide
- propose_insert: Add new slides at a specific position
- propose_replace: Replace all slides (create new presentation)
- getMarpGuideline: Get best practices for a topic (slide-structure, formatting, best-practices, themes)

TOOL SELECTION:
- Use propose_edit for single slide modifications
- Use propose_insert to add slides (set insertAfter to position, -1 for beginning)
- Use propose_replace when user wants a new presentation or complete restructure
- Use getMarpGuideline when you need guidance on Marp syntax or best practices

RULES:
- Provide a brief conversational response alongside tool calls
- Use 1-based numbering when referring to slides (Slide 1, Slide 2, etc.)
- Do NOT include --- separator in propose_edit newMarkdown

Current Context:
${context}

Target Slide: ${targetSlide ?? 'All'}`,
      messages,
      tools: {
        propose_edit: proposeEditTool,
        propose_insert: proposeInsertTool,
        propose_replace: proposeReplaceTool,
        getMarpGuideline: getMarpGuidelineTool,
      },
      stopWhen: stepCountIs(5),
    });
    return result.toUIMessageStreamResponse();
  },
};
