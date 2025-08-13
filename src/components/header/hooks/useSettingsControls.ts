/**
 * Settings Controls共通状態管理フック
 */

import React from "react";
import type {
  MarpSettings,
  ManualSettings,
  ManualValues,
  SettingsChangeHandler,
  SettingsControlsState,
} from "../types";

// デフォルト設定（Hydration Mismatch回避用）
const DEFAULT_SETTINGS: MarpSettings = {
  theme: "default",
  paginate: true,
  header: "",
  footer: "",
};

const DEFAULT_MANUAL_SETTINGS: ManualSettings = {
  theme: false,
  paginate: false,
  header: false,
  footer: false,
};

interface UseSettingsControlsProps {
  settings: MarpSettings;
  manualSettings: ManualSettings;
  isHydrated: boolean;
  onSettingsChange: SettingsChangeHandler;
  parseManualFrontmatterValues?: (markdown: string) => ManualValues;
  markdown: string;
}

export const useSettingsControls = ({
  settings,
  manualSettings,
  isHydrated,
  onSettingsChange,
  parseManualFrontmatterValues,
  markdown,
}: UseSettingsControlsProps): SettingsControlsState => {
  // Theme popover の開閉状態管理
  const [isThemePopoverOpen, setIsThemePopoverOpen] = React.useState(false);

  // 設定変更のログ出力とエラーハンドリング
  const handleSettingsChange = React.useCallback(
    (newSettings: Partial<MarpSettings>) => {
      try {
        if (!newSettings || typeof newSettings !== "object") {
          console.warn("Invalid settings object provided:", newSettings);
          return;
        }

        onSettingsChange(newSettings);
      } catch (error) {
        console.error("Error in handleSettingsChange:", error);
        // エラーが発生してもUIを破壊しないよう、何もしない
      }
    },
    [onSettingsChange]
  );

  // Hydration Mismatch回避：ハイドレーション完了まではデフォルト設定を使用
  const displaySettings = isHydrated ? settings : DEFAULT_SETTINGS;
  const displayManualSettings = isHydrated
    ? manualSettings
    : DEFAULT_MANUAL_SETTINGS;

  // 手動設定の実際の値を取得（エラーハンドリング付き）
  const manualValues = React.useMemo(() => {
    if (!isHydrated || !parseManualFrontmatterValues) return {};
    try {
      return parseManualFrontmatterValues(markdown);
    } catch (error) {
      console.warn(
        "Failed to parse manual frontmatter values in useSettingsControls:",
        error
      );
      return {};
    }
  }, [isHydrated, parseManualFrontmatterValues, markdown]);

  return {
    isThemePopoverOpen,
    setIsThemePopoverOpen,
    displaySettings,
    displayManualSettings,
    manualValues,
    handleSettingsChange,
  };
};
