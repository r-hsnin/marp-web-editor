"use client";

import { useState, useMemo } from "react";
import type {
  MarpEditorHeaderProps,
  UseExportControlsReturn,
  ExportFormat,
} from "../types";

/**
 * Export controls hook
 *
 * Manages export functionality including popover state, export handlers,
 * and export status. Handles all export-related logic in a focused manner.
 */
const useExportControls = (
  props: MarpEditorHeaderProps
): UseExportControlsReturn => {
  // Destructure props to avoid dependency warnings
  const { onExportHTML, onExportFile, isExporting, exportingFormat } = props;

  // Export popover state management
  const [isExportPopoverOpen, setIsExportPopoverOpen] =
    useState<boolean>(false);

  // Memoize export handlers to prevent unnecessary re-renders
  const exportHandlers = useMemo(
    () => ({
      html: onExportHTML,
      pdf: () => onExportFile("pdf" as ExportFormat),
      pptx: () => onExportFile("pptx" as ExportFormat),
    }),
    [onExportHTML, onExportFile]
  );

  return {
    isExportPopoverOpen,
    setIsExportPopoverOpen,
    exportHandlers,
    isExporting,
    exportingFormat,
  };
};

export default useExportControls;
