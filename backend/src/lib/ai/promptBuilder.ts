import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const GUIDELINES_DIR = join(process.cwd(), 'guidelines');

function loadBaseRules(): string {
  const path = join(GUIDELINES_DIR, 'base-rules.md');
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    console.warn('[promptBuilder] Failed to load base-rules.md');
    return '';
  }
}

function loadThemeGuideline(theme: string): string {
  // 1. Try MD file first
  const mdPath = join(GUIDELINES_DIR, 'themes', `${theme}.md`);
  if (existsSync(mdPath)) {
    try {
      return readFileSync(mdPath, 'utf-8');
    } catch {
      console.warn(`[promptBuilder] Failed to load theme guideline: ${theme}`);
    }
  }

  // 2. Try extracting from CSS comments (future enhancement)
  // For now, return empty if no MD file exists
  console.warn(`[promptBuilder] No guideline found for theme: ${theme}`);
  return '';
}

// Cache for loaded guidelines
let cachedBaseRules: string | null = null;
const cachedThemeGuidelines = new Map<string, string>();

export function getBaseRules(): string {
  if (cachedBaseRules === null) {
    cachedBaseRules = loadBaseRules();
  }
  return cachedBaseRules;
}

export function getThemeGuideline(theme: string): string {
  if (!cachedThemeGuidelines.has(theme)) {
    cachedThemeGuidelines.set(theme, loadThemeGuideline(theme));
  }
  return cachedThemeGuidelines.get(theme) || '';
}

export type AgentType = 'general' | 'architect' | 'editor';

const AGENT_INSTRUCTIONS: Record<AgentType, string> = {
  general: `You are a helpful assistant for a Marp presentation editor.
Answer questions, discuss content, and provide feedback about the presentation.
Do NOT generate or modify slides directly - just have a conversation.
When referring to slides, use 1-based numbering (Slide 1, Slide 2, etc.).`,

  architect: `You are the Architect Agent.
Your goal is to design the structure of a presentation based on the user's request.
Use propose_plan to propose presentation structure.
Provide a brief conversational response alongside tool calls.
When referring to slides, use 1-based numbering (Slide 1, Slide 2, etc.).`,

  editor: `You are the Editor Agent for Marp presentations.

TOOL SELECTION:
- propose_edit: Modify a single existing slide
- propose_insert: Add new slides at a specific position
- propose_replace: Replace all slides (create new presentation)

RULES:
- Provide a brief conversational response alongside tool calls
- Use 1-based numbering when referring to slides (Slide 1, Slide 2, etc.)
- Do NOT include --- separator in propose_edit newMarkdown`,
};

export function buildSystemPrompt(agentType: AgentType, context: string, theme?: string): string {
  const instructions = AGENT_INSTRUCTIONS[agentType];
  const baseRules = getBaseRules();

  let prompt = `${instructions}

## Marp Guidelines
${baseRules}`;

  // Add theme-specific guidelines for editor agent
  if (agentType === 'editor' && theme) {
    const themeGuideline = getThemeGuideline(theme);
    if (themeGuideline) {
      prompt += `

## Theme: ${theme}
${themeGuideline}`;
    }
  }

  prompt += `

## Current Presentation
${context}`;

  return prompt;
}
