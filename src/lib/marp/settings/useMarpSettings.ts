/**
 * Marp設定管理React Hook
 */

import { useState, useCallback, useEffect } from "react";
import type { MarpSettings, ManualSettingsFlags } from "./settingsTypes";
import { DEFAULT_SETTINGS } from "./settingsTypes";
import { SettingsValidator } from "./settingsValidator";
import { SettingsStorage } from "./settingsStorage";
import { FrontmatterProcessor } from "./frontmatterProcessor";

/**
 * Marp設定管理カスタムフック
 * フロントマター設定をUI要素で管理するための機能を提供
 */
export function useMarpSettings() {
  // 設定状態の初期化（サーバーとクライアントで統一するため、常にデフォルト設定で初期化）
  const [settings, setSettings] = useState<MarpSettings>(DEFAULT_SETTINGS);

  // 手動フロントマター設定の状態
  const [manualSettings, setManualSettings] = useState<ManualSettingsFlags>({
    theme: false,
    paginate: false,
    header: false,
    footer: false,
  });

  // ハイドレーション完了フラグ（Hydration Mismatch回避）
  const [isHydrated, setIsHydrated] = useState(false);

  // クライアントサイドでlocalStorageから設定を復元（hydration mismatch回避）
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const loadedSettings = SettingsStorage.loadSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.warn("Failed to load Marp settings:", error);
      } finally {
        // ハイドレーション完了をマーク
        setIsHydrated(true);
      }
    }
  }, []);

  /**
   * 設定更新ハンドラー
   */
  const updateSettings = useCallback((newSettings: Partial<MarpSettings>) => {
    try {
      if (!SettingsValidator.isValidSettingsObject(newSettings)) {
        console.warn(
          "Invalid settings object provided to updateSettings:",
          newSettings
        );
        return;
      }

      setSettings((prevSettings) => {
        try {
          const updatedSettings = { ...prevSettings, ...newSettings };
          const validatedSettings =
            SettingsValidator.validateSettings(updatedSettings);

          // localStorageに保存
          SettingsStorage.saveSettings(validatedSettings);

          return validatedSettings;
        } catch (error) {
          console.error("Failed to update settings:", error);
          return prevSettings;
        }
      });
    } catch (error) {
      console.error("Failed to process settings update:", error);
    }
  }, []);

  /**
   * フロントマターYAMLを解析して手動設定を検出
   */
  const parseManualFrontmatter = useCallback((markdown: string) => {
    try {
      const manualFlags = FrontmatterProcessor.parseManualFrontmatter(markdown);
      setManualSettings(manualFlags);
      return manualFlags;
    } catch (error) {
      console.warn("Failed to parse manual frontmatter:", error);
      const defaultFlags: ManualSettingsFlags = {
        theme: false,
        paginate: false,
        header: false,
        footer: false,
      };
      setManualSettings(defaultFlags);
      return defaultFlags;
    }
  }, []);

  /**
   * 手動フロントマターから実際の設定値を抽出
   */
  const parseManualFrontmatterValues = useCallback((markdown: string) => {
    try {
      return FrontmatterProcessor.parseManualFrontmatterValues(markdown);
    } catch (error) {
      console.warn("Failed to parse manual frontmatter values:", error);
      return {};
    }
  }, []);

  /**
   * UI設定からフロントマターYAMLを生成
   */
  const generateFrontmatter = useCallback(() => {
    try {
      return FrontmatterProcessor.generateFrontmatter(settings);
    } catch (error) {
      console.warn("Failed to generate frontmatter:", error);
      return "---\nmarp: true\n---";
    }
  }, [settings]);

  /**
   * 手動設定とUI設定をマージしたフロントマターを生成
   */
  const generateMergedFrontmatter = useCallback(
    (
      manualValues: Partial<MarpSettings & { size?: string }>,
      uiSettings: MarpSettings,
      manualFlags: ManualSettingsFlags
    ) => {
      return FrontmatterProcessor.generateMergedFrontmatter(
        manualValues,
        uiSettings,
        manualFlags
      );
    },
    []
  );

  /**
   * エディタ表示用Markdown（フロントマター除去済み）
   */
  const getDisplayMarkdown = useCallback((markdown: string) => {
    return FrontmatterProcessor.getDisplayMarkdown(markdown);
  }, []);

  /**
   * レンダリング用Markdown（フロントマター付き）
   */
  const getRenderMarkdown = useCallback(
    (markdown: string) => {
      return FrontmatterProcessor.getRenderMarkdown(markdown, settings);
    },
    [settings]
  );

  /**
   * 設定をクリアしてデフォルト値にリセット
   */
  const clearSettings = useCallback(() => {
    try {
      SettingsStorage.clearSettings();
      setSettings(DEFAULT_SETTINGS);
      setManualSettings({
        theme: false,
        paginate: false,
        header: false,
        footer: false,
      });
    } catch (error) {
      console.error("Failed to clear settings:", error);
    }
  }, []);

  return {
    // 設定状態
    settings,
    manualSettings,
    isHydrated,

    // 設定操作
    updateSettings,
    clearSettings,

    // フロントマター処理
    parseManualFrontmatter,
    parseManualFrontmatterValues,
    generateFrontmatter,
    generateMergedFrontmatter,

    // Markdown処理
    getDisplayMarkdown,
    getRenderMarkdown,
  };
}
