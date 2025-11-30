import { z } from 'zod';

export const exportSchema = z.object({
  markdown: z.string(),
  format: z.enum(['pdf', 'pptx', 'html', 'png', 'jpg']),
});

export type ExportRequest = z.infer<typeof exportSchema>;
export type ExportFormat = ExportRequest['format'];
