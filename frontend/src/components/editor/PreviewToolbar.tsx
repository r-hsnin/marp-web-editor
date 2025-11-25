import React from "react";
import {
  LayoutList,
  Presentation,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { ThemeSelector } from "@/components/header/ThemeSelector";
import { PaginationToggle } from "@/components/header/PaginationToggle";

interface PreviewToolbarProps {
  viewMode: "list" | "slide";
  setViewMode: (mode: "list" | "slide") => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  currentSlideIndex: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  hasPrevSlide: boolean;
  hasNextSlide: boolean;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  paginate: boolean;
  onPaginateToggle: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  viewMode,
  setViewMode,
  isFullscreen,
  toggleFullscreen,
  currentSlideIndex,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  hasPrevSlide,
  hasNextSlide,
  currentTheme,
  onThemeChange,
  paginate,
  onPaginateToggle,
}) => {
  return (
    <div className="flex items-center justify-between p-1 border-b border-border bg-muted/20 h-10">
      <div className="flex items-center gap-2 px-2">
        <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Preview</span>
        <Separator orientation="vertical" className="h-4 bg-border/50" />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />

            <PaginationToggle
              enabled={paginate}
              onToggle={onPaginateToggle}
            />

            <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "slide" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("slide")}
                >
                  <Presentation className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Slide View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />

        <div className="flex items-center gap-1 bg-background/50 rounded-md border border-border/50 px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevSlide}
            disabled={!hasPrevSlide || viewMode === "list"}
            className={cn(
              "h-6 w-6 transition-opacity",
              (!hasPrevSlide || viewMode === "list") && "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium tabular-nums min-w-[3rem] text-center">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 transition-opacity",
              (!hasNextSlide || viewMode === "list") && "opacity-30 cursor-not-allowed"
            )}
            onClick={onNextSlide}
            disabled={!hasNextSlide || viewMode === "list"}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
