import { z } from 'zod';

export const generateSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    }),
  ),
});

export const chatSchema = z.object({
  messages: z.array(z.any()), // Accept UIMessage format with flexible structure
  context: z.string().default(''),
  theme: z.string().optional(),
});
