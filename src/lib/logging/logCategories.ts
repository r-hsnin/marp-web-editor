/**
 * ログカテゴリ定義 - 重要な処理のみ
 */
export const LOG_CATEGORIES = {
  // ユーザー操作
  EXPORT: "EXPORT",
  RENDER: "RENDER",
  SHARE: "SHARE",
  SAVE: "SAVE",

  // 認証・セキュリティ
  AUTH: "AUTH",
  SHARE_ACCESS: "SHARE_ACCESS",

  // システム
  API: "API",
  MARP_CLI: "MARP_CLI",
  VALIDATION: "VALIDATION",

  // ファイル操作
  FILE_OP: "FILE_OP",
  CLEANUP: "CLEANUP",

  // 画像アップロード
  IMAGE_UPLOAD: "IMAGE_UPLOAD",
} as const;

export type LogCategory = (typeof LOG_CATEGORIES)[keyof typeof LOG_CATEGORIES];
