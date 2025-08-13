/**
 * Simplified Desktop Layout Component
 * Handles only the split-screen arrangement of Editor and Preview
 */

"use client";

import React from "react";
import { Allotment } from "allotment";
import MarpEditor from "@/components/editor/MarpEditor";
import MarpPreview from "@/components/preview";
import type { DesktopLayoutProps } from "./types";
import "allotment/dist/style.css";

export const DesktopLayout: React.FC<DesktopLayoutProps> = React.memo(
  ({ editorProps, previewProps }) => {
    return (
      <Allotment
        defaultSizes={[40, 60]}
        vertical={false}
        className="hidden md:block"
      >
        {/* Editor Pane */}
        <Allotment.Pane minSize={300}>
          <MarpEditor {...editorProps} />
        </Allotment.Pane>

        {/* Preview Pane */}
        <Allotment.Pane minSize={300}>
          <MarpPreview {...previewProps} />
        </Allotment.Pane>
      </Allotment>
    );
  }
);

DesktopLayout.displayName = "DesktopLayout";
