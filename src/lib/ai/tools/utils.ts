/**
 * ツール共通ユーティリティ関数
 */

/**
 * スライドを分割
 */
export function splitSlides(markdown: string): string[] {
  return markdown.split(/^---$/m);
}

/**
 * スライドを結合
 */
export function joinSlides(slides: string[]): string {
  return slides
    .map((slide) => slide.replace(/^\n+/, "").replace(/\n+$/, ""))
    .filter((slide) => slide.trim().length > 0)
    .join("\n\n---\n\n");
}

/**
 * スライド番号を検証
 */
export function validateSlideNumber(
  totalSlides: number,
  slideNumber: number
): void {
  if (slideNumber < 1 || slideNumber > totalSlides) {
    throw createSlideNotFoundError(slideNumber, totalSlides);
  }
}

/**
 * スライドが見つからないエラーを生成
 */
export function createSlideNotFoundError(
  slideNumber: number,
  totalSlides: number
): Error {
  return new Error(
    `Slide ${slideNumber} not found. Total slides: ${totalSlides}`
  );
}

/**
 * スライド数をカウント
 */
export function countSlides(markdown: string): number {
  const slides = splitSlides(markdown);
  return slides.length;
}

/**
 * 特定スライドを抽出
 */
export function extractSlide(markdown: string, slideNumber: number): string {
  const slides = splitSlides(markdown);
  validateSlideNumber(slides.length, slideNumber);
  return slides[slideNumber - 1]?.trim() || "";
}

/**
 * スライド範囲を抽出
 */
export function extractSlideRange(
  markdown: string,
  startSlide: number,
  endSlide: number
): string {
  const slides = splitSlides(markdown);

  if (startSlide < 1 || endSlide > slides.length || startSlide > endSlide) {
    throw new Error(
      `Invalid range: ${startSlide}-${endSlide}. Total slides: ${slides.length}`
    );
  }

  const selectedSlides = slides.slice(startSlide - 1, endSlide);
  return joinSlides(selectedSlides);
}
