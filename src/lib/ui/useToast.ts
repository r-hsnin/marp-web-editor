/**
 * Toast通知のReactフック
 */

import { useCallback } from "react";
import type { ToastOptions, ToastUpdateOptions } from "./toastTypes";
import { ToastManager } from "./toastManager";

export function useToast() {
  /**
   * 成功メッセージを表示
   */
  const showSuccess = useCallback(
    async (
      message: string,
      options: Partial<ToastOptions> = {}
    ): Promise<void> => {
      await ToastManager.showSuccess(message, options);
    },
    []
  );

  /**
   * エラーメッセージを表示
   */
  const showError = useCallback(
    async (
      message: string,
      options: Partial<ToastOptions> = {}
    ): Promise<void> => {
      await ToastManager.showError(message, options);
    },
    []
  );

  /**
   * 情報メッセージを表示
   */
  const showInfo = useCallback(
    async (
      message: string,
      options: Partial<ToastOptions> = {}
    ): Promise<void> => {
      await ToastManager.showInfo(message, options);
    },
    []
  );

  /**
   * 警告メッセージを表示
   */
  const showWarning = useCallback(
    async (
      message: string,
      options: Partial<ToastOptions> = {}
    ): Promise<void> => {
      await ToastManager.showWarning(message, options);
    },
    []
  );

  /**
   * ローディングメッセージを表示
   */
  const showLoading = useCallback(
    async (
      message: string,
      options: Partial<ToastOptions> = {}
    ): Promise<string | number | null> => {
      return await ToastManager.showLoading(message, options);
    },
    []
  );

  /**
   * Toastを更新
   */
  const updateToast = useCallback(
    async (
      toastId: string,
      message: string,
      options: ToastUpdateOptions = {}
    ): Promise<void> => {
      await ToastManager.updateToast(toastId, message, options);
    },
    []
  );

  /**
   * 特定のToastを削除
   */
  const dismiss = useCallback(async (toastId?: string): Promise<void> => {
    await ToastManager.dismiss(toastId);
  }, []);

  /**
   * 全てのToastを削除
   */
  const dismissAll = useCallback(async (): Promise<void> => {
    await ToastManager.dismissAll();
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    updateToast,
    dismiss,
    dismissAll,
  };
}
