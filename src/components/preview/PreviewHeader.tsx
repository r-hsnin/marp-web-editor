/**
 * プレビューヘッダーコンポーネント
 */

"use client";

import React from "react";
import { PreviewHeaderProps } from "./types";

export const PreviewHeader: React.FC<PreviewHeaderProps> = React.memo(
  ({ slideInfo }) => {
    const {
      totalSlides,
      currentSlideIndex,
      viewMode,
      hasNextSlide,
      hasPrevSlide,
      handleViewModeChange,
      handleSlideNavigation,
    } = slideInfo;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm h-12">
        {/* 左側: Preview タイトル + スライド数 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <h2 className="text-sm font-semibold text-foreground">Preview</h2>
          </div>

          {totalSlides > 0 && (
            <div className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
              ({currentSlideIndex + 1}/{totalSlides})
            </div>
          )}
        </div>

        {/* 右側: 表示モード切り替え + ナビゲーション（固定幅レイアウト） */}
        <div
          className="flex items-center gap-3"
          style={{ width: "200px", justifyContent: "flex-end" }}
        >
          {/* 表示モード切り替え */}
          {totalSlides > 0 && handleViewModeChange && (
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shadow-inner">
              <button
                onClick={() => handleViewModeChange("single")}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-all duration-200 min-w-[50px] ${
                  viewMode === "single"
                    ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  単一
                </div>
              </button>
              <button
                onClick={() => handleViewModeChange("overview")}
                className={`px-4 py-1 text-xs font-medium rounded-md transition-all duration-200 min-w-[50px] ${
                  viewMode === "overview"
                    ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  一覧
                </div>
              </button>
            </div>
          )}

          {/* ナビゲーションボタン（常に表示、無効時はグレーアウト） */}
          {totalSlides > 0 && handleSlideNavigation && (
            <div
              className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700"
              style={{ width: "80px", justifyContent: "center" }}
            >
              <button
                onClick={() => handleSlideNavigation("prev")}
                disabled={viewMode !== "single" || !hasPrevSlide}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="前のスライド"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
              <button
                onClick={() => handleSlideNavigation("next")}
                disabled={viewMode !== "single" || !hasNextSlide}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="次のスライド"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

PreviewHeader.displayName = "PreviewHeader";
