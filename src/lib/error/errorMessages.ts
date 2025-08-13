import type { LogCategory } from "../logging/logCategories";
import type { UserErrorMessages, ErrorSeverity } from "./errorTypes";

/**
 * ユーザーフレンドリーなエラーメッセージ定義
 */
export const USER_ERROR_MESSAGES: UserErrorMessages = {
  EXPORT_FAILED:
    "ファイルの出力に失敗しました。しばらく待ってから再試行してください。",
  EXPORT_PDF_FAILED:
    "PDFの生成に失敗しました。内容を簡素化してから再試行してください。",
  EXPORT_PPTX_FAILED:
    "PowerPointファイルの生成に失敗しました。内容を簡素化してから再試行してください。",
  RENDER_FAILED:
    "プレビューの生成に失敗しました。マークダウンの内容を確認してください。",
  SHARE_FAILED: "共有リンクの作成に失敗しました。再試行してください。",
  SHARE_ACCESS_FAILED:
    "共有リンクにアクセスできませんでした。URLを確認してください。",
  SAVE_FAILED: "保存に失敗しました。ブラウザの容量を確認してください。",
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
  SYNTAX_ERROR: "マークダウンの書式に問題があります。内容を確認してください。",
  THEME_ERROR:
    "指定されたテーマが見つかりません。デフォルトテーマを使用してください。",
  TIMEOUT_ERROR: "処理に時間がかかりすぎています。内容を簡素化してください。",
  PASSWORD_ERROR: "パスワードが正しくありません。",
  EXPIRED_ERROR: "この共有リンクは期限切れです。",
  NOT_FOUND_ERROR: "共有リンクが見つかりません。URLを確認してください。",
  VALIDATION_ERROR: "入力内容に問題があります。内容を確認してください。",
  IMAGE_UPLOAD_FAILED: "画像のアップロードに失敗しました。再試行してください。",
  IMAGE_FILE_TOO_LARGE:
    "ファイルサイズが5MBを超えています。より小さなファイルを選択してください。",
  IMAGE_INVALID_TYPE:
    "サポートされていないファイル形式です。PNG、JPEG、GIF、WebP形式のファイルを選択してください。",
};

/**
 * カテゴリ別デフォルトメッセージマッピング
 */
const CATEGORY_DEFAULT_MESSAGES: Record<LogCategory, keyof UserErrorMessages> =
  {
    EXPORT: "EXPORT_FAILED",
    RENDER: "RENDER_FAILED",
    MARP_CLI: "RENDER_FAILED",
    SHARE: "SHARE_FAILED",
    SHARE_ACCESS: "SHARE_ACCESS_FAILED",
    SAVE: "SAVE_FAILED",
    AUTH: "PASSWORD_ERROR",
    VALIDATION: "VALIDATION_ERROR",
    API: "NETWORK_ERROR",
    FILE_OP: "SAVE_FAILED",
    CLEANUP: "SAVE_FAILED",
    IMAGE_UPLOAD: "IMAGE_UPLOAD_FAILED",
  };

/**
 * カテゴリ別エラー重要度マッピング
 */
const CATEGORY_SEVERITY_MAP: Record<LogCategory, ErrorSeverity> = {
  AUTH: "HIGH",
  SHARE_ACCESS: "HIGH",
  SAVE: "HIGH",
  EXPORT: "MEDIUM",
  SHARE: "MEDIUM",
  API: "MEDIUM",
  VALIDATION: "MEDIUM",
  RENDER: "LOW",
  MARP_CLI: "LOW",
  FILE_OP: "MEDIUM",
  CLEANUP: "LOW",
  IMAGE_UPLOAD: "MEDIUM",
};

/**
 * エラーメッセージからエラータイプを推定
 */
function classifyErrorByMessage(
  message: string
): keyof UserErrorMessages | null {
  const lowerMessage = message.toLowerCase();

  // ネットワーク関連
  if (
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("network") ||
    lowerMessage.includes("connection")
  ) {
    return "NETWORK_ERROR";
  }

  // タイムアウト関連
  if (lowerMessage.includes("timeout") || lowerMessage.includes("time")) {
    return "TIMEOUT_ERROR";
  }

  // 構文エラー関連
  if (
    lowerMessage.includes("syntax") ||
    lowerMessage.includes("parse") ||
    lowerMessage.includes("invalid")
  ) {
    return "SYNTAX_ERROR";
  }

  // テーマ関連
  if (
    lowerMessage.includes("theme") ||
    lowerMessage.includes("unknown theme")
  ) {
    return "THEME_ERROR";
  }

  // パスワード関連
  if (lowerMessage.includes("password")) {
    return "PASSWORD_ERROR";
  }

  return null;
}

/**
 * HTTPステータスコードからエラータイプを推定
 */
function classifyErrorByStatus(
  error: Error & { status?: number }
): keyof UserErrorMessages | null {
  if (!error.status) return null;

  switch (error.status) {
    case 404:
      return "NOT_FOUND_ERROR";
    case 410:
      return "EXPIRED_ERROR";
    case 401:
    case 403:
      return "PASSWORD_ERROR";
    case 408:
    case 504:
      return "TIMEOUT_ERROR";
    case 500:
    case 502:
    case 503:
      return "NETWORK_ERROR";
    default:
      return null;
  }
}

/**
 * エラーを分析してユーザーフレンドリーなメッセージを返す
 */
export function getFriendlyErrorMessage(
  category: LogCategory,
  error: Error
): string {
  // HTTPステータスコードによる分類
  const statusType = classifyErrorByStatus(
    error as Error & { status?: number }
  );
  if (statusType) {
    return USER_ERROR_MESSAGES[statusType];
  }

  // エラーメッセージによる分類
  const messageType = classifyErrorByMessage(error.message);
  if (messageType) {
    return USER_ERROR_MESSAGES[messageType];
  }

  // カテゴリ別の特別処理
  if (category === "EXPORT") {
    const message = error.message.toLowerCase();
    if (message.includes("pdf")) {
      return USER_ERROR_MESSAGES.EXPORT_PDF_FAILED;
    }
    if (message.includes("pptx")) {
      return USER_ERROR_MESSAGES.EXPORT_PPTX_FAILED;
    }
  }

  // 画像アップロード関連の特別処理
  if (category === "IMAGE_UPLOAD") {
    const message = error.message.toLowerCase();
    if (message.includes("size") || message.includes("5mb")) {
      return USER_ERROR_MESSAGES.IMAGE_FILE_TOO_LARGE;
    }
    if (message.includes("type") || message.includes("format")) {
      return USER_ERROR_MESSAGES.IMAGE_INVALID_TYPE;
    }
  }

  // カテゴリ別デフォルトメッセージ
  const defaultMessageKey = CATEGORY_DEFAULT_MESSAGES[category];
  if (defaultMessageKey) {
    return USER_ERROR_MESSAGES[defaultMessageKey];
  }

  return "エラーが発生しました。再試行してください。";
}

/**
 * エラーの重要度を判定
 */
export function getErrorSeverityByCategory(
  category: LogCategory,
  _error: Error
): ErrorSeverity {
  // カテゴリベースの重要度
  return CATEGORY_SEVERITY_MAP[category] || "MEDIUM";
}
