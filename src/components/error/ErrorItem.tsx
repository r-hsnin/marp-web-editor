/**
 * 単一エラー表示コンポーネント
 */

"use client";

import React from "react";
import {
  AlertCircle,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorStyles } from "./utils/styles";
import { ErrorItemProps } from "./types";

export const ErrorItem: React.FC<ErrorItemProps> = ({
  error,
  onRetry,
  onDismiss,
  isRetrying,
  isExpanded,
  onToggleExpand,
}) => {
  const styles = getErrorStyles(error.severity);

  return (
    <div
      className={`border-l-4 p-4 rounded-r-md ${styles.container}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertCircle
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`}
            aria-hidden="true"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${styles.title}`}>
                {error.userMessage}
              </h3>

              {/* 展開/折りたたみボタン */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className={`ml-2 p-1 h-auto ${styles.button}`}
                aria-label={isExpanded ? "詳細を非表示" : "詳細を表示"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* 詳細情報（展開時のみ表示） */}
            {isExpanded && (
              <div className={`mt-2 text-xs ${styles.description}`}>
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">エラータイプ:</span>{" "}
                    {error.type}
                  </div>
                  <div>
                    <span className="font-medium">重要度:</span>{" "}
                    {error.severity}
                  </div>
                  <div>
                    <span className="font-medium">発生時刻:</span>{" "}
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                  {error.context?.operation && (
                    <div>
                      <span className="font-medium">操作:</span>{" "}
                      {error.context.operation}
                    </div>
                  )}
                  {process.env.NODE_ENV === "development" &&
                    error.originalError?.message && (
                      <div>
                        <span className="font-medium">詳細:</span>{" "}
                        {error.originalError.message}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center space-x-2 ml-4">
          {error.canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(error)}
              disabled={isRetrying}
              className={`${styles.button} text-xs`}
              aria-label="エラーをリトライ"
            >
              <RotateCcw
                className={`w-3 h-3 mr-1 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "リトライ中..." : "リトライ"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(error.id)}
            className={`p-1 h-auto ${styles.button}`}
            aria-label="エラーを閉じる"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
