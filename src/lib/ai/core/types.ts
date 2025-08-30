/**
 * Tool実行結果の共通型
 */
export interface ToolExecutionResult<T> {
  success: boolean;
  data: T;
  error?: string;
  executionTime?: number;
}

/**
 * AI処理の共通エラー型
 */
export interface AIError {
  message: string;
  type: "rate_limit" | "timeout" | "auth" | "quota" | "unknown";
  retryable: boolean;
}
