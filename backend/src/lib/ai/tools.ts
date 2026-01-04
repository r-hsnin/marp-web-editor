import { tool } from 'ai';
import { z } from 'zod';

/**
 * Schema for propose_edit tool
 * Used by Editor agent to suggest changes to existing slides
 */
const proposeEditSchema = z.object({
  slideIndex: z.number().describe('The 0-based index from the context (e.g., [0], [1], [2])'),
  newMarkdown: z
    .string()
    .describe('The new markdown content for the slide. Do NOT include slide separator ---'),
  reason: z.string().describe('Brief explanation of changes for the user'),
});

/**
 * Schema for propose_insert tool
 * Used by Editor agent to insert new slides
 */
const proposeInsertSchema = z.object({
  insertAfter: z
    .number()
    .describe('Insert after this slide index. Use -1 to insert at the beginning.'),
  newMarkdown: z
    .string()
    .describe(
      'The markdown content for new slide(s). Use --- to separate multiple slides. Do NOT start with ---.',
    ),
  reason: z.string().describe('Brief explanation for this insertion'),
});

/**
 * Schema for propose_replace tool
 * Used by Editor agent to replace all slides
 */
const proposeReplaceSchema = z.object({
  newMarkdown: z
    .string()
    .describe(
      'The complete markdown content for the new presentation. Use --- to separate slides. Do NOT start with ---.',
    ),
  reason: z.string().describe('Brief explanation for this replacement'),
});

/**
 * Schema for propose_plan tool
 * Used by Architect agent to suggest presentation structure
 */
const proposePlanSchema = z.object({
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
    'Propose edits to a specific slide. Call multiple times when editing multiple slides. Other slides remain unchanged.',
  inputSchema: proposeEditSchema,
  outputSchema: z.string(),
});

export const proposeInsertTool = tool({
  description:
    'Propose inserting new slide(s) at a specific position. Existing slides remain unchanged.',
  inputSchema: proposeInsertSchema,
  outputSchema: z.string(),
});

export const proposeReplaceTool = tool({
  description:
    'Propose replacing ALL slides with new content. Use ONLY when creating from scratch or the user explicitly wants to rewrite everything.',
  inputSchema: proposeReplaceSchema,
  outputSchema: z.string(),
});

export const proposePlanTool = tool({
  description:
    'Propose a plan for the presentation structure. Use this when creating a new deck or significantly restructuring.',
  inputSchema: proposePlanSchema,
  outputSchema: z.string(),
});
