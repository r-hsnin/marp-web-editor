/**
 * 統一サーバーエラーハンドラー
 */

import { NextResponse } from "next/server";
import type { ServerErrorInfo, ServerErrorContext } from "./serverTypes";
import { ErrorClassifier } from "./errorClassifier";
import { HttpStatusMapper } from "./httpStatusMapper";
import { MessageGenerator } from "./messageGenerator";
import { ServerLogger } from "./serverLogger";
import { ResponseBuilder } from "./responseBuilder";

export class ServerErrorHandler {
  /**
   * API エラーを統一的に処理する
   */
  static handleApiError(
    error: Error,
    context: ServerErrorContext = {},
    operationId: string | null = null
  ): NextResponse {
    const errorInfo = this.classifyServerError(error, context);

    // ログ記録
    ServerLogger.logServerError(errorInfo, operationId);

    // HTTPレスポンス生成
    return ResponseBuilder.createErrorResponse(errorInfo, operationId);
  }

  /**
   * サーバーエラーを分類する
   */
  static classifyServerError(
    error: Error,
    context: ServerErrorContext
  ): ServerErrorInfo {
    const errorType = ErrorClassifier.determineServerErrorType(error, context);
    const httpStatus = HttpStatusMapper.getHttpStatus(
      errorType,
      error,
      context
    );
    const userMessage = MessageGenerator.generateServerUserMessage(
      errorType,
      error,
      context
    );

    return {
      id: this.generateErrorId(),
      type: errorType,
      httpStatus,
      originalError: error,
      context,
      userMessage,
      timestamp: new Date().toISOString(),
      canRetry: ErrorClassifier.canRetryServerError(errorType),
      isPublic: ErrorClassifier.isPublicError(errorType),
    };
  }

  /**
   * バリデーションエラーのヘルパー関数
   */
  static validationError(message: string, operationId?: string): NextResponse {
    const error = new Error(message);
    error.name = "ValidationError";
    return this.handleApiError(
      error,
      { operation: "validation" },
      operationId || null
    );
  }

  /**
   * 認証エラーのヘルパー関数
   */
  static authenticationError(
    message: string,
    operationId?: string
  ): NextResponse {
    const error = new Error(message);
    error.name = "AuthenticationError";
    return this.handleApiError(
      error,
      { operation: "authentication" },
      operationId || null
    );
  }

  /**
   * Not Foundエラーのヘルパー関数
   */
  static notFoundError(message: string, operationId?: string): NextResponse {
    const error = new Error(message);
    return this.handleApiError(
      error,
      { operation: "not-found" },
      operationId || null
    );
  }

  /**
   * エラーIDを生成する
   */
  private static generateErrorId(): string {
    return `server_error_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
  }
}
