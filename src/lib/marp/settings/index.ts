/**
 * 設定管理システムのエクスポート
 */

// 型定義
export type {
  MarpSettings,
  ManualSettingsFlags,
  FrontmatterExtraction,
  StorageData,
  ValidTheme,
} from "./settingsTypes";

export { DEFAULT_SETTINGS, STORAGE_KEY, VALID_THEMES } from "./settingsTypes";

// コアクラス
export { SettingsValidator } from "./settingsValidator";
export { SettingsStorage } from "./settingsStorage";
export { FrontmatterProcessor } from "./frontmatterProcessor";

// React Hook
export { useMarpSettings } from "./useMarpSettings";

export { useMarpSettings as default } from "./useMarpSettings";
