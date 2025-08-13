/**
 * Marp設定のバリデーション
 */

import { THEMES } from "@/lib/constants/marp";
import type { MarpTheme } from "@/types/marp";

export class MarpValidator {
  /**
   * テーマの有効性を検証
   */
  static validateTheme(theme: string): string {
    const validThemes = THEMES.map((t) => t.value);
    return validThemes.includes(theme as MarpTheme) ? theme : "default";
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
