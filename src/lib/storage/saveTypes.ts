import type { JSONValue } from "../../types/base";

export interface SaveData {
  markdown: string;
  theme: string;
  timestamp: number;
  version?: string;
  [key: string]: JSONValue;
}

export interface SaveState {
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isInitialLoad: boolean;
}

export interface SaveOptions {
  showToast?: boolean;
  force?: boolean;
  silent?: boolean;
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // milliseconds
  debounceDelay: number; // milliseconds
}

export interface SaveResult {
  success: boolean;
  timestamp?: Date;
  error?: string;
}

export type SaveHandler = (
  data: SaveData,
  options?: SaveOptions
) => Promise<SaveResult>;

export const DEFAULT_AUTO_SAVE_CONFIG: AutoSaveConfig = {
  enabled: true,
  interval: 2000, // 2 seconds
  debounceDelay: 500, // 0.5 seconds
};

export const STORAGE_KEYS = {
  EDITOR_CONTENT: "marp-editor-content",
  AUTO_SAVE_CONFIG: "marp-auto-save-config",
} as const;
