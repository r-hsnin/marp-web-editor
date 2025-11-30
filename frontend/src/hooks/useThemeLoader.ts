import { useEffect, useState } from 'react';
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

      // 2. External Theme (from backend)
      try {
        const res = await fetch(`/themes/${activeThemeId}.css`);
        if (!res.ok) throw new Error('Failed to load theme');
        const css = await res.text();
        setLoadedCss(css);
      } catch (error) {
        console.error(`Failed to load theme ${activeThemeId}:`, error);
        setLoadedCss(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [activeThemeId]);

  return { loadedCss, isLoading, activeThemeId };
};
