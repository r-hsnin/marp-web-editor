import { Presentation } from 'lucide-react';
import type React from 'react';
import type { Slide } from '@/hooks/useSlides';
import { cn } from '@/lib/utils';

interface SlideViewProps {
  slide: Slide | null;
  isFullscreen: boolean;
}

export const SlideView: React.FC<SlideViewProps> = ({ slide, isFullscreen }) => {
  if (!slide) {
    return (
      <div className="flex flex-col items-center gap-3 text-muted-foreground animate-in fade-in zoom-in duration-300">
        <Presentation className="h-12 w-12 opacity-20" />
        <p>No slides to display</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div
        className={cn(
          'marp-content-isolated bg-white transition-all duration-500 ease-out transform-gpu',
          isFullscreen ? 'w-full h-full' : 'rounded-xl',
        )}
        style={{
          width: isFullscreen ? '100%' : '95%',
          maxWidth: isFullscreen ? 'none' : '1280px',
          height: isFullscreen ? '100%' : 'auto',
          aspectRatio: isFullscreen ? 'none' : '16 / 9',
          boxShadow: isFullscreen
            ? 'none'
            : '0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -10px rgba(0, 0, 0, 0.1)',
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Rendering Marp generated HTML
        dangerouslySetInnerHTML={{ __html: slide.html }}
      />
    </div>
  );
};
