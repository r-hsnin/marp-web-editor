import type { z } from "zod";
import type { MarkdownModification } from "@/lib/ai";

// ===================================================================
// AI機能の基本型定義
// ===================================================================

/**
 * AI処理の基本レスポンス型
 */
export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * ワンショット修正のリクエスト型
 */
export interface OneshotModificationRequest {
  markdown: string;
  instruction: string;
  userId?: string;
}

/**
 * ワンショット修正のレスポンス型（構造化出力対応）
 */
export interface OneshotModificationResponse extends MarkdownModification {
  // MarkdownModificationスキーマを継承
}

/**
 * エージェント型チャットのメッセージ型
 */
export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

/**
 * Tool呼び出し情報
 */
export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "success" | "error";
  error?: string;
}

/**
 * エージェント実行状態
 */
export interface AgentExecutionState {
  isRunning: boolean;
  currentStep: number;
  maxSteps: number;
  messages: AgentMessage[];
  lastToolCall?: ToolCall;
}

/**
 * スライド修正パラメータ
 */
export interface SlideModificationParams {
  slideIndex?: number;
  targetAudience?: string;
  instructions?: string;
}

/**
 * Tool実行結果（modifySlide用）
 */
export interface ModifySlideResult {
  success: boolean;
  modifiedContent?: string;
  slideIndex?: number;
  changes: string[];
  reason: string;
  executionTime?: number;
  error?: string;
  originalContent?: string;
}

/**
 * Tool実行結果（analyzeSlide用）
 */
export interface AnalyzeSlideResult {
  success: boolean;
  analysis?: {
    slideCount: number;
    wordCount: number;
    structure: {
      hasTitle: boolean;
      hasImages: boolean;
      hasBulletPoints: boolean;
      hasTheme: boolean;
    };
    suggestions: string[];
  };
  recommendations: string[];
  reason: string;
  executionTime?: number;
  error?: string;
}

// ===================================================================
// 共通型定義の再エクスポート
// ===================================================================

export type { MarkdownModification } from "@/lib/ai";

// ===================================================================
// Zodスキーマ型の推論
// ===================================================================

/**
 * Zodスキーマから型を推論するヘルパー型
 */
export type InferZodSchema<T extends z.ZodType> = z.infer<T>;

// ===================================================================
// エラー型定義
// ===================================================================

/**
 * AI処理エラーの種類
 */
export type AIErrorType =
  | "validation_error"
  | "api_error"
  | "timeout_error"
  | "rate_limit_error"
  | "tool_execution_error"
  | "agent_loop_error"
  | "structured_output_error"
  | "unknown_error";

/**
 * AI処理エラー
 */
export interface AIError {
  type: AIErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ===================================================================
// 設定型定義
// ===================================================================

/**
 * AI機能の設定
 */
export interface AIConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  maxRetries?: number;
}

/**
 * エージェント設定
 */
export interface AgentConfig extends AIConfig {
  maxSteps: number;
  stopConditions?: string[];
  toolTimeout?: number;
}
