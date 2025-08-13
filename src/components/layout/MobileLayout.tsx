/**
 * Simplified Mobile Layout Component
 * Handles tab-based switching between Editor and Preview
 */

"use client";

import React from "react";
import MarpEditor from "@/components/editor/MarpEditor";
import MarpPreview from "@/components/preview";
import type { MobileLayoutProps } from "./types";

export const MobileLayout: React.FC<MobileLayoutProps> = React.memo(
  ({ editorProps, previewProps, mobileTab, onMobileTabChange }) => {
    return (
      <div className="md:hidden h-full flex flex-col">
        {/* Mobile Tab Switcher */}
        <div className="flex bg-muted/30 border-b">
          <button
            onClick={() => onMobileTabChange("editor")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
              mobileTab === "editor"
                ? "bg-background text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  mobileTab === "editor"
                    ? "bg-green-500 animate-pulse"
                    : "bg-muted-foreground"
                }`}
              ></div>
              Editor
            </div>
          </button>
          <button
            onClick={() => onMobileTabChange("preview")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
              mobileTab === "preview"
                ? "bg-background text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  mobileTab === "preview"
                    ? "bg-blue-500 animate-pulse"
                    : "bg-muted-foreground"
                }`}
              ></div>
              Preview
            </div>
          </button>
        </div>

        {/* Mobile Content - Conditional Mounting */}
        <div className="flex-1 relative">
          {/* Mobile Editor - Only mount when active */}
          {mobileTab === "editor" && <MarpEditor {...editorProps} />}

          {/* Mobile Preview - Only mount when active */}
          {mobileTab === "preview" && <MarpPreview {...previewProps} />}
        </div>
      </div>
    );
  }
);

MobileLayout.displayName = "MobileLayout";
