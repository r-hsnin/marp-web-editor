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
    .describe(
      'Markdown for new slides. Use --- between slides. NEVER include frontmatter (marp/theme).',
    ),
  reason: z.string().describe('Brief explanation for insertion'),
});

const proposeReplaceSchema = z.object({
  newMarkdown: z
    .string()
    .describe(
      'Complete presentation markdown. Use --- between slides. NEVER include frontmatter (marp/theme).',
    ),
  reason: z.string().describe('Brief explanation for replacement'),
});

const proposePlanSchema = z.object({
  title: z.string().describe('Presentation title'),
  outline: z
    .array(
      z.object({
        title: z.string().describe('Slide title'),
        description: z.string().optional().describe('Brief description of slide content'),
      }),
    )
    .describe('Slide outline'),
  rationale: z.string().optional().describe('Brief explanation of why this structure works'),
});

const proposeReviewSchema = z.object({
  score: z.number().min(1).max(5).describe('Overall rating (1-5)'),
  overview: z.string().describe('Overall impression (1-2 sentences)'),
  good: z.array(z.string()).describe('List of positive points'),
  improvements: z
    .array(
      z.object({
        slideIndex: z.number().describe('0-based index'),
        title: z.string().describe('Slide title or topic'),
        problem: z.string().describe('What needs improvement'),
        suggestion: z.string().describe('Specific improvement suggestion'),
      }),
    )
    .describe('List of improvements (only for slides with issues)'),
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

export const proposeReviewTool = tool({
  description: 'Review and analyze the current presentation structure and content.',
  inputSchema: proposeReviewSchema,
  outputSchema: z.string(),
});
