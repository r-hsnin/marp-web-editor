"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SaveStatusProps } from "../types";

/**
 * Save status component
 *
 * Displays save status with icon and text, and provides reset functionality.
 * Shows different states: saving, saved, or no status.
 */
const SaveStatus: React.FC<SaveStatusProps> = ({
  saveStatusDisplay,
  onClearSavedData,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {saveStatusDisplay && (
          <>
            {saveStatusDisplay.icon}
            {saveStatusDisplay.text}
          </>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClearSavedData}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Reset
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs font-medium">
            保存データをクリアしてサンプルに戻す
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default SaveStatus;
