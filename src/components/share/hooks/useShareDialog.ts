/**
 * ShareDialog のビジネスロジックと状態管理
 */

"use client";
import { useState, useCallback } from "react";
import { useErrorHandler } from "@/lib/error";
import { useToast } from "@/lib/ui";
import { validateShareForm } from "../utils/validation";
import type {
  ShareFormData,
  ShareResult,
  UseShareDialogOptions,
  UseShareDialogReturn,
} from "../types";

// 共有API用のエラー型定義
interface ShareApiError extends Error {
  canRetry: boolean;
  httpStatus?: number;
  originalError?: Error;
  isTimeout?: boolean;
}

const INITIAL_FORM_DATA: ShareFormData = {
  title: "",
  password: "",
  expirationDays: "7",
};

export const useShareDialog = (
  options: UseShareDialogOptions
): UseShareDialogReturn => {
  const { markdown, theme, getRenderMarkdown } = options;

  // State
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [formData, setFormData] = useState<ShareFormData>(INITIAL_FORM_DATA);

  // Hooks
  const { handleError, executeWithHandling, errorState, clearError } =
    useErrorHandler();
  const { showSuccess } = useToast();

  // UI設定を反映したMarkdownを取得
  const getShareMarkdown = useCallback(() => {
    if (getRenderMarkdown && typeof getRenderMarkdown === "function") {
      return getRenderMarkdown(markdown);
    }
    return markdown;
  }, [markdown, getRenderMarkdown]);

  // フォームデータの更新
  const handleFormDataChange = useCallback(
    (data: Partial<ShareFormData>) => {
      setFormData((prev) => ({ ...prev, ...data }));

      // エラーがある場合はクリア
      if (errorState.hasError) {
        clearError();
      }
    },
    [errorState.hasError, clearError]
  );

  // 共有リンク作成
  const handleShare = useCallback(async () => {
    clearError();

    const shareMarkdown = getShareMarkdown();

    // バリデーション
    const validation = validateShareForm(
      shareMarkdown,
      formData.password,
      formData.expirationDays
    );

    if (!validation.isValid) {
      const firstError = validation.errors[0];
      const validationError = new Error(
        firstError?.message || "バリデーションエラー"
      );
      validationError.name = "ValidationError";
      handleError(validationError, {
        context: {
          operation: "share",
          type: "validation",
          field: firstError?.field || "unknown",
        },
      });
      return;
    }

    setIsSharing(true);

    try {
      const result = await executeWithHandling(
        async () => {
          // タイムアウト付きのfetch
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          try {
            const response = await fetch("/api/share", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                markdown: shareMarkdown,
                theme,
                title: formData.title.trim() || undefined,
                password: formData.password.trim() || undefined,
                expirationDays: parseInt(formData.expirationDays),
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // レスポンスの解析
            let data;
            try {
              data = await response.json();
            } catch (parseError) {
              const error = new Error(
                "サーバーからの応答を解析できませんでした"
              );
              error.name = "NetworkError";
              (error as ShareApiError).canRetry = true;
              (error as ShareApiError).originalError =
                parseError instanceof Error
                  ? parseError
                  : new Error(String(parseError));
              throw error;
            }

            if (!response.ok) {
              const error = new Error(
                data.error || `サーバーエラー (${response.status})`
              );

              // ステータスコードに応じてエラータイプを決定
              if (response.status === 400) {
                error.name = "ValidationError";
                (error as ShareApiError).canRetry = false;
              } else if (response.status === 401 || response.status === 403) {
                error.name = "AuthenticationError";
                (error as ShareApiError).canRetry = false;
              } else if (response.status === 409) {
                error.name = "ConflictError";
                (error as ShareApiError).canRetry = true;
              } else if (response.status >= 500) {
                error.name = "NetworkError";
                (error as ShareApiError).canRetry = true;
              } else {
                error.name = "NetworkError";
                (error as ShareApiError).canRetry = false;
              }

              (error as ShareApiError).httpStatus = response.status;
              (error as ShareApiError).canRetry =
                (error as ShareApiError).canRetry && data.canRetry !== false;
              throw error;
            }

            if (!data.success) {
              const error = new Error(
                data.error || "共有リンクの作成に失敗しました"
              );
              error.name = "NetworkError";
              (error as ShareApiError).canRetry = data.canRetry !== false;
              throw error;
            }

            return data;
          } catch (fetchError: unknown) {
            clearTimeout(timeoutId);

            // AbortErrorの場合はタイムアウトエラーとして処理
            if (
              fetchError instanceof Error &&
              fetchError.name === "AbortError"
            ) {
              const error = new Error("リクエストがタイムアウトしました");
              error.name = "NetworkError";
              (error as ShareApiError).canRetry = true;
              (error as ShareApiError).isTimeout = true;
              throw error;
            }

            // その他のネットワークエラー
            if (
              fetchError instanceof Error &&
              fetchError.name === "TypeError" &&
              fetchError.message.includes("fetch")
            ) {
              const error = new Error("ネットワーク接続に失敗しました");
              error.name = "NetworkError";
              (error as ShareApiError).canRetry = true;
              (error as ShareApiError).originalError =
                fetchError instanceof Error
                  ? fetchError
                  : new Error(String(fetchError));
              throw error;
            }

            throw fetchError;
          }
        },
        {
          context: {
            operation: "share",
            markdownLength: shareMarkdown.length,
            hasPassword: !!formData.password.trim(),
            hasTitle: !!formData.title.trim(),
            expirationDays: parseInt(formData.expirationDays),
            theme,
          },
        }
      );

      // 成功時の処理
      if (result.success && result.data) {
        setShareResult(result.data);
      }
    } catch (error) {
      console.debug("Share creation failed:", error);
    } finally {
      setIsSharing(false);
    }
  }, [
    clearError,
    getShareMarkdown,
    formData,
    executeWithHandling,
    theme,
    handleError,
  ]);

  // クリップボードにコピー
  const handleCopyToClipboard = useCallback(
    async (text: string) => {
      try {
        if (!navigator.clipboard) {
          const error = new Error("Clipboard API is not available");
          error.name = "ValidationError";
          throw error;
        }

        await navigator.clipboard.writeText(text);
        await showSuccess("リンクをクリップボードにコピーしました");
      } catch (error) {
        handleError(error as Error, {
          context: {
            operation: "copy-to-clipboard",
            textLength: text?.length || 0,
            hasClipboardAPI: !!navigator.clipboard,
          },
        });
      }
    },
    [showSuccess, handleError]
  );

  // リセット
  const reset = useCallback(() => {
    setShareResult(null);
    setFormData(INITIAL_FORM_DATA);
    clearError();
  }, [clearError]);

  return {
    // State
    isSharing,
    shareResult,
    formData,
    hasError: errorState.hasError,
    errorMessage: errorState.error?.message,

    // Actions
    handleShare,
    handleFormDataChange,
    handleCopyToClipboard,
    clearError,
    reset,
  };
};
