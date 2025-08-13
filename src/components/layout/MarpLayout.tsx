"use client";

import React from "react";
import { Toaster } from "sonner";
import MarpEditorHeader from "@/components/header";
import ShareDialog from "@/components/share";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";
import { useLayoutState } from "./hooks/useLayoutState";
import type { MarpLayoutProps } from "./types";

/**
 * MarpLayout - Main application layout component
 *
 * Responsibilities:
 * - Overall application layout management (Header + Editor + Preview + ShareDialog)
 * - Desktop/Mobile responsive switching
 * - ShareDialog overlay management
 * - State distribution to child components
 */
const MarpLayout: React.FC<MarpLayoutProps> = (props = {}) => {
  const layoutState = useLayoutState(props);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <MarpEditorHeader {...layoutState.headerProps} />

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {layoutState.isMobile ? (
          <MobileLayout {...layoutState.mobileProps} />
        ) : (
          <DesktopLayout {...layoutState.desktopProps} />
        )}
      </div>

      {/* ShareDialog Overlay */}
      {layoutState.showShareDialog && (
        <ShareDialog {...layoutState.shareDialogProps} />
      )}

      {/* Toast Notifications */}
      <Toaster {...layoutState.toasterProps} />
    </div>
  );
};

export default MarpLayout;
