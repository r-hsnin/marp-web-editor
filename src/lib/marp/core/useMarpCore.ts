/**
 * Marp Core React Hook
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { MarpResult } from "./marpTypes";
import type { MarpSettings, MarpTheme } from "../settings/settingsTypes";
import { MarpRenderer } from "./marpRenderer";
import { MarpValidator } from "./marpValidator";
import { MarpErrorClassifier } from "./errorClassifier";
import { PerformanceMonitor } from "./performanceMonitor";

/**
 * marp-coreを使用してMarkdownをHTML+CSSに変換するカスタムフック
 *
 * 機能:
 * - 即座のレンダリング（デバウンス無し）
 * - 詳細なエラーハンドリング
 * - パフォーマンス測定
 * - メモリリーク防止
 * - テーマ検証
 * - フロントマター設定対応（手動・UI設定の統合）
 */
export const useMarpCore = (
  markdown: string,
  theme: string = "default",
  settings: Partial<MarpSettings> = {}
): MarpResult => {
  // テーマの検証
  const validatedTheme = MarpValidator.validateTheme(theme);

  // 設定のデフォルト値
  const marpSettings: MarpSettings = useMemo(
    () => ({
      theme: validatedTheme as MarpTheme,
      paginate: settings.paginate ?? true,
      header: settings.header ?? "",
      footer: settings.footer ?? "",
    }),
    [validatedTheme, settings.paginate, settings.header, settings.footer]
  );

  const [result, setResult] = useState<MarpResult>({
    html: "",
    css: "",
    error: null,
    isLoading: false,
    renderTime: 0,
    metrics: PerformanceMonitor.createPerformanceMetrics(),
  });

  const lastMarkdownRef = useRef("");
  const lastThemeRef = useRef("");
  const lastSettingsRef = useRef<MarpSettings | null>(null);

  /**
   * Markdownをレンダリングする
   */
  const renderMarkdown = useCallback(
    async (markdownContent: string, selectedTheme: string) => {
      if (!markdownContent.trim()) {
        setResult((prev) => ({
          html: "",
          css: "",
          error: null,
          isLoading: false,
          renderTime: 0,
          metrics: prev.metrics,
        }));
        return;
      }

      setResult((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { result: renderResult, renderTime } =
          await PerformanceMonitor.measureAsyncRenderTime(() =>
            MarpRenderer.renderMarkdown(
              markdownContent,
              selectedTheme,
              marpSettings
            )
          );

        const updatedMetrics = PerformanceMonitor.updateMetrics(
          result.metrics,
          renderTime,
          markdownContent.length,
          false
        );

        setResult({
          html: renderResult.html,
          css: renderResult.css,
          error: null,
          isLoading: false,
          renderTime,
          metrics: updatedMetrics,
        });
      } catch (error) {
        const classifiedError = MarpErrorClassifier.createClassifiedError(
          error as Error,
          {
            theme: selectedTheme,
            contentSize: markdownContent.length,
          }
        );

        const fallbackHtml = MarpErrorClassifier.generateFallbackHtml(
          classifiedError,
          selectedTheme
        );

        const updatedMetrics = PerformanceMonitor.updateMetrics(
          result.metrics,
          0,
          markdownContent.length,
          true
        );

        setResult({
          html: fallbackHtml,
          css: "",
          error: classifiedError,
          isLoading: false,
          renderTime: 0,
          metrics: updatedMetrics,
        });
      }
    },
    [marpSettings, result.metrics]
  );

  /**
   * 即座のレンダリング実行
   */
  const immediateRender = useCallback(
    (markdownContent: string, selectedTheme: string) => {
      // 変更がない場合はスキップ（設定の変更も含めて判定）
      const settingsChanged =
        JSON.stringify(marpSettings) !==
        JSON.stringify(lastSettingsRef.current);
      if (
        markdownContent === lastMarkdownRef.current &&
        selectedTheme === lastThemeRef.current &&
        !settingsChanged
      ) {
        return;
      }

      // 即座に実行
      lastMarkdownRef.current = markdownContent;
      lastThemeRef.current = selectedTheme;
      lastSettingsRef.current = { ...marpSettings };
      renderMarkdown(markdownContent, selectedTheme);
    },
    [renderMarkdown, marpSettings]
  );

  // Markdownまたはテーマまたは設定が変更された時に即座にレンダリング実行
  useEffect(() => {
    immediateRender(markdown, validatedTheme);
  }, [markdown, validatedTheme, marpSettings, immediateRender]);

  // メモリリーク防止のための追加クリーンアップ（タイマー関連のクリーンアップは不要）
  useEffect(() => {
    return () => {
      // 必要に応じて他のクリーンアップ処理を追加
    };
  }, []);

  return result;
};
