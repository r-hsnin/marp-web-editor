// エラーハンドリングモジュールのエクスポート

// 型定義
export type {
  AppError,
  ErrorHandlingOptions,
  ErrorState,
  ErrorHandlerResult,
  ErrorSeverity,
  ErrorMetrics,
  ErrorInfo,
} from "./errorTypes";

// ユーティリティ関数
export {
  createAppError,
  getErrorSeverity,
  getUserFriendlyMessage,
  isRetryableError,
  calculateRetryDelay,
} from "./errorUtils";

// エラーメッセージ管理
export {
  USER_ERROR_MESSAGES,
  getFriendlyErrorMessage,
  getErrorSeverityByCategory,
} from "./errorMessages";

// エラーログ管理 - logging/モジュールから再エクスポート
export {
  logError,
  logWarning,
  logDebug,
  getLogEntries,
  getLogMetrics,
  clearLogs,
  initializeLogger,
  destroyLogger,
} from "../logging/logStorage";

// ログ関連型定義 - logging/モジュールから再エクスポート
export type { LogEntry, LogMetrics, LoggerConfig } from "../logging/logTypes";

// エラー処理ロジック
export {
  processError,
  executeWithErrorHandling,
  executeWithRetry,
  collectErrorMetrics,
} from "./errorProcessor";

// Reactフック
export { useErrorHandler, type UseErrorHandlerReturn } from "./useErrorHandler";

// エラー表示システム
export type {
  DisplayType,
  ToastOptions,
  DisplayOptions,
  DisplayStats,
} from "./displayTypes";
export { DISPLAY_TYPES, DISPLAY_DURATION } from "./displayTypes";
export { ErrorToastManager } from "./errorToastManager";
export { useErrorDisplay } from "./useErrorDisplay";
