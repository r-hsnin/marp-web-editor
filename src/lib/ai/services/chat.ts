import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { aiClient, AI_CONFIG } from "../core/client";
import { createAgentSystemPrompt } from "../prompts";
import { createToolsWithContext } from "../tools/create-tools";

/**
 * エージェント型チャット処理を実行
 */
export async function processChat(
  messages: UIMessage[],
  getCurrentMarkdown: () => string,
  setMarkdown: (content: string) => void
) {
  // UIMessagesをModelMessagesに変換
  const modelMessages = convertToModelMessages(messages);

  // システムメッセージを追加
  // システムメッセージを作成
  const systemMessage = {
    role: "system" as const,
    content: await createAgentSystemPrompt(),
  };

  // 新しいツールセットを作成
  const tools = createToolsWithContext(getCurrentMarkdown, setMarkdown);

  // streamText実行
  const result = streamText({
    model: aiClient(AI_CONFIG.models.chat),
    messages: [systemMessage, ...modelMessages],
    tools,
    stopWhen: stepCountIs(5),
    maxRetries: AI_CONFIG.maxRetries,
    temperature: AI_CONFIG.temperature.chat,
  });

  return result;
}
