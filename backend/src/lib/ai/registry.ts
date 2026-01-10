import { bedrock } from '@ai-sdk/amazon-bedrock';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { createProviderRegistry } from 'ai';

export const registry = createProviderRegistry({
  anthropic,
  bedrock,
  google,
  openai,
  openrouter,
});

export type ProviderModelId =
  | `anthropic:${string}`
  | `bedrock:${string}`
  | `google:${string}`
  | `openai:${string}`
  | `openrouter:${string}`;
