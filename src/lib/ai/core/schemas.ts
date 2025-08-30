import { z } from "zod";

// ===================================================================
// 共通スキーマ定義
// ===================================================================

/**
 * Markdown修正結果のスキーマ
 */
export const MarkdownModificationSchema = z.object({
  markdown: z
    .string()
    .optional()
    .describe(
      "元の内容をベースに指示に従って改善した完全なMarkdown内容。元の情報量と構造を維持し、フロントマターは含めず純粋なMarkdown部分のみを全文出力すること。部分的な出力や要約は禁止。（成功時のみ必須）"
    ),
  changes: z
    .array(z.string())
    .default([])
    .describe("具体的な変更点の説明。どの部分をどのように改善したかを明記"),
  success: z.boolean().describe("修正の成功/失敗"),
  reason: z
    .string()
    .describe(
      "改善の理由と方針。元の内容をどのような観点で改善したかを説明、または失敗理由"
    ),
});

/**
 * スライド分析結果のスキーマ
 */
export const SlideAnalysisSchema = z.object({
  slideCount: z.number().describe("スライド数"),
  wordCount: z.number().describe("総文字数"),
  structure: z
    .object({
      hasTitle: z.boolean().describe("タイトルスライドの有無"),
      hasImages: z.boolean().describe("画像の有無"),
      hasBulletPoints: z.boolean().describe("箇条書きの有無"),
      hasTheme: z.boolean().describe("テーマ設定の有無"),
    })
    .describe("構造分析"),
  suggestions: z.array(z.string()).describe("改善提案"),
  success: z.boolean().describe("分析の成功/失敗"),
  reason: z.string().describe("分析理由または失敗理由"),
});

// ===================================================================
// 型定義（スキーマから推論）
// ===================================================================

export type MarkdownModification = z.infer<typeof MarkdownModificationSchema>;
export type SlideAnalysis = z.infer<typeof SlideAnalysisSchema>;
