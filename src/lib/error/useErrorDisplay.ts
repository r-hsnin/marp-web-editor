/**
 * エラー表示管理のReactフック
 */

import { useCallback } from "react";
import type { ErrorInfo } from "./errorTypes";
import type { DisplayOptions } from "./displayTypes";
import { DISPLAY_TYPES } from "./displayTypes";
import { ErrorToastManager } from "./errorToastManager";
import { useToast } from "@/lib/ui";

export function useErrorDisplay() {
  const toast = useToast();

  /**
   * エラー情報を適切な方法で表示
   */
  const showError = useCallback(async (errorInfo: ErrorInfo): Promise<void> => {
    const displayType = determineDisplayType(errorInfo);

    switch (displayType) {
      case DISPLAY_TYPES.TOAST_ONLY:
        await ErrorToastManager.showError(errorInfo);
        break;
      case DISPLAY_TYPES.PERSISTENT_ONLY:
        showPersistentError(errorInfo);
        break;
      case DISPLAY_TYPES.BOTH:
        await ErrorToastManager.showError(errorInfo);
        showPersistentError(errorInfo);
        break;
      default:
        await ErrorToastManager.showError(errorInfo);
    }
  }, []);

  /**
   * 成功メッセージを表示
   */
  const showSuccess = useCallback(
    async (message: string, options: DisplayOptions = {}): Promise<void> => {
      await toast.showSuccess(message, {
        ...(options.duration !== undefined && { duration: options.duration }),
        ...(options.description !== undefined && {
          description: options.description,
        }),
      });
    },
    [toast]
  );

  /**
   * 情報メッセージを表示
   */
  const showInfo = useCallback(
    async (message: string, options: DisplayOptions = {}): Promise<void> => {
      await toast.showInfo(message, {
        ...(options.duration !== undefined && { duration: options.duration }),
        ...(options.description !== undefined && {
          description: options.description,
        }),
      });
    },
    [toast]
  );

  /**
   * ローディングメッセージを表示
   */
  const showLoading = useCallback(
    async (
      message: string,
      options: DisplayOptions = {}
    ): Promise<string | number | null> => {
      return await toast.showLoading(message, {
        ...(options.description !== undefined && {
          description: options.description,
        }),
      });
    },
    [toast]
  );

  /**
   * Toastを更新
   */
  const updateToast = useCallback(
    async (
      toastId: string,
      message: string,
      options: DisplayOptions = {}
    ): Promise<void> => {
      await toast.updateToast(toastId, message, {
        ...(options.type !== undefined && { type: options.type }),
        ...(options.duration !== undefined && { duration: options.duration }),
        ...(options.description !== undefined && {
          description: options.description,
        }),
      });
    },
    [toast]
  );

  /**
   * 特定のエラーをクリア
   */
  const clearError = useCallback(
    async (errorId: string): Promise<void> => {
      await toast.dismiss(errorId);
      clearPersistentError(errorId);
    },
    [toast]
  );

  /**
   * 全てのエラー表示をクリア
   */
  const clearAllErrors = useCallback(async (): Promise<void> => {
    await toast.dismissAll();
    clearAllPersistentErrors();
  }, [toast]);

  return {
    showError,
    showSuccess,
    showInfo,
    showLoading,
    updateToast,
    clearError,
    clearAllErrors,
  };
}

/**
 * 表示タイプを決定
 */
function determineDisplayType(errorInfo: ErrorInfo): string {
  switch (errorInfo.severity) {
    case "LOW":
      return DISPLAY_TYPES.TOAST_ONLY;
    case "MEDIUM":
      return DISPLAY_TYPES.BOTH;
    case "HIGH":
      return DISPLAY_TYPES.PERSISTENT_ONLY;
    default:
      return DISPLAY_TYPES.TOAST_ONLY;
  }
}

/**
 * 永続エラー表示を表示
 */
function showPersistentError(errorInfo: ErrorInfo): void {
  const errorDisplayEvent = new CustomEvent("showPersistentError", {
    detail: errorInfo,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(errorDisplayEvent);
  }
}

/**
 * 特定の永続エラー表示を削除
 */
function clearPersistentError(errorId: string): void {
  const clearErrorEvent = new CustomEvent("clearError", {
    detail: { errorId },
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(clearErrorEvent);
  }
}

/**
 * 全ての永続エラー表示を削除
 */
function clearAllPersistentErrors(): void {
  const clearAllErrorsEvent = new CustomEvent("clearAllErrors");

  if (typeof window !== "undefined") {
    window.dispatchEvent(clearAllErrorsEvent);
  }
}
