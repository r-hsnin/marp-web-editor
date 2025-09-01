import type { UIMessage } from "ai";
import { useCallback } from "react";

const STORAGE_KEY = "marp-chat-history";
const MAX_MESSAGES = 50; // 最新50件のみ保持

/**
 * チャット履歴管理
 */
export function useChatHistory() {
  const load = useCallback((): UIMessage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load chat history:", error);
      return [];
    }
  }, []);

  const save = useCallback((messages: UIMessage[]) => {
    try {
      // 最新50件のみ保持
      const trimmed = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn("Failed to save chat history:", error);
    }
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear chat history:", error);
    }
  }, []);

  return { load, save, clear };
}
