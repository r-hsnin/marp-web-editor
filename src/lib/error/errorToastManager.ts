/**
 * エラー専用Toast通知管理システム
 */

import type { ErrorInfo } from "./errorTypes";
import type { ToastOptions } from "./displayTypes";
import { DISPLAY_DURATION } from "./displayTypes";
import { ToastManager } from "@/lib/ui";

export class ErrorToastManager {
  /**
   * エラーToastを表示
   */
  static async showError(errorInfo: ErrorInfo): Promise<void> {
    const options = this.createToastOptions(errorInfo);
    await ToastManager.showError(errorInfo.userMessage, options);
  }

  /**
   * 特定のToastを削除
   */
  static async dismiss(toastId?: string): Promise<void> {
    await ToastManager.dismiss(toastId);
  }

  /**
   * Toast用オプションを作成
   */
  private static createToastOptions(errorInfo: ErrorInfo): ToastOptions {
    const duration = this.getToastDuration(errorInfo);

    const description = this.getToastDescription(errorInfo);
    const options: ToastOptions = {
      id: errorInfo.id,
      duration,
      ...(description !== undefined && { description }),
      dismissible: true,
    };

    // リトライ可能な場合はアクションボタンを追加
    if (errorInfo.canRetry) {
      options.action = {
        label: "リトライ",
        onClick: () => this.handleRetryClick(errorInfo),
      };
    }

    return options;
  }

  /**
   * Toast表示継続時間を取得
   */
  private static getToastDuration(errorInfo: ErrorInfo): number {
    switch (errorInfo.severity) {
      case "HIGH":
        return DISPLAY_DURATION.INFINITE;
      case "MEDIUM":
        return DISPLAY_DURATION.LONG;
      case "LOW":
        return DISPLAY_DURATION.MEDIUM;
      default:
        return DISPLAY_DURATION.MEDIUM;
    }
  }

  /**
   * Toast用説明文を取得
   */
  private static getToastDescription(errorInfo: ErrorInfo): string | undefined {
    if (errorInfo.type === "VALIDATION") {
      return undefined;
    }

    const descriptions: Record<string, string> = {
      NETWORK:
        "ネットワーク接続を確認し、しばらく待ってから再試行してください。",
      FILESYSTEM: "ファイル操作に失敗しました。権限を確認してください。",
      RENDERING: "コンテンツの内容を確認してください。",
      UNKNOWN: "問題が続く場合は、ページを再読み込みしてください。",
    };

    return descriptions[errorInfo.type] || descriptions["UNKNOWN"];
  }

  /**
   * リトライボタンクリック処理
   */
  private static handleRetryClick(errorInfo: ErrorInfo): void {
    const retryEvent = new CustomEvent("errorRetryRequested", {
      detail: errorInfo,
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(retryEvent);
    }
  }
}
