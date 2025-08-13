import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";

export type MarpTheme = "default" | "gaia" | "uncover";

const THEMES: MarpTheme[] = ["default", "gaia", "uncover"];

export interface ThemeState {
  selectedTheme: MarpTheme;
  availableThemes: MarpTheme[];
  isHydrated: boolean;
  handleThemeChange: (newTheme: MarpTheme) => void;
  setSelectedTheme: (newTheme: MarpTheme) => void;
  updateMarkdownTheme: (markdown: string, newTheme: MarpTheme) => string;
  getThemeDisplayName: (theme: MarpTheme) => string;
  isValidTheme: (theme: string) => theme is MarpTheme;
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
  const [isHydrated, setIsHydrated] = useState(false);

  // クライアントサイドでlocalStorageからテーマを復元
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("marp-editor-content");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedTheme = parsed.theme;
          if (savedTheme && THEMES.includes(savedTheme)) {
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
      if (!THEMES.includes(newTheme)) {
        logger.warn(LOG_CATEGORIES.SAVE, "Invalid theme selected", {
          theme: newTheme,
          availableThemes: THEMES,
        });
        return;
      }

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
    const displayNames: Record<MarpTheme, string> = {
      default: "Default",
      gaia: "Gaia",
      uncover: "Uncover",
    };
    return displayNames[theme];
  }, []);

  const isValidTheme = useCallback((theme: string): theme is MarpTheme => {
    return THEMES.includes(theme as MarpTheme);
  }, []);

  const getNextTheme = useCallback((): MarpTheme => {
    const currentIndex = THEMES.indexOf(selectedTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    return THEMES[nextIndex] ?? THEMES[0] ?? "default";
  }, [selectedTheme]);

  const getPreviousTheme = useCallback((): MarpTheme => {
    const currentIndex = THEMES.indexOf(selectedTheme);
    const previousIndex =
      currentIndex === 0 ? THEMES.length - 1 : currentIndex - 1;
    return THEMES[previousIndex] ?? THEMES[0] ?? "default";
  }, [selectedTheme]);

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
    availableThemes: THEMES,
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
