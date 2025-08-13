/**
 * 設定の永続化管理
 */

import type { MarpSettings, StorageData } from "./settingsTypes";
import { STORAGE_KEY, DEFAULT_SETTINGS } from "./settingsTypes";
import { SettingsValidator } from "./settingsValidator";

export class SettingsStorage {
  /**
   * LocalStorageから設定を読み込み
   */
  static loadSettings(): MarpSettings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return DEFAULT_SETTINGS;
      }

      const parsed: StorageData = JSON.parse(saved);
      if (!parsed.settings) {
        return DEFAULT_SETTINGS;
      }

      return SettingsValidator.validateSettings(parsed.settings);
    } catch (error) {
      console.warn("Failed to load Marp settings from localStorage:", error);
      this.clearSettings();
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * LocalStorageに設定を保存
   */
  static saveSettings(settings: MarpSettings): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const validatedSettings = SettingsValidator.validateSettings(settings);
      const storageData: StorageData = {
        settings: validatedSettings,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error("Failed to save Marp settings to localStorage:", error);
      return false;
    }
  }

  /**
   * LocalStorageから設定を削除
   */
  static clearSettings(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to clear Marp settings from localStorage:", error);
      }
    }
  }

  /**
   * 設定が存在するかチェック
   */
  static hasStoredSettings(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null;
    } catch {
      return false;
    }
  }

  /**
   * 設定の最終更新時刻を取得
   */
  static getLastUpdateTime(): number | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return null;
      }

      const parsed: StorageData = JSON.parse(saved);
      return parsed.timestamp || null;
    } catch {
      return null;
    }
  }
}
