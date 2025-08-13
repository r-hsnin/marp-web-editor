/**
 * ファイルエクスポート機能（HTML, PDF, PPTX）
 */

import type {
  ExportResult,
  ExportContext,
  ExportOptions,
  ExportFormat,
} from "./exportTypes";
import { EXPORT_ENDPOINTS } from "./exportTypes";
import { ExportUtils } from "./exportProcessor";
import { generateFilename } from "../utils/exportHelpers";

export class FileExporter {
  /**
   * ファイルエクスポートを実行（HTML, PDF, PPTX）
   */
  static async exportFile(
    context: ExportContext,
    options: Required<ExportOptions>
  ): Promise<ExportResult> {
    try {
      const response = await ExportUtils.fetchWithTimeout(
        EXPORT_ENDPOINTS[context.format],
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markdown: context.markdown,
            format: context.format,
          }),
        },
        options.timeout
      );

      ExportUtils.validateResponse(response, context.format);

      const blob = await response.blob();
      const filename = generateFilename(context.markdown, context.format);

      // Blobをダウンロード用に変換
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        data: blob,
        filename,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * HTMLエクスポート
   */
  static async exportHtml(
    context: Omit<ExportContext, "format">,
    options: Required<ExportOptions>
  ): Promise<ExportResult> {
    return this.exportFile({ ...context, format: "html" }, options);
  }

  /**
   * PDFエクスポート
   */
  static async exportPdf(
    context: Omit<ExportContext, "format">,
    options: Required<ExportOptions>
  ): Promise<ExportResult> {
    return this.exportFile({ ...context, format: "pdf" }, options);
  }

  /**
   * PPTXエクスポート
   */
  static async exportPptx(
    context: Omit<ExportContext, "format">,
    options: Required<ExportOptions>
  ): Promise<ExportResult> {
    return this.exportFile({ ...context, format: "pptx" }, options);
  }

  /**
   * エクスポート形式に応じたMIMEタイプを取得
   */
  static getMimeType(format: ExportFormat): string {
    const mimeTypes: Record<ExportFormat, string> = {
      html: "text/html",
      pdf: "application/pdf",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };

    return mimeTypes[format];
  }

  /**
   * エクスポート形式の表示名を取得
   */
  static getFormatDisplayName(format: ExportFormat): string {
    const displayNames: Record<ExportFormat, string> = {
      html: "HTML",
      pdf: "PDF",
      pptx: "PowerPoint",
    };

    return displayNames[format];
  }
}
