import { tool } from 'ai';
import { z } from 'zod';

/**
 * Schema for propose_edit tool
 * Used by Editor agent to suggest changes to existing slides
 */
export const proposeEditSchema = z.object({
  slideIndex: z.number().describe('The 0-based index from the context (e.g., [0], [1], [2])'),
  newMarkdown: z
    .string()
    .describe('The new markdown content for the slide. Do NOT include slide separator ---'),
  reason: z.string().describe('Brief explanation of changes for the user'),
});

/**
 * Schema for propose_add tool
 * Used by Editor agent to add new slides or replace all slides
 */
export const proposeAddSchema = z.object({
  insertAfter: z
    .number()
    .describe(
      'Insert after this slide index. Use -1 to insert at the beginning. Ignored if replaceAll is true.',
    ),
  newMarkdown: z
    .string()
    .describe(
      'The markdown content for new slide(s). Can include --- to add multiple slides at once.',
    ),
  replaceAll: z
    .boolean()
    .describe(
      'If true, replace all existing slides with the new content. If false, insert new slides.',
    ),
  reason: z.string().describe('Brief explanation for this change'),
});

/**
 * Schema for propose_plan tool
 * Used by Architect agent to suggest presentation structure
 */
export const proposePlanSchema = z.object({
  title: z.string().describe('The presentation title'),
  outline: z.array(z.string()).describe('List of slide titles/topics'),
});

/**
 * Tool definitions for use with streamText
 * These are client-side tools (Human-in-the-loop pattern)
 * No 'execute' function = AI SDK will emit tool calls for frontend handling
 */
export const proposeEditTool = tool({
  description:
    'Propose edits to existing slides. Use this tool when you want to modify the content of slides.',
  inputSchema: proposeEditSchema,
  outputSchema: z.string(),
  // No execute function - this is intentional for Human-in-the-loop
});

export const proposeAddTool = tool({
  description:
    'Propose adding a new slide. Use this tool when you want to add a new slide to the presentation.',
  inputSchema: proposeAddSchema,
  outputSchema: z.string(),
  // No execute function - this is intentional for Human-in-the-loop
});

export const proposePlanTool = tool({
  description:
    'Propose a plan for the presentation structure. Use this tool when creating a new deck or significantly restructuring.',
  inputSchema: proposePlanSchema,
  outputSchema: z.string(),
  // No execute function - this is intentional for Human-in-the-loop
});
