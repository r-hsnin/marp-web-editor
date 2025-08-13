import type { RefObject } from "react";
import type { EditorView } from "@codemirror/view";
import type { MarpSettings, MarpTheme } from "@/types/marp";

// Re-export component prop types for centralized access
export type { MarpEditorHeaderProps } from "@/components/header/types";
export type { ShareDialogProps } from "@/components/share/types";

// Main layout component props
export interface MarpLayoutProps {
  initialMarkdown?: string;
  initialTheme?: string;
  initialDarkMode?: boolean;
}

// Editor component props (simplified interface for new MarpEditor)
export interface MarpEditorProps {
  markdown: string;
  isDark: boolean;
  onMarkdownChange: (value: string) => void;
  onInsertText?: (text: string) => void;
  onHeadingToggle?: (level: number) => void;
  onTextDecoration?: (decorationType: "bold" | "italic" | "code") => boolean;
  editorRef?: RefObject<{ view: EditorView } | null>;
}

// Preview component props (compatible with actual MarpPreview usage)
export interface MarpPreviewProps {
  markdown: string;
  theme?: MarpTheme; // Use proper MarpTheme type instead of string
  isDark?: boolean;
  mobileTab?: string;
  settings?: MarpSettings;
  onSlideInfoChange?: (info: unknown) => void;
}

// Mobile layout props
export interface MobileLayoutProps {
  editorProps: MarpEditorProps;
  previewProps: MarpPreviewProps;
  mobileTab: string;
  onMobileTabChange: (tab: string) => void;
}

// Desktop layout props
export interface DesktopLayoutProps {
  editorProps: MarpEditorProps;
  previewProps: MarpPreviewProps;
}

// Toaster props
export interface ToasterProps {
  theme: "light" | "dark";
  position: "bottom-right";
}

// Layout state hook return type
export interface UseLayoutStateReturn {
  // UI State
  isDark: boolean;
  isMobile: boolean;
  showShareDialog: boolean;
  mobileTab: string;

  // Component Props
  headerProps: import("@/components/header/types").MarpEditorHeaderProps;
  editorProps: MarpEditorProps;
  previewProps: MarpPreviewProps;
  shareDialogProps: import("@/components/share/types").ShareDialogProps;
  mobileProps: MobileLayoutProps;
  desktopProps: DesktopLayoutProps;
  toasterProps: ToasterProps;

  // UI Handlers
  toggleDarkMode: () => void;
  openShareDialog: () => void;
  closeShareDialog: () => void;
  setMobileTab: (tab: string) => void;
  toggleMobileTab: () => void;
}

// Legacy layout types (to be simplified/removed)
export interface LayoutProps {
  displayMarkdown: string;
  renderMarkdown: string;
  isDark: boolean;
  selectedTheme: string;
  mobileTab: string;
  editorRef: RefObject<{ view: EditorView } | null>;
  marpSettings: MarpSettings;
  onMarkdownChange: (value: string) => void;
  onSlideInfoChange?: (info: unknown) => void;
  slideInfo?: unknown;
  onInsertText?: (text: string) => void;
  onHeadingToggle?: (level: number) => void;
  onTextDecoration?: (type: string) => void;
  onMobileTabChange?: (tab: string) => void;
}

// Specific layout component props (legacy - to be simplified)
export interface DesktopLayoutPropsLegacy extends LayoutProps {}
export interface MobileLayoutPropsLegacy extends LayoutProps {}
