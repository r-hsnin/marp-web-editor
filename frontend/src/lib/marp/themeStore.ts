import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  // List of available theme names (fetched from backend)
  availableThemes: string[];
  // Currently active theme name
  activeThemeId: string;

  // Actions
  setAvailableThemes: (themes: string[]) => void;
  setActiveTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      availableThemes: [],
      activeThemeId: 'default', // Default built-in theme

      setAvailableThemes: (themes) => set({ availableThemes: themes }),
      setActiveTheme: (id) => set({ activeThemeId: id }),
    }),
    {
      name: 'marp-theme-storage', // LocalStorage key
      partialize: (state) => ({ activeThemeId: state.activeThemeId }), // Only persist activeThemeId
    },
  ),
);
