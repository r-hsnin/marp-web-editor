// Core Marp functionality exports
export { useMarpCore } from "./useMarpCore";
export { MarpRenderer } from "./marpRenderer";
export { MarpValidator } from "./marpValidator";
export { MarpErrorClassifier } from "./errorClassifier";
export { PerformanceMonitor } from "./performanceMonitor";
export { createIsolatedMarpCSS, MarpIsolatedStyle } from "./cssIsolation";

// Type exports
export type {
  MarpResult,
  MarpError,
  MarpErrorType,
  MarpRenderContext,
  PerformanceMetrics,
  MemoryUsage,
  FrontmatterResult,
} from "./marpTypes";

export type { MarpStyleProps } from "./cssIsolation";

export { ERROR_TYPES } from "./marpTypes";
