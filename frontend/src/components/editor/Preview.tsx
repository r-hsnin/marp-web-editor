import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useMediaQuery } from 'usehooks-ts';
import { MarpIsolatedStyle } from '@/components/editor/MarpIsolatedStyle';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { useMarp } from '@/hooks/useMarp';
import { useSlides } from '@/hooks/useSlides';
import { FrontmatterProcessor } from '@/lib/marp/frontmatterProcessor';
import { useEditorStore } from '@/lib/store';
import { PreviewToolbar } from './PreviewToolbar';
import { SlideList } from './SlideList';
import { SlideView } from './SlideView';

export const Preview: React.FC = () => {
  const { markdown, setMarkdown } = useEditorStore();
  const { html, css } = useMarp(markdown);
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
  } = useSlides(html);
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'list' | 'slide'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextSlide(),
    onSwipedRight: () => goToPrevSlide(),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  // Parse current settings from markdown
  const currentSettings = React.useMemo(() => {
    return FrontmatterProcessor.parseSettings(markdown);
  }, [markdown]);

  const handlePaginateToggle = () => {
    const newPaginate = !currentSettings.paginate;
    const newMarkdown = FrontmatterProcessor.updateFrontmatter(markdown, { paginate: newPaginate });
    setMarkdown(newMarkdown);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focus is on an input element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.cm-editor')
      ) {
        return;
      }

      // Only handle navigation if we are in slide view or fullscreen
      if (viewMode === 'slide' || isFullscreen) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          goToNextSlide();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToPrevSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isFullscreen, goToNextSlide, goToPrevSlide]);

  return (
    <div className="flex flex-col h-full w-full bg-background relative group overflow-hidden">
      <PreviewToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        onPrevSlide={goToPrevSlide}
        onNextSlide={goToNextSlide}
        hasPrevSlide={hasPrevSlide}
        hasNextSlide={hasNextSlide}
        paginate={currentSettings.paginate || false}
        onPaginateToggle={handlePaginateToggle}
      />

      <div
        ref={containerRef}
        {...(isMobile && viewMode === 'slide' ? swipeHandlers : {})}
        className={clsx(
          'flex-1 overflow-y-auto transition-colors duration-300 relative scroll-smooth',
          resolvedTheme === 'dark' ? 'bg-zinc-950/30' : 'bg-slate-50/50',
          isFullscreen && 'p-0 bg-black',
        )}
      >
        <MarpIsolatedStyle css={css} />

        {viewMode === 'list' ? (
          <SlideList
            slides={slides}
            onSlideClick={(index) => {
              goToSlide(index);
              setViewMode('slide');
            }}
          />
        ) : (
          <SlideView slide={currentSlide} isFullscreen={isFullscreen} />
        )}

        {/* Floating Navigation Controls (Only in Fullscreen) */}
        {isFullscreen && viewMode === 'slide' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevSlide}
              disabled={!hasPrevSlide}
              className="rounded-full hover:bg-white/20 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <span className="text-sm font-medium tabular-nums tracking-wider text-white/90">
              {currentSlideIndex + 1} <span className="opacity-40 mx-2">/</span> {totalSlides}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextSlide}
              disabled={!hasNextSlide}
              className="rounded-full hover:bg-white/20 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
