import { tool } from 'ai';
import { z } from 'zod';

const proposeEditSchema = z.object({
  slideIndex: z.number().describe('0-based index from context (e.g., [0], [1], [2])'),
  newMarkdown: z.string().describe('Single slide markdown (without --- separator)'),
  reason: z.string().describe('Brief explanation of changes'),
});

const proposeInsertSchema = z.object({
  insertAfter: z.number().describe('Insert after this index. Use -1 for beginning.'),
  newMarkdown: z
    .string()
    .describe('Markdown for new slides. Use --- between slides. Omit frontmatter.'),
  reason: z.string().describe('Brief explanation for insertion'),
});

const proposeReplaceSchema = z.object({
  newMarkdown: z
    .string()
    .describe('Complete presentation markdown. Use --- between slides. Omit frontmatter.'),
  reason: z.string().describe('Brief explanation for replacement'),
});

const proposePlanSchema = z.object({
  title: z.string().describe('Presentation title'),
  outline: z.array(z.string()).describe('List of slide titles/topics'),
});

export const proposeEditTool = tool({
  description: 'Edit a specific existing slide. Call once per slide when editing multiple slides.',
  inputSchema: proposeEditSchema,
  outputSchema: z.string(),
});

export const proposeInsertTool = tool({
  description: 'Insert new slide(s) at a position. Existing slides remain unchanged.',
  inputSchema: proposeInsertSchema,
  outputSchema: z.string(),
});

export const proposeReplaceTool = tool({
  description:
    'Replace ALL slides with new content. Use only for creating from scratch or complete rewrite.',
  inputSchema: proposeReplaceSchema,
  outputSchema: z.string(),
});

export const proposePlanTool = tool({
  description: 'Propose presentation structure with title and slide outline.',
  inputSchema: proposePlanSchema,
  outputSchema: z.string(),
});
