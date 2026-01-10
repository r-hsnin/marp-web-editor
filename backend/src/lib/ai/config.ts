import type { LanguageModel } from 'ai';
import { type ProviderModelId, registry } from './registry.js';

// Model ID format: "provider:model" (e.g., "openai:gpt-4o", "anthropic:claude-3-5-sonnet-20240620")
const modelId = Bun.env.AI_MODEL as ProviderModelId | undefined;

function getModel(): LanguageModel | null {
  if (!modelId) return null;
  return registry.languageModel(modelId);
}

export const aiModel = getModel();

export function getRequiredModel(): LanguageModel {
  if (!aiModel) {
    throw new Error('AI is not configured. Set AI_MODEL environment variable.');
  }
  return aiModel;
}

// OpenRouter reasoning config (only applied when AI_REASONING_MAX_TOKENS is set)
const reasoningMaxTokens = Bun.env.AI_REASONING_MAX_TOKENS
  ? Number.parseInt(Bun.env.AI_REASONING_MAX_TOKENS, 10)
  : undefined;

export const providerOptions =
  modelId?.startsWith('openrouter:') && reasoningMaxTokens
    ? { openrouter: { reasoning: { max_tokens: reasoningMaxTokens } } }
    : undefined;
