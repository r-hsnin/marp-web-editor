/**
 * Image upload error constants and messages
 */

import type { ImageUploadError } from "@/types/api";

// Error codes for image upload
export const IMAGE_UPLOAD_ERROR_CODES = {
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_TYPE: "INVALID_TYPE",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  NO_FILE: "NO_FILE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  PLACEHOLDER_ERROR: "PLACEHOLDER_ERROR",
} as const;

export type ImageUploadErrorCode = keyof typeof IMAGE_UPLOAD_ERROR_CODES;

// User-friendly error messages for image upload
export const IMAGE_UPLOAD_ERROR_MESSAGES: Record<ImageUploadErrorCode, string> =
  {
    FILE_TOO_LARGE:
      "ファイルサイズが5MBを超えています。より小さなファイルを選択してください。",
    INVALID_TYPE:
      "サポートされていないファイル形式です。PNG、JPEG、GIF、WebP形式のファイルを選択してください。",
    UPLOAD_FAILED:
      "アップロードに失敗しました。しばらく待ってから再試行してください。",
    NO_FILE: "ファイルが選択されていません。画像ファイルを選択してください。",
    VALIDATION_ERROR:
      "ファイルの検証に失敗しました。有効な画像ファイルを選択してください。",
    NETWORK_ERROR:
      "ネットワークエラーが発生しました。接続を確認して再試行してください。",
    TIMEOUT_ERROR:
      "アップロードがタイムアウトしました。ファイルサイズを小さくするか、しばらく待ってから再試行してください。",
    PLACEHOLDER_ERROR:
      "プレースホルダーの処理に失敗しました。エディタを確認してください。",
  };

// Retry configuration for different error types
export const ERROR_RETRY_CONFIG: Record<
  ImageUploadErrorCode,
  { canRetry: boolean; maxRetries: number; delay: number }
> = {
  FILE_TOO_LARGE: { canRetry: false, maxRetries: 0, delay: 0 },
  INVALID_TYPE: { canRetry: false, maxRetries: 0, delay: 0 },
  UPLOAD_FAILED: { canRetry: true, maxRetries: 3, delay: 2000 },
  NO_FILE: { canRetry: false, maxRetries: 0, delay: 0 },
  VALIDATION_ERROR: { canRetry: false, maxRetries: 0, delay: 0 },
  NETWORK_ERROR: { canRetry: true, maxRetries: 3, delay: 1000 },
  TIMEOUT_ERROR: { canRetry: true, maxRetries: 2, delay: 3000 },
  PLACEHOLDER_ERROR: { canRetry: true, maxRetries: 1, delay: 500 },
};

// File validation constants
export const FILE_VALIDATION = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
  ] as const,
  TIMEOUT_MS: 30000, // 30 seconds
} as const;

/**
 * Get user-friendly error message from error code
 */
export function getImageUploadErrorMessage(code: string): string {
  const errorCode = code as ImageUploadErrorCode;
  return (
    IMAGE_UPLOAD_ERROR_MESSAGES[errorCode] ||
    IMAGE_UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED
  );
}

/**
 * Determine if an error is retryable
 */
export function isRetryableImageUploadError(code: string): boolean {
  const errorCode = code as ImageUploadErrorCode;
  return ERROR_RETRY_CONFIG[errorCode]?.canRetry || false;
}

/**
 * Get retry configuration for an error code
 */
export function getRetryConfig(code: string): {
  canRetry: boolean;
  maxRetries: number;
  delay: number;
} {
  const errorCode = code as ImageUploadErrorCode;
  return (
    ERROR_RETRY_CONFIG[errorCode] || {
      canRetry: false,
      maxRetries: 0,
      delay: 0,
    }
  );
}

/**
 * Classify error from API response
 */
export function classifyImageUploadError(
  error: ImageUploadError | Error
): ImageUploadErrorCode {
  if ("code" in error && error.code) {
    return error.code as ImageUploadErrorCode;
  }

  const message = (
    "message" in error ? error.message : String(error)
  ).toLowerCase();

  if (message.includes("size") || message.includes("5mb")) {
    return "FILE_TOO_LARGE";
  }

  if (
    message.includes("type") ||
    message.includes("format") ||
    message.includes("形式")
  ) {
    return "INVALID_TYPE";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "NETWORK_ERROR";
  }

  if (message.includes("timeout")) {
    return "TIMEOUT_ERROR";
  }

  if (message.includes("placeholder")) {
    return "PLACEHOLDER_ERROR";
  }

  if (message.includes("validation")) {
    return "VALIDATION_ERROR";
  }

  return "UPLOAD_FAILED";
}
