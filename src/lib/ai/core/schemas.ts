import { z } from "zod";

// ===================================================================
// 共通スキーマ定義
// ===================================================================

/**
 * Markdown修正結果のスキーマ (GPT-5-mini最適化)
 */
export const MarkdownModificationSchema = z.object({
  success: z.boolean().describe("修正の成功/失敗"),
  markdown: z
    .string()
    .nullable()
    .describe("改善されたMarkdown全文（成功時のみ）"),
  changes: z.array(z.string()).default([]).describe("具体的な変更点"),
  reason: z.string().describe("改善理由または失敗理由"),
});

/**
 * スライド分析結果のスキーマ (GPT-5-mini最適化)
 */
export const SlideAnalysisSchema = z.object({
  success: z.boolean().describe("分析の成功/失敗"),
  slideCount: z.number().describe("スライド数"),
  wordCount: z.number().describe("総文字数"),
  structure: z
    .object({
      hasTitle: z.boolean().describe("タイトルスライドの有無"),
      hasImages: z.boolean().describe("画像の有無"),
      hasBulletPoints: z.boolean().describe("箇条書きの有無"),
    })
    .describe("構造分析"),
  suggestions: z.array(z.string()).default([]).describe("改善提案"),
  reason: z.string().describe("分析理由または失敗理由"),
});

// ===================================================================
// 型定義（スキーマから推論）
// ===================================================================

export type MarkdownModification = z.infer<typeof MarkdownModificationSchema>;
export type SlideAnalysis = z.infer<typeof SlideAnalysisSchema>;
