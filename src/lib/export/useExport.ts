/**
 * エクスポート機能のReact Hook
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  ExportState,
  ExportFormat,
  ExportOptions,
  ExportContext,
} from "./core/exportTypes";
import { ExportUtils } from "./core/exportProcessor";
import { FileExporter } from "./core/fileExporter";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import {
  withErrorLogging,
  withImportantLogging,
} from "@/lib/logging/autoLogger";
import { useErrorHandler } from "@/lib/error";
import { ErrorToastManager } from "@/lib/error";

/**
 * Custom hook for handling export functionality (HTML, PDF, PPTX)
 */
export function useExport(
  markdown: string,
  selectedTheme: string,
  getRenderMarkdown?: ((markdown: string) => string) | null
) {
  // Export state management
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    exportingFormat: null,
    exportError: null,
  });

  // 統一エラーハンドリング統合
  const { executeWithHandling } = useErrorHandler();

  /**
   * エクスポート実行の共通処理
   */
  const executeExport = useCallback(
    async (format: ExportFormat, options: Partial<ExportOptions> = {}) => {
      const mergedOptions = ExportUtils.mergeExportOptions(options);
      const exportMarkdown = ExportUtils.getExportMarkdown(
        markdown,
        getRenderMarkdown
      );

      if (!exportMarkdown.trim()) {
        throw new Error("エクスポートするコンテンツがありません");
      }

      const context: ExportContext = {
        markdown: exportMarkdown,
        theme: selectedTheme,
        format,
        contentSize: exportMarkdown.length,
      };

      setExportState({
        isExporting: true,
        exportingFormat: format,
        exportError: null,
      });

      // 処理中のtoast表示（元のuseExport.jsから復元）
      const formatName = FileExporter.getFormatDisplayName(format);
      toast.loading(`${formatName}エクスポートを開始しています...`, {
        id: `${format}-export-loading`,
        description: "プレゼンテーションを処理中",
      });

      try {
        const result = await FileExporter.exportFile(context, mergedOptions);

        if (!result.success) {
          throw (
            result.error || new Error(`${format.toUpperCase()} export failed`)
          );
        }

        // 処理中toastを閉じて成功通知を表示
        const formatName = FileExporter.getFormatDisplayName(format);
        toast.dismiss(`${format}-export-loading`);
        toast.success(`${formatName}エクスポートが完了しました`);

        return result;
      } finally {
        // 処理中toastを閉じる
        toast.dismiss(`${format}-export-loading`);

        setExportState({
          isExporting: false,
          exportingFormat: null,
          exportError: null,
        });
      }
    },
    [markdown, selectedTheme, getRenderMarkdown]
  );

  /**
   * ファイルエクスポート（HTML, PDF, PPTX）
   */
  const handleExportFile = useCallback(
    (format: ExportFormat) => {
      // Use setTimeout to ensure export doesn't block UI
      setTimeout(async () => {
        const result = await executeWithHandling(() => executeExport(format), {
          category: LOG_CATEGORIES.EXPORT,
          context: {
            operation: `export-${format}`,
            theme: selectedTheme,
            contentSize: markdown.length,
          },
        });

        if (!result.success && result.error) {
          const errorMessage = ExportUtils.generateErrorMessage(
            format,
            result.error
          );

          // 即時トースト通知（統一レイヤ）
          await ErrorToastManager.showError({
            id: `export-${format}-${Date.now()}`,
            type: /timeout|network|fetch/i.test(result.error.message)
              ? "NETWORK"
              : "UNKNOWN",
            severity: "MEDIUM",
            userMessage: errorMessage,
            originalError: result.error,
            context: {
              format,
              theme: selectedTheme,
              contentSize: markdown.length,
            },
            canRetry: true,
          });

          // 既存のログは維持
          logger.error(LOG_CATEGORIES.EXPORT, errorMessage, {
            error: result.error.message,
            format,
            theme: selectedTheme,
            contentSize: markdown.length,
          });

          // 画面側で必要に応じて参照できるように state にも保持（既存動作）
          setExportState((prev) => ({
            ...prev,
            exportError: result.error || null,
          }));
        }
      }, 0);
    },
    [executeExport, executeWithHandling, selectedTheme, markdown.length]
  );

  /**
   * HTMLエクスポート
   */
  const handleExportHTML = useCallback(() => {
    handleExportFile("html");
  }, [handleExportFile]);

  /**
   * PDFエクスポート
   */
  const handleExportPDF = useCallback(() => {
    handleExportFile("pdf");
  }, [handleExportFile]);

  /**
   * PPTXエクスポート
   */
  const handleExportPPTX = useCallback(() => {
    handleExportFile("pptx");
  }, [handleExportFile]);

  /**
   * エクスポートエラーをクリア
   */
  const clearExportError = useCallback(() => {
    setExportState((prev) => ({
      ...prev,
      exportError: null,
    }));
  }, []);

  return {
    // State
    isExporting: exportState.isExporting,
    exportingFormat: exportState.exportingFormat,
    exportError: exportState.exportError,

    // Actions
    handleExportHTML: withImportantLogging(
      withErrorLogging(handleExportHTML, LOG_CATEGORIES.EXPORT),
      LOG_CATEGORIES.EXPORT
    ),
    handleExportPDF: withImportantLogging(
      withErrorLogging(handleExportPDF, LOG_CATEGORIES.EXPORT),
      LOG_CATEGORIES.EXPORT
    ),
    handleExportPPTX: withImportantLogging(
      withErrorLogging(handleExportPPTX, LOG_CATEGORIES.EXPORT),
      LOG_CATEGORIES.EXPORT
    ),
    clearExportError,

    // Utilities
    executeExport,
  };
}
