/**
 * エクスポートユーティリティ
 */

import type { ExportFormat, ExportOptions } from "./exportTypes";
import { DEFAULT_EXPORT_OPTIONS } from "./exportTypes";

export class ExportUtils {
  /**
   * タイムアウト付きfetch
   */
  static async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_EXPORT_OPTIONS.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === "AbortError") {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }

      throw error;
    }
  }

  /**
   * エクスポート用のMarkdownを取得
   */
  static getExportMarkdown(
    markdown: string,
    getRenderMarkdown?: ((markdown: string) => string) | null
  ): string {
    if (getRenderMarkdown && typeof getRenderMarkdown === "function") {
      // UI設定を反映したMarkdownを使用
      return getRenderMarkdown(markdown);
    }
    // フォールバック: 生のMarkdownを使用
    return markdown;
  }

  /**
   * エクスポートオプションのマージ
   */
  static mergeExportOptions(
    options: Partial<ExportOptions> = {}
  ): Required<ExportOptions> {
    return {
      ...DEFAULT_EXPORT_OPTIONS,
      ...options,
    };
  }

  /**
   * エクスポート形式の検証
   */
  static isValidExportFormat(format: string): format is ExportFormat {
    return ["html", "pdf", "pptx"].includes(format);
  }

  /**
   * エラーメッセージの生成
   */
  static generateErrorMessage(format: ExportFormat, error: Error): string {
    const formatNames: Record<ExportFormat, string> = {
      html: "HTML",
      pdf: "PDF",
      pptx: "PowerPoint",
    };

    const formatName = formatNames[format];

    if (error.message.includes("timeout")) {
      return `${formatName}エクスポートがタイムアウトしました。しばらく待ってから再試行してください。`;
    }

    if (error.message.includes("network") || error.message.includes("fetch")) {
      return `${formatName}エクスポート中にネットワークエラーが発生しました。接続を確認してください。`;
    }

    return `${formatName}エクスポートに失敗しました。しばらく待ってから再試行してください。`;
  }

  /**
   * レスポンスの検証
   */
  static validateResponse(response: Response, format: ExportFormat): void {
    if (!response.ok) {
      throw new Error(
        `Export failed with status ${response.status}: ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type");

    if (format === "html" && !contentType?.includes("text/html")) {
      throw new Error("Invalid response format for HTML export");
    }

    if (format === "pdf" && !contentType?.includes("application/pdf")) {
      throw new Error("Invalid response format for PDF export");
    }

    if (
      format === "pptx" &&
      !contentType?.includes(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      )
    ) {
      throw new Error("Invalid response format for PPTX export");
    }
  }
}
