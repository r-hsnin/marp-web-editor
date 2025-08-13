import { logger } from "../logging/logger";
import { LOG_CATEGORIES } from "../logging/logCategories";
import type {
  AppError,
  ErrorHandlingOptions,
  ErrorHandlerResult,
  ErrorMetrics,
} from "./errorTypes";
import {
  createAppError,
  getErrorSeverity,
  getUserFriendlyMessage,
  isRetryableError,
  calculateRetryDelay,
} from "./errorUtils";

/**
 * エラーを処理し、ログ記録・ユーザー通知・リトライ判定を行う
 */
export async function processError(
  error: Error | string,
  options: ErrorHandlingOptions = {}
): Promise<ErrorHandlerResult> {
  const appError = createAppError(error, options);
  const severity = getErrorSeverity(appError);

  // エラーログを記録
  if (options.logError !== false) {
    const logMethod =
      severity === "CRITICAL" || severity === "HIGH" ? "error" : "warn";

    logger[logMethod](
      appError.category || LOG_CATEGORIES.API,
      appError.message,
      {
        operationId: appError.operationId || "unknown",
        severity,
        ...(appError.code !== undefined && { code: appError.code }),
        ...(process.env.NODE_ENV === "development" &&
          appError.stack !== undefined && { stack: appError.stack }),
        ...(appError.context !== undefined && { context: appError.context }),
      }
    );
  }

  // リトライ判定
  const shouldRetry = options.retryable !== false && isRetryableError(appError);

  // ユーザーメッセージ生成
  const userMessage =
    options.showToUser !== false ? getUserFriendlyMessage(appError) : undefined;

  return {
    success: false,
    error: appError,
    shouldRetry,
    ...(userMessage !== undefined && { userMessage }),
  };
}

/**
 * 関数を実行し、エラーハンドリングを適用
 */
export async function executeWithErrorHandling<T>(
  fn: () => Promise<T> | T,
  options: ErrorHandlingOptions = {}
): Promise<ErrorHandlerResult & { data?: T }> {
  try {
    const data = await fn();

    logger.debug(
      options.category || LOG_CATEGORIES.API,
      "Operation completed successfully",
      {
        context: options.context,
      }
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    const result = await processError(error as Error, options);
    return result;
  }
}

/**
 * リトライ機能付きで関数を実行
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T> | T,
  options: ErrorHandlingOptions = {}
): Promise<ErrorHandlerResult & { data?: T }> {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.retryDelay || 1000;

  let lastError: AppError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await fn();

      if (attempt > 0) {
        logger.debug(
          options.category || LOG_CATEGORIES.API,
          "Operation succeeded after retry",
          {
            attempt,
            maxRetries,
            context: options.context,
          }
        );
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      const result = await processError(error as Error, {
        ...options,
        logError: attempt === maxRetries, // 最後の試行でのみログ
      });

      if (result.error) {
        lastError = result.error;
      }

      // 最後の試行または リトライ不可の場合は終了
      if (attempt === maxRetries || !result.shouldRetry) {
        const finalError = lastError || result.error;
        if (finalError) {
          return {
            success: false,
            error: finalError,
            ...(result.userMessage !== undefined && {
              userMessage: result.userMessage,
            }),
          };
        }
        // フォールバック用のエラーを作成
        const fallbackError = createAppError(
          "Unknown error occurred during retry",
          options
        );
        return {
          success: false,
          error: fallbackError,
          ...(result.userMessage !== undefined && {
            userMessage: result.userMessage,
          }),
        };
      }

      // リトライ前の待機
      if (attempt < maxRetries) {
        const delay = calculateRetryDelay(attempt, baseDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // この時点でlastErrorは必ず存在するはずだが、型安全性のためにチェック
  if (!lastError) {
    // フォールバック用のエラーを作成
    lastError = createAppError("Unknown error occurred during retry", options);
  }

  return {
    success: false,
    error: lastError,
    userMessage: getUserFriendlyMessage(lastError),
  };
}

/**
 * エラーメトリクスを収集
 */
export function collectErrorMetrics(
  error: AppError,
  resolved = false
): ErrorMetrics {
  return {
    timestamp: Date.now(),
    category: error.category || LOG_CATEGORIES.API,
    severity: getErrorSeverity(error),
    resolved,
    retryCount: 0, // 実装時に追加
  };
}
