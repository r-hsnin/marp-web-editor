/**
 * Marp設定のバリデーション
 */

import { THEMES } from "@/lib/constants/marp";
import type { MarpTheme } from "@/types/marp";

export class MarpValidator {
  /**
   * テーマの有効性を検証（非同期対応）
   */
  static async validateTheme(theme: string): Promise<string> {
    // 組み込みテーマの場合は即座に検証
    const validBuiltInThemes = THEMES.map((t) => t.value);
    if (validBuiltInThemes.includes(theme as MarpTheme)) {
      return theme;
    }

    // カスタムテーマの存在確認
    try {
      const response = await fetch("/api/themes");

      if (!response.ok) {
        throw new Error(`Themes API failed: ${response.status}`);
      }

      const themes = await response.json();
      const themeExists = themes.some(
        (t: { name: string }) => t.name === theme
      );

      return themeExists ? theme : "default";
    } catch (error) {
      // API呼び出し失敗時はdefaultにフォールバック
      console.error(`Theme validation failed for "${theme}":`, error);
      return "default";
    }
  }

  /**
   * 設定値のバリデーション（テーマを除く）
   */
  static validateSettings(settings: Record<string, unknown>): {
    paginate: boolean;
    header: string;
    footer: string;
  } {
    return {
      paginate:
        typeof settings.paginate === "boolean" ? settings.paginate : true,
      header:
        typeof settings.header === "string"
          ? settings.header.slice(0, 100)
          : "",
      footer:
        typeof settings.footer === "string"
          ? settings.footer.slice(0, 100)
          : "",
    };
  }

  /**
   * Markdownコンテンツの基本検証
   */
  static validateMarkdown(markdown: string): boolean {
    if (typeof markdown !== "string") return false;
    if (markdown.length > 1000000) return false; // 1MB制限
    return true;
  }
}
