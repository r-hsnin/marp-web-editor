/**
 * PersistentErrorDisplay関連の型定義
 */

import React from "react";
import type { ErrorContext } from "@/types/base";

// エラー重要度の型
export type ErrorSeverity = "HIGH" | "MEDIUM" | "LOW";

// エラー情報の型
export interface ErrorInfo {
  id: string;
  type: string;
  severity: ErrorSeverity;
  userMessage: string;
  timestamp: number;
  canRetry: boolean;
  context?: {
    operation?: string;
  } & ErrorContext;
  originalError?: {
    message: string;
    name?: string;
    stack?: string;
    code?: string;
    cause?: unknown;
  };
}

// エラー統計の型
export interface ErrorStats {
  retryableErrors: number;
  bySeverity: Record<ErrorSeverity, number>;
}

// エラースタイルの型
export interface ErrorStyles {
  container: string;
  icon: string;
  title: string;
  description: string;
  button: string;
}

// エラーアイテムのProps
export interface ErrorItemProps {
  error: ErrorInfo;
  onRetry: (error: ErrorInfo) => void;
  onDismiss: (errorId: string) => void;
  isRetrying: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

// エラー統計表示のProps
export interface ErrorStatsProps {
  stats: ErrorStats;
}

// メインコンポーネントのProps
export interface PersistentErrorDisplayProps {
  maxDisplayErrors?: number;
  autoHideDelay?: number | null;
  showErrorStats?: boolean;
  className?: string;
}

// 永続エラー状態管理の型
export interface PersistentErrorsState {
  errors: ErrorInfo[];
  hasErrors: boolean;
  isRetrying: boolean;
  expandedErrors: Set<string>;
  isCollapsed: boolean;
  retryOperation: (error: ErrorInfo, persistent?: boolean) => Promise<void>;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  getErrorStats: () => ErrorStats;
  isOperationRetrying: (operation?: string, type?: string) => boolean;
  toggleErrorExpansion: (errorId: string) => void;
  toggleAllExpansion: () => void;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

// useErrorHandlerのオプション型
export interface UseErrorHandlerOptions {
  persistentErrorsOnly?: boolean;
  maxStoredErrors?: number;
}
