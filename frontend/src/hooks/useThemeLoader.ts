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

      // 2. External Theme (from backend API)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/themes/${activeThemeId}`);
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

  // Fetch available themes from backend
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/themes`);
        if (res.ok) {
          const data = await res.json();
          useThemeStore.getState().setAvailableThemes(data.themes);
        }
      } catch (error) {
        console.error('Failed to fetch themes:', error);
      }
    };
    fetchThemes();
  }, []);

  return { loadedCss, isLoading, activeThemeId };
};
