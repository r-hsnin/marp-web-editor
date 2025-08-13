/**
 * Retry utilities for image upload operations
 */

import { nanoid } from "nanoid";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import {
  getRetryConfig,
  classifyImageUploadError,
  getImageUploadErrorMessage,
  type ImageUploadErrorCode,
} from "./errorConstants";

export interface RetryContext {
  operationId: string;
  attempt: number;
  maxRetries: number;
  file: File;
  onProgress?: (progress: { attempt: number; maxRetries: number }) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  finalErrorCode?: ImageUploadErrorCode;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute upload with retry logic
 */
export async function retryImageUpload<T>(
  uploadFn: () => Promise<T>,
  file: File,
  onProgress?: (progress: { attempt: number; maxRetries: number }) => void
): Promise<RetryResult<T>> {
  const operationId = nanoid(8);
  let lastError: Error | null = null;
  let attempts = 0;
  let maxRetries = 3; // Default, will be updated based on error type

  logger.debug(LOG_CATEGORIES.IMAGE_UPLOAD, "Starting retry upload operation", {
    operationId,
    filename: file.name,
    size: file.size,
  });

  while (attempts < maxRetries) {
    attempts++;

    try {
      // Report progress
      onProgress?.({ attempt: attempts, maxRetries });

      logger.debug(
        LOG_CATEGORIES.IMAGE_UPLOAD,
        `Upload attempt ${attempts}/${maxRetries}`,
        {
          operationId,
          attempt: attempts,
          filename: file.name,
        }
      );

      const result = await uploadFn();

      logger.debug(LOG_CATEGORIES.IMAGE_UPLOAD, "Upload succeeded", {
        operationId,
        attempts,
        filename: file.name,
      });

      return {
        success: true,
        data: result,
        attempts,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorCode = classifyImageUploadError(lastError);
      const retryConfig = getRetryConfig(errorCode);

      // Update maxRetries based on error type
      maxRetries = Math.max(retryConfig.maxRetries, 1);

      logger.warn(
        LOG_CATEGORIES.IMAGE_UPLOAD,
        `Upload attempt ${attempts} failed`,
        {
          operationId,
          attempt: attempts,
          maxRetries,
          errorCode,
          error: lastError.message,
          filename: file.name,
        }
      );

      // If this error type is not retryable, fail immediately
      if (!retryConfig.canRetry) {
        logger.error(
          LOG_CATEGORIES.IMAGE_UPLOAD,
          "Non-retryable error encountered",
          {
            operationId,
            errorCode,
            error: lastError.message,
            filename: file.name,
          }
        );

        return {
          success: false,
          error: lastError,
          attempts,
          finalErrorCode: errorCode,
        };
      }

      // If we've reached max retries, fail
      if (attempts >= maxRetries) {
        logger.error(LOG_CATEGORIES.IMAGE_UPLOAD, "Max retries exceeded", {
          operationId,
          attempts,
          maxRetries,
          errorCode,
          error: lastError.message,
          filename: file.name,
        });

        return {
          success: false,
          error: lastError,
          attempts,
          finalErrorCode: errorCode,
        };
      }

      // Wait before retrying
      if (retryConfig.delay > 0) {
        logger.debug(
          LOG_CATEGORIES.IMAGE_UPLOAD,
          `Waiting ${retryConfig.delay}ms before retry`,
          {
            operationId,
            delay: retryConfig.delay,
            nextAttempt: attempts + 1,
          }
        );

        await sleep(retryConfig.delay);
      }
    }
  }

  // This should never be reached, but just in case
  const finalErrorCode = lastError
    ? classifyImageUploadError(lastError)
    : "UPLOAD_FAILED";

  return {
    success: false,
    error: lastError || new Error("Upload failed after retries"),
    attempts,
    finalErrorCode,
  };
}

/**
 * Create a user-friendly error message from retry result
 */
export function createRetryErrorMessage(result: RetryResult<unknown>): string {
  if (!result.error || !result.finalErrorCode) {
    return "アップロードに失敗しました。";
  }

  const baseMessage = getImageUploadErrorMessage(result.finalErrorCode);

  if (result.attempts > 1) {
    return `${baseMessage} (${result.attempts}回試行しました)`;
  }

  return baseMessage;
}

/**
 * Validate file before upload attempt with enhanced security checks
 */
export function validateFileForUpload(file: File): {
  valid: boolean;
  errorCode?: ImageUploadErrorCode;
  message?: string;
} {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

  // Basic size check
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      errorCode: "FILE_TOO_LARGE",
      message: getImageUploadErrorMessage("FILE_TOO_LARGE"),
    };
  }

  // Basic MIME type check
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      errorCode: "INVALID_TYPE",
      message: getImageUploadErrorMessage("INVALID_TYPE"),
    };
  }

  // Basic filename validation
  if (!file.name || file.name.trim().length === 0) {
    return {
      valid: false,
      errorCode: "INVALID_TYPE",
      message: "ファイル名が無効です",
    };
  }

  return { valid: true };
}
