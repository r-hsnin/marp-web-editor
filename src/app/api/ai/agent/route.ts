import { NextRequest } from "next/server";
import { processChat } from "@/lib/ai";
import { agentRateLimit, getClientIP, checkRateLimit } from "@/lib/ratelimit";

// ===================================================================
// APIハンドラー
// ===================================================================

export async function POST(request: NextRequest) {
  try {
    // レート制限チェック
    const clientIP = getClientIP(request);
    const rateLimitResult = await checkRateLimit(agentRateLimit, clientIP);
    
    if (!rateLimitResult.success) {
      return new Response("API利用制限に達しました。1分後に再試行してください。", {
        status: 429,
      });
    }

    // リクエストボディの解析（最小限の検証）
    const body = await request.json();
    const { messages, currentMarkdown } = body;

    // 基本的な検証のみ
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // OpenAI API Keyの確認
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("OpenAI API Keyが設定されていません", {
        status: 500,
      });
    }

    // ログ出力（開発環境のみ）
    if (process.env.NODE_ENV === "development") {
      console.log("AI Agent Chat:", {
        messagesCount: messages.length,
        markdownLength: currentMarkdown?.length || 0,
        rateLimitRemaining: rateLimitResult.remaining,
      });
    }

    // エージェント処理を実行
    const result = await processChat(messages, currentMarkdown || "");

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI Agent Chat Error:", error);
    return new Response("エージェント処理中にエラーが発生しました", {
      status: 500,
    });
  }
}

// GET メソッドでのヘルスチェック
export async function GET() {
  return new Response(
    JSON.stringify({
      service: "AI Agent Chat",
      status: "healthy",
      tools: ["modifySlide", "analyzeSlide"],
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
