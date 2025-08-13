import React from "react";
import type { MarpSettings } from "@/types/marp";

// Marp設定の型定義 - 中央集約された型を使用
// MarpSettings は @/types/marp から import
export type { MarpSettings, MarpTheme } from "@/types/marp";

// 手動設定の検出状態
export interface ManualSettings {
  theme: boolean;
  paginate: boolean;
  header: boolean;
  footer: boolean;
}

// 手動設定の実際の値
export interface ManualValues {
  theme?: string;
  paginate?: boolean;
  header?: string;
  footer?: string;
}

// 設定変更ハンドラーの型
export type SettingsChangeHandler = (settings: Partial<MarpSettings>) => void;

// テーマ選択関連の型
export interface ThemeOption {
  value: string;
  label: string;
}

// 共通のコントロールProps
export interface BaseControlProps {
  settings: MarpSettings;
  manualSettings: ManualSettings;
  isHydrated: boolean;
  onSettingsChange: SettingsChangeHandler;
  isDark?: boolean;
}

// テーマセレクターのProps
export interface ThemeSelectorProps extends BaseControlProps {
  manualValues: ManualValues;
}

// ページネーション切り替えのProps
export interface PaginateToggleProps extends BaseControlProps {
  manualValues: ManualValues;
}

// ヘッダー・フッター設定のProps
export interface HeaderFooterSettingsProps extends BaseControlProps {
  manualValues: ManualValues;
}

// 設定コントロールの状態管理
export interface SettingsControlsState {
  isThemePopoverOpen: boolean;
  setIsThemePopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  displaySettings: MarpSettings;
  displayManualSettings: ManualSettings;
  manualValues: ManualValues;
  handleSettingsChange: SettingsChangeHandler;
}

// Export format type
export type ExportFormat = "html" | "pdf" | "pptx";

// Main component props interface (maintain exact compatibility)
export interface MarpEditorHeaderProps {
  isDark: boolean;
  selectedTheme: string;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  isExporting: boolean;
  exportingFormat: string | null;
  onThemeChange: (theme: string) => void;
  onExportHTML: () => void;
  onExportFile: (format: ExportFormat) => void;
  onToggleDarkMode: () => void;
  onOpenShareDialog: () => void;
  onSaveToLocalStorage: (manual?: boolean) => void;
  onClearSavedData: () => void;
  formatTimeAgo: (date: Date) => string;
  // Marp settings related props
  marpSettings: MarpSettings;
  marpManualSettings: ManualSettings;
  marpIsHydrated: boolean;
  onMarpSettingsChange: (settings: Partial<MarpSettings>) => void;
  parseManualFrontmatterValues: (markdown: string) => ManualValues;
  markdown: string;
}

// Save status display interface
export interface SaveStatusDisplay {
  icon: React.ReactNode;
  text: React.ReactNode;
}

// Sub-component props interfaces
export interface HeaderBrandingProps {
  // No props needed - pure branding display
}

export interface ExportControlsProps {
  isExportPopoverOpen: boolean;
  setIsExportPopoverOpen: (open: boolean) => void;
  exportHandlers: Record<string, () => void>;
  isExporting: boolean;
  exportingFormat: string | null;
}

export interface ActionControlsProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
  onOpenShareDialog: () => void;
  onSaveToLocalStorage: (manual?: boolean) => void;
  marpSettings: MarpSettings;
  marpManualSettings: ManualSettings;
  marpIsHydrated: boolean;
  onMarpSettingsChange: (settings: Partial<MarpSettings>) => void;
  parseManualFrontmatterValues: (markdown: string) => ManualValues;
  markdown: string;
}

export interface ActionControlsWithExportProps extends ActionControlsProps {
  exportControls: UseExportControlsReturn;
}

export interface SaveStatusProps {
  saveStatusDisplay: SaveStatusDisplay | null;
  onClearSavedData: () => void;
}

// Hook return type interfaces
export interface UseHeaderStateReturn {
  brandingProps: HeaderBrandingProps;
  actionProps: ActionControlsWithExportProps;
  saveStatusProps: SaveStatusProps;
}

export interface UseExportControlsReturn {
  isExportPopoverOpen: boolean;
  setIsExportPopoverOpen: (open: boolean) => void;
  exportHandlers: Record<string, () => void>;
  isExporting: boolean;
  exportingFormat: string | null;
}

export interface UseSaveStatusReturn {
  saveStatusDisplay: SaveStatusDisplay | null;
  onClearSavedData: () => void;
  lastSaved: Date | null;
}
