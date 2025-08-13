/**
 * リトライ通知システム
 */

import type { RetryEventDetail, RetryErrorInfo } from "./retryTypes";
import { RETRY_CONFIG } from "./retryTypes";

export class RetryNotifications {
  /**
   * リトライ開始の通知
   */
  static notifyRetryStart(
    errorInfo: RetryErrorInfo,
    retryKey: string,
    attempt: number,
    isManual: boolean
  ): void {
    const message = isManual
      ? "リトライ中..."
      : `自動リトライ中... (${attempt}/${RETRY_CONFIG.MAX_ATTEMPTS})`;

    const detail: RetryEventDetail = {
      errorInfo,
      retryKey,
      attempt,
      isManual,
      message,
    };

    this.dispatchEvent("retryStarted", detail);
    console.log(`🔄 ${message}`, { errorInfo, attempt });
  }

  /**
   * リトライ成功時の処理
   */
  static handleRetrySuccess(
    errorInfo: RetryErrorInfo,
    retryKey: string,
    attempts: number
  ): void {
    const message =
      attempts > 1
        ? `処理が完了しました (${attempts}回目で成功)`
        : "処理が完了しました";

    const detail: RetryEventDetail = {
      errorInfo,
      retryKey,
      attempts,
      message,
    };

    this.dispatchEvent("retrySucceeded", detail);
    console.log(`✅ ${message}`, { errorInfo, attempts });
  }

  /**
   * リトライ失敗時の処理
   */
  static handleRetryFailure(
    errorInfo: RetryErrorInfo,
    retryKey: string,
    attempts: number,
    error: Error,
    isManual: boolean,
    isExhausted: boolean
  ): void {
    const message = isManual
      ? "リトライに失敗しました"
      : `リトライに失敗しました (${attempts}/${RETRY_CONFIG.MAX_ATTEMPTS})`;

    const detail: RetryEventDetail = {
      errorInfo,
      retryKey,
      attempts,
      error,
      isManual,
      isExhausted,
      message,
    };

    this.dispatchEvent("retryFailed", detail);
    console.error(`❌ ${message}`, { errorInfo, attempts, error });
  }

  /**
   * リトライ上限到達時の処理
   */
  static handleRetryExhausted(
    errorInfo: RetryErrorInfo,
    retryKey: string
  ): void {
    const message =
      "自動リトライが上限に達しました。手動でリトライしてください。";

    const detail: RetryEventDetail = {
      errorInfo,
      retryKey,
      message,
    };

    this.dispatchEvent("retryExhausted", detail);
    console.warn(`⚠️ ${message}`, { errorInfo });
  }

  /**
   * カスタムイベントを発火する
   */
  private static dispatchEvent(
    eventName: string,
    detail: RetryEventDetail
  ): void {
    if (typeof window !== "undefined") {
      const event = new CustomEvent(eventName, { detail });
      window.dispatchEvent(event);
    }
  }
}
