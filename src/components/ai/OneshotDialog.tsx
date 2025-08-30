"use client";

import React, { useState } from "react";
import { Loader2, Zap, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/lib/ui/useToast";
import type {
  OneshotModificationRequest,
  OneshotModificationResponse,
  AIResponse,
} from "@/types/ai";

interface OneshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
}

interface ProcessingState {
  isProcessing: boolean;
  result?: OneshotModificationResponse;
  error?: string;
}

export function OneshotDialog({
  open,
  onOpenChange,
  currentMarkdown,
  onMarkdownChange,
}: OneshotDialogProps) {
  const [instruction, setInstruction] = useState("");
  const [state, setState] = useState<ProcessingState>({ isProcessing: false });
  const { showSuccess, showError } = useToast();

  const maxInstructionLength = 5000;
  const remainingChars = maxInstructionLength - instruction.length;

  // ダイアログを閉じる際の状態リセット
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setInstruction("");
      setState({ isProcessing: false });
    }
    onOpenChange(newOpen);
  };

  // AI修正の実行
  const handleImprove = async () => {
    if (!instruction.trim()) {
      showError("改善指示を入力してください。");
      return;
    }

    setState({ isProcessing: true });

    try {
      const request: OneshotModificationRequest = {
        markdown: currentMarkdown,
        instruction: instruction.trim(),
      };

      const response = await fetch("/api/ai/oneshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const data: AIResponse<OneshotModificationResponse> =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "AI処理に失敗しました");
      }

      if (!data.data) {
        throw new Error("レスポンスデータが不正です");
      }

      setState({
        isProcessing: false,
        result: data.data,
      });

      // 成功時のトースト
      if (data.data.success) {
        showSuccess(`${data.data.changes.length}件の改善を適用しました。`);
      } else {
        showError(data.data.reason);
      }
    } catch (error) {
      console.error("AI Oneshot Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "AI処理中にエラーが発生しました";

      setState({
        isProcessing: false,
        error: errorMessage,
      });

      showError(errorMessage);
    }
  };

  // 修正結果を適用
  const handleApplyChanges = () => {
    if (state.result?.success && state.result.markdown) {
      onMarkdownChange(state.result.markdown);
      showSuccess("変更を適用しました。スライドが更新されました。");
      handleOpenChange(false);
    }
  };

  // 再試行
  const handleRetry = () => {
    setState({ isProcessing: false });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI修正
          </DialogTitle>
          <DialogDescription>
            簡単な指示でスライドを自動改善します。「もっと分かりやすく」「専門用語を減らして」などの指示を入力してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 改善指示入力 */}
          <div className="space-y-2">
            <Label htmlFor="instruction">改善指示</Label>
            <Textarea
              id="instruction"
              placeholder="例: もっと分かりやすく説明してください"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              disabled={state.isProcessing}
              className="min-h-[100px]"
              maxLength={maxInstructionLength}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>具体的な指示ほど良い結果が得られます</span>
              <span className={remainingChars < 50 ? "text-orange-500" : ""}>
                残り {remainingChars} 文字
              </span>
            </div>
          </div>

          {/* 処理中表示 */}
          {state.isProcessing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  AI修正を実行中...
                </p>
                <p className="text-xs text-muted-foreground">
                  通常30秒程度で完了します
                </p>
              </div>
            </div>
          )}

          {/* 結果表示 */}
          {state.result && !state.isProcessing && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {state.result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h4 className="font-medium">
                    {state.result.success ? "AI修正完了" : "AI修正結果"}
                  </h4>
                </div>

                <p className="text-sm text-muted-foreground">
                  {state.result.reason}
                </p>

                {state.result.success && state.result.changes.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">変更点:</h5>
                    <ul className="text-sm space-y-1">
                      {state.result.changes.map((change, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* エラー表示 */}
          {state.error && !state.isProcessing && (
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center gap-2 text-red-500">
                <XCircle className="h-5 w-5" />
                <h4 className="font-medium">エラーが発生しました</h4>
              </div>
              <p className="text-sm text-muted-foreground">{state.error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {state.isProcessing ? (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              処理中...
            </Button>
          ) : state.result?.success ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-2" />
                再修正
              </Button>
              <Button onClick={handleApplyChanges}>変更を適用</Button>
            </div>
          ) : state.error ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                キャンセル
              </Button>
              <Button onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-2" />
                再試行
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                キャンセル
              </Button>
              <Button onClick={handleImprove} disabled={!instruction.trim()}>
                <Zap className="h-4 w-4 mr-2" />
                AI修正実行
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
