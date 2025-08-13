/**
 * サーバーエラー分類システム
 */

import type { ServerErrorType, ServerErrorContext } from "./serverTypes";
import { SERVER_ERROR_TYPES } from "./serverTypes";

// エラー分類用の型定義
interface PrismaError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}

interface FileSystemError extends Error {
  code?: string;
  path?: string;
  errno?: number;
}

interface NetworkError extends Error {
  code?: string;
  signal?: string;
  errno?: number;
}

interface TimeoutError extends Error {
  code?: string;
  signal?: string;
  timeout?: number;
}

export class ErrorClassifier {
  /**
   * サーバーエラータイプを判定する
   */
  static determineServerErrorType(
    error: Error,
    context: ServerErrorContext
  ): ServerErrorType {
    // バリデーションエラー
    if (
      error.name === "ValidationError" ||
      context.operation === "validation" ||
      error.message.includes("required") ||
      error.message.includes("invalid")
    ) {
      return SERVER_ERROR_TYPES.VALIDATION;
    }

    // 認証エラー
    if (
      error.name === "AuthenticationError" ||
      error.message.includes("unauthorized") ||
      error.message.includes("authentication")
    ) {
      return SERVER_ERROR_TYPES.AUTHENTICATION;
    }

    // 認可エラー
    if (
      error.name === "AuthorizationError" ||
      error.message.includes("forbidden") ||
      error.message.includes("permission")
    ) {
      return SERVER_ERROR_TYPES.AUTHORIZATION;
    }

    // データベースエラー
    if (
      error.name === "PrismaClientKnownRequestError" ||
      error.name === "PrismaClientUnknownRequestError" ||
      (error as PrismaError).code === "P2002" || // Unique constraint
      (error as PrismaError).code === "P2025" || // Record not found
      error.message.includes("database") ||
      error.message.includes("prisma")
    ) {
      return SERVER_ERROR_TYPES.DATABASE;
    }

    // ファイルシステムエラー
    if (
      (error as FileSystemError).code === "ENOENT" ||
      (error as FileSystemError).code === "EACCES" ||
      (error as FileSystemError).code === "EMFILE" ||
      error.message.includes("file") ||
      error.message.includes("ENOENT")
    ) {
      return SERVER_ERROR_TYPES.FILE_SYSTEM;
    }

    // ネットワーク/外部サービスエラー
    if (
      error.name === "NetworkError" ||
      (error as NetworkError).code === "ECONNREFUSED" ||
      (error as NetworkError).code === "ENOTFOUND" ||
      (error as NetworkError).code === "ETIMEDOUT" ||
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      context.operation?.includes("marp-cli")
    ) {
      return SERVER_ERROR_TYPES.EXTERNAL_SERVICE;
    }

    // タイムアウトエラー
    if (
      error.name === "TimeoutError" ||
      (error as TimeoutError).code === "ETIMEDOUT" ||
      (error as TimeoutError).signal === "SIGTERM" ||
      error.message.includes("timeout")
    ) {
      return SERVER_ERROR_TYPES.TIMEOUT;
    }

    // 404エラー
    if (
      error.message.includes("not found") ||
      error.message.includes("does not exist")
    ) {
      return SERVER_ERROR_TYPES.NOT_FOUND;
    }

    // 競合エラー
    if (
      error.message.includes("already exists") ||
      error.message.includes("conflict")
    ) {
      return SERVER_ERROR_TYPES.CONFLICT;
    }

    return SERVER_ERROR_TYPES.UNKNOWN;
  }

  /**
   * サーバーエラーがリトライ可能かどうかを判定する
   */
  static canRetryServerError(errorType: ServerErrorType): boolean {
    const retryableTypes: ServerErrorType[] = [
      SERVER_ERROR_TYPES.EXTERNAL_SERVICE,
      SERVER_ERROR_TYPES.DATABASE,
      SERVER_ERROR_TYPES.FILE_SYSTEM,
      SERVER_ERROR_TYPES.NETWORK,
      SERVER_ERROR_TYPES.TIMEOUT,
    ];

    return retryableTypes.includes(errorType);
  }

  /**
   * エラーが公開可能（クライアントに詳細を送信可能）かどうかを判定する
   */
  static isPublicError(errorType: ServerErrorType): boolean {
    const publicTypes: ServerErrorType[] = [
      SERVER_ERROR_TYPES.VALIDATION,
      SERVER_ERROR_TYPES.AUTHENTICATION,
      SERVER_ERROR_TYPES.AUTHORIZATION,
      SERVER_ERROR_TYPES.NOT_FOUND,
      SERVER_ERROR_TYPES.CONFLICT,
    ];

    return publicTypes.includes(errorType);
  }
}
