import { logger } from "./logger";
import { getFriendlyErrorMessage } from "../error";
import type { LogCategory } from "./logCategories";

export interface ErrorLoggingOptions {
  userFriendlyErrors?: boolean;
  logSuccess?: boolean;
  logArgs?: boolean;
}

export interface EnhancedError extends Error {
  originalError?: Error;
  operationId?: string;
}

type GenericFunction<T extends unknown[], R> = (...args: T) => R | Promise<R>;

// operationId生成（logger内部メソッドへの依存を削除）
function generateOperationId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * エラーログ付きの関数ラッパー
 * 関数実行時のエラーを自動的にログ記録し、ユーザーフレンドリーなエラーに変換
 */
export function withErrorLogging<T extends unknown[], R>(
  fn: GenericFunction<T, R>,
  category: LogCategory,
  options: ErrorLoggingOptions = {}
): (...args: T) => Promise<R> {
  const {
    userFriendlyErrors = true,
    logSuccess = false,
    logArgs = false,
  } = options;

  return async function (...args: T): Promise<R> {
    const operationId = generateOperationId();
    const startTime = performance.now();

    try {
      const result = await fn(...args);

      if (logSuccess) {
        const duration = Math.round(performance.now() - startTime);
        logger.debug(category, `${fn.name} completed successfully`, {
          operationId,
          duration,
          ...(logArgs && { argsCount: args.length }),
        });
      }

      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      logger.error(category, `${fn.name} failed`, {
        operationId,
        error: error instanceof Error ? error.message : String(error),
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
        duration,
        ...(logArgs && { argsCount: args.length }),
      });

      if (userFriendlyErrors) {
        const friendlyMessage = getFriendlyErrorMessage(
          category,
          error instanceof Error ? error : new Error(String(error))
        );
        const friendlyError: EnhancedError = new Error(friendlyMessage);
        friendlyError.originalError =
          error instanceof Error ? error : new Error(String(error));
        friendlyError.operationId = operationId;
        throw friendlyError;
      }

      throw error;
    }
  };
}

export function withImportantLogging<T extends unknown[], R>(
  fn: GenericFunction<T, R>,
  category: LogCategory
): (...args: T) => Promise<R> {
  return withErrorLogging(fn, category, {
    logSuccess: true,
    userFriendlyErrors: true,
  });
}

export function withApiLogging<T extends unknown[], R>(
  fn: GenericFunction<T, R>,
  category: LogCategory
): (...args: T) => Promise<R> {
  return withErrorLogging(fn, category, {
    logSuccess: false,
    userFriendlyErrors: true,
    logArgs: false,
  });
}
/**
 * パフォーマンス監視付きラッパー
 * 実行時間が閾値を超えた場合に警告ログを出力
 */
export function withPerformanceLogging<T extends unknown[], R>(
  fn: GenericFunction<T, R>,
  category: LogCategory,
  slowThreshold = 2000
): (...args: T) => Promise<R> {
  return async function (...args: T): Promise<R> {
    const operationId = generateOperationId();
    const startTime = performance.now();

    try {
      const result = await fn(...args);
      const duration = Math.round(performance.now() - startTime);

      if (duration > slowThreshold) {
        logger.warn(category, `${fn.name} is slow`, {
          operationId,
          duration,
          threshold: slowThreshold,
        });
      } else {
        logger.debug(category, `${fn.name} completed`, {
          operationId,
          duration,
        });
      }

      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);

      logger.error(category, `${fn.name} failed`, {
        operationId,
        error: error instanceof Error ? error.message : String(error),
        duration,
      });

      throw error;
    }
  };
}

export const log = {
  error: (category: LogCategory, message: string, details = {}): void => {
    logger.error(category, message, details);
  },

  debug: (category: LogCategory, message: string, details = {}): void => {
    logger.debug(category, message, details);
  },

  warn: (category: LogCategory, message: string, details = {}): void => {
    logger.warn(category, message, details);
  },
};
