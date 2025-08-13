/**
 * ページネーション切り替えコンポーネント
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { PaginateToggleProps } from "../types";

export const PaginationToggle: React.FC<PaginateToggleProps> = ({
  settings,
  manualSettings,
  onSettingsChange,
}) => {
  const handleToggle = () => {
    onSettingsChange({ paginate: !settings.paginate });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={manualSettings.paginate}
      className={`w-9 h-9 rounded-lg bg-card/50 border border-border/50 hover:bg-accent/50 shadow-sm ${
        manualSettings.paginate ? "opacity-50 cursor-not-allowed" : ""
      } ${settings.paginate ? "text-primary bg-primary/10" : ""}`}
      title={settings.paginate ? "ページ番号を非表示" : "ページ番号を表示"}
    >
      <FileText className="h-4 w-4" />
    </Button>
  );
};

export default React.memo(PaginationToggle);
