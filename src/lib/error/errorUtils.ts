import type {
  AppError,
  ErrorSeverity,
  ErrorHandlingOptions,
} from "./errorTypes";

/**
 * 標準Errorを拡張AppErrorに変換
 */
export function createAppError(
  error: Error | string,
  options: Partial<ErrorHandlingOptions> = {}
): AppError {
  const baseError = typeof error === "string" ? new Error(error) : error;

  const appError: AppError = {
    ...baseError,
    name: baseError.name || "AppError",
    message: baseError.message,
    code: options.category || "UNKNOWN",
    category: options.category || "API",
    userFriendly: options.showToUser || false,
    retryable: options.retryable || false,
    context: options.context || {},
    operationId: generateOperationId(),
  };

  return appError;
}

/**
 * エラーの重要度を判定
 */
export function getErrorSeverity(error: AppError): ErrorSeverity {
  if (!error.category) return "MEDIUM";

  // 新しいメッセージモジュールを使用
  const { getErrorSeverityByCategory } = require("./errorMessages");
  return getErrorSeverityByCategory(error.category, error);
}

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 */
export function getUserFriendlyMessage(error: AppError): string {
  if (error.userFriendly && error.message) {
    return error.message;
  }

  if (!error.category) {
    return "予期しないエラーが発生しました。";
  }

  // 新しいメッセージモジュールを使用
  const { getFriendlyErrorMessage } = require("./errorMessages");
  return getFriendlyErrorMessage(error.category, error);
}

/**
 * エラーがリトライ可能かを判定
 */
export function isRetryableError(error: AppError): boolean {
  if (error.retryable !== undefined) {
    return error.retryable;
  }

  // ネットワークエラーはリトライ可能
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return true;
  }

  // 一時的なサーバーエラーはリトライ可能
  if (
    error.message.includes("500") ||
    error.message.includes("502") ||
    error.message.includes("503")
  ) {
    return true;
  }

  // 認証エラーはリトライ不可
  if (error.category === "AUTH") {
    return false;
  }

  // バリデーションエラーはリトライ不可
  if (error.category === "VALIDATION") {
    return false;
  }

  return false;
}

/**
 * リトライ遅延時間を計算（指数バックオフ）
 */
export function calculateRetryDelay(
  retryCount: number,
  baseDelay = 1000
): number {
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000); // 最大10秒
}

function generateOperationId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
