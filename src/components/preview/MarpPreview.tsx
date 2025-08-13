"use client";

import { memo, useMemo } from "react";
import type { MarpSettings } from "@/types/marp";

import SlideViewer from "./components/SlideViewer";
import SlideOverview from "./components/SlideOverview";
import { PreviewHeader } from "./PreviewHeader";
import usePreviewCore from "./hooks/usePreviewCore";
import usePreviewNavigation from "./hooks/usePreviewNavigation";
import usePreviewState from "./hooks/usePreviewState";
import type { ViewMode, NavigationAction, SlideInfo } from "./types";

// MarpPreview コンポーネントのProps型定義
interface MarpPreviewProps {
  markdown: string;
  theme?: string;
  className?: string;
  isDark?: boolean;
  mobileTab?: string; // Current mobile tab state
  // フロントマター設定（既存システムとの互換性）
  settings?: MarpSettings;
  // 統合ヘッダー用のコールバック関数
  onSlideInfoChange?: ((info: SlideInfo) => void) | null; // スライド情報変更時のコールバック
  onViewModeChange?: ((mode: ViewMode) => void) | null; // 表示モード変更時のコールバック
  onSlideNavigation?:
    | ((action: NavigationAction, index?: number | null) => void)
    | null; // スライドナビゲーション時のコールバック
}

/**
 * MarpPreview Component
 *
 * marp-coreを使用したクライアントサイドプレビューコンポーネント:
 * - 既存MarpPreview.jsと同じpropsインターフェース
 * - useMarpCoreフックとの統合
 * - エラー状態とローディング状態の表示
 * - 既存コンポーネントと同等のスタイリング
 * - iframe不使用の直接DOM表示
 * - フロントマター設定対応（paginate, header, footer, size）
 */
const MarpPreview = memo<MarpPreviewProps>(function MarpPreview({
  markdown,
  theme = "default",
  className = "",
  isDark = false,
  mobileTab = "editor", // Current mobile tab state
  // フロントマター設定（既存システムとの互換性）
  settings = {
    theme: "default",
    paginate: true,
    header: "",
    footer: "",
  },
  // 統合ヘッダー用のコールバック関数
  onSlideInfoChange = null, // スライド情報変更時のコールバック
  onViewModeChange = null, // 表示モード変更時のコールバック
  onSlideNavigation = null, // スライドナビゲーション時のコールバック
}) {
  // Hook composition pattern
  const coreState = usePreviewCore({ markdown, theme, settings });
  const navigationState = usePreviewNavigation({
    html: coreState.html,
    css: coreState.css,
  });
  const { handleViewModeChange } = usePreviewState({
    navigationState,
    onSlideInfoChange,
    onViewModeChange,
    onSlideNavigation,
  });

  // Track window size for responsive rendering (既存コンポーネントと同様)
  const isDesktop = useMemo((): boolean => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true; // Default to desktop for SSR
  }, []);

  // Conditional rendering logic: Desktop always renders, Mobile only when preview tab is active
  const shouldRender = useMemo((): boolean => {
    // Desktop: always render
    if (isDesktop) {
      return true;
    }

    // Mobile: only render when preview tab is active
    return mobileTab === "preview";
  }, [isDesktop, mobileTab]);

  // Prepare slideInfo for PreviewHeader
  const slideInfo = useMemo(
    () => ({
      totalSlides: navigationState.totalSlides,
      currentSlideIndex: navigationState.currentSlideIndex,
      viewMode: navigationState.viewMode,
      hasNextSlide: navigationState.hasNextSlide,
      hasPrevSlide: navigationState.hasPrevSlide,
      handleViewModeChange: handleViewModeChange,
      handleSlideNavigation: navigationState.handleSlideNavigation,
    }),
    [
      navigationState.totalSlides,
      navigationState.currentSlideIndex,
      navigationState.viewMode,
      navigationState.hasNextSlide,
      navigationState.hasPrevSlide,
      handleViewModeChange,
      navigationState.handleSlideNavigation,
    ]
  );

  // Early return if component should not render (mobile and not preview tab)
  if (!shouldRender) {
    return null; // Don't render anything when not needed
  }

  // Empty state when no markdown content
  if (!markdown?.trim()) {
    return (
      <div
        className={`h-full flex flex-col bg-card/30 backdrop-blur-sm ${className}`}
      >
        {/* Preview Header */}
        <PreviewHeader
          slideInfo={{
            totalSlides: 0,
            currentSlideIndex: 0,
            viewMode: "single" as ViewMode,
            hasNextSlide: false,
            hasPrevSlide: false,
            handleViewModeChange: null,
            handleSlideNavigation: null,
          }}
          selectedTheme={theme}
          isDark={isDark}
        />

        <div className="flex-1 overflow-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
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
              </div>
              <p className="text-sm">
                Start typing to see your presentation preview
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Powered by Marp
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col bg-card/30 backdrop-blur-sm ${className}`}
    >
      {/* Preview Header */}
      <PreviewHeader
        slideInfo={slideInfo}
        selectedTheme={theme}
        isDark={isDark}
      />

      <div className="flex-1 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative">
        {/* スライド表示 */}
        {navigationState.viewMode === "single" ? (
          navigationState.currentSlide ? (
            <SlideViewer
              slide={navigationState.currentSlide}
              css={coreState.css} // CSSを渡す
              onKeyDown={navigationState.handleKeyDown}
              currentIndex={navigationState.currentSlideIndex}
              totalSlides={navigationState.totalSlides}
              onNext={navigationState.goToNextSlide}
              onPrev={navigationState.goToPrevSlide}
              hasNext={navigationState.hasNextSlide}
              hasPrev={navigationState.hasPrevSlide}
              className="h-full"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">No slide to display</p>
              </div>
            </div>
          )
        ) : (
          <SlideOverview
            slides={navigationState.slides}
            css={coreState.css} // CSSを渡す
            currentIndex={navigationState.currentSlideIndex}
            onSlideClick={(index: number) => {
              navigationState.goToSlide(index);
              handleViewModeChange("single");
            }}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
});

// Display name for debugging
MarpPreview.displayName = "MarpPreview";

export default memo(MarpPreview);
