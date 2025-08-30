"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/lib/ui/useToast";

interface ToolResult {
  success: boolean;
  modifiedContent?: string;
  changes?: string[];
  error?: string;
  recommendations?: string[];
}

interface AgentChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
}

export function AgentChatDialog({
  open,
  onOpenChange,
  currentMarkdown,
  onMarkdownChange,
}: AgentChatDialogProps) {
  const { showSuccess, showError } = useToast();
  const [processedToolResults, setProcessedToolResults] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 最新のcurrentMarkdownを参照するためのref
  const currentMarkdownRef = useRef(currentMarkdown);
  currentMarkdownRef.current = currentMarkdown;

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/agent",
      prepareSendMessagesRequest: ({ id, messages }) => {
        return {
          body: {
            id,
            messages,
            currentMarkdown: currentMarkdownRef.current,
          },
        };
      },
    }),
    onError: (error: Error) => {
      console.error("Agent chat error:", error);
      showError("エージェント処理中にエラーが発生しました");
    },
  });

  const prevStatusRef = useRef<string>("ready");

  // ローディング表示判定
  const shouldShowLoading = () => {
    if (status === "submitted") return true;
    if (status !== "streaming") return false;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "assistant") return true;

    const hasTextContent = lastMessage.parts.some(
      (part) => part.type === "text" && part.text.trim()
    );

    return !hasTextContent;
  };

  // ローディングメッセージ決定
  const getLoadingMessage = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage?.parts) {
      const activeTool = lastMessage.parts.find(
        (part) =>
          part.type.startsWith("tool-") &&
          "state" in part &&
          part.state !== "output-available"
      );
      if (activeTool) {
        const toolName = activeTool.type.replace("tool-", "");
        switch (toolName) {
          case "modifySlide":
            return "AIがスライドを修正しています...";
          case "analyzeSlide":
            return "AIがスライドを分析しています...";
          default:
            return "AI処理中...";
        }
      }
    }
    return "AIが考えています...";
  };

  // メッセージフィルタリング
  const filterMessages = (messages: UIMessage[]) => {
    return messages.filter((message: UIMessage) => {
      if (message.role !== "assistant") return true;

      const hasTextContent = message.parts.some(
        (part) => part.type === "text" && part.text.trim().length > 0
      );

      return hasTextContent;
    });
  };

  // 自動スクロール
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // メッセージ変更時に自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages, status, scrollToBottom]);

  // AI応答完了時に入力エリアにフォーカス
  useEffect(() => {
    if (prevStatusRef.current === "streaming" && status === "ready") {
      textareaRef.current?.focus();
    }
    prevStatusRef.current = status;
  }, [status]);

  // Tool実行結果の監視とスライド更新
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && lastMessage.parts) {
      for (const part of lastMessage.parts) {
        // Tool実行結果の一意識別子を作成
        // ToolUIPartの場合のみtoolCallIdとstateが存在するため、型ガードを使用
        let toolResultId: string;
        if (
          part.type.startsWith("tool-") &&
          "toolCallId" in part &&
          "state" in part
        ) {
          toolResultId = `${lastMessage.id}-${part.type}-${part.toolCallId}-${part.state}`;
        } else {
          toolResultId = `${lastMessage.id}-${part.type}`;
        }

        // 既に処理済みの場合はスキップ
        if (processedToolResults.has(toolResultId)) {
          continue;
        }

        // AI SDK 5.0では tool-${toolName} 形式
        // ToolUIPartの型ガードを使用してstateプロパティの存在を確認
        if (
          part.type === "tool-modifySlide" &&
          "state" in part &&
          part.state === "output-available"
        ) {
          const result = "output" in part ? part.output : null;

          if (result && typeof result === "object" && "success" in result) {
            const typedResult = result as ToolResult;
            if (typedResult.success && typedResult.modifiedContent) {
              onMarkdownChange(typedResult.modifiedContent);
              showSuccess("スライドが自動修正されました");

              // 処理済みとしてマーク
              setProcessedToolResults(
                (prev) => new Set([...prev, toolResultId])
              );
            } else if (!typedResult.success) {
              showError(
                `スライド修正に失敗: ${typedResult.error || "不明なエラー"}`
              );

              // 処理済みとしてマーク
              setProcessedToolResults(
                (prev) => new Set([...prev, toolResultId])
              );
            }
          }
        }

        if (
          part.type === "tool-analyzeSlide" &&
          "state" in part &&
          part.state === "output-available"
        ) {
          const result = "output" in part ? part.output : null;

          if (result && typeof result === "object" && "success" in result) {
            const typedResult = result as ToolResult;
            if (typedResult.success && typedResult.recommendations) {
              // 分析結果は特に何もしない（将来的にUI表示等を検討）
            }
          }

          // 処理済みとしてマーク
          setProcessedToolResults((prev) => new Set([...prev, toolResultId]));
        }
      }
    }
  }, [
    messages,
    processedToolResults,
    onMarkdownChange,
    showError,
    showSuccess,
  ]);

  // ダイアログを閉じる際の状態リセット
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMessages([]);
      setProcessedToolResults(new Set());
    }
    onOpenChange(newOpen);
  };

  // メッセージ送信処理
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const input = formData.get("input") as string;

    if (!input.trim() || status === "streaming") return;

    sendMessage({
      text: input,
    });

    // フォームをリセット
    form.reset();
  };

  // エンターキー送信処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const textarea = e.target as HTMLTextAreaElement;
      const input = textarea.value.trim();

      if (!input || status === "streaming") return;

      sendMessage({
        text: input,
      });

      // テキストエリアをクリア
      textarea.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI相談
          </DialogTitle>
          <DialogDescription>
            AIエージェントとの対話を通じて、スライドを段階的に改善します。
            AIが自動的にスライドを分析・修正することがあります。
          </DialogDescription>
        </DialogHeader>

        {/* メッセージ表示エリア */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-md bg-muted/20 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>AIエージェントがスライドの改善をお手伝いします。</p>
              <p className="text-sm mt-2">
                「スライドを分析して」「もっと読みやすくして」などと話しかけてください。
              </p>
            </div>
          ) : (
            filterMessages(messages).map((message: UIMessage) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* アバター */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* メッセージ内容 */}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {/* メッセージパーツを表示 */}
                    {message.parts.map((part, index: number) => {
                      if (part.type === "text") {
                        return (
                          <div
                            key={index}
                            className="text-sm whitespace-pre-wrap"
                          >
                            {part.text}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* ローディング表示 */}
          {shouldShowLoading() && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="text-sm">{getLoadingMessage()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* スクロール用の要素 */}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* 入力エリア */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            name="input"
            placeholder="AIエージェントに相談内容を入力してください..."
            disabled={status === "streaming"}
            className="flex-1 min-h-[60px] resize-none"
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={status === "streaming"}
              className="h-[60px] px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* フッター情報 */}
        <div className="text-xs text-muted-foreground text-center">
          AIが自動的にスライドを修正する場合があります。最大5ステップまで自動実行されます。
        </div>
      </DialogContent>
    </Dialog>
  );
}
