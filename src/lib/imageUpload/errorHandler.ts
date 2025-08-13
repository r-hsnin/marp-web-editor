/**
 * Enhanced error handler for image upload operations
 */

import { useCallback, useState, useRef } from "react";
import { useToast } from "@/lib/ui/useToast";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import {
  classifyImageUploadError,
  getImageUploadErrorMessage,
  isRetryableImageUploadError,
  type ImageUploadErrorCode,
} from "./errorConstants";
import type { ImageUploadError } from "@/types/api";

export interface ImageUploadErrorInfo {
  code: ImageUploadErrorCode;
  message: string;
  canRetry: boolean;
  originalError: Error;
  context: {
    filename?: string;
    fileSize?: number;
    attempt?: number;
    operationId?: string;
  };
}

export interface UseImageUploadErrorHandlerReturn {
  handleError: (
    error: Error | ImageUploadError,
    context?: ImageUploadErrorInfo["context"]
  ) => ImageUploadErrorInfo;
  showErrorToast: (errorInfo: ImageUploadErrorInfo) => void;
  showRetryToast: (
    errorInfo: ImageUploadErrorInfo,
    attempt: number,
    maxRetries: number
  ) => void;
  showSuccessToast: (filename: string, attempts?: number) => void;
  clearError: () => void;
  currentError: ImageUploadErrorInfo | null;
}

/**
 * Hook for handling image upload errors with comprehensive feedback
 */
export function useImageUploadErrorHandler(): UseImageUploadErrorHandlerReturn {
  const [currentError, setCurrentError] = useState<ImageUploadErrorInfo | null>(
    null
  );
  const { showError, showSuccess, showInfo } = useToast();
  const toastIdRef = useRef<string | null>(null);

  const handleError = useCallback(
    (
      error: Error | ImageUploadError,
      context: ImageUploadErrorInfo["context"] = {}
    ): ImageUploadErrorInfo => {
      const errorCode = classifyImageUploadError(error);
      // Use the original error message if available, otherwise use default message
      const message =
        (error instanceof Error ? error.message : null) ||
        getImageUploadErrorMessage(errorCode);
      const canRetry = isRetryableImageUploadError(errorCode);

      const errorInfo: ImageUploadErrorInfo = {
        code: errorCode,
        message,
        canRetry,
        originalError:
          error instanceof Error ? error : new Error(String(error)),
        context,
      };

      setCurrentError(errorInfo);

      // Log the error with context
      logger.error(LOG_CATEGORIES.IMAGE_UPLOAD, "Image upload error occurred", {
        errorCode,
        message: errorInfo.originalError.message,
        canRetry,
        context,
      });

      return errorInfo;
    },
    []
  );

  const showErrorToast = useCallback(
    async (errorInfo: ImageUploadErrorInfo) => {
      const { message, canRetry, context } = errorInfo;

      let toastMessage = message;
      const description = context.filename
        ? `ファイル: ${context.filename}`
        : undefined;

      // Add retry information if applicable
      if (canRetry) {
        toastMessage += " 自動的に再試行します。";
      }

      const toastOptions: Parameters<typeof showError>[1] = {
        duration: canRetry ? 4000 : 6000, // Longer duration for non-retryable errors
      };

      if (description) {
        toastOptions.description = description;
      }

      await showError(toastMessage, toastOptions);
    },
    [showError]
  );

  const showRetryToast = useCallback(
    async (
      errorInfo: ImageUploadErrorInfo,
      attempt: number,
      maxRetries: number
    ) => {
      const message = `再試行中... (${attempt}/${maxRetries})`;
      const description = errorInfo.context.filename
        ? `ファイル: ${errorInfo.context.filename}`
        : undefined;

      const toastOptions: Parameters<typeof showInfo>[1] = {
        duration: 3000,
      };

      if (description) {
        toastOptions.description = description;
      }

      // Store toast ID for potential updates
      const toastId = await showInfo(message, toastOptions);

      if (typeof toastId === "string") {
        toastIdRef.current = toastId;
      }
    },
    [showInfo]
  );

  const showSuccessToast = useCallback(
    async (filename: string, attempts?: number) => {
      let message = `画像「${filename}」をアップロードしました`;

      if (attempts && attempts > 1) {
        message += ` (${attempts}回目で成功)`;
      }

      await showSuccess(message, {
        duration: 3000,
      });
    },
    [showSuccess]
  );

  const clearError = useCallback(() => {
    setCurrentError(null);
    toastIdRef.current = null;
  }, []);

  return {
    handleError,
    showErrorToast,
    showRetryToast,
    showSuccessToast,
    clearError,
    currentError,
  };
}

/**
 * Create detailed error context for logging and debugging
 */
export function createErrorContext(
  file: File,
  operationId: string,
  additionalContext?: Record<string, unknown>
): ImageUploadErrorInfo["context"] {
  return {
    filename: file.name,
    fileSize: file.size,
    operationId,
    ...additionalContext,
  };
}

/**
 * Format error for user display with actionable guidance
 */
export function formatErrorForUser(errorInfo: ImageUploadErrorInfo): {
  title: string;
  message: string;
  actions: string[];
} {
  const { code, message } = errorInfo;

  const actions: string[] = [];

  switch (code) {
    case "FILE_TOO_LARGE":
      actions.push("ファイルサイズを5MB以下に縮小してください");
      actions.push("画像圧縮ツールを使用してください");
      break;

    case "INVALID_TYPE":
      actions.push("PNG、JPEG、GIF、WebP形式のファイルを選択してください");
      actions.push("ファイル拡張子を確認してください");
      break;

    case "NETWORK_ERROR":
      actions.push("インターネット接続を確認してください");
      actions.push("しばらく待ってから再試行してください");
      break;

    case "TIMEOUT_ERROR":
      actions.push("ファイルサイズを小さくしてください");
      actions.push("ネットワーク接続を確認してください");
      break;

    default:
      actions.push("しばらく待ってから再試行してください");
      actions.push("問題が続く場合は管理者にお問い合わせください");
  }

  return {
    title: "画像アップロードエラー",
    message,
    actions,
  };
}

/**
 * Determine if error should trigger immediate user notification
 */
export function shouldShowImmediateNotification(
  errorCode: ImageUploadErrorCode
): boolean {
  // Show immediate notification for validation errors that user can fix
  const immediateNotificationCodes: ImageUploadErrorCode[] = [
    "FILE_TOO_LARGE",
    "INVALID_TYPE",
    "NO_FILE",
    "VALIDATION_ERROR",
  ];

  return immediateNotificationCodes.includes(errorCode);
}
