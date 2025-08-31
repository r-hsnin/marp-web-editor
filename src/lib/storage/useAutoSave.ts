"use client";

import { useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { LOG_CATEGORIES } from "../logging/logCategories";
import { useErrorHandler } from "../error";
import { useEditorStorage } from "./useLocalStorage";
import { useSaveState } from "./useSaveState";
import type {
  SaveData,
  SaveOptions,
  SaveResult,
  AutoSaveConfig,
} from "./saveTypes";
import { DEFAULT_AUTO_SAVE_CONFIG } from "./saveTypes";

export interface UseAutoSaveProps {
  markdown: string;
  theme: string;
  config?: Partial<AutoSaveConfig>;
}

export interface UseAutoSaveReturn {
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isInitialLoad: boolean;
  saveManually: (options?: SaveOptions) => Promise<SaveResult>;
  saveToLocalStorage: (options?: SaveOptions) => Promise<SaveResult>;
  clearSavedData: () => Promise<SaveResult>;
  getSavedData: () => SaveData | null;
  formatTimeAgo: (date: Date | null) => string;
}

/**
 * 自動保存機能付きエディタ保存フック
 * LocalStorage への自動保存・手動保存を提供
 */
export function useAutoSave({
  markdown,
  theme,
  config = {},
}: UseAutoSaveProps): UseAutoSaveReturn {
  const autoSaveConfig = useMemo(
    () => ({ ...DEFAULT_AUTO_SAVE_CONFIG, ...config }),
    [config]
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: savedData, setData, removeData } = useEditorStorage();
  const saveState = useSaveState();
  const { executeWithHandling } = useErrorHandler();

  // 初期化時にローカルストレージのデータからlastSavedを設定
  useEffect(() => {
    if (
      savedData &&
      typeof savedData === "object" &&
      "timestamp" in savedData &&
      !saveState.lastSaved
    ) {
      const data = savedData as SaveData;
      saveState.setLastSaved(new Date(data.timestamp));
    }
    return undefined;
  }, [savedData, saveState]);

  // 保存処理の実行
  const performSave = useCallback(
    async (
      saveData: SaveData,
      options: SaveOptions = {}
    ): Promise<SaveResult> => {
      const { showToast = true, silent = false } = options;

      const result = await executeWithHandling(
        async () => {
          const saveResult = await setData(saveData);

          if (saveResult.success) {
            if (showToast && !silent) {
              toast.success("保存しました", {
                duration: 2000,
              });
            }
          }

          return saveResult;
        },
        {
          category: LOG_CATEGORIES.SAVE,
          showToUser: true,
          context: {
            markdownLength: saveData.markdown.length,
            theme: saveData.theme,
          },
        }
      );

      // ErrorHandlerResult を SaveResult に変換
      if (result.success && result.data) {
        return result.data;
      } else {
        return {
          success: false,
          error: result.error?.message || "Save failed",
        };
      }
    },
    [setData, executeWithHandling]
  );

  // 手動保存
  const saveManually = useCallback(
    async (options: SaveOptions = {}): Promise<SaveResult> => {
      if (saveState.isSaving) {
        return { success: false, error: "Save already in progress" };
      }

      const saveData: SaveData = {
        markdown,
        theme,
        timestamp: Date.now(),
      };

      // 保存開始状態に設定
      saveState.setIsSaving(true);

      const result = await performSave(saveData, {
        showToast: true,
        ...options,
      });

      saveState.updateSaveState(result);
      return result;
    },
    [markdown, theme, saveState, performSave]
  );

  // 自動保存の実行
  const performAutoSave = useCallback(async (): Promise<void> => {
    if (
      !autoSaveConfig.enabled ||
      saveState.isSaving ||
      saveState.isInitialLoad
    ) {
      return;
    }
    const saveData: SaveData = {
      markdown,
      theme,
      timestamp: Date.now(),
    };

    // 自動保存開始
    saveState.setIsSaving(true);

    const result = await performSave(saveData, {
      showToast: false,
      silent: true,
    });

    saveState.updateSaveState(result);
  }, [markdown, theme, autoSaveConfig.enabled, saveState, performSave]);

  // デバウンス付き自動保存のスケジュール
  const scheduleAutoSave = useCallback(() => {
    if (!autoSaveConfig.enabled || saveState.isSaving) return;

    // 既存のタイマーをクリア
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // デバウンス処理
    debounceTimeoutRef.current = setTimeout(() => {
      // 実行時にも再度チェック
      if (!saveState.isSaving) {
        saveTimeoutRef.current = setTimeout(() => {
          performAutoSave();
        }, autoSaveConfig.interval);
      }
    }, autoSaveConfig.debounceDelay);
  }, [autoSaveConfig, performAutoSave, saveState.isSaving]);

  // 前回の値を保持して変更検知
  const prevMarkdownRef = useRef(markdown);
  const prevThemeRef = useRef(theme);

  // コンテンツ変更の監視
  useEffect(() => {
    if (saveState.isInitialLoad) {
      // 初期ロード完了後に変更監視を開始
      const timer = setTimeout(() => {
        saveState.finishInitialLoad();
        // 初期値を設定
        prevMarkdownRef.current = markdown;
        prevThemeRef.current = theme;
      }, 100);
      return () => clearTimeout(timer);
    }

    // 実際に変更があった場合のみ自動保存をスケジュール
    const hasMarkdownChanged = prevMarkdownRef.current !== markdown;
    const hasThemeChanged = prevThemeRef.current !== theme;

    if ((hasMarkdownChanged || hasThemeChanged) && !saveState.isSaving) {
      saveState.markAsChanged();
      scheduleAutoSave();

      // 前回の値を更新
      prevMarkdownRef.current = markdown;
      prevThemeRef.current = theme;
    }
    return undefined;
  }, [markdown, theme, saveState, scheduleAutoSave]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 保存データのクリア
  const clearSavedData = useCallback(async (): Promise<SaveResult> => {
    const result = await removeData();
    if (result.success) {
      saveState.resetState();
      toast.success("保存データを削除しました");
    }
    return result;
  }, [removeData, saveState]);

  // 保存データの取得
  const getSavedData = useCallback((): SaveData | null => {
    if (savedData && typeof savedData === "object" && "markdown" in savedData) {
      return savedData as SaveData;
    }
    return null;
  }, [savedData]);

  // 時間の相対表示
  const formatTimeAgo = useCallback((date: Date | null): string => {
    if (!date) return "Never";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  }, []);

  return {
    lastSaved: saveState.lastSaved,
    hasUnsavedChanges: saveState.hasUnsavedChanges,
    isSaving: saveState.isSaving,
    isInitialLoad: saveState.isInitialLoad,
    saveManually,
    saveToLocalStorage: saveManually, // エイリアス
    clearSavedData,
    getSavedData,
    formatTimeAgo,
  };
}
