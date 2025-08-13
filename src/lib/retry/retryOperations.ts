/**
 * 操作別リトライ実装
 */

import type { RetryContext, RetryErrorInfo } from "./retryTypes";

export class RetryOperations {
  /**
   * Marpレンダリングのリトライ
   */
  static async retryMarpRender(context: RetryContext): Promise<unknown> {
    const { markdown, theme = "default" } = context;

    if (!markdown) {
      throw new Error("Markdown content is required for rendering");
    }

    const response = await fetch("/api/marp-render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markdown, theme }),
    });

    if (!response.ok) {
      throw new Error(
        `Marp render failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Rendering failed");
    }

    return result;
  }

  /**
   * エクスポートのリトライ
   */
  static async retryExport(context: RetryContext): Promise<Blob> {
    const { markdown, format, theme = "default" } = context;

    const response = await fetch("/api/marp-export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markdown, format, theme }),
    });

    if (!response.ok) {
      throw new Error(
        `Export failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.blob();
  }

  /**
   * 保存のリトライ
   */
  static async retrySave(
    context: RetryContext
  ): Promise<{ success: boolean; timestamp: string }> {
    const { markdown, theme } = context;

    try {
      const dataToSave = {
        markdown,
        theme,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("marp-editor-content", JSON.stringify(dataToSave));
      return { success: true, timestamp: dataToSave.timestamp };
    } catch (error) {
      throw new Error(`Save failed: ${(error as Error).message}`);
    }
  }

  /**
   * 共有のリトライ
   */
  static async retryShare(context: RetryContext): Promise<unknown> {
    const { markdown, password, expiresIn } = context;

    const response = await fetch("/api/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ markdown, password, expiresIn }),
    });

    if (!response.ok) {
      throw new Error(
        `Share failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * API呼び出しのリトライ
   */
  static async retryApiCall(context: RetryContext): Promise<unknown> {
    const { url, options = {} } = context;

    if (!url) {
      throw new Error("URL is required for API call");
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * 元の処理を再実行する
   */
  static async executeOriginalOperation(
    errorInfo: RetryErrorInfo
  ): Promise<unknown> {
    const { context } = errorInfo;

    if (!context?.operation) {
      throw new Error("Operation context is required for retry");
    }

    // 操作タイプに応じて適切な処理を実行
    switch (context.operation) {
      case "marp-render":
        return await this.retryMarpRender(context);
      case "export":
        return await this.retryExport(context);
      case "save":
        return await this.retrySave(context);
      case "share":
        return await this.retryShare(context);
      case "api-call":
        return await this.retryApiCall(context);
      default:
        throw new Error(`Unknown operation for retry: ${context.operation}`);
    }
  }
}
