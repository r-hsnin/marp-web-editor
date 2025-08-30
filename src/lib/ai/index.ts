// ===================================================================
// 公開API
// ===================================================================

// サービス
export { modifySlide } from "./services/modification";
export {
  analyzeSlide,
  countSlides,
  countWords,
  analyzeBasicStructure,
} from "./services/analysis";
export { processChat } from "./services/chat";

// 型定義
export type { MarkdownModification, SlideAnalysis } from "./core/schemas";
export type { ToolExecutionResult, AIError } from "./core/types";

// スキーマ（必要に応じて）
export {
  MarkdownModificationSchema,
  SlideAnalysisSchema,
} from "./core/schemas";
