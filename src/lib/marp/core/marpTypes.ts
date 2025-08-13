/**
 * Marp関連の型定義
 */

import type { LogContext } from "@/types/base";

export const ERROR_TYPES = {
  SYNTAX_ERROR: "SYNTAX_ERROR",
  RENDERING_ERROR: "RENDERING_ERROR",
  MEMORY_ERROR: "MEMORY_ERROR",
  INITIALIZATION_ERROR: "INITIALIZATION_ERROR",
  THEME_ERROR: "THEME_ERROR",
} as const;

export type MarpErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  renderCount: number;
  errorCount: number;
  lastRenderSize: number;
  averageRenderTime: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  limit: number;
}

// MarpSettings is now imported from settings module

export interface FrontmatterResult {
  frontmatter: string;
  content: string;
  hasManualFrontmatter: boolean;
}

export interface MarpResult {
  html: string;
  css: string;
  error: MarpError | null;
  isLoading: boolean;
  renderTime: number;
  metrics: PerformanceMetrics;
}

export interface MarpError extends Error {
  type: MarpErrorType;
  userMessage: string;
  canRetry: boolean;
  originalError: Error;
  context: LogContext;
  timestamp: string;
}

export interface MarpRenderContext {
  theme: string;
  contentSize: number;
  phase?: string;
  [key: string]: string | number | boolean;
}
