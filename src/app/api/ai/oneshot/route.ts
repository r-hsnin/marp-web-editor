import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { OneshotModificationResponse, AIResponse } from "@/types/ai";
import { modifySlide } from "@/lib/ai";
import { oneshotRateLimit, getClientIP, checkRateLimit } from "@/lib/ratelimit";

// ===================================================================
// Zodスキーマ定義
// ===================================================================

const RequestSchema = z.object({
  markdown: z.string().min(1, "Markdownコンテンツが必要です"),
  instruction: z
    .string()
    .min(1, "改善指示が必要です")
    .max(5000, "改善指示は5000文字以内で入力してください"),
  userId: z.string().optional(),
});

// ===================================================================
// ユーティリティ関数
// ===================================================================

/**
 * 統一されたJSONレスポンスを生成
 */
function toJsonResponse<T>(data: T, status = 200): NextResponse<AIResponse<T>> {
  return NextResponse.json(
    {
      success: status < 400,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * エラーレスポンスを生成
 */
function toErrorResponse(
  error: string,
  status = 500
): NextResponse<AIResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// ===================================================================
// APIハンドラー
// ===================================================================

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(oneshotRateLimit, clientIP);

    if (!rateLimitResult.success) {
      return toErrorResponse(
        "API利用制限に達しました。1分後に再試行してください。",
        429
      );
    }

    // リクエストボディの解析と検証
    const body = await request.json();
    const validatedRequest = RequestSchema.parse(body);

    const { markdown, instruction, userId } = validatedRequest;

    // OpenAI API Keyの確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API Key not found in environment variables");
      return toErrorResponse("OpenAI API Keyが設定されていません", 500);
    }

    // API Keyの形式確認（開発環境のみ）
    if (process.env.NODE_ENV === "development") {
      console.log("OpenAI API Key found:", apiKey.substring(0, 10) + "...");
    }

    // AI処理の実行（共通ユーティリティを使用）
    const result = await modifySlide(markdown, instruction);

    if (result.success) {
      // レスポンスの構築
      const response: OneshotModificationResponse = {
        markdown: result.data.success
          ? result.data.markdown || markdown
          : markdown,
        changes: result.data.changes || [],
        success: result.data.success,
        reason: result.data.reason,
      };

      // ログ出力（開発環境のみ）
      if (process.env.NODE_ENV === "development") {
        console.log("AI Oneshot Modification:", {
          userId,
          instructionLength: instruction.length,
          originalLength: markdown.length,
          modifiedLength: result.data.markdown?.length || markdown.length,
          success: result.data.success,
          changesCount: result.data.changes?.length || 0,
          executionTime: result.executionTime,
          rateLimitRemaining: rateLimitResult.remaining,
        });
      }

      return toJsonResponse(response);
    } else {
      // 処理失敗時のレスポンス
      const response: OneshotModificationResponse = {
        markdown: markdown, // 元のコンテンツを保持
        changes: [],
        success: false,
        reason: result.data.reason || "AI処理に失敗しました",
      };

      console.error("AI Oneshot Modification Failed:", {
        error: result.error,
        reason: result.data.reason,
        executionTime: result.executionTime,
      });

      return toJsonResponse(response);
    }
  } catch (error) {
    console.error("AI Oneshot Modification Error:", error);

    // Zodバリデーションエラー
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return toErrorResponse(`入力値エラー: ${errorMessage}`, 400);
    }

    // AI SDK エラー
    if (error instanceof Error) {
      console.error("AI SDK Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500),
      });

      if (
        error.message.includes("rate limit") ||
        error.message.includes("Rate limit")
      ) {
        return toErrorResponse(
          "API利用制限に達しました。しばらく待ってから再試行してください。",
          429
        );
      }
      if (
        error.message.includes("timeout") ||
        error.message.includes("Timeout")
      ) {
        return toErrorResponse(
          "処理がタイムアウトしました。再試行してください。",
          408
        );
      }
      if (
        error.message.includes("API key") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("401")
      ) {
        return toErrorResponse(
          "API認証エラーが発生しました。API Keyを確認してください。",
          401
        );
      }
      if (
        error.message.includes("quota") ||
        error.message.includes("billing")
      ) {
        return toErrorResponse(
          "API利用制限またはクレジット不足です。OpenAIアカウントを確認してください。",
          402
        );
      }

      // その他のエラーの場合、詳細なメッセージを返す（開発環境のみ）
      if (process.env.NODE_ENV === "development") {
        return toErrorResponse(`AI処理エラー: ${error.message}`, 500);
      }
    }

    return toErrorResponse(
      "AI処理中にエラーが発生しました。再試行してください。",
      500
    );
  }
}

// GET メソッドでのヘルスチェック
export async function GET() {
  return toJsonResponse({
    service: "AI Oneshot Modification",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
