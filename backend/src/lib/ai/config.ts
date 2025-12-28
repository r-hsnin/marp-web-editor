import { bedrock } from '@ai-sdk/amazon-bedrock';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'bedrock' | '';

const provider = (Bun.env.AI_PROVIDER || '') as ModelProvider;

function getModel() {
  switch (provider) {
    case 'openai':
      return openai('gpt-4.1-mini');
    case 'anthropic':
      return anthropic('claude-sonnet-4-20250514');
    case 'google':
      return google('gemini-2.5-flash');
    case 'bedrock':
      return bedrock('anthropic.claude-sonnet-4-20250514-v1:0');
    default:
      return null;
  }
}

export const aiModel = getModel();
export const aiProvider = provider;
