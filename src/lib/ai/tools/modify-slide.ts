import { tool } from "ai";
import { z } from "zod";
import { modifySlide } from "../services/modification";

/**
 * 現在のMarkdownを注入してmodifySlideツールを作成
 */
export function createModifySlideToolWithContext(currentMarkdown: string) {
  return tool({
    description: `スライドの内容を修正・改善する。
    - 読みやすさの向上
    - 構造の改善
    - 内容の簡潔化
    - 視覚的効果の追加`,
    inputSchema: z.object({
      instructions: z.string().optional().describe("修正・改善の具体的な指示"),
    }),
    execute: async ({ instructions }) => {
      console.log("🔧 modifySlide Tool実行開始:", {
        instructions,
      });

      try {
        const result = await modifySlide(currentMarkdown, instructions);

        if (result.success) {
          console.log("✅ modifySlide Tool実行完了:", {
            success: result.data.success,
            changesCount: result.data.changes?.length || 0,
            executionTime: result.executionTime,
          });

          return {
            success: result.data.success,
            modifiedContent: result.data.markdown || currentMarkdown,
            changes: result.data.changes || [],
            reason: result.data.reason,
            executionTime: result.executionTime,
          };
        } else {
          console.error("❌ modifySlide Tool処理失敗:", result.error);
          return {
            success: false,
            error: result.error || "スライド修正に失敗しました",
            originalContent: currentMarkdown,
            modifiedContent: currentMarkdown,
            changes: [],
            reason: result.data.reason || "処理に失敗しました",
          };
        }
      } catch (error) {
        console.error("❌ modifySlide Tool実行エラー:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "スライド修正中にエラーが発生しました",
          originalContent: currentMarkdown,
          modifiedContent: currentMarkdown,
          changes: [],
          reason: "予期しないエラーが発生しました",
        };
      }
    },
  });
}
