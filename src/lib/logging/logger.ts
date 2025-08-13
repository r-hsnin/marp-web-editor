import type { LogCategory } from "./logCategories";

/**
 * ログレベル定義
 */
export type LogLevel = "ERROR" | "WARN" | "DEBUG";

/**
 * ログデータの型定義
 */
export interface LogData {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  operationId: string;
  [key: string]: unknown;
}

/**
 * ログ詳細情報の型定義
 */
export interface LogDetails {
  operationId?: string;
  [key: string]: unknown;
}

/**
 * 軽量Logger - エラーログと重要なデバッグログのみ
 */
class SimpleLogger {
  private readonly isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV === "development";
  }

  private _generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * エラーログ - 本番環境でも記録
   */
  error(
    category: LogCategory,
    message: string,
    details: LogDetails = {}
  ): void {
    const logData: LogData = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      category,
      message,
      operationId: details.operationId || this._generateId(),
      ...details,
    };

    if (this.isDev) {
      console.error(`❌ [${category}] ${message}`, details);
    } else {
      console.error(JSON.stringify(logData));
    }
  }

  /**
   * デバッグログ - 開発環境のみ
   */
  debug(
    category: LogCategory,
    message: string,
    details: LogDetails = {}
  ): void {
    if (this.isDev) {
      console.log(`🔍 [${category}] ${message}`, details);
    }
  }

  /**
   * 警告ログ - 本番環境でも記録
   */
  warn(category: LogCategory, message: string, details: LogDetails = {}): void {
    const logData: LogData = {
      timestamp: new Date().toISOString(),
      level: "WARN",
      category,
      message,
      operationId: details.operationId || this._generateId(),
      ...details,
    };

    if (this.isDev) {
      console.warn(`⚠️ [${category}] ${message}`, details);
    } else {
      console.warn(JSON.stringify(logData));
    }
  }
}

export const logger = new SimpleLogger();
