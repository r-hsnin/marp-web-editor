/**
 * API configuration constants
 * Centralized configuration for API operations
 */

import { ENV_CONFIG } from "./env";

export const API_CONFIG = {
  RETRY: {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 8000, // 8 seconds
    backoffFactor: 2,
  },
  TIMEOUT: {
    marpCliTimeout: ENV_CONFIG.marpCliTimeout,
    fileOperationTimeout: 5000, // 5 seconds
    databaseTimeout: 10000, // 10 seconds
  },
  LIMITS: {
    maxBufferSize: 1024 * 1024 * 10, // 10MB
    maxMarkdownSize: ENV_CONFIG.maxMarkdownSize,
  },
} as const;

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(attempt: number): number {
  return Math.min(
    API_CONFIG.RETRY.baseDelay *
      Math.pow(API_CONFIG.RETRY.backoffFactor, attempt),
    API_CONFIG.RETRY.maxDelay
  );
}

/**
 * Check if retry should be attempted
 */
export function shouldRetry(attempt: number): boolean {
  return attempt < API_CONFIG.RETRY.maxRetries;
}
