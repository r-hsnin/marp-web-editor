"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EXPORT_FORMATS } from "@/lib/constants/marp";
import type { ExportControlsProps } from "../types";

/**
 * Export controls component
 *
 * Handles export button and popover with format selection.
 * Manages export loading states and user interactions.
 */
const ExportControls: React.FC<ExportControlsProps> = ({
  isExportPopoverOpen,
  setIsExportPopoverOpen,
  exportHandlers,
  isExporting,
  exportingFormat,
}) => {
  return (
    <Popover open={isExportPopoverOpen} onOpenChange={setIsExportPopoverOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isExporting}
              className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border shadow-sm h-9 hover:bg-accent/50 transition-colors"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <Download className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium">
                {isExporting
                  ? `${exportingFormat?.toUpperCase() || "Export"}...`
                  : "Export"}
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs font-medium">
            {isExporting
              ? `${exportingFormat?.toUpperCase() || "Export"}中...`
              : "HTML、PDF、PPTXでエクスポート"}
          </p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-32 p-1" align="end">
        <div className="space-y-1">
          {EXPORT_FORMATS.map((format) => (
            <Button
              key={format.value}
              variant="ghost"
              size="sm"
              onClick={() => {
                const handler =
                  exportHandlers[format.value as keyof typeof exportHandlers];
                if (handler) handler();
                setIsExportPopoverOpen(false);
              }}
              disabled={isExporting}
              className="w-full justify-start text-sm"
            >
              {format.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ExportControls;
