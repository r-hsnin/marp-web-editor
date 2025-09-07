import { createOpenAI } from "@ai-sdk/openai";
import type { AIError } from "./types";

/**
 * OpenAIクライアント
 */
const openai = createOpenAI();

/**
 * AI SDK共通設定
 */
export const AI_CONFIG = {
  models: {
    chat: "gpt-4.1",
    structured: "gpt-5-mini",
  },
  temperature: {
    chat: 0.2,
  },
  maxRetries: 2,
} as const;

/**
 * モデルに応じた最適なパラメータを生成
 */
export function createModelParams(modelName: string) {
  if (modelName.startsWith("gpt-5")) {
    // GPT-5系: temperatureなし、reasoning_effortのみ
    return {
      model: openai(modelName),
      providerOptions: {
        openai: {
          reasoning_effort: "minimal" as const,
        },
      },
    };
  }

  // GPT-4系: temperature対応
  return {
    model: openai(modelName),
    temperature: AI_CONFIG.temperature.chat,
  };
}

/**
 * OpenAIクライアント（エクスポート用）
 */
export const aiClient = openai;

/**
 * AI処理エラーを統一的に処理
 */
export function handleAIError(error: unknown): AIError {
  if (error instanceof Error) {
    // レート制限エラー
    if (error.message.includes("rate limit")) {
      return {
        message:
          "API利用制限に達しました。しばらく待ってから再試行してください。",
        type: "rate_limit",
        retryable: true,
      };
    }

    // タイムアウトエラー
    if (error.message.includes("timeout")) {
      return {
        message: "処理がタイムアウトしました。再試行してください。",
        type: "timeout",
        retryable: true,
      };
    }

    // 認証エラー
    if (error.message.includes("API key") || error.message.includes("401")) {
      return {
        message: "API認証エラーが発生しました。設定を確認してください。",
        type: "auth",
        retryable: false,
      };
    }

    // クォータエラー
    if (error.message.includes("quota") || error.message.includes("billing")) {
      return {
        message:
          "API利用制限またはクレジット不足です。アカウントを確認してください。",
        type: "quota",
        retryable: false,
      };
    }

    return {
      message: `AI処理エラー: ${error.message}`,
      type: "unknown",
      retryable: true,
    };
  }

  return {
    message: "予期しないエラーが発生しました。再試行してください。",
    type: "unknown",
    retryable: true,
  };
}
