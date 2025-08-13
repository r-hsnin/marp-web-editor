/**
 * Share機能のバリデーションロジック
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 共有フォームのバリデーション
 */
export const validateShareForm = (
  markdown: string,
  password: string,
  expirationDays: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Markdownコンテンツの検証
  if (!markdown.trim()) {
    errors.push({
      field: "markdown",
      message: "コンテンツを追加してから共有してください",
    });
  }

  // パスワードの検証
  const trimmedPassword = password.trim();
  if (trimmedPassword && trimmedPassword.length < 4) {
    errors.push({
      field: "password",
      message: "パスワードは4文字以上で入力してください",
    });
  }

  // 有効期限の検証
  const expDays = parseInt(expirationDays);
  if (isNaN(expDays) || expDays < 1 || expDays > 365) {
    errors.push({
      field: "expirationDays",
      message: "有効期限は1日から365日の間で設定してください",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 単一フィールドのバリデーション
 */
export const validateField = (
  field: string,
  value: string,
  _markdown?: string
): ValidationError | null => {
  switch (field) {
    case "markdown":
      if (!value.trim()) {
        return {
          field: "markdown",
          message: "コンテンツを追加してから共有してください",
        };
      }
      break;

    case "password":
      const trimmedPassword = value.trim();
      if (trimmedPassword && trimmedPassword.length < 4) {
        return {
          field: "password",
          message: "パスワードは4文字以上で入力してください",
        };
      }
      break;

    case "expirationDays":
      const expDays = parseInt(value);
      if (isNaN(expDays) || expDays < 1 || expDays > 365) {
        return {
          field: "expirationDays",
          message: "有効期限は1日から365日の間で設定してください",
        };
      }
      break;

    default:
      return null;
  }

  return null;
};
