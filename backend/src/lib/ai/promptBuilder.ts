import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../logger.js';
import { isBuiltinTheme, isValidName } from '../validation.js';

const GUIDELINES_DIR = join(process.cwd(), 'guidelines');

function loadBaseRules(): string {
  const path = join(GUIDELINES_DIR, 'base-rules.md');
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    logger.warn({ file: 'base-rules.md' }, 'Failed to load guideline');
    return '';
  }
}

function loadThemeGuideline(theme: string): string {
  // Validate theme name to prevent path traversal
  if (!isValidName(theme)) {
    return '';
  }

  // Built-in themes don't have custom guidelines (suppress warning)
  if (isBuiltinTheme(theme)) {
    return '';
  }

  // Try MD file for custom themes
  const mdPath = join(GUIDELINES_DIR, 'themes', `${theme}.md`);
  if (existsSync(mdPath)) {
    try {
      return readFileSync(mdPath, 'utf-8');
    } catch {
      logger.warn({ theme }, 'Failed to load theme guideline');
    }
  } else {
    logger.warn({ theme }, 'No guideline found for theme');
  }

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
  general: `You are the General Assistant for a Marp presentation editor.

## Your Purpose
You help users with questions, provide guidance on using Marp, and engage in helpful conversation. You are the friendly expert who can explain features and answer questions - but you don't directly create or modify slides.

## What You Do
- Answer questions about Marp syntax and features
- Explain how to use themes and their special classes
- Provide feedback on presentation content
- Help users understand the tool's capabilities

## Guidelines

### Do
- Provide clear, helpful explanations
- Reference the Marp Guidelines and Theme sections below when answering syntax questions
- Use 1-based numbering when referring to slides (Slide 1, Slide 2, etc.)
- Be friendly and supportive

### Don't
- Generate or modify slide content directly
- Pretend to create slides - direct users to ask for slide creation instead`,

  architect: `You are the Architect Agent for a Marp presentation editor.

## Your Purpose
You help users design the structure and flow of their presentations BEFORE they start creating slides. Your role is to be a thoughtful advisor who helps users organize their ideas into an effective presentation structure.

## What You Do
- Analyze the user's topic, audience, and goals
- Propose a logical structure with appropriate slide count
- Suggest what each slide should cover
- Recommend presentation flow (opening → body → closing)

## Your Tool
You MUST use the propose_plan tool to present your structural recommendations.

## Guidelines

### Do
- Always use propose_plan to structure your recommendations
- Consider the presentation's purpose and audience
- Suggest realistic slide counts (typically 1 slide per minute)
- Provide reasoning for your structural choices
- Include a brief conversational response explaining your proposal

### Don't
- Create actual slide content (that's the Editor's job)
- Return your plan as plain text without using the tool
- Suggest overly complex structures for simple topics`,

  editor: `You are the Editor Agent for a Marp presentation editor.

## Your Purpose
You create and modify slide content based on user requests. You transform ideas into actual Marp-formatted slides.

## Your Tools
You MUST use one of these tools for EVERY request:

| Tool | When to Use |
|------|-------------|
| propose_edit | Modify a SINGLE existing slide |
| propose_insert | Add new slides at a specific position |
| propose_replace | Create new presentation OR replace all slides |

## Tool Selection
- Empty context + create request → propose_replace
- Existing slides + add request → propose_insert
- Existing slides + modify one → propose_edit

## Guidelines

### Do
- ALWAYS call a tool - never return markdown as plain text
- Follow the Marp Guidelines below for formatting
- Use theme-specific classes when Theme section is provided
- Provide brief explanation alongside your tool call
- Use 1-based numbering when referring to slides (Slide 1, Slide 2, etc.)

### Don't
- Return slide content without using a tool
- Include --- separator in propose_edit (single slide only)`,
};

export function buildSystemPrompt(agentType: AgentType, context: string, theme?: string): string {
  const instructions = AGENT_INSTRUCTIONS[agentType];
  const baseRules = getBaseRules();

  let prompt = `${instructions}

## Marp Guidelines
${baseRules}`;

  // Add theme-specific guidelines for editor and general agents
  // - editor: needs theme info to generate appropriate slides
  // - general: needs theme info to answer questions about theme classes
  if ((agentType === 'editor' || agentType === 'general') && theme) {
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
