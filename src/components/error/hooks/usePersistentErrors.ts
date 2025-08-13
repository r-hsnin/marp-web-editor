/**
 * 永続エラー状態管理フック
 */

"use client";

import React from "react";
import { useErrorHandler } from "@/lib/error";
import { PersistentErrorsState, ErrorInfo, ErrorStats } from "../types";

interface UsePersistentErrorsProps {
  maxDisplayErrors: number;
  autoHideDelay: number | null;
}

export const usePersistentErrors = ({
  maxDisplayErrors: _maxDisplayErrors,
  autoHideDelay,
}: UsePersistentErrorsProps): PersistentErrorsState => {
  // 現在のuseErrorHandlerは異なるAPIを持つため、モックデータで代替
  const { clearError: _clearSingleError } = useErrorHandler();

  // モックデータ（実際の実装では適切なエラー管理システムと統合）
  const [errors] = React.useState<ErrorInfo[]>([]);
  const hasErrors = errors.length > 0;
  const isRetrying = false;

  const retryOperation = React.useCallback(
    async (error: ErrorInfo, persistent?: boolean) => {
      // 実装予定: リトライロジック
      console.log("Retry operation:", error, persistent);
    },
    []
  );

  const clearError = React.useCallback((errorId: string) => {
    // 実装予定: 個別エラークリア
    console.log("Clear error:", errorId);
  }, []);

  const clearAllErrors = React.useCallback(() => {
    // 実装予定: 全エラークリア
    console.log("Clear all errors");
  }, []);

  const getErrorStats = React.useCallback((): ErrorStats => {
    return {
      retryableErrors: 0,
      bySeverity: { HIGH: 0, MEDIUM: 0, LOW: 0 },
    };
  }, []);

  const isOperationRetrying = React.useCallback(
    (_operation?: string, _type?: string) => {
      return false;
    },
    []
  );

  // 展開状態管理
  const [expandedErrors, setExpandedErrors] = React.useState<Set<string>>(
    new Set()
  );
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // 自動非表示タイマー
  React.useEffect(() => {
    if (autoHideDelay && hasErrors) {
      const timer = setTimeout(() => {
        clearAllErrors();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [hasErrors, autoHideDelay, clearAllErrors]);

  // エラー展開状態の切り替え
  const toggleErrorExpansion = React.useCallback((errorId: string) => {
    setExpandedErrors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  }, []);

  // 全て展開/折りたたみ
  const toggleAllExpansion = React.useCallback(() => {
    if (expandedErrors.size === errors.length) {
      setExpandedErrors(new Set());
    } else {
      setExpandedErrors(new Set(errors.map((error: ErrorInfo) => error.id)));
    }
  }, [errors, expandedErrors.size]);

  return {
    errors,
    hasErrors,
    isRetrying,
    expandedErrors,
    isCollapsed,
    retryOperation,
    clearError,
    clearAllErrors,
    getErrorStats,
    isOperationRetrying,
    toggleErrorExpansion,
    toggleAllExpansion,
    setIsCollapsed,
  };
};
