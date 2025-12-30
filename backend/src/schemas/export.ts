import { z } from 'zod';

export const exportSchema = z.object({
  markdown: z.string(),
  format: z.enum(['pdf', 'pptx', 'html', 'png', 'jpg']),
  theme: z.string().optional(),
});
