/**
 * 統一リトライ管理システム
 */

import type { RetryResult, RetryStats, RetryErrorInfo } from "./retryTypes";
import { RETRY_CONFIG, RETRY_STATUS } from "./retryTypes";
import { RetryStrategies } from "./retryStrategies";
import { RetryOperations } from "./retryOperations";
import { RetryNotifications } from "./retryNotifications";

export class RetryManager {
  // リトライ試行回数を管理するMap
  private static retryAttempts = new Map<string, number>();

  // 進行中のリトライを管理するMap
  private static activeRetries = new Map<string, Promise<RetryResult>>();

  /**
   * エラーに対してリトライを実行する
   */
  static async retry(
    errorInfo: RetryErrorInfo,
    isManual: boolean = false
  ): Promise<RetryResult> {
    const retryKey = RetryStrategies.generateRetryKey(errorInfo);
    const attempts = this.retryAttempts.get(retryKey) || 0;

    // 自動リトライの上限チェック
    if (!isManual && attempts >= RETRY_CONFIG.MAX_ATTEMPTS) {
      RetryNotifications.handleRetryExhausted(errorInfo, retryKey);
      return {
        success: false,
        status: RETRY_STATUS.EXHAUSTED,
        attempts,
        errorInfo,
      };
    }

    // 既に進行中のリトライがある場合は待機
    if (this.activeRetries.has(retryKey)) {
      const activeRetry = this.activeRetries.get(retryKey);
      if (activeRetry) {
        return activeRetry;
      }
    }

    // リトライ実行
    const retryPromise = this.executeRetry(
      errorInfo,
      retryKey,
      attempts,
      isManual
    );
    this.activeRetries.set(retryKey, retryPromise);

    try {
      const result = await retryPromise;
      this.activeRetries.delete(retryKey);
      return result;
    } catch (error) {
      this.activeRetries.delete(retryKey);
      throw error;
    }
  }

  /**
   * リトライを実行する
   */
  private static async executeRetry(
    errorInfo: RetryErrorInfo,
    retryKey: string,
    attempts: number,
    isManual: boolean
  ): Promise<RetryResult> {
    // 試行回数を更新
    this.retryAttempts.set(retryKey, attempts + 1);

    try {
      // リトライ開始の通知
      RetryNotifications.notifyRetryStart(
        errorInfo,
        retryKey,
        attempts + 1,
        isManual
      );

      // 指数バックオフによる待機（手動リトライの場合は即座に実行）
      if (!isManual && attempts > 0) {
        const delay = RetryStrategies.calculateBackoffDelay(attempts);
        await RetryStrategies.delay(delay);
      }

      // 元の処理を再実行
      const result = await RetryOperations.executeOriginalOperation(errorInfo);

      // 成功時の処理
      RetryNotifications.handleRetrySuccess(errorInfo, retryKey, attempts + 1);

      return {
        success: true,
        status: RETRY_STATUS.SUCCESS,
        attempts: attempts + 1,
        result,
        errorInfo,
      };
    } catch (error) {
      // リトライ失敗時の処理
      return this.handleRetryFailure(
        errorInfo,
        retryKey,
        attempts + 1,
        error as Error,
        isManual
      );
    }
  }

  /**
   * リトライ失敗時の処理
   */
  private static handleRetryFailure(
    errorInfo: RetryErrorInfo,
    retryKey: string,
    attempts: number,
    error: Error,
    isManual: boolean
  ): RetryResult {
    const maxAttempts = RETRY_CONFIG.MAX_ATTEMPTS;
    const isExhausted = attempts >= maxAttempts;

    if (isExhausted) {
      RetryNotifications.handleRetryExhausted(errorInfo, retryKey);
    }

    RetryNotifications.handleRetryFailure(
      errorInfo,
      retryKey,
      attempts,
      error,
      isManual,
      isExhausted
    );

    return {
      success: false,
      status: isExhausted ? RETRY_STATUS.EXHAUSTED : RETRY_STATUS.FAILED,
      attempts,
      error,
      errorInfo,
    };
  }

  /**
   * 特定のリトライをキャンセルする
   */
  static cancelRetry(retryKey: string): void {
    this.retryAttempts.delete(retryKey);
    this.activeRetries.delete(retryKey);
  }

  /**
   * 全てのリトライをクリアする
   */
  static clearAllRetries(): void {
    this.retryAttempts.clear();
    this.activeRetries.clear();
  }

  /**
   * リトライ統計情報を取得する
   */
  static getRetryStats(): RetryStats {
    return {
      activeRetries: this.activeRetries.size,
      totalRetryKeys: this.retryAttempts.size,
      retryAttempts: Object.fromEntries(this.retryAttempts),
    };
  }

  /**
   * 特定の操作がリトライ可能かどうかを判定する
   */
  static isRetryableOperation(operation: string): boolean {
    return RetryStrategies.isRetryableOperation(operation);
  }
}
