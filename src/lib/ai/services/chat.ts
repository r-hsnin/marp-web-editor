import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { aiClient, AI_CONFIG } from "../core/client";
import { createAgentSystemPrompt } from "../prompts";
import {
  createModifySlideToolWithContext,
  createAnalyzeSlideToolWithContext,
} from "../tools";

/**
 * エージェント型チャット処理を実行
 */
export async function processChat(
  messages: UIMessage[],
  currentMarkdown: string
) {
  // UIMessagesをModelMessagesに変換
  const modelMessages = convertToModelMessages(messages);

  // システムメッセージを追加
  const systemMessage = {
    role: "system" as const,
    content: createAgentSystemPrompt(currentMarkdown),
  };

  // 現在のMarkdownを注入してツールを作成
  const modifySlideTool = createModifySlideToolWithContext(currentMarkdown);
  const analyzeSlideTool = createAnalyzeSlideToolWithContext(currentMarkdown);

  // streamText実行
  const result = streamText({
    model: aiClient(AI_CONFIG.models.chat),
    messages: [systemMessage, ...modelMessages],
    tools: {
      modifySlide: modifySlideTool,
      analyzeSlide: analyzeSlideTool,
    },
    stopWhen: stepCountIs(5),
    maxRetries: AI_CONFIG.maxRetries,
    temperature: AI_CONFIG.temperature.chat,
  });

  return result;
}
