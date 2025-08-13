/**
 * 設定管理システムの型定義
 */

// Import MarpTheme from centralized types
import type { MarpTheme } from "@/types/marp";

export interface MarpSettings {
  theme: MarpTheme; // Use MarpTheme instead of string
  paginate: boolean;
  header: string;
  footer: string;
  [key: string]: unknown;
}

export interface ManualSettingsFlags {
  theme: boolean;
  paginate: boolean;
  header: boolean;
  footer: boolean;
}

export interface FrontmatterExtraction {
  frontmatter: string;
  content: string;
  hasManualFrontmatter: boolean;
}

export interface StorageData {
  settings: MarpSettings;
  timestamp: number;
}

export const DEFAULT_SETTINGS: MarpSettings = {
  theme: "default" as MarpTheme,
  paginate: true,
  header: "",
  footer: "",
};

export const STORAGE_KEY = "marp-editor-settings";

export const VALID_THEMES = ["default", "gaia", "uncover"] as const;
export type ValidTheme = (typeof VALID_THEMES)[number];

// Re-export MarpTheme for compatibility
export type { MarpTheme } from "@/types/marp";
