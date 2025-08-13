/**
 * ヘッダー・フッター設定コンポーネント
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import type { HeaderFooterSettingsProps } from "../types";

export const HeaderFooterSettings: React.FC<HeaderFooterSettingsProps> = ({
  settings,
  manualSettings,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempHeader, setTempHeader] = React.useState(settings.header || "");
  const [tempFooter, setTempFooter] = React.useState(settings.footer || "");

  // 設定が変更されたときに一時的な値を更新
  React.useEffect(() => {
    setTempHeader(settings.header || "");
    setTempFooter(settings.footer || "");
  }, [settings.header, settings.footer]);

  const handleApply = () => {
    try {
      const newSettings = {
        header: typeof tempHeader === "string" ? tempHeader.slice(0, 100) : "", // 最大100文字
        footer: typeof tempFooter === "string" ? tempFooter.slice(0, 100) : "", // 最大100文字
      };

      onSettingsChange(newSettings);
      setIsOpen(false);
    } catch (error) {
      console.error("Error applying header/footer settings:", error);
      // エラー時もポップオーバーは閉じる
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempHeader(settings.header || "");
    setTempFooter(settings.footer || "");
    setIsOpen(false);
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempHeader(e.target.value);
  };

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempFooter(e.target.value);
  };

  const isDisabled = manualSettings.header || manualSettings.footer;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          className={`w-9 h-9 rounded-lg bg-card/50 border border-border/50 hover:bg-accent/50 shadow-sm ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          } ${
            settings.header || settings.footer
              ? "text-primary bg-primary/10"
              : ""
          }`}
          title="ヘッダー・フッター設定"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header-input" className="text-sm font-medium">
              ヘッダー
            </Label>
            <Input
              id="header-input"
              value={tempHeader}
              onChange={handleHeaderChange}
              placeholder="ヘッダーテキストを入力"
              maxLength={100}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {tempHeader.length}/100文字
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer-input" className="text-sm font-medium">
              フッター
            </Label>
            <Input
              id="footer-input"
              value={tempFooter}
              onChange={handleFooterChange}
              placeholder="フッターテキストを入力"
              maxLength={100}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {tempFooter.length}/100文字
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              適用
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(HeaderFooterSettings);
