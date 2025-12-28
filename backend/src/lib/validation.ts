/**
 * Common validation utilities for theme and template names.
 * Prevents path traversal attacks by enforcing a strict whitelist pattern.
 */

const SAFE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Marp built-in themes that don't have custom guideline files.
 */
export const BUILTIN_THEMES = ['default', 'gaia', 'uncover'] as const;
export type BuiltinTheme = (typeof BUILTIN_THEMES)[number];

/**
 * Validates a theme or template name against a safe pattern.
 * Only allows alphanumeric characters, underscores, and hyphens.
 */
export function isValidName(name: string): boolean {
  return SAFE_NAME_PATTERN.test(name);
}

/**
 * Checks if a theme is a Marp built-in theme.
 */
export function isBuiltinTheme(theme: string): theme is BuiltinTheme {
  return BUILTIN_THEMES.includes(theme as BuiltinTheme);
}
