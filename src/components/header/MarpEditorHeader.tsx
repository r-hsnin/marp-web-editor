"use client";

import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHeaderState, useExportControls, useSaveStatus } from "./hooks";
import { HeaderBranding, ActionControls, SaveStatus } from "./components";
import type { MarpEditorHeaderProps } from "./types";

/**
 * Main header component for Marp Web Editor
 *
 * Provides a unified header with branding, settings controls, export functionality,
 * and action buttons. Composed of focused sub-components for maintainability.
 */
const MarpEditorHeader: React.FC<MarpEditorHeaderProps> = React.memo(
  function MarpEditorHeader(props) {
    // Use custom hooks for state management and logic
    const exportControls = useExportControls(props);
    const headerState = useHeaderState(props, exportControls);
    const saveStatus = useSaveStatus(props);

    return (
      <TooltipProvider>
        <header className="relative border-b bg-gradient-to-r from-background via-background to-muted/20 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm animate-slide-in-left">
          {/* Left side: Branding and title */}
          <div className="flex items-start gap-2 sm:gap-4">
            <HeaderBranding {...headerState.brandingProps} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-7">
              <SaveStatus {...saveStatus} />
            </div>
          </div>

          {/* Right side: Controls and actions - テーマ、ページ数、ヘッダーフッター、共有、エクスポート、保存、ダークモード */}
          <div className="flex items-center gap-3 sm:gap-4 animate-slide-in-right overflow-x-auto">
            <ActionControls {...headerState.actionProps} />
          </div>
        </header>
      </TooltipProvider>
    );
  }
);

export default MarpEditorHeader;
