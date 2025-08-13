import { logger } from "./logger";
import type { LogContext } from "@/types/base";
import { LOG_CATEGORIES } from "./logCategories";
import type { LogCategory } from "./logCategories";
import type { LogEntry, LogMetrics, LoggerConfig } from "./logTypes";

/**
 * デフォルトログ設定
 */
const DEFAULT_CONFIG: LoggerConfig = {
  maxLogs: 1000,
  cleanupInterval: 300000, // 5分
  enableMetrics: true,
  persistLogs: false, // 本番環境では無効
};

/**
 * ログエントリの保存とメトリクス管理
 */
class ErrorLoggerState {
  private logs: LogEntry[] = [];
  private metrics: LogMetrics = {
    totalLogs: 0,
    errorCount: 0,
    warnCount: 0,
    debugCount: 0,
    categoryCounts: {} as Record<LogCategory, number>,
    lastCleanup: Date.now(),
  };
  private config: LoggerConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeCategoryCounts();
    this.startCleanupTimer();
  }

  private initializeCategoryCounts(): void {
    Object.values(LOG_CATEGORIES).forEach((category) => {
      this.metrics.categoryCounts[category] = 0;
    });
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1時間前

    const initialCount = this.logs.length;
    this.logs = this.logs.filter((log) => log.timestamp > oneHourAgo);
    const removedCount = initialCount - this.logs.length;
    if (removedCount > 0) {
      logger.debug(
        LOG_CATEGORIES.CLEANUP,
        `Cleaned up ${removedCount} old log entries`
      );
    }

    this.metrics.lastCleanup = now;
  }

  addLog(entry: LogEntry): void {
    this.logs.push(entry);
    this.updateMetrics(entry);

    // ログ数制限チェック
    if (this.logs.length > this.config.maxLogs) {
      const excess = this.logs.length - this.config.maxLogs;
      this.logs.splice(0, excess);
    }
  }

  private updateMetrics(entry: LogEntry): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalLogs++;

    switch (entry.level) {
      case "ERROR":
        this.metrics.errorCount++;
        break;
      case "WARN":
        this.metrics.warnCount++;
        break;
      case "DEBUG":
        this.metrics.debugCount++;
        break;
    }

    this.metrics.categoryCounts[entry.category] =
      (this.metrics.categoryCounts[entry.category] || 0) + 1;
  }

  getLogs(category?: LogCategory, level?: LogEntry["level"]): LogEntry[] {
    let filteredLogs = this.logs;

    if (category) {
      filteredLogs = filteredLogs.filter((log) => log.category === category);
    }

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    return filteredLogs.slice(); // コピーを返す
  }

  getMetrics(): LogMetrics {
    return { ...this.metrics };
  }

  clear(): void {
    this.logs = [];
    this.metrics = {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      debugCount: 0,
      categoryCounts: {} as Record<LogCategory, number>,
      lastCleanup: Date.now(),
    };
    this.initializeCategoryCounts();
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// グローバルインスタンス
let globalLogger: ErrorLoggerState | null = null;

/**
 * エラーログの記録
 */
export function logError(
  category: LogCategory,
  message: string,
  error?: Error,
  context?: LogContext
): void {
  if (!globalLogger) {
    globalLogger = new ErrorLoggerState();
  }

  const entry: LogEntry = {
    id: generateLogId(),
    timestamp: Date.now(),
    level: "ERROR",
    category,
    message,
    operationId: generateOperationId(),
    ...(context !== undefined && { context }),
    ...(error && {
      error: {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV === "development" &&
          error.stack !== undefined && { stack: error.stack }),
      },
    }),
  };

  globalLogger.addLog(entry);

  // 基本ログシステムにも記録
  logger.error(category, message, {
    operationId: entry.operationId,
    context,
    error: error?.message,
  });
} /**

 * 警告ログの記録
 */
export function logWarning(
  category: LogCategory,
  message: string,
  context?: LogContext
): void {
  if (!globalLogger) {
    globalLogger = new ErrorLoggerState();
  }

  const entry: LogEntry = {
    id: generateLogId(),
    timestamp: Date.now(),
    level: "WARN",
    category,
    message,
    operationId: generateOperationId(),
    ...(context !== undefined && { context }),
  };

  globalLogger.addLog(entry);

  // 基本ログシステムにも記録
  logger.warn(category, message, {
    operationId: entry.operationId,
    context,
  });
}

/**
 * デバッグログの記録
 */
export function logDebug(
  category: LogCategory,
  message: string,
  context?: LogContext
): void {
  if (!globalLogger) {
    globalLogger = new ErrorLoggerState();
  }

  const entry: LogEntry = {
    id: generateLogId(),
    timestamp: Date.now(),
    level: "DEBUG",
    category,
    message,
    operationId: generateOperationId(),
    ...(context !== undefined && { context }),
  };

  globalLogger.addLog(entry);

  // 基本ログシステムにも記録
  logger.debug(category, message, {
    operationId: entry.operationId,
    context,
  });
} /**

 * ログエントリの取得
 */
export function getLogEntries(
  category?: LogCategory,
  level?: LogEntry["level"]
): LogEntry[] {
  if (!globalLogger) {
    return [];
  }
  return globalLogger.getLogs(category, level);
}

/**
 * ログメトリクスの取得
 */
export function getLogMetrics(): LogMetrics {
  if (!globalLogger) {
    return {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      debugCount: 0,
      categoryCounts: {} as Record<LogCategory, number>,
      lastCleanup: Date.now(),
    };
  }
  return globalLogger.getMetrics();
}

/**
 * ログのクリア
 */
export function clearLogs(): void {
  if (globalLogger) {
    globalLogger.clear();
  }
}

/**
 * ログシステムの初期化
 */
export function initializeLogger(config?: Partial<LoggerConfig>): void {
  if (globalLogger) {
    globalLogger.destroy();
  }
  globalLogger = new ErrorLoggerState(config);
}

/**
 * ログシステムの破棄
 */
export function destroyLogger(): void {
  if (globalLogger) {
    globalLogger.destroy();
    globalLogger = null;
  }
}

// ユーティリティ関数
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function generateOperationId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
