/**
 * エクスポート機能の型定義
 */

export type ExportFormat = "html" | "pdf" | "pptx";

export interface ExportState {
  isExporting: boolean;
  exportingFormat: ExportFormat | null;
  exportError: Error | null;
}

export interface ExportOptions {
  timeout?: number;
  retryCount?: number;
  showProgress?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: Blob;
  filename?: string;
  error?: Error;
}

export interface ExportContext {
  markdown: string;
  theme: string;
  format: ExportFormat;
  contentSize: number;
}

export const DEFAULT_EXPORT_OPTIONS: Required<ExportOptions> = {
  timeout: 30000,
  retryCount: 3,
  showProgress: true,
};

export const EXPORT_ENDPOINTS: Record<ExportFormat, string> = {
  html: "/api/marp-export",
  pdf: "/api/marp-export",
  pptx: "/api/marp-export",
};
