import { tool } from "ai";
import { z } from "zod";
import { countSlides, splitSlides } from "./utils";

/**
 * スライド構造分析ツール
 */
export function createAnalyzeStructureTool(getCurrentMarkdown: () => string) {
  return tool({
    description:
      "Analyze slide structure and get comprehensive metrics including slide count, word counts per slide, heading hierarchy, slide types, and content features for quality assessment and optimization recommendations",
    inputSchema: z.object({}),
    execute: async () => {
      const markdown = getCurrentMarkdown();

      return {
        slideCount: countSlides(markdown),
        wordCounts: getWordCountsPerSlide(markdown),
        headingStructure: parseHeadingHierarchy(markdown),
        slideTypes: identifySlideTypes(markdown),
        totalWords: getTotalWordCount(markdown),
        averageWordsPerSlide: getAverageWordsPerSlide(markdown),
        hasImages: checkForImages(markdown),
        hasCodeBlocks: checkForCodeBlocks(markdown),
        hasTables: checkForTables(markdown),
      };
    },
  });
}

/**
 * スライドごとの単語数を取得
 */
function getWordCountsPerSlide(markdown: string): number[] {
  const slides = splitSlides(markdown);
  return slides.map((slide) => {
    const cleanText = slide
      .replace(/^---$/gm, "")
      .replace(/^#+\s/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^\s*[-*+]\s/gm, "")
      .replace(/^\s*\d+\.\s/gm, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();

    const words = cleanText.split(/\s+/).filter((word) => word.length > 0);
    const japaneseChars =
      cleanText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || [];

    return words.length + Math.floor(japaneseChars.length / 2);
  });
}

/**
 * ヘッダー階層を解析
 */
function parseHeadingHierarchy(
  markdown: string
): Array<{ slide: number; level: number; text: string }> {
  const slides = splitSlides(markdown);
  const headings: Array<{ slide: number; level: number; text: string }> = [];

  slides.forEach((slide, index) => {
    const lines = slide.split("\n");
    lines.forEach((line) => {
      const match = line.match(/^(#+)\s+(.+)$/);
      if (match && match[1] && match[2]) {
        headings.push({
          slide: index + 1,
          level: match[1].length,
          text: match[2].trim(),
        });
      }
    });
  });

  return headings;
}

/**
 * スライドタイプを識別（全テーマ対応）
 */
function identifySlideTypes(
  markdown: string
): Array<{ slide: number; type: string; features: string[] }> {
  const slides = splitSlides(markdown);

  return slides.map((slide, index) => {
    const features: string[] = [];
    let type = "content";

    // Marpクラスの検出
    if (slide.includes("<!-- _class: cover -->")) {
      type = "cover";
      features.push("cover-slide");
    } else if (slide.includes("<!-- _class: section -->")) {
      type = "section";
      features.push("section-divider");
    } else if (slide.includes("<!-- _class: invert -->")) {
      type = "invert";
      features.push("inverted-colors");
    } else if (slide.includes("<!-- _class: lead -->")) {
      type = "lead";
      features.push("lead-slide");
    }

    // professionalテーマ特有のクラス
    if (slide.includes("<!-- _class: title -->")) {
      type = "title";
      features.push("title-slide");
    }

    // コンテンツ特徴の検出
    if (slide.includes("![")) features.push("has-images");
    if (slide.includes("```")) features.push("has-code");
    if (slide.includes("|")) features.push("has-table");
    if (slide.match(/^\s*[-*+]\s/m)) features.push("has-bullets");
    if (slide.match(/^\s*\d+\.\s/m)) features.push("has-numbered-list");
    if (slide.includes(">")) features.push("has-quotes");

    return {
      slide: index + 1,
      type,
      features,
    };
  });
}

/**
 * 総単語数を取得
 */
function getTotalWordCount(markdown: string): number {
  const wordCounts = getWordCountsPerSlide(markdown);
  return wordCounts.reduce((total, count) => total + count, 0);
}

/**
 * スライドあたりの平均単語数を取得
 */
function getAverageWordsPerSlide(markdown: string): number {
  const wordCounts = getWordCountsPerSlide(markdown);
  const total = wordCounts.reduce((sum, count) => sum + count, 0);
  return wordCounts.length > 0 ? Math.round(total / wordCounts.length) : 0;
}

/**
 * 画像の有無をチェック
 */
function checkForImages(markdown: string): boolean {
  return markdown.includes("![");
}

/**
 * コードブロックの有無をチェック
 */
function checkForCodeBlocks(markdown: string): boolean {
  return markdown.includes("```");
}

/**
 * テーブルの有無をチェック
 */
function checkForTables(markdown: string): boolean {
  return /\|.*\|/.test(markdown);
}
