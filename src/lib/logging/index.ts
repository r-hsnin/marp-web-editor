// Logging module - unified log system
// This module provides a centralized logging system for the application

// Core logging functionality
export { logger } from "./logger";
export type { LogLevel, LogData, LogDetails } from "./logger";

// Enhanced logging with error handling
export {
  withErrorLogging,
  withImportantLogging,
  withApiLogging,
  withPerformanceLogging,
  log,
} from "./autoLogger";
export type { ErrorLoggingOptions, EnhancedError } from "./autoLogger";

// Log categories
export { LOG_CATEGORIES } from "./logCategories";
export type { LogCategory } from "./logCategories";

// Log storage and metrics
export {
  logError,
  logWarning,
  logDebug,
  getLogEntries,
  getLogMetrics,
  clearLogs,
  initializeLogger,
  destroyLogger,
} from "./logStorage";

// Log types
export type { LogEntry, LogMetrics, LoggerConfig } from "./logTypes";
