import { tool } from "ai";
import { z } from "zod";
import { analyzeSlide } from "../services/analysis";

/**
 * 現在のMarkdownでanalyzeSlideツールを作成
 */
export function createAnalyzeSlideToolWithContext(currentMarkdown: string) {
  return tool({
    description: `現在のスライドの内容を分析し、改善提案を提供する。
    - 構造の分析
    - 読みやすさの評価
    - 改善点の特定
    - 具体的な提案`,
    inputSchema: z.object({}),
    execute: async () => {
      console.log("🔍 analyzeSlide Tool実行開始:", {
        contentLength: currentMarkdown.length,
      });

      try {
        const result = await analyzeSlide(currentMarkdown);

        if (result.success) {
          console.log("✅ analyzeSlide Tool実行完了:", {
            success: result.data.success,
            suggestionsCount: result.data.suggestions?.length || 0,
            executionTime: result.executionTime,
          });

          return {
            success: result.data.success,
            analysis: {
              slideCount: result.data.slideCount,
              wordCount: result.data.wordCount,
              structure: result.data.structure,
              suggestions: result.data.suggestions,
            },
            recommendations: result.data.suggestions,
            reason: result.data.reason,
            executionTime: result.executionTime,
          };
        } else {
          console.error("❌ analyzeSlide Tool処理失敗:", result.error);
          return {
            success: false,
            error: result.error || "スライド分析に失敗しました",
            reason: result.data.reason || "処理に失敗しました",
          };
        }
      } catch (error) {
        console.error("❌ analyzeSlide Tool実行エラー:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "スライド分析中にエラーが発生しました",
          reason: "予期しないエラーが発生しました",
        };
      }
    },
  });
}
