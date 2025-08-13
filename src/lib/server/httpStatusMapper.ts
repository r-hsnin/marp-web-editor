/**
 * HTTPステータスコード管理
 */

import type {
  ServerErrorType,
  ServerErrorContext,
  HttpStatus,
} from "./serverTypes";
import { HTTP_STATUS, SERVER_ERROR_TYPES } from "./serverTypes";

export class HttpStatusMapper {
  /**
   * エラータイプに応じたHTTPステータスコードを取得する
   */
  static getHttpStatus(
    errorType: ServerErrorType,
    error: Error,
    context: ServerErrorContext = {}
  ): HttpStatus {
    // コンテキストで明示的にHTTPステータスが指定されている場合
    if (context.httpStatus) {
      return context.httpStatus;
    }

    // 期限切れエラーの特別処理
    if (context.isExpired || error.name === "ExpiredError") {
      return HTTP_STATUS.GONE;
    }

    switch (errorType) {
      case SERVER_ERROR_TYPES.VALIDATION:
        return HTTP_STATUS.BAD_REQUEST;
      case SERVER_ERROR_TYPES.AUTHENTICATION:
        return HTTP_STATUS.UNAUTHORIZED;
      case SERVER_ERROR_TYPES.AUTHORIZATION:
        return HTTP_STATUS.FORBIDDEN;
      case SERVER_ERROR_TYPES.NOT_FOUND:
        return HTTP_STATUS.NOT_FOUND;
      case SERVER_ERROR_TYPES.CONFLICT:
        return HTTP_STATUS.CONFLICT;
      case SERVER_ERROR_TYPES.EXTERNAL_SERVICE:
      case SERVER_ERROR_TYPES.TIMEOUT:
        return HTTP_STATUS.SERVICE_UNAVAILABLE;
      case SERVER_ERROR_TYPES.DATABASE:
      case SERVER_ERROR_TYPES.FILE_SYSTEM:
      case SERVER_ERROR_TYPES.NETWORK:
      case SERVER_ERROR_TYPES.UNKNOWN:
      default:
        return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
  }
}
