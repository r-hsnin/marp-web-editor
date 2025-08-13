import type { LogCategory } from "./logCategories";
import type { LogContext } from "@/types/base";

/**
 * ログエントリの型定義
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: "ERROR" | "WARN" | "DEBUG";
  category: LogCategory;
  message: string;
  operationId: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * ログメトリクスの型定義
 */
export interface LogMetrics {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  debugCount: number;
  categoryCounts: Record<LogCategory, number>;
  lastCleanup: number;
}

/**
 * ログ設定の型定義
 */
export interface LoggerConfig {
  maxLogs: number;
  cleanupInterval: number;
  enableMetrics: boolean;
  persistLogs: boolean;
}
