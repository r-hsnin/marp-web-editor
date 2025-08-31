"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Share2, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeSelector } from "./ThemeSelector";
import { PaginationToggle } from "./PaginationToggle";
import { HeaderFooterSettings } from "./HeaderFooterSettings";
import { useSettingsControls } from "../hooks/useSettingsControls";
import ExportControls from "./ExportControls";
import type { ActionControlsWithExportProps } from "../types";

/**
 * Action controls component
 *
 * Handles action buttons including share, save, dark mode toggle,
 * and integrates MarpSettingsControls and ExportControls components.
 */
const ActionControls: React.FC<ActionControlsWithExportProps> = ({
  isDark,
  onToggleDarkMode,
  onOpenShareDialog,
  onSaveToLocalStorage,
  marpSettings,
  marpManualSettings,
  marpIsHydrated,
  onMarpSettingsChange,
  parseManualFrontmatterValues,
  markdown,
  exportControls,
}) => {
  // Memoize Marp settings change handler
  const handleMarpSettingsChange = useCallback(
    (newSettings: Partial<typeof marpSettings>): void => {
      onMarpSettingsChange(newSettings);
    },
    [onMarpSettingsChange]
  );

  const {
    isThemePopoverOpen,
    setIsThemePopoverOpen,
    displaySettings,
    displayManualSettings,
    manualValues,
    handleSettingsChange,
  } = useSettingsControls({
    settings: marpSettings,
    manualSettings: marpManualSettings,
    isHydrated: marpIsHydrated,
    onSettingsChange: handleMarpSettingsChange,
    parseManualFrontmatterValues,
    markdown,
  });

  return (
    <>
      {/* 1. Marp Settings Controls - テーマ、ページ数、ヘッダーフッター */}
      <div className="flex items-center gap-2">
        {/* Theme Selector */}
        <ThemeSelector
          settings={displaySettings}
          manualSettings={displayManualSettings}
          manualValues={manualValues}
          isHydrated={marpIsHydrated}
          onSettingsChange={handleSettingsChange}
          isDark={isDark}
          isThemePopoverOpen={isThemePopoverOpen}
          setIsThemePopoverOpen={setIsThemePopoverOpen}
        />

        {/* Paginate Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <PaginationToggle
                settings={displaySettings}
                manualSettings={displayManualSettings}
                manualValues={manualValues}
                isHydrated={marpIsHydrated}
                onSettingsChange={handleSettingsChange}
                isDark={isDark}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs font-medium">
              {displayManualSettings.paginate
                ? `ページ番号: ${
                    manualValues.paginate !== undefined
                      ? manualValues.paginate
                        ? "有効"
                        : "無効"
                      : displaySettings.paginate
                        ? "有効"
                        : "無効"
                  } (手動設定が優先されています)`
                : `ページ番号: ${displaySettings.paginate ? "有効" : "無効"}`}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Header/Footer Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <HeaderFooterSettings
                settings={displaySettings}
                manualSettings={displayManualSettings}
                manualValues={manualValues}
                isHydrated={marpIsHydrated}
                onSettingsChange={handleSettingsChange}
                isDark={isDark}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs font-medium space-y-1">
              {displayManualSettings.header || displayManualSettings.footer ? (
                <div>
                  {displayManualSettings.header && (
                    <p>
                      ヘッダー:{" "}
                      {manualValues.header ||
                        displaySettings.header ||
                        "(なし)"}{" "}
                      (手動設定)
                    </p>
                  )}
                  {displayManualSettings.footer && (
                    <p>
                      フッター:{" "}
                      {manualValues.footer ||
                        displaySettings.footer ||
                        "(なし)"}{" "}
                      (手動設定)
                    </p>
                  )}
                  {!displayManualSettings.header && (
                    <p>ヘッダー: {displaySettings.header || "(なし)"}</p>
                  )}
                  {!displayManualSettings.footer && (
                    <p>フッター: {displaySettings.footer || "(なし)"}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p>ヘッダー: {displaySettings.header || "(なし)"}</p>
                  <p>フッター: {displaySettings.footer || "(なし)"}</p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* 2. Share Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenShareDialog}
            className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border shadow-sm h-9 hover:bg-accent/50 transition-colors"
          >
            <Share2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Share</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs font-medium">プレゼンテーションを共有</p>
        </TooltipContent>
      </Tooltip>

      {/* 3. Export Controls */}
      <ExportControls {...exportControls} />

      {/* 4. Manual Save Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSaveToLocalStorage(true)}
            className="w-9 h-9 rounded-lg bg-card/50 border border-border/50 hover:bg-accent/50 shadow-sm"
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs font-medium">手動保存</p>
        </TooltipContent>
      </Tooltip>

      {/* 5. Dark Mode Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDarkMode}
            className="w-9 h-9 rounded-lg bg-card/50 border border-border/50 hover:bg-accent/50 shadow-sm"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs font-medium">
            {isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          </p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default ActionControls;
