import type { LogCategory } from "../logging/logCategories";
import type { SafeRecord } from "@/types/base";

export interface AppError extends Error {
  code?: string;
  category?: LogCategory;
  operationId?: string;
  userFriendly?: boolean;
  retryable?: boolean;
  context?: SafeRecord;
}

export interface ErrorHandlingOptions {
  showToUser?: boolean;
  logError?: boolean;
  retryable?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  category?: LogCategory;
  context?: SafeRecord;
}

export interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  isProcessing: boolean;
  retryCount: number;
}

export interface ErrorHandlerResult {
  success: boolean;
  error?: AppError;
  shouldRetry?: boolean;
  userMessage?: string;
}

export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ErrorInfo {
  id: string;
  type: string;
  severity: ErrorSeverity;
  userMessage: string;
  canRetry: boolean;
  originalError?: Error;
  context?: SafeRecord;
}

export interface UserErrorMessages {
  EXPORT_FAILED: string;
  EXPORT_PDF_FAILED: string;
  EXPORT_PPTX_FAILED: string;
  RENDER_FAILED: string;
  SHARE_FAILED: string;
  SHARE_ACCESS_FAILED: string;
  SAVE_FAILED: string;
  NETWORK_ERROR: string;
  SYNTAX_ERROR: string;
  THEME_ERROR: string;
  TIMEOUT_ERROR: string;
  PASSWORD_ERROR: string;
  EXPIRED_ERROR: string;
  NOT_FOUND_ERROR: string;
  VALIDATION_ERROR: string;
  IMAGE_UPLOAD_FAILED: string;
  IMAGE_FILE_TOO_LARGE: string;
  IMAGE_INVALID_TYPE: string;
}

export interface ErrorClassifier {
  getFriendlyError: (category: LogCategory, error: Error) => string;
  getErrorSeverity: (category: LogCategory, error: Error) => ErrorSeverity;
}

export interface ErrorMetrics {
  timestamp: number;
  category: LogCategory;
  severity: ErrorSeverity;
  resolved: boolean;
  retryCount: number;
}
