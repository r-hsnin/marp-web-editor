import { useEffect, useCallback } from "react";
import { usePrevious } from "@/lib/core";
import type { ViewMode, NavigationAction, SlideInfo } from "../types";
import type { UsePreviewNavigationReturn } from "./usePreviewNavigation";

/**
 * Preview state coordination hook
 * Handles state coordination, callback management, and props integration
 */
export interface UsePreviewStateProps {
  navigationState: UsePreviewNavigationReturn;
  onSlideInfoChange?: ((info: SlideInfo) => void) | null;
  onViewModeChange?: ((mode: ViewMode) => void) | null;
  onSlideNavigation?:
    | ((action: NavigationAction, index?: number | null) => void)
    | null;
}

export interface UsePreviewStateReturn {
  // Enhanced handlers with callback integration
  handleViewModeChange: (mode: ViewMode) => void;
  handleSlideNavigation: (
    action: NavigationAction,
    index?: number | null
  ) => void;
}

/**
 * State coordination and callback management hook
 * Coordinates between core and navigation hooks and manages parent callbacks
 */
export default function usePreviewState({
  navigationState,
  onSlideInfoChange = null,
  onViewModeChange = null,
  onSlideNavigation = null,
}: UsePreviewStateProps): UsePreviewStateReturn {
  // Use navigation state for slides data (single source of truth)
  const { totalSlides } = navigationState;
  const {
    currentSlideIndex,
    viewMode,
    hasNextSlide,
    hasPrevSlide,
    handleViewModeChange: baseHandleViewModeChange,
    handleSlideNavigation: baseHandleSlideNavigation,
  } = navigationState;

  // 前回の値を追跡（フォーカス喪失問題の解決）
  const prevTotalSlides = usePrevious(totalSlides);
  const prevCurrentSlideIndex = usePrevious(currentSlideIndex);
  const prevViewMode = usePrevious(viewMode);

  // Enhanced view mode change handler with callback
  const handleViewModeChange = useCallback(
    (mode: ViewMode): void => {
      baseHandleViewModeChange(mode);
      if (onViewModeChange) {
        onViewModeChange(mode);
      }
    },
    [baseHandleViewModeChange, onViewModeChange]
  );

  // Enhanced navigation handler with callback
  const handleSlideNavigation = useCallback(
    (action: NavigationAction, index: number | null = null): void => {
      baseHandleSlideNavigation(action, index);
      if (onSlideNavigation) {
        onSlideNavigation(action, index);
      }
    },
    [baseHandleSlideNavigation, onSlideNavigation]
  );

  // スライド情報を親コンポーネントに通知（最適化版）
  useEffect(() => {
    if (onSlideInfoChange) {
      // 重要な値が実際に変更された場合のみ更新
      const hasImportantChange =
        prevTotalSlides !== totalSlides ||
        prevCurrentSlideIndex !== currentSlideIndex ||
        prevViewMode !== viewMode;

      // 初回レンダリング時は常に実行（prevTotalSlidesがundefinedの場合）
      if (prevTotalSlides === undefined || hasImportantChange) {
        onSlideInfoChange({
          totalSlides,
          currentSlideIndex,
          viewMode,
          hasNextSlide,
          hasPrevSlide,
          // ハンドラー関数も渡す
          handleViewModeChange,
          handleSlideNavigation,
        });
      }
    }
  }, [
    totalSlides,
    currentSlideIndex,
    viewMode,
    hasNextSlide,
    hasPrevSlide,
    onSlideInfoChange,
    handleViewModeChange,
    handleSlideNavigation,
    prevTotalSlides,
    prevCurrentSlideIndex,
    prevViewMode,
  ]);

  return {
    handleViewModeChange,
    handleSlideNavigation,
  };
}
