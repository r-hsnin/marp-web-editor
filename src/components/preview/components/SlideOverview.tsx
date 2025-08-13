"use client";

import React from "react";
// 16:9固定のアスペクト比定数
const ASPECT_RATIO_CSS = "16 / 9";
import { MarpIsolatedStyle } from "@/lib/marp";
import type { Slide } from "@/lib/marp/ui";

interface SlideOverviewProps {
  slides: Slide[];
  css: string;
  currentIndex?: number;
  onSlideClick?: (index: number) => void;
  className?: string;
}

/**
 * スライド一覧表示コンポーネント
 */
const SlideOverview: React.FC<SlideOverviewProps> = ({
  slides,
  css,
  currentIndex = 0,
  onSlideClick,
  className = "",
}) => {
  // スライドサイズは16:9固定のため、動的な抽出は不要

  if (!slides || slides.length === 0) {
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
    <div className={`h-full overflow-auto p-4 ${className}`}>
      {/* Marp CSS with enhanced scoping to prevent Tailwind interference */}
      <MarpIsolatedStyle css={css} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`
              relative cursor-pointer border-2 transition-all duration-200
              ${
                index === currentIndex
                  ? "border-blue-500"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
            onClick={() => onSlideClick?.(index)}
            role="button"
            tabIndex={0}
            aria-label={`スライド ${index + 1}: ${slide.title}`}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSlideClick?.(index);
              }
            }}
          >
            {/* スライドプレビュー */}
            <div
              className="bg-white flex items-center justify-center overflow-hidden"
              style={{
                aspectRatio: ASPECT_RATIO_CSS,
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: slide.html }}
                className="marp-content-isolated"
                style={{
                  transform: "scale(1)", // スケールを1（100%）に！縮小なし
                  transformOrigin: "center",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
              />
            </div>

            {/* シンプルなスライド情報 */}
            <div className="absolute bottom-2 left-2 bg-white/90 text-gray-800 px-2 py-1 rounded text-sm font-medium">
              {index + 1} / {slides.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SlideOverview);
