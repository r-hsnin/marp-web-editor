export const OFFICIAL_THEMES = [
  { id: 'default', name: 'Default (Built-in)', type: 'builtin' },
  { id: 'gaia', name: 'Gaia (Built-in)', type: 'builtin' },
  { id: 'uncover', name: 'Uncover (Built-in)', type: 'builtin' },
  { id: 'professional', name: 'Professional', type: 'external', url: '/themes/professional.css' },
] as const;

export type OfficialThemeId = (typeof OFFICIAL_THEMES)[number]['id'];
