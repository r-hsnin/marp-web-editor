/**
 * 設定値のバリデーション
 */

import type { MarpSettings, ValidTheme } from "./settingsTypes";
import { VALID_THEMES, DEFAULT_SETTINGS } from "./settingsTypes";

export class SettingsValidator {
  /**
   * 設定値の検証とサニタイゼーション
   */
  static validateSettings(inputSettings: Partial<MarpSettings>): MarpSettings {
    return {
      theme:
        inputSettings.theme &&
        VALID_THEMES.includes(inputSettings.theme as ValidTheme)
          ? inputSettings.theme
          : DEFAULT_SETTINGS.theme,
      paginate:
        typeof inputSettings.paginate === "boolean"
          ? inputSettings.paginate
          : DEFAULT_SETTINGS.paginate,
      header:
        typeof inputSettings.header === "string"
          ? inputSettings.header.slice(0, 100)
          : DEFAULT_SETTINGS.header,
      footer:
        typeof inputSettings.footer === "string"
          ? inputSettings.footer.slice(0, 100)
          : DEFAULT_SETTINGS.footer,
    };
  }

  /**
   * 設定オブジェクトの妥当性チェック
   */
  static isValidSettingsObject(obj: unknown): obj is Partial<MarpSettings> {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    const settings = obj as Record<string, unknown>;

    // 各プロパティの型チェック
    if (settings.theme !== undefined && typeof settings.theme !== "string") {
      return false;
    }
    if (
      settings.paginate !== undefined &&
      typeof settings.paginate !== "boolean"
    ) {
      return false;
    }
    if (settings.header !== undefined && typeof settings.header !== "string") {
      return false;
    }
    if (settings.footer !== undefined && typeof settings.footer !== "string") {
      return false;
    }

    return true;
  }

  /**
   * テーマの妥当性チェック
   */
  static isValidTheme(theme: string): theme is ValidTheme {
    return VALID_THEMES.includes(theme as ValidTheme);
  }
}
