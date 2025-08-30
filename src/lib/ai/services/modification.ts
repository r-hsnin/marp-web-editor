import { generateObject } from "ai";
import {
  MarkdownModificationSchema,
  type MarkdownModification,
} from "../core/schemas";
import { type ToolExecutionResult } from "../core/types";
import { createModelParams, AI_CONFIG, handleAIError } from "../core/client";
import {
  createModificationSystemPrompt,
  createModificationUserPrompt,
} from "../prompts";

/**
 * スライドを修正する
 */
export async function modifySlide(
  targetContent: string,
  instructions?: string
): Promise<ToolExecutionResult<MarkdownModification>> {
  const startTime = Date.now();

  try {
    console.log("🔧 スライド修正開始:", {
      contentLength: targetContent.length,
      hasInstructions: !!instructions,
    });

    const modelParams = createModelParams(AI_CONFIG.models.structured);

    const result = await generateObject({
      ...modelParams,
      schema: MarkdownModificationSchema,
      system: createModificationSystemPrompt(),
      prompt: createModificationUserPrompt(targetContent, instructions),
    });

    const executionTime = Date.now() - startTime;

    console.log("✅ スライド修正完了:", {
      success: result.object.success,
      changesCount: result.object.changes?.length || 0,
      executionTime: `${executionTime}ms`,
    });

    return {
      success: true,
      data: result.object,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("❌ スライド修正エラー:", error);

    const aiError = handleAIError(error);
    return {
      success: false,
      error: aiError.message,
      data: {
        success: false,
        markdown: targetContent,
        changes: [],
        reason: "AI処理中にエラーが発生しました",
      },
      executionTime,
    };
  }
}
