import type { RefObject } from "react";
import type { EditorView } from "@codemirror/view";

/**
 * MarpEditor component props
 * Focused on editor-specific functionality only
 */
export interface MarpEditorProps {
  markdown: string;
  isDark: boolean;
  onMarkdownChange: (value: string) => void;
  onInsertText?: (text: string) => void;
  onHeadingToggle?: (level: number) => void;
  onTextDecoration?: (decorationType: "bold" | "italic" | "code") => boolean; // Restored original return type
  editorRef?: RefObject<{ view: EditorView } | null>;
}

// Legacy types (to be removed after refactoring)
export interface EditorState {
  markdown: string;
  isDark: boolean;
  selectedTheme: string;
}

export interface EditorActions {
  handleEditorChange: (value: string) => void;
  handleThemeChange: (theme: string) => void;
  toggleDarkMode: () => void;
}
