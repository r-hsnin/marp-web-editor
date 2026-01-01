import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/config';
import { logger } from '../lib/logger';
import { useThemeStore } from '../lib/marp/themeStore';

const BUILTIN_THEMES = ['default', 'gaia', 'uncover'];

export const useThemeLoader = () => {
  const { activeThemeId } = useThemeStore();
  const [loadedCss, setLoadedCss] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      setIsLoading(true);

      // 1. Built-in Theme
      if (BUILTIN_THEMES.includes(activeThemeId)) {
        setLoadedCss(null);
        setIsLoading(false);
        return;
      }

      // 2. External Theme (from backend API)
      try {
        const res = await fetch(`${API_BASE}/api/themes/${activeThemeId}`);
        if (!res.ok) throw new Error('Failed to load theme');
        const css = await res.text();
        setLoadedCss(css);
      } catch (error) {
        logger.warn(`Failed to load theme ${activeThemeId}:`, error);
        setLoadedCss(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [activeThemeId]);

  // Fetch available themes from backend
  useEffect(() => {
    const loadThemes = async () => {
      const themes = await import('../lib/api').then((m) => m.fetchThemes());
      useThemeStore.getState().setAvailableThemes(themes);
    };
    loadThemes();
  }, []);

  return { loadedCss, isLoading, activeThemeId };
};
