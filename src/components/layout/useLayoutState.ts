/**
 * レイアウト状態管理フック
 */

import React from "react";
import { SlideInfo, SlideInfoChangeHandler, LayoutState } from "./layoutTypes";

// 初期スライド情報
const INITIAL_SLIDE_INFO: SlideInfo = {
  totalSlides: 0,
  currentSlideIndex: 0,
  viewMode: "single",
  hasNextSlide: false,
  hasPrevSlide: false,
  handleViewModeChange: null,
  handleSlideNavigation: null,
};

export const useLayoutState = (): LayoutState => {
  // スライド情報を状態で管理
  const [slideInfo, setSlideInfo] =
    React.useState<SlideInfo>(INITIAL_SLIDE_INFO);

  // MarpPreviewからのスライド情報更新コールバック
  const handleSlideInfoChange = React.useCallback<SlideInfoChangeHandler>(
    (info) => {
      setSlideInfo(info);
    },
    []
  );

  return {
    slideInfo,
    handleSlideInfoChange,
  };
};
