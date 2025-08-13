/**
 * リトライ機能のReactフック
 */

import { useCallback, useState, useEffect } from "react";
import type { RetryResult, RetryStats, RetryErrorInfo } from "./retryTypes";
import { RetryManager } from "./retryManager";

export function useRetry() {
  const [retryStats, setRetryStats] = useState<RetryStats>(() =>
    RetryManager.getRetryStats()
  );

  /**
   * リトライを実行する
   */
  const executeRetry = useCallback(
    async (
      errorInfo: RetryErrorInfo,
      isManual: boolean = false
    ): Promise<RetryResult> => {
      const result = await RetryManager.retry(errorInfo, isManual);
      setRetryStats(RetryManager.getRetryStats());
      return result;
    },
    []
  );

  /**
   * 手動リトライを実行する
   */
  const manualRetry = useCallback(
    async (errorInfo: RetryErrorInfo): Promise<RetryResult> => {
      return executeRetry(errorInfo, true);
    },
    [executeRetry]
  );

  /**
   * 自動リトライを実行する
   */
  const autoRetry = useCallback(
    async (errorInfo: RetryErrorInfo): Promise<RetryResult> => {
      return executeRetry(errorInfo, false);
    },
    [executeRetry]
  );

  /**
   * 特定のリトライをキャンセルする
   */
  const cancelRetry = useCallback((retryKey: string): void => {
    RetryManager.cancelRetry(retryKey);
    setRetryStats(RetryManager.getRetryStats());
  }, []);

  /**
   * 全てのリトライをクリアする
   */
  const clearAllRetries = useCallback((): void => {
    RetryManager.clearAllRetries();
    setRetryStats(RetryManager.getRetryStats());
  }, []);

  /**
   * 操作がリトライ可能かどうかを判定する
   */
  const isRetryableOperation = useCallback((operation: string): boolean => {
    return RetryManager.isRetryableOperation(operation);
  }, []);

  /**
   * リトライ統計を更新する
   */
  const refreshStats = useCallback((): void => {
    setRetryStats(RetryManager.getRetryStats());
  }, []);

  // リトライイベントのリスナー設定
  useEffect(() => {
    const handleRetryEvent = () => {
      setRetryStats(RetryManager.getRetryStats());
    };

    if (typeof window !== "undefined") {
      window.addEventListener("retryStarted", handleRetryEvent);
      window.addEventListener("retrySucceeded", handleRetryEvent);
      window.addEventListener("retryFailed", handleRetryEvent);
      window.addEventListener("retryExhausted", handleRetryEvent);

      return () => {
        window.removeEventListener("retryStarted", handleRetryEvent);
        window.removeEventListener("retrySucceeded", handleRetryEvent);
        window.removeEventListener("retryFailed", handleRetryEvent);
        window.removeEventListener("retryExhausted", handleRetryEvent);
      };
    }
    return undefined;
  }, []);

  return {
    executeRetry,
    manualRetry,
    autoRetry,
    cancelRetry,
    clearAllRetries,
    isRetryableOperation,
    refreshStats,
    retryStats,
  };
}
