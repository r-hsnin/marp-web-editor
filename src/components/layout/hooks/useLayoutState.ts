"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MarpLayoutProps, UseLayoutStateReturn } from "../types";
import type { ExportFormat } from "@/components/header/types";
import type { MarpTheme, MarpSettings } from "@/types/marp";
import type { EditorView } from "@codemirror/view";

// Import required utilities and hooks
import { DEFAULT_MARKDOWN } from "@/lib/constants/marp";
import useExport from "@/lib/export";
import { useAutoSave } from "@/lib/storage";
import { useTheme } from "@/lib/marp/ui";
import { FrontmatterProcessor } from "@/lib/marp/settings/frontmatterProcessor";
import useEditorActions from "@/lib/editor/useEditorActions";
import { useErrorHandler } from "@/lib/error";
import useMarpSettings from "@/lib/marp/settings";

/**
 * Mobile detection hook
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

/**
 * Layout state management hook
 * Manages application-wide state and distributes props to child components
 */
export function useLayoutState({
  initialDarkMode,
}: MarpLayoutProps = {}): UseLayoutStateReturn {
  const { handleError } = useErrorHandler();

  // Mobile detection
  const isMobile = useIsMobile();

  // UI State
  const [isDark, setIsDark] = useState<boolean>(initialDarkMode ?? false);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<string>("editor");

  // Core editor state
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const editorRef = useRef<{ view: EditorView } | null>(null);

  // Editor change handler
  const handleEditorChange = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  // Restore markdown from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("marp-editor-content");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const savedMarkdown = parsed.markdown;
          if (typeof savedMarkdown === "string" && savedMarkdown.trim()) {
            setMarkdown(savedMarkdown);
          }
        } catch (error) {
          const storageError = new Error(
            "Failed to load saved content from localStorage"
          );
          storageError.name = "StorageError";
          handleError(storageError, {
            context: {
              operation: "useLayoutState markdown restoration",
              originalError:
                error instanceof Error ? error.message : String(error),
            },
          });
        }
      }
    }
  }, [handleError]);

  // Theme management
  const { selectedTheme, handleThemeChange } = useTheme();

  // Auto-save functionality
  const {
    lastSaved,
    hasUnsavedChanges,
    saveToLocalStorage,
    clearSavedData,
    formatTimeAgo,
  } = useAutoSave({ markdown, theme: selectedTheme });

  // Editor actions
  const { handleInsertText, handleHeadingToggle, handleTextDecoration } =
    useEditorActions(editorRef);

  // Marp settings
  const {
    settings: marpSettings,
    manualSettings: marpManualSettings,
    isHydrated: marpIsHydrated,
    updateSettings: updateMarpSettings,
    parseManualFrontmatterValues,
    getDisplayMarkdown,
  } = useMarpSettings();

  // Export functionality (after getRenderMarkdown is available)
  const {
    isExporting,
    exportingFormat,
    handleExportHTML,
    handleExportPDF,
    handleExportPPTX,
  } = useExport(markdown, selectedTheme, (md: string) =>
    FrontmatterProcessor.getRenderMarkdown(md, {
      theme: selectedTheme as MarpTheme,
      paginate: marpSettings.paginate,
      header: marpSettings.header,
      footer: marpSettings.footer,
    })
  );

  // Restore dark mode setting from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && initialDarkMode === undefined) {
      const savedDarkMode = localStorage.getItem("marp-editor-dark-mode");
      if (savedDarkMode === "true") {
        setIsDark(true);
      }
    }
  }, [initialDarkMode]);

  // Apply dark mode to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDark]);

  // UI Handlers
  const toggleDarkMode = useCallback((): void => {
    setIsDark((prev) => {
      const newDarkMode = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("marp-editor-dark-mode", newDarkMode.toString());
        } catch (error) {
          console.warn("Failed to save dark mode setting:", error);
        }
      }
      return newDarkMode;
    });
  }, []);

  const openShareDialog = useCallback((): void => {
    setShowShareDialog(true);
  }, []);

  const closeShareDialog = useCallback((): void => {
    setShowShareDialog(false);
  }, []);

  const handleMobileTabChange = useCallback((tab: string): void => {
    setMobileTab(tab);
  }, []);

  const toggleMobileTab = useCallback((): void => {
    setMobileTab((prev) => (prev === "editor" ? "preview" : "editor"));
  }, []);

  // Export handler wrapper to handle type conversion
  const handleExportFile = useCallback(
    (format: ExportFormat) => {
      if (format === "html") {
        handleExportHTML();
      } else if (format === "pdf") {
        handleExportPDF();
      } else if (format === "pptx") {
        handleExportPPTX();
      }
    },
    [handleExportHTML, handleExportPDF, handleExportPPTX]
  );

  // Auto-save wrapper
  const onSaveToLocalStorage = useCallback(async () => {
    await saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Clear saved data wrapper - also resets editor content and settings
  const handleClearSavedData = useCallback(async () => {
    const result = await clearSavedData();
    if (result.success) {
      // Reset editor content to default
      setMarkdown(DEFAULT_MARKDOWN);

      // Reset theme to default
      handleThemeChange("default");

      // Reset Marp settings to default
      updateMarpSettings({
        theme: "default",
        paginate: true,
        header: "",
        footer: "",
      });
    }
    return result;
  }, [clearSavedData, setMarkdown, handleThemeChange, updateMarpSettings]);

  // Theme change wrapper to handle type conversion
  const handleThemeChangeWrapper = useCallback(
    (theme: string) => {
      handleThemeChange(theme);
    },
    [handleThemeChange]
  );

  // Props distribution
  const headerProps = useMemo(
    () => ({
      isDark,
      selectedTheme,
      lastSaved,
      hasUnsavedChanges,
      isExporting,
      exportingFormat,
      onThemeChange: handleThemeChangeWrapper,
      onExportHTML: handleExportHTML,
      onExportFile: handleExportFile,
      onToggleDarkMode: toggleDarkMode,
      onOpenShareDialog: openShareDialog,
      onSaveToLocalStorage,
      onClearSavedData: handleClearSavedData,
      formatTimeAgo,
      marpSettings: {
        ...marpSettings,
        theme: selectedTheme as MarpTheme,
      },
      marpManualSettings,
      marpIsHydrated,
      onMarpSettingsChange: (settings: Partial<MarpSettings>) => {
        // テーマ変更の場合は専用ハンドラーを使用
        if (settings.theme) {
          handleThemeChangeWrapper(settings.theme);
        }

        // その他の設定変更は通常のハンドラーを使用
        const otherSettings = { ...settings };
        delete otherSettings.theme;
        if (Object.keys(otherSettings).length > 0) {
          updateMarpSettings(otherSettings);
        }
      },
      parseManualFrontmatterValues,
      markdown,
    }),
    [
      isDark,
      selectedTheme,
      lastSaved,
      hasUnsavedChanges,
      isExporting,
      exportingFormat,
      handleThemeChangeWrapper,
      handleExportHTML,
      handleExportFile,
      onSaveToLocalStorage,
      handleClearSavedData,
      formatTimeAgo,
      marpSettings,
      marpManualSettings,
      marpIsHydrated,
      updateMarpSettings,
      parseManualFrontmatterValues,
      markdown,
      toggleDarkMode,
      openShareDialog,
    ]
  );

  const editorProps = useMemo(
    () => ({
      markdown: getDisplayMarkdown(markdown),
      isDark,
      onMarkdownChange: handleEditorChange,
      onInsertText: handleInsertText,
      onHeadingToggle: handleHeadingToggle,
      onTextDecoration: handleTextDecoration,
      editorRef,
    }),
    [
      getDisplayMarkdown,
      markdown,
      isDark,
      handleEditorChange,
      handleInsertText,
      handleHeadingToggle,
      handleTextDecoration,
      editorRef,
    ]
  );

  const previewProps = useMemo(
    () => ({
      markdown: FrontmatterProcessor.getRenderMarkdown(markdown, {
        theme: selectedTheme as MarpTheme,
        paginate: marpSettings.paginate,
        header: marpSettings.header,
        footer: marpSettings.footer,
      }),
      theme: selectedTheme as MarpTheme,
      isDark,
      mobileTab,
      settings: marpSettings,
      onSlideInfoChange: () => {}, // Placeholder function
    }),
    [markdown, selectedTheme, isDark, mobileTab, marpSettings]
  );

  const shareDialogProps = useMemo(
    () => ({
      isOpen: showShareDialog,
      onClose: closeShareDialog,
      markdown: FrontmatterProcessor.getRenderMarkdown(markdown, {
        theme: selectedTheme as MarpTheme,
        paginate: marpSettings.paginate,
        header: marpSettings.header,
        footer: marpSettings.footer,
      }),
      theme: selectedTheme as MarpTheme,
      settings: marpSettings,
    }),
    [showShareDialog, closeShareDialog, markdown, selectedTheme, marpSettings]
  );

  const mobileProps = useMemo(
    () => ({
      editorProps,
      previewProps,
      mobileTab,
      onMobileTabChange: handleMobileTabChange,
    }),
    [editorProps, previewProps, mobileTab, handleMobileTabChange]
  );

  const desktopProps = useMemo(
    () => ({
      editorProps,
      previewProps,
    }),
    [editorProps, previewProps]
  );

  const toasterProps = useMemo(
    () => ({
      theme: (isDark ? "dark" : "light") as "light" | "dark",
      position: "bottom-right" as const,
    }),
    [isDark]
  );

  return {
    // UI State
    isDark,
    isMobile,
    showShareDialog,
    mobileTab,

    // Component Props
    headerProps,
    editorProps,
    previewProps,
    shareDialogProps,
    mobileProps,
    desktopProps,
    toasterProps,

    // UI Handlers
    toggleDarkMode,
    openShareDialog,
    closeShareDialog,
    setMobileTab: handleMobileTabChange,
    toggleMobileTab,
  };
}
