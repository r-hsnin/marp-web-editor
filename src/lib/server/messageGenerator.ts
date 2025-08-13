/**
 * サーバーエラーメッセージ生成
 */

import type { ServerErrorType, ServerErrorContext } from "./serverTypes";
import { SERVER_ERROR_TYPES } from "./serverTypes";

export class MessageGenerator {
  /**
   * サーバーエラー用のユーザーメッセージを生成する
   */
  static generateServerUserMessage(
    errorType: ServerErrorType,
    _error: Error,
    _context: ServerErrorContext
  ): string {
    const messages: Record<ServerErrorType, string> = {
      [SERVER_ERROR_TYPES.VALIDATION]:
        "入力内容に問題があります。正しい形式で入力してください。",
      [SERVER_ERROR_TYPES.AUTHENTICATION]:
        "認証に失敗しました。認証情報を確認してください。",
      [SERVER_ERROR_TYPES.AUTHORIZATION]:
        "この操作を実行する権限がありません。",
      [SERVER_ERROR_TYPES.NOT_FOUND]: "要求されたリソースが見つかりません。",
      [SERVER_ERROR_TYPES.CONFLICT]:
        "競合が発生しました。しばらく待ってから再試行してください。",
      [SERVER_ERROR_TYPES.EXTERNAL_SERVICE]:
        "外部サービスとの通信に失敗しました。しばらく待ってから再試行してください。",
      [SERVER_ERROR_TYPES.DATABASE]:
        "データベース処理でエラーが発生しました。しばらく待ってから再試行してください。",
      [SERVER_ERROR_TYPES.FILE_SYSTEM]:
        "ファイル処理でエラーが発生しました。しばらく待ってから再試行してください。",
      [SERVER_ERROR_TYPES.NETWORK]:
        "ネットワークエラーが発生しました。接続を確認してください。",
      [SERVER_ERROR_TYPES.TIMEOUT]:
        "処理がタイムアウトしました。しばらく待ってから再試行してください。",
      [SERVER_ERROR_TYPES.UNKNOWN]:
        "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
    };

    return messages[errorType] || messages[SERVER_ERROR_TYPES.UNKNOWN];
  }
}
