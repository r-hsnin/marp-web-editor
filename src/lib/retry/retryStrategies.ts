/**
 * リトライ戦略の実装
 */

import type { RetryErrorInfo } from "./retryTypes";
import { RETRY_CONFIG } from "./retryTypes";

export class RetryStrategies {
  /**
   * 指数バックオフによる遅延時間を計算する
   */
  static calculateBackoffDelay(attempts: number): number {
    const delay =
      RETRY_CONFIG.BASE_DELAY *
      Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempts - 1);
    return Math.min(delay, RETRY_CONFIG.MAX_DELAY);
  }

  /**
   * 指定時間待機する
   */
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * リトライキーを生成する
   */
  static generateRetryKey(errorInfo: RetryErrorInfo): string {
    const operation = errorInfo.context?.operation || "unknown";
    const timestamp = Math.floor(Date.now() / 10000); // 10秒単位でグループ化
    return `${errorInfo.type}_${operation}_${timestamp}`;
  }

  /**
   * 特定の操作がリトライ可能かどうかを判定する
   */
  static isRetryableOperation(operation: string): boolean {
    const retryableOperations = [
      "marp-render",
      "export",
      "save",
      "share",
      "api-call",
    ];

    return retryableOperations.includes(operation);
  }
}
