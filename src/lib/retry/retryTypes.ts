/**
 * リトライシステムの型定義
 */

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY: 1000, // 1秒
  MAX_DELAY: 10000, // 10秒
  BACKOFF_MULTIPLIER: 2,
} as const;

export const RETRY_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  EXHAUSTED: "EXHAUSTED",
} as const;

export type RetryStatus = (typeof RETRY_STATUS)[keyof typeof RETRY_STATUS];

export interface RetryErrorInfo {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  userMessage: string;
  canRetry: boolean;
  originalError?: Error;
  context?: RetryContext;
}

export interface RetryResult {
  success: boolean;
  status: RetryStatus;
  attempts: number;
  result?: unknown;
  error?: Error;
  errorInfo: RetryErrorInfo;
}

export interface RetryContext {
  operation: string;
  markdown?: string;
  theme?: string;
  format?: string;
  password?: string;
  expiresIn?: number;
  url?: string;
  options?: RequestInit;
}

export interface RetryEventDetail {
  errorInfo: RetryErrorInfo;
  retryKey: string;
  attempt?: number;
  attempts?: number;
  isManual?: boolean;
  message: string;
  error?: Error;
  isExhausted?: boolean;
}

export interface RetryStats {
  activeRetries: number;
  totalRetryKeys: number;
  retryAttempts: Record<string, number>;
}
