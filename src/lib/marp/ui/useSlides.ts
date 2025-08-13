"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";

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
  css: string;
}

/**
 * HTMLからスライドを抽出してナビゲーション機能を提供
 * MarpのHTML出力を個別スライドに分割し、キーボードナビゲーションを提供
 */
export const useSlides = (html: string, css: string): SlidesNavigation => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = useMemo((): Slide[] => {
    if (!html) return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const marpitContainer = doc.querySelector(".marpit");
      if (!marpitContainer) {
        logger.warn(
          LOG_CATEGORIES.RENDER,
          "Marpit container not found in HTML"
        );
        return [];
      }

      // 各svg要素（各スライド）を抽出
      const svgElements = marpitContainer.querySelectorAll(
        "svg[data-marpit-svg]"
      );

      return Array.from(svgElements).map((svg, index): Slide => {
        // 各スライド用の完全なMarpit構造を生成
        const slideContainer = document.createElement("div");
        slideContainer.className = "marpit";

        const clonedSvg = svg.cloneNode(true) as SVGElement;
        slideContainer.appendChild(clonedSvg);

        // section要素からメタデータを取得
        const section = svg.querySelector("section");
        const textContent = section?.textContent?.trim() || "";
        const title =
          section?.querySelector("h1, h2, h3")?.textContent?.trim() ||
          `スライド ${index + 1}`;
        const theme = section?.getAttribute("data-theme") || "default";

        return {
          id: index,
          html: slideContainer.outerHTML,
          sectionHtml: section?.outerHTML || "",
          textContent,
          title,
          theme,
        };
      });
    } catch (error) {
      logger.error(LOG_CATEGORIES.RENDER, "Failed to parse slides from HTML", {
        error,
      });
      return [];
    }
  }, [html]);

  // スライドインデックスの範囲チェック
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
    [slides.length]
  );

  const goToNextSlide = useCallback((): void => {
    setCurrentSlideIndex((prev) =>
      prev < slides.length - 1 ? prev + 1 : prev
    );
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
        case "ArrowRight":
        case " ": // スペースキー
          event.preventDefault();
          goToNextSlide();
          break;
        case "ArrowLeft":
          event.preventDefault();
          goToPrevSlide();
          break;
        case "Home":
          event.preventDefault();
          goToFirstSlide();
          break;
        case "End":
          event.preventDefault();
          goToLastSlide();
          break;
      }
    },
    [goToNextSlide, goToPrevSlide, goToFirstSlide, goToLastSlide]
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
    css,
  };
};
