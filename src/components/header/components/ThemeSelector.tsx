/**
 * テーマ選択コンポーネント
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Palette } from "lucide-react";
import { THEMES } from "@/lib/constants/marp";
import type { MarpTheme } from "@/types/marp";
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
  const handleThemeChange = (themeValue: string) => {
    onSettingsChange({ theme: themeValue as MarpTheme });
    setIsThemePopoverOpen(false);
  };

  const currentTheme = THEMES.find((t) => t.value === settings.theme);

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
            {currentTheme?.label || settings.theme}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-1" align="start">
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
};

export default React.memo(ThemeSelector);
