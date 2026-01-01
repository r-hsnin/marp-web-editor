import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '../lib/logger';

export interface Slide {
  id: number;
  html: string;
  sectionHtml: string;
  textContent: string;
  title: string;
  theme: string;
}

export interface SlidesNavigation {
  slides: Slide[];
  currentSlide: Slide | null;
  currentSlideIndex: number;
  totalSlides: number;
  hasNextSlide: boolean;
  hasPrevSlide: boolean;
  goToSlide: (index: number) => void;
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  goToFirstSlide: () => void;
  goToLastSlide: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
}

export const useSlides = (html: string): SlidesNavigation => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = useMemo((): Slide[] => {
    if (!html) return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Marp renders slides as SVG inside a .marpit container or just as SVGs
      // We need to handle both cases, but typically Marp Core output (html: true)
      // produces a structure where each slide is an <svg> element.

      // Try to find the container first
      const marpitContainer = doc.querySelector('.marpit');
      let svgElements: NodeListOf<SVGElement>;

      if (marpitContainer) {
        svgElements = marpitContainer.querySelectorAll('svg[data-marpit-svg]');
      } else {
        // Fallback: look for SVGs directly in body if no container
        svgElements = doc.querySelectorAll('svg[data-marpit-svg]');
      }

      if (svgElements.length === 0) {
        // If no SVGs found, it might be a simple HTML output (not slide mode)
        // But for Marp slide preview, we expect SVGs.
        return [];
      }

      return Array.from(svgElements).map((svg, index): Slide => {
        // Create a container for each slide to maintain Marp structure
        const slideContainer = document.createElement('div');
        slideContainer.className = 'marpit';

        const clonedSvg = svg.cloneNode(true) as SVGElement;
        slideContainer.appendChild(clonedSvg);

        // Extract metadata from section
        const section = svg.querySelector('section');
        const textContent = section?.textContent?.trim() || '';
        const title =
          section?.querySelector('h1, h2, h3')?.textContent?.trim() || `Slide ${index + 1}`;
        const theme = section?.getAttribute('data-theme') || 'default';

        return {
          id: index,
          html: slideContainer.outerHTML,
          sectionHtml: section?.outerHTML || '',
          textContent,
          title,
          theme,
        };
      });
    } catch (error) {
      logger.warn('Failed to parse slides:', error);
      return [];
    }
  }, [html]);

  // Range check
  useEffect(() => {
    if (slides.length > 0 && currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  const goToSlide = useCallback(
    (index: number): void => {
      if (index >= 0 && index < slides.length) {
        setCurrentSlideIndex(index);
      }
    },
    [slides.length],
  );

  const goToNextSlide = useCallback((): void => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const goToPrevSlide = useCallback((): void => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToFirstSlide = useCallback((): void => {
    setCurrentSlideIndex(0);
  }, []);

  const goToLastSlide = useCallback((): void => {
    setCurrentSlideIndex(slides.length - 1);
  }, [slides.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          goToNextSlide();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevSlide();
          break;
        case 'Home':
          event.preventDefault();
          goToFirstSlide();
          break;
        case 'End':
          event.preventDefault();
          goToLastSlide();
          break;
      }
    },
    [goToNextSlide, goToPrevSlide, goToFirstSlide, goToLastSlide],
  );

  const currentSlide = slides[currentSlideIndex] || null;
  const hasNextSlide = currentSlideIndex < slides.length - 1;
  const hasPrevSlide = currentSlideIndex > 0;
  const totalSlides = slides.length;

  return {
    slides,
    currentSlide,
    currentSlideIndex,
    totalSlides,
    hasNextSlide,
    hasPrevSlide,
    goToSlide,
    goToNextSlide,
    goToPrevSlide,
    goToFirstSlide,
    goToLastSlide,
    handleKeyDown,
  };
};
