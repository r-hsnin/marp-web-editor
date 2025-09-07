// ===================================================================
// 公開API
// ===================================================================

// サービス
export { modifySlide } from "./services/modification";
export { processChat } from "./services/chat";

// 新ツールセット
export { createToolsWithContext } from "./tools/create-tools";

// 型定義
export type { MarkdownModification, SlideAnalysis } from "./core/schemas";
export type { ToolExecutionResult, AIError } from "./core/types";
