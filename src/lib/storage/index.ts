// ストレージ管理モジュールのエクスポート

// 型定義
export type {
  SaveData,
  SaveState,
  SaveOptions,
  AutoSaveConfig,
  SaveResult,
  SaveHandler,
} from "./saveTypes";

export { DEFAULT_AUTO_SAVE_CONFIG, STORAGE_KEYS } from "./saveTypes";

// LocalStorage操作
export {
  useLocalStorage,
  useEditorStorage,
  type UseLocalStorageReturn,
} from "./useLocalStorage";

// 保存状態管理
export { useSaveState, type UseSaveStateReturn } from "./useSaveState";

// 自動保存機能
export {
  useAutoSave,
  type UseAutoSaveProps,
  type UseAutoSaveReturn,
} from "./useAutoSave";
