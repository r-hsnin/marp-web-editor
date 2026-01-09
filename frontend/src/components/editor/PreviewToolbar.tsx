import {
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Maximize2,
  Minimize2,
  Presentation,
} from 'lucide-react';
import type React from 'react';
import { ThemeSelector } from '@/components/editor/ThemeSelector';
import { PaginationToggle } from '@/components/header/PaginationToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PreviewToolbarProps {
  viewMode: 'list' | 'slide';
  setViewMode: (mode: 'list' | 'slide') => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  currentSlideIndex: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  hasPrevSlide: boolean;
  hasNextSlide: boolean;
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
  paginate,
  onPaginateToggle,
}) => {
  return (
    <div className="flex items-center justify-between p-1 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-10 z-10 relative">
      <div className="hidden md:flex items-center gap-2 px-3">
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          Preview
        </span>
        <Separator orientation="vertical" className="h-3 bg-border/50" />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={300}>
            <ThemeSelector />
            <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />
            <PaginationToggle enabled={paginate} onToggle={onPaginateToggle} />

            <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-background hover:shadow-sm"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">List View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'slide' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-background hover:shadow-sm"
                  onClick={() => setViewMode('slide')}
                >
                  <Presentation className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Slide View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />

        <div className="flex items-center gap-1 bg-background/50 rounded-md border border-border/50 px-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevSlide}
            disabled={!hasPrevSlide || viewMode === 'list'}
            className={cn(
              'h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-opacity',
              (!hasPrevSlide || viewMode === 'list') && 'opacity-30 cursor-not-allowed',
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-medium tabular-nums min-w-[3rem] text-center text-muted-foreground">
            {currentSlideIndex + 1} / {totalSlides}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-opacity',
              (!hasNextSlide || viewMode === 'list') && 'opacity-30 cursor-not-allowed',
            )}
            onClick={onNextSlide}
            disabled={!hasNextSlide || viewMode === 'list'}
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
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-background hover:shadow-sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
