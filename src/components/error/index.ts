/**
 * Error コンポーネント統一エクスポート
 * 分割されたコンポーネントを提供
 */

// メインコンポーネント
export { default as ErrorDisplay } from "./ErrorDisplay";
export { default as PersistentErrorDisplay } from "./PersistentErrorDisplay";

// 個別コンポーネント（必要に応じて個別使用可能）
export { ErrorItem } from "./ErrorItem";
export { ErrorStats } from "./ErrorStats";

// カスタムフック
export { usePersistentErrors } from "./hooks";

// ユーティリティ
export { getErrorStyles } from "./utils";

// 型定義
export type {
  ErrorSeverity,
  ErrorInfo,
  ErrorStats as ErrorStatsType,
  ErrorStyles,
  ErrorItemProps,
  ErrorStatsProps,
  PersistentErrorDisplayProps,
  PersistentErrorsState,
  UseErrorHandlerOptions,
} from "./types";

export { default } from "./PersistentErrorDisplay";
