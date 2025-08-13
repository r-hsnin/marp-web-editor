/**
 * 統一エラーハンドリングシステム - PersistentErrorDisplay
 *
 * 責任範囲:
 * - 永続的なエラー表示用のReactコンポーネント
 * - エラー情報の表示とリトライボタン
 * - 複数エラーのスタック表示
 * - エラー解決時の自動非表示機能
 * - アクセシビリティ対応
 */

"use client";

import React from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorItem } from "./ErrorItem";
import { ErrorStats } from "./ErrorStats";
import { usePersistentErrors } from "./hooks/usePersistentErrors";
import { PersistentErrorDisplayProps, ErrorInfo } from "./types";

/**
 * 永続エラー表示コンポーネント
 */
export const PersistentErrorDisplay: React.FC<PersistentErrorDisplayProps> = ({
  maxDisplayErrors = 5,
  autoHideDelay = null,
  showErrorStats = false,
  className = "",
}) => {
  const {
    errors,
    hasErrors,
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
  } = usePersistentErrors({
    maxDisplayErrors,
    autoHideDelay,
  });

  // リトライハンドラー
  const handleRetry = React.useCallback(
    async (error: ErrorInfo) => {
      try {
        await retryOperation(error, true);
      } catch (retryError) {
        console.error("Retry failed:", retryError);
      }
    },
    [retryOperation]
  );

  // エラーがない場合は何も表示しない
  if (!hasErrors) {
    return null;
  }

  const displayErrors = errors.slice(0, maxDisplayErrors);
  const hiddenErrorCount = Math.max(0, errors.length - maxDisplayErrors);
  const stats = showErrorStats ? getErrorStats() : null;

  return (
    <div
      className={`fixed top-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50 ${className}`}
      role="region"
      aria-label="エラー通知"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              エラー通知 ({errors.length})
            </h2>
          </div>

          <div className="flex items-center space-x-1">
            {/* 全て展開/折りたたみボタン */}
            {displayErrors.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllExpansion}
                className="p-1 h-auto text-xs"
                aria-label={
                  expandedErrors.size === errors.length
                    ? "全て折りたたみ"
                    : "全て展開"
                }
              >
                {expandedErrors.size === errors.length ? "折りたたみ" : "展開"}
              </Button>
            )}

            {/* 全てクリアボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllErrors}
              className="p-1 h-auto text-xs"
              aria-label="全てのエラーをクリア"
            >
              全てクリア
            </Button>

            {/* 折りたたみボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 h-auto"
              aria-label={
                isCollapsed ? "エラー一覧を表示" : "エラー一覧を非表示"
              }
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* エラー一覧 */}
        {!isCollapsed && (
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2 p-3">
              {displayErrors.map((error) => (
                <ErrorItem
                  key={error.id}
                  error={error}
                  onRetry={handleRetry}
                  onDismiss={clearError}
                  isRetrying={isOperationRetrying(
                    error.context?.operation,
                    error.type
                  )}
                  isExpanded={expandedErrors.has(error.id)}
                  onToggleExpand={() => toggleErrorExpansion(error.id)}
                />
              ))}

              {/* 隠れたエラーの表示 */}
              {hiddenErrorCount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2 border-t border-gray-200 dark:border-gray-700">
                  他に {hiddenErrorCount} 件のエラーがあります
                </div>
              )}
            </div>
          </div>
        )}

        {/* 統計情報（オプション） */}
        {showErrorStats && stats && !isCollapsed && (
          <ErrorStats stats={stats} />
        )}
      </div>
    </div>
  );
};

// デフォルトエクスポート
export default PersistentErrorDisplay;
