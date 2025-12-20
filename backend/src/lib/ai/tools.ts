import { tool } from 'ai';
import { z } from 'zod';

/**
 * Schema for propose_edit tool
 * Used by Editor and Writer agents to suggest changes to slides
 */
export const proposeEditSchema = z.object({
  slideIndex: z.number().describe('The 0-based index of the slide to edit'),
  newMarkdown: z.string().describe('The complete new markdown content for the target slide'),
  reason: z.string().describe('Brief explanation of changes for the user'),
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

export const proposePlanTool = tool({
  description:
    'Propose a plan for the presentation structure. Use this tool when creating a new deck or significantly restructuring.',
  inputSchema: proposePlanSchema,
  outputSchema: z.string(),
  // No execute function - this is intentional for Human-in-the-loop
});
