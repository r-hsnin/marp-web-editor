// Preview-specific types
export type ViewMode = "single" | "overview";
export type NavigationAction = "prev" | "next" | "goto";

export interface SlideInfo {
  totalSlides: number;
  currentSlideIndex: number;
  viewMode: ViewMode;
  hasNextSlide: boolean;
  hasPrevSlide: boolean;
  handleViewModeChange: ((mode: ViewMode) => void) | null;
  handleSlideNavigation:
    | ((action: NavigationAction, index?: number | null) => void)
    | null;
}

export interface PreviewHeaderProps {
  slideInfo: SlideInfo;
  selectedTheme: string;
  isDark: boolean;
}
