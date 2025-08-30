import { generateObject } from "ai";
import { SlideAnalysisSchema, type SlideAnalysis } from "../core/schemas";
import { type ToolExecutionResult } from "../core/types";
import { createModelParams, AI_CONFIG, handleAIError } from "../core/client";
import {
  createAnalysisSystemPrompt,
  createAnalysisUserPrompt,
} from "../prompts";

/**
 * スライドを分析する
 */
export async function analyzeSlide(
  content: string
): Promise<ToolExecutionResult<SlideAnalysis>> {
  const startTime = Date.now();

  try {
    console.log("🔍 スライド分析開始:", {
      contentLength: content.length,
    });

    const modelParams = createModelParams(AI_CONFIG.models.structured);

    const result = await generateObject({
      ...modelParams,
      schema: SlideAnalysisSchema,
      system: createAnalysisSystemPrompt(),
      prompt: createAnalysisUserPrompt(content),
    });

    const executionTime = Date.now() - startTime;

    console.log("✅ スライド分析完了:", {
      success: result.object.success,
      suggestionsCount: result.object.suggestions?.length || 0,
      executionTime: `${executionTime}ms`,
    });

    return {
      success: true,
      data: result.object,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("❌ スライド分析エラー:", error);

    const aiError = handleAIError(error);
    return {
      success: false,
      error: aiError.message,
      data: {
        slideCount: 0,
        wordCount: 0,
        structure: {
          hasTitle: false,
          hasImages: false,
          hasBulletPoints: false,
          hasTheme: false,
        },
        suggestions: [],
        success: false,
        reason: "AI処理中にエラーが発生しました",
      },
      executionTime,
    };
  }
}

/**
 * スライド数をカウント
 */
export function countSlides(markdown: string): number {
  return (markdown.match(/^---$/gm) || []).length + 1;
}

/**
 * 文字数をカウント（空白除く）
 */
export function countWords(markdown: string): number {
  return markdown.replace(/\s+/g, "").length;
}

/**
 * 基本的なスライド構造を分析
 */
export function analyzeBasicStructure(markdown: string) {
  return {
    hasTitle: /^#\s+/.test(markdown),
    hasImages: /!\[.*?\]\(.*?\)/.test(markdown),
    hasBulletPoints: /^[\s]*[-*+]\s+/m.test(markdown),
    hasTheme: /^theme:\s*\w+/m.test(markdown),
  };
}
