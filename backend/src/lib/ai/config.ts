import { bedrock } from '@ai-sdk/amazon-bedrock';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'bedrock' | 'openrouter' | '';

const provider = (Bun.env.AI_PROVIDER || '') as ModelProvider;
const modelId = Bun.env.AI_MODEL;
const reasoningMaxTokens = Bun.env.AI_REASONING_MAX_TOKENS
  ? Number.parseInt(Bun.env.AI_REASONING_MAX_TOKENS, 10)
  : undefined;

function getModel(): LanguageModel | null {
  if (!modelId) return null;

  switch (provider) {
    case 'openrouter':
      return openrouter(modelId);
    case 'openai':
      return openai(modelId);
    case 'anthropic':
      return anthropic(modelId);
    case 'google':
      return google(modelId);
    case 'bedrock':
      return bedrock(modelId);
    default:
      return null;
  }
}

export const aiModel = getModel();

export function getRequiredModel(): LanguageModel {
  if (!aiModel) {
    throw new Error('AI is not configured. Set AI_PROVIDER and AI_MODEL environment variables.');
  }
  return aiModel;
}

// OpenRouter reasoning config (only applied when AI_REASONING_MAX_TOKENS is set)
export const providerOptions =
  provider === 'openrouter' && reasoningMaxTokens
    ? { openrouter: { reasoning: { max_tokens: reasoningMaxTokens } } }
    : undefined;
