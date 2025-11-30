import type { Slide } from '@/hooks/useSlides';
import type React from 'react';

interface SlideListProps {
  slides: Slide[];
  onSlideClick: (index: number) => void;
}

export const SlideList: React.FC<SlideListProps> = ({ slides, onSlideClick }) => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {slides.map((slide, index) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable enough for this list
            key={index}
            type="button"
            className="group/slide relative flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer w-full text-left"
            onClick={() => onSlideClick(index)}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-sm border border-border/40 bg-white transition-all duration-300 group-hover/slide:shadow-xl group-hover/slide:border-primary/20 group-hover/slide:ring-2 group-hover/slide:ring-primary/20">
              <div
                className="marp-content-isolated w-full h-full origin-top-left transform-gpu"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Rendering Marp generated HTML
                dangerouslySetInnerHTML={{ __html: slide.html }}
              />
              <div className="absolute inset-0 bg-transparent transition-colors group-hover/slide:bg-black/[0.02]" />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-muted-foreground group-hover/slide:text-primary transition-colors">
                Slide {index + 1}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
