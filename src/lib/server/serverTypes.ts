/**
 * サーバーエラーハンドリングの型定義
 */

import type { SafeRecord } from "@/types/base";

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const SERVER_ERROR_TYPES = {
  VALIDATION: "VALIDATION",
  AUTHENTICATION: "AUTHENTICATION",
  AUTHORIZATION: "AUTHORIZATION",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  EXTERNAL_SERVICE: "EXTERNAL_SERVICE",
  DATABASE: "DATABASE",
  FILE_SYSTEM: "FILE_SYSTEM",
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type ServerErrorType =
  (typeof SERVER_ERROR_TYPES)[keyof typeof SERVER_ERROR_TYPES];

export interface ServerErrorInfo {
  id: string;
  type: ServerErrorType;
  httpStatus: HttpStatus;
  originalError: Error;
  context: ServerErrorContext;
  userMessage: string;
  timestamp: string;
  canRetry: boolean;
  isPublic: boolean;
}

export interface ServerErrorContext extends SafeRecord {
  operation?: string;
  httpStatus?: HttpStatus;
  isExpired?: boolean;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  // API固有のコンテキスト
  format?: string;
  processingTime?: number;
  isHealthCheck?: boolean;
  shareId?: string;
}

export interface ErrorResponseBody {
  success: false;
  error: string;
  errorType: ServerErrorType;
  canRetry: boolean;
  timestamp: string;
  operationId: string;
  details?: {
    originalMessage: string;
    context: SafeRecord;
  };
}
