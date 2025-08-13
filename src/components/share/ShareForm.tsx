/**
 * 共有フォームコンポーネント
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Lock, Share2 } from "lucide-react";
import { EXPIRATION_OPTIONS } from "./types";
import type { ShareFormProps } from "./types";

const ShareForm: React.FC<ShareFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
  isSharing,
  hasError,
  errorMessage,
  onClearError,
}) => {
  return (
    <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-border/50 animate-fade-in transform transition-all duration-300">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
          <Share2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Share Presentation
          </h2>
          <p className="text-sm text-muted-foreground">
            Create a shareable link for your slides
          </p>
        </div>
      </div>

      {/* エラー表示 */}
      {hasError && errorMessage && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        </div>
      )}

      {/* フォーム */}
      <div className="space-y-6">
        {/* タイトル */}
        <div className="space-y-2">
          <Label
            htmlFor="title"
            className="text-sm font-semibold text-foreground"
          >
            Title (optional)
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onFormDataChange({ title: e.target.value })}
            placeholder="Auto-generated from first heading"
            className="mt-1 bg-background border-border focus:border-primary focus:ring-primary/30 transition-all duration-200 rounded-lg shadow-sm"
          />
        </div>

        {/* 有効期限 */}
        <div className="space-y-2">
          <Label
            htmlFor="expiration"
            className="text-sm font-semibold text-foreground"
          >
            Expiration
          </Label>
          <Select
            value={formData.expirationDays}
            onValueChange={(value) =>
              onFormDataChange({ expirationDays: value })
            }
          >
            <SelectTrigger className="mt-1 bg-background border-border focus:border-primary focus:ring-primary/30 transition-all duration-200 rounded-lg shadow-sm">
              <Clock className="h-4 w-4 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-lg">
              {EXPIRATION_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="hover:bg-accent/50"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* パスワード */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-foreground"
          >
            Password (optional)
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                onFormDataChange({ password: e.target.value });
                // パスワード入力時にエラーをクリア
                if (hasError) {
                  onClearError();
                }
              }}
              placeholder="Leave empty for no password"
              className="pl-10 bg-background border-border focus:border-primary focus:ring-primary/30 transition-all duration-200 rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          onClick={() => {
            onClearError();
            onClose?.();
          }}
          className="flex-1 bg-background border-border hover:bg-accent transition-all duration-200 rounded-lg shadow-sm"
          type="button"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSharing}
          className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg disabled:opacity-50"
          type="button"
        >
          {isSharing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating...
            </div>
          ) : (
            "Create Share Link"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ShareForm;
