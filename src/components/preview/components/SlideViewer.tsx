"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
// 16:9固定のスライドサイズ定数
const SLIDE_SIZE = { width: 1280, height: 720 };
const ASPECT_RATIO_CSS = "16 / 9";
import { MarpIsolatedStyle } from "@/lib/marp";

// 型定義
interface Slide {
  html: string;
}

interface SlideViewerProps {
  slide?: Slide;
  css: string;
  className?: string;
  onKeyDown?: (event: KeyboardEvent) => void;
  currentIndex?: number;
  totalSlides?: number;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * 単一スライド表示コンポーネント（ミニマル版）
 * ヘッダーに統合されたナビゲーション機能により、スライド内容のみに集中
 */
const SlideViewer: React.FC<SlideViewerProps> = ({
  slide,
  css,
  className = "",
  onKeyDown,
  currentIndex = 0,
  totalSlides = 0,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 16:9固定のスライドサイズ
  const slideSize = SLIDE_SIZE;

  // 全画面機能
  const toggleFullscreen = useCallback(async (): Promise<void> => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen not supported:", error);
    }
  }, []);

  // 全画面状態の監視
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // キーボードイベントの設定
  useEffect(() => {
    const container = containerRef.current;
    if (container && onKeyDown) {
      const handleKeyDown = (event: KeyboardEvent): void => {
        onKeyDown(event);
      };

      container.addEventListener("keydown", handleKeyDown);

      return () => {
        container.removeEventListener("keydown", handleKeyDown);
      };
    }
    return undefined;
  }, [onKeyDown]);

  if (!slide) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-lg mb-2">📄</div>
          <p>スライドがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full focus:outline-none flex flex-col ${className}`}
      tabIndex={0}
      role="region"
      aria-label={`スライド ${currentIndex + 1} / ${totalSlides}`}
    >
      {/* Marp CSS with enhanced scoping to prevent Tailwind interference */}
      <MarpIsolatedStyle css={css} />

      {/* スライドコンテンツエリア */}
      <div
        className={`flex-1 overflow-hidden ${isFullscreen ? "p-0" : "p-4"}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="slide-content rounded-lg overflow-hidden marp-content-isolated"
          style={
            {
              background: "white",
              width: isFullscreen ? "100%" : "95%",
              maxWidth: isFullscreen ? "none" : `${slideSize.width}px`,
              height: isFullscreen ? "100%" : "auto",
              aspectRatio: isFullscreen ? "none" : ASPECT_RATIO_CSS,
              // 影とボーダーを改善（全画面時は無効）
              boxShadow: isFullscreen
                ? "none"
                : "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
              border: isFullscreen ? "none" : "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: isFullscreen ? "0" : undefined,
              // CSS干渉対策
              isolation: "isolate",
              contain: "layout style",
            } as React.CSSProperties
          }
        >
          {/* Marpの元の構造とスタイルを完全に保持 */}
          <div
            dangerouslySetInnerHTML={{ __html: slide.html }}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* 下部コントロールバー */}
      {totalSlides > 0 && (
        <div
          className={`flex items-center justify-between px-6 py-3 ${
            isFullscreen
              ? "absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-none"
              : "border-t bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm"
          }`}
        >
          {/* 左側: 空白（バランス用） */}
          <div className="w-28"></div>

          {/* 中央: メインナビゲーション */}
          <div className="flex items-center gap-4">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 rounded-full hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm border border-gray-200/50 dark:border-gray-600/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
              aria-label="前のスライド"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-sm border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {currentIndex + 1}
              </span>
              <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {totalSlides}
              </span>
            </div>

            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 rounded-full hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm border border-gray-200/50 dark:border-gray-600/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
              aria-label="次のスライド"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* 右側: 全画面ボタン */}
          <div className="w-28 flex justify-end">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 text-xs font-medium rounded-full border border-gray-200/50 dark:border-gray-600/50 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 shadow-sm backdrop-blur-sm text-gray-700 dark:text-gray-300"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isFullscreen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  )}
                </svg>
                <span>{isFullscreen ? "終了" : "全画面"}</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SlideViewer);
