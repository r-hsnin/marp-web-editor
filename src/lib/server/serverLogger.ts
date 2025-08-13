/**
 * サーバーエラーログ管理
 */

import type { ServerErrorInfo } from "./serverTypes";
import { SERVER_ERROR_TYPES } from "./serverTypes";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES, type LogCategory } from "@/lib/logging/logCategories";

export class ServerLogger {
  /**
   * サーバーエラーをログに記録する
   */
  static logServerError(
    errorInfo: ServerErrorInfo,
    operationId: string | null
  ): void {
    const category = this.mapErrorTypeToLogCategory(errorInfo.type);
    const logDetails: Record<string, unknown> = {
      errorId: errorInfo.id,
      errorType: errorInfo.type,
      httpStatus: errorInfo.httpStatus,
      context: errorInfo.context,
      canRetry: errorInfo.canRetry,
      timestamp: errorInfo.timestamp,
      operationId: operationId || "unknown",
    };

    // 開発環境では詳細なスタックトレースも記録（認証エラーは除く）
    if (
      process.env.NODE_ENV === "development" &&
      errorInfo.type !== SERVER_ERROR_TYPES.AUTHENTICATION
    ) {
      logDetails.stack = errorInfo.originalError.stack;
      logDetails.originalMessage = errorInfo.originalError.message;
    }

    // エラータイプに応じてログレベルを調整
    if (errorInfo.httpStatus >= 500) {
      logger.error(category, errorInfo.userMessage, logDetails);
    } else if (errorInfo.httpStatus >= 400) {
      // 認証失敗は正常な業務フローなので、debugレベルでログ記録
      if (errorInfo.type === SERVER_ERROR_TYPES.AUTHENTICATION) {
        logger.debug(category, errorInfo.userMessage, logDetails);
      } else {
        logger.warn(category, errorInfo.userMessage, logDetails);
      }
    } else {
      logger.debug(category, errorInfo.userMessage, logDetails);
    }
  }

  /**
   * エラータイプをログカテゴリにマッピングする
   */
  private static mapErrorTypeToLogCategory(errorType: string): LogCategory {
    switch (errorType) {
      case SERVER_ERROR_TYPES.VALIDATION:
        return LOG_CATEGORIES.VALIDATION;
      case SERVER_ERROR_TYPES.AUTHENTICATION:
      case SERVER_ERROR_TYPES.AUTHORIZATION:
        return LOG_CATEGORIES.AUTH;
      case SERVER_ERROR_TYPES.DATABASE:
        return LOG_CATEGORIES.API;
      case SERVER_ERROR_TYPES.FILE_SYSTEM:
        return LOG_CATEGORIES.FILE_OP;
      case SERVER_ERROR_TYPES.EXTERNAL_SERVICE:
        return LOG_CATEGORIES.MARP_CLI;
      case SERVER_ERROR_TYPES.NETWORK:
      case SERVER_ERROR_TYPES.TIMEOUT:
        return LOG_CATEGORIES.API;
      default:
        return LOG_CATEGORIES.API;
    }
  }
}
