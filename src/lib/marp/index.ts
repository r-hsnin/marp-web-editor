/**
 * Marpシステムのエクスポート
 */

// Core functionality (excluding MarpSettings to avoid conflict)
export {
  useMarpCore,
  MarpRenderer,
  MarpValidator,
  MarpErrorClassifier,
  PerformanceMonitor,
  createIsolatedMarpCSS,
  MarpIsolatedStyle,
  ERROR_TYPES,
} from "./core";

export type {
  MarpResult,
  MarpError,
  MarpErrorType,
  MarpRenderContext,
  PerformanceMetrics,
  MemoryUsage,
  FrontmatterResult,
  MarpStyleProps,
} from "./core";

// Settings management
export * from "./settings";

// UI utilities
export * from "./ui";

// Default export
export { useMarpCore as default } from "./core";
