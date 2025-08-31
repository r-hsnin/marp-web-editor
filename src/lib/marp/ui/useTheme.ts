import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import type { MarpTheme } from "@/types/marp";

const BUILTIN_THEMES: string[] = ["default", "gaia", "uncover"];

export interface ThemeState {
  selectedTheme: MarpTheme;
  availableThemes: string[];
  isHydrated: boolean;
  handleThemeChange: (newTheme: MarpTheme) => void;
  setSelectedTheme: (newTheme: MarpTheme) => void;
  updateMarkdownTheme: (markdown: string, newTheme: MarpTheme) => string;
  getThemeDisplayName: (theme: MarpTheme) => string;
  isValidTheme: (theme: string) => boolean;
  getNextTheme: () => MarpTheme;
  getPreviousTheme: () => MarpTheme;
  cycleToNextTheme: () => void;
  cycleToPreviousTheme: () => void;
}

/**
 * テーマ管理とMarkdownフロントマター操作
 * Hydration Mismatch対策でLocalStorageから段階的に復元
 */
export default function useTheme(): ThemeState {
  // Hydration Mismatch回避のため、初期値は常にdefaultを使用
  const [selectedTheme, setSelectedTheme] = useState<MarpTheme>("default");
  const [availableThemes, setAvailableThemes] =
    useState<string[]>(BUILTIN_THEMES);
  const [isHydrated, setIsHydrated] = useState(false);

  // 利用可能なテーマを取得
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes");
        const themes = await response.json();
        const themeNames = themes.map((t: { name: string }) => t.name);
        setAvailableThemes(themeNames);
      } catch {
        // エラー時は組み込みテーマのみ使用
        setAvailableThemes(BUILTIN_THEMES);
      }
    };

    fetchThemes();
  }, []);

  // クライアントサイドでlocalStorageからテーマを復元
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("marp-editor-content");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedTheme = parsed.theme;
          if (savedTheme && typeof savedTheme === "string") {
            setSelectedTheme(savedTheme);
          }
        } catch (error) {
          logger.error(LOG_CATEGORIES.SAVE, "Failed to parse saved theme", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      setIsHydrated(true);
    }
  }, []);

  const handleThemeChange = useCallback(
    (newTheme: MarpTheme): void => {
      setSelectedTheme(newTheme);

      logger.debug(LOG_CATEGORIES.SAVE, "Theme changed", {
        oldTheme: selectedTheme,
        newTheme: newTheme,
      });
    },
    [selectedTheme]
  );

  /**
   * Markdownのフロントマターでテーマを更新
   * 既存のfrontmatterがあれば更新、なければ新規作成
   */
  const updateMarkdownTheme = useCallback(
    (markdown: string, newTheme: MarpTheme): string => {
      // 既存のfrontmatterをチェック
      if (markdown.startsWith("---\n")) {
        const frontmatterEnd = markdown.indexOf("\n---\n", 4);
        if (frontmatterEnd !== -1) {
          const frontmatter = markdown.substring(4, frontmatterEnd);
          const content = markdown.substring(frontmatterEnd + 5);

          // frontmatter内のテーマを更新
          let updatedFrontmatter = frontmatter;
          if (frontmatter.includes("theme:")) {
            updatedFrontmatter = frontmatter.replace(
              /theme:\s*\w+/,
              `theme: ${newTheme}`
            );
          } else {
            updatedFrontmatter = frontmatter + `\ntheme: ${newTheme}`;
          }

          return `---\n${updatedFrontmatter}\n---\n${content}`;
        }
      }

      // frontmatterが存在しない場合は新規作成
      return `---\nmarp: true\ntheme: ${newTheme}\npaginate: true\n---\n\n${markdown}`;
    },
    []
  );

  const getThemeDisplayName = useCallback((theme: MarpTheme): string => {
    const displayNames: Record<string, string> = {
      default: "Default",
      gaia: "Gaia",
      uncover: "Uncover",
    };
    return displayNames[theme] || theme;
  }, []);

  const isValidTheme = useCallback(
    (theme: string): boolean => {
      return availableThemes.includes(theme);
    },
    [availableThemes]
  );

  const getNextTheme = useCallback((): MarpTheme => {
    const currentIndex = availableThemes.indexOf(selectedTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    return availableThemes[nextIndex] ?? availableThemes[0] ?? "default";
  }, [selectedTheme, availableThemes]);

  const getPreviousTheme = useCallback((): MarpTheme => {
    const currentIndex = availableThemes.indexOf(selectedTheme);
    const previousIndex =
      currentIndex === 0 ? availableThemes.length - 1 : currentIndex - 1;
    return availableThemes[previousIndex] ?? availableThemes[0] ?? "default";
  }, [selectedTheme, availableThemes]);

  const cycleToNextTheme = useCallback((): void => {
    const nextTheme = getNextTheme();
    handleThemeChange(nextTheme);
  }, [getNextTheme, handleThemeChange]);

  const cycleToPreviousTheme = useCallback((): void => {
    const previousTheme = getPreviousTheme();
    handleThemeChange(previousTheme);
  }, [getPreviousTheme, handleThemeChange]);

  return {
    selectedTheme,
    availableThemes,
    isHydrated,
    handleThemeChange,
    setSelectedTheme: handleThemeChange,
    updateMarkdownTheme,
    getThemeDisplayName,
    isValidTheme,
    getNextTheme,
    getPreviousTheme,
    cycleToNextTheme,
    cycleToPreviousTheme,
  };
}
