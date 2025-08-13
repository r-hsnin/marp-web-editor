/**
 * Server-side type definitions for API operations
 */

/**
 * child_process exec error type definition
 * Used for Marp CLI operations and other exec operations
 */
export interface ExecError extends Error {
  code?: number;
  killed?: boolean;
  signal?: string;
  cmd?: string;
  stdout?: string;
  stderr?: string;
}

/**
 * API operation context for logging and error handling
 */
export interface ApiOperationContext {
  operationId: string;
  operation: string;
  processingTime?: number;
  retriesAttempted?: number;
  stderr?: string;
  format?: string;
  isExpired?: boolean;
  shareId?: string;
}

/**
 * Unified API response type
 * Provides consistent response format across all API endpoints
 */
export interface UnifiedApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  operationId?: string;
  processingTime?: number;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: {
    error: string;
    code: string;
  };
}

/**
 * Database operation result
 */
export interface DatabaseOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
}
