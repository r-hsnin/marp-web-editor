/**
 * 共有結果表示コンポーネント
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle } from "lucide-react";
import type { ShareResultProps } from "./types";

const ShareResult: React.FC<ShareResultProps> = ({
  result,
  onClose,
  onCopyToClipboard,
  password,
}) => {
  return (
    <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-border/50 animate-fade-in transform transition-all duration-300">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Share Link Created!
          </h2>
          <p className="text-sm text-muted-foreground">
            Your presentation is ready to share
          </p>
        </div>
      </div>

      {/* 共有情報 */}
      <div className="space-y-4">
        {/* 共有URL */}
        <div>
          <Label className="text-sm font-semibold text-foreground">
            Share URL
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={result.shareUrl}
              readOnly
              className="flex-1 bg-muted/50 border-border text-foreground font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyToClipboard(result.shareUrl)}
              className="bg-background border-border hover:bg-accent transition-all duration-200 shadow-sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 共有詳細 */}
        <div className="bg-muted/30 rounded-lg p-3 border">
          <div className="text-sm space-y-1">
            <p className="text-foreground font-medium">
              Expires: {new Date(result.expiresAt).toLocaleDateString()}
            </p>
            {password && (
              <p className="text-foreground font-medium">Password protected</p>
            )}
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={onClose}
          className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default ShareResult;
