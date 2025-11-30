import { z } from 'zod';

export const generateSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    }),
  ),
});

export type GenerateRequest = z.infer<typeof generateSchema>;
