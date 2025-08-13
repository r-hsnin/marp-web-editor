/**
 * サーバーレスポンス構築
 */

import { NextResponse } from "next/server";
import type { ServerErrorInfo, ErrorResponseBody } from "./serverTypes";

export class ResponseBuilder {
  /**
   * エラーレスポンスを作成する
   */
  static createErrorResponse(
    errorInfo: ServerErrorInfo,
    operationId: string | null
  ): NextResponse {
    const responseBody: ErrorResponseBody = {
      success: false,
      error: errorInfo.userMessage,
      errorType: errorInfo.type,
      canRetry: errorInfo.canRetry,
      timestamp: errorInfo.timestamp,
      operationId: operationId || "unknown",
    };

    // 開発環境では詳細情報も含める
    if (process.env.NODE_ENV === "development" && errorInfo.isPublic) {
      responseBody.details = {
        originalMessage: errorInfo.originalError.message,
        context: errorInfo.context,
      };
    }

    return NextResponse.json(responseBody, {
      status: errorInfo.httpStatus,
      headers: {
        "X-Error-Id": errorInfo.id,
        "X-Operation-Id": operationId || "unknown",
        "X-Can-Retry": errorInfo.canRetry.toString(),
      },
    });
  }

  /**
   * 成功レスポンスを作成する
   */
  static createSuccessResponse<T = unknown>(
    data: T,
    operationId: string | null = null
  ): NextResponse {
    const responseBody = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      operationId: operationId || "unknown",
    };

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "X-Operation-Id": operationId || "unknown",
      },
    });
  }
}
