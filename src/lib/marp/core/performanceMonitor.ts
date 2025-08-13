/**
 * Marpパフォーマンス監視システム
 */

import type { PerformanceMetrics, MemoryUsage } from "./marpTypes";

export class PerformanceMonitor {
  /**
   * パフォーマンスメトリクスの初期値を作成
   */
  static createPerformanceMetrics(): PerformanceMetrics {
    return {
      renderTime: 0,
      memoryUsage: 0,
      renderCount: 0,
      errorCount: 0,
      lastRenderSize: 0,
      averageRenderTime: 0,
    };
  }

  /**
   * メモリ使用量を測定（概算）
   */
  static measureMemoryUsage(): MemoryUsage {
    if (typeof window !== "undefined" && "memory" in performance) {
      const memory = (
        performance as Performance & {
          memory: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  /**
   * レンダリング時間を測定
   */
  static measureRenderTime<T>(fn: () => T): { result: T; renderTime: number } {
    const startTime = performance.now();
    const result = fn();
    const renderTime = performance.now() - startTime;

    return { result, renderTime };
  }

  /**
   * 非同期レンダリング時間を測定
   */
  static async measureAsyncRenderTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; renderTime: number }> {
    const startTime = performance.now();
    const result = await fn();
    const renderTime = performance.now() - startTime;

    return { result, renderTime };
  }

  /**
   * メトリクスを更新
   */
  static updateMetrics(
    currentMetrics: PerformanceMetrics,
    renderTime: number,
    contentSize: number,
    isError: boolean = false
  ): PerformanceMetrics {
    const newRenderCount = currentMetrics.renderCount + 1;
    const totalRenderTime =
      currentMetrics.averageRenderTime * currentMetrics.renderCount +
      renderTime;

    return {
      renderTime,
      memoryUsage: this.measureMemoryUsage().used,
      renderCount: newRenderCount,
      errorCount: currentMetrics.errorCount + (isError ? 1 : 0),
      lastRenderSize: contentSize,
      averageRenderTime: totalRenderTime / newRenderCount,
    };
  }

  /**
   * パフォーマンス警告をチェック
   */
  static checkPerformanceWarnings(metrics: PerformanceMetrics): string[] {
    const warnings: string[] = [];

    if (metrics.averageRenderTime > 1000) {
      warnings.push("レンダリング時間が長すぎます");
    }

    if (metrics.memoryUsage > 100) {
      warnings.push("メモリ使用量が多すぎます");
    }

    if (metrics.errorCount / metrics.renderCount > 0.1) {
      warnings.push("エラー率が高すぎます");
    }

    return warnings;
  }
}
