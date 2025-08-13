/**
 * Marpエラー分類システム
 */

import type { MarpError, MarpRenderContext } from "./marpTypes";
import { ERROR_TYPES } from "./marpTypes";

export class MarpErrorClassifier {
  /**
   * エラーを分類して適切なエラーオブジェクトを作成
   */
  static createClassifiedError(
    error: Error,
    context: MarpRenderContext = {} as MarpRenderContext
  ): MarpError {
    const classifiedError = new Error(
      error.message || "Unknown error"
    ) as MarpError;
    classifiedError.originalError = error;
    classifiedError.context = context;
    classifiedError.timestamp = new Date().toISOString();

    // エラー分類
    if (error.name === "SyntaxError" || error.message.includes("syntax")) {
      classifiedError.type = ERROR_TYPES.SYNTAX_ERROR;
      classifiedError.userMessage = "Markdown構文にエラーがあります";
      classifiedError.canRetry = true;
    } else if (
      error.message.includes("memory") ||
      error.name === "RangeError"
    ) {
      classifiedError.type = ERROR_TYPES.MEMORY_ERROR;
      classifiedError.userMessage = "コンテンツが大きすぎます";
      classifiedError.canRetry = false;
    } else if (error.message.includes("theme")) {
      classifiedError.type = ERROR_TYPES.THEME_ERROR;
      classifiedError.userMessage = "テーマの適用に失敗しました";
      classifiedError.canRetry = true;
    } else if (context.phase === "initialization") {
      classifiedError.type = ERROR_TYPES.INITIALIZATION_ERROR;
      classifiedError.userMessage = "Marp Coreの初期化に失敗しました";
      classifiedError.canRetry = false;
    } else {
      classifiedError.type = ERROR_TYPES.RENDERING_ERROR;
      classifiedError.userMessage = "プレビューの生成に失敗しました";
      classifiedError.canRetry = true;
    }

    return classifiedError;
  }

  /**
   * エラータイプに応じたフォールバックHTMLを生成
   */
  static generateFallbackHtml(error: MarpError, theme: string): string {
    switch (error.type) {
      case ERROR_TYPES.SYNTAX_ERROR:
        return `
          <div style="padding: 20px; color: #d97706; border: 2px solid #fbbf24; background: #fef3c7; margin: 10px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">⚠️ Markdown構文エラー</h3>
            <p style="margin: 0;">Markdownの構文を確認してください。</p>
          </div>
        `;
      case ERROR_TYPES.MEMORY_ERROR:
        return `
          <div style="padding: 20px; color: #dc2626; border: 2px solid #f87171; background: #fee2e2; margin: 10px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">🚫 メモリエラー</h3>
            <p style="margin: 0;">コンテンツが大きすぎます。内容を分割してください。</p>
          </div>
        `;
      case ERROR_TYPES.THEME_ERROR:
        return `
          <div style="padding: 20px; color: #7c2d12; border: 2px solid #fb923c; background: #fed7aa; margin: 10px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">🎨 テーマエラー</h3>
            <p style="margin: 0;">テーマ "${theme}" の適用に失敗しました。</p>
          </div>
        `;
      default:
        return `
          <div style="padding: 20px; color: #dc2626; border: 2px solid #f87171; background: #fee2e2; margin: 10px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">❌ レンダリングエラー</h3>
            <p style="margin: 0;">プレビューの生成に失敗しました。</p>
          </div>
        `;
    }
  }
}
