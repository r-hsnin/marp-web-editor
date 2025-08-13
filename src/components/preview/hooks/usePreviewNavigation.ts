import { useState, useCallback } from "react";
import { useSlides, type Slide } from "@/lib/marp/ui";
import type { ViewMode, NavigationAction } from "../types";

/**
 * Preview navigation functionality hook
 * Handles slide navigation, view mode switching, and keyboard controls
 */
export interface UsePreviewNavigationProps {
  html: string;
  css: string;
}

export interface UsePreviewNavigationReturn {
  // Slides data (moved from core)
  slides: Slide[];
  currentSlide: Slide | null;
  totalSlides: number;

  // Navigation state
  currentSlideIndex: number;
  hasNextSlide: boolean;
  hasPrevSlide: boolean;

  // View mode state
  viewMode: ViewMode;

  // Navigation actions
  goToSlide: (index: number) => void;
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;

  // View mode actions
  handleViewModeChange: (mode: ViewMode) => void;

  // Combined navigation handler
  handleSlideNavigation: (
    action: NavigationAction,
    index?: number | null
  ) => void;
}

/**
 * Navigation and view mode management hook
 * Manages slide navigation and view mode switching
 */
export default function usePreviewNavigation({
  html,
  css,
}: UsePreviewNavigationProps): UsePreviewNavigationReturn {
  // 表示モード管理
  const [viewMode, setViewMode] = useState<ViewMode>("single");

  // スライド管理とナビゲーション機能（単一のuseSlides呼び出し）
  const {
    slides,
    currentSlide,
    currentSlideIndex,
    totalSlides,
    hasNextSlide,
    hasPrevSlide,
    goToSlide,
    goToNextSlide,
    goToPrevSlide,
    handleKeyDown,
  } = useSlides(html, css);

  // 統合ヘッダー用の表示モード切り替えハンドラー
  const handleViewModeChange = useCallback((mode: ViewMode): void => {
    setViewMode(mode);
  }, []);

  // 統合ヘッダー用のナビゲーションハンドラー
  const handleSlideNavigation = useCallback(
    (action: NavigationAction, index: number | null = null): void => {
      switch (action) {
        case "prev":
          goToPrevSlide();
          break;
        case "next":
          goToNextSlide();
          break;
        case "goto":
          if (index !== null) {
            goToSlide(index);
          }
          break;
      }
    },
    [goToPrevSlide, goToNextSlide, goToSlide]
  );

  return {
    // Slides data (moved from core)
    slides,
    currentSlide,
    totalSlides,

    // Navigation state
    currentSlideIndex,
    hasNextSlide,
    hasPrevSlide,

    // View mode state
    viewMode,

    // Navigation actions
    goToSlide,
    goToNextSlide,
    goToPrevSlide,
    handleKeyDown,

    // View mode actions
    handleViewModeChange,

    // Combined navigation handler
    handleSlideNavigation,
  };
}
