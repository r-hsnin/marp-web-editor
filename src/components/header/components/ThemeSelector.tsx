/**
 * テーマ選択コンポーネント
 */

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { THEMES } from "@/lib/constants/marp";
import type { MarpTheme, ThemeInfo } from "@/types/marp";
import type { ThemeSelectorProps } from "../types";

interface ThemeSelectorInternalProps extends ThemeSelectorProps {
  isThemePopoverOpen: boolean;
  setIsThemePopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ThemeSelector: React.FC<ThemeSelectorInternalProps> = ({
  settings,
  manualSettings,
  manualValues: _manualValues,
  onSettingsChange,
  isThemePopoverOpen,
  setIsThemePopoverOpen,
}) => {
  const [themes, setThemes] = useState<ThemeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Hydration mismatch回避
  useEffect(() => {
    setIsClient(true);
  }, []);

  // テーマ一覧を取得
  useEffect(() => {
    if (!isClient) return;

    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes");

        if (!response.ok) {
          throw new Error(
            `API failed: ${response.status} ${response.statusText}`
          );
        }

        const themesData: ThemeInfo[] = await response.json();
        setThemes(themesData);
      } catch (error) {
        console.error("Failed to fetch themes:", error);
        // エラー時は組み込みテーマのみ表示
        const builtInThemes: ThemeInfo[] = THEMES.map((theme) => ({
          name: theme.value,
          displayName: theme.label,
          isBuiltIn: true,
        }));
        setThemes(builtInThemes);

        // ユーザーに通知
        const { toast } = await import("sonner");
        toast.error("カスタムテーマの読み込みに失敗しました", {
          description: "組み込みテーマのみ利用可能です",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [isClient]);

  const handleThemeChange = (themeValue: string) => {
    onSettingsChange({ theme: themeValue as MarpTheme });
    setIsThemePopoverOpen(false);
  };

  const currentTheme = themes.find((t) => t.name === settings.theme);

  // クライアントサイドでない場合は組み込みテーマのみ表示
  if (!isClient) {
    const builtInTheme = THEMES.find((t) => t.value === settings.theme);
    return (
      <Popover open={isThemePopoverOpen} onOpenChange={setIsThemePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={manualSettings.theme}
            className={`flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border shadow-sm h-9 hover:bg-accent/50 transition-colors ${
              manualSettings.theme ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Palette className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {builtInTheme?.label || settings.theme}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start">
          <div className="space-y-1">
            {THEMES.map((theme) => (
              <Button
                key={theme.value}
                variant="ghost"
                size="sm"
                onClick={() => handleThemeChange(theme.value)}
                disabled={manualSettings.theme}
                className="w-full justify-start text-sm"
              >
                {theme.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={isThemePopoverOpen} onOpenChange={setIsThemePopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={manualSettings.theme || loading}
          className={`flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border shadow-sm h-9 hover:bg-accent/50 transition-colors ${
            manualSettings.theme || loading
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Palette className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {loading
              ? "Loading..."
              : currentTheme?.displayName || settings.theme}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        <div className="space-y-1">
          {themes.map((theme) => (
            <Button
              key={theme.name}
              variant="ghost"
              size="sm"
              onClick={() => handleThemeChange(theme.name)}
              disabled={manualSettings.theme}
              className="w-full justify-start text-sm"
            >
              {theme.displayName}
              {!theme.isBuiltIn && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Custom
                </span>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(ThemeSelector);
