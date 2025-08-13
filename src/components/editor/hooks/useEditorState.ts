/**
 * Editor State Management Hook
 *
 * Manages editor-specific state and operations:
 * - Editor content state
 * - CodeMirror configuration
 * - Editor operations (insert, decoration, etc.)
 */

"use client";

import { useCallback, useMemo } from "react";
import * as markdownLang from "@codemirror/lang-markdown";
import type { Extension } from "@codemirror/state";

export interface UseEditorStateProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
}

export interface UseEditorStateReturn {
  // Editor state
  displayMarkdown: string;

  // Editor operations
  handleEditorChange: (value: string) => void;

  // CodeMirror configuration
  extensions: Extension[];
  basicSetup: {
    lineNumbers: boolean;
    foldGutter: boolean;
    dropCursor: boolean;
    allowMultipleSelections: boolean;
  };
  style: React.CSSProperties;
}

/**
 * Editor state management hook
 * Handles editor-specific state and CodeMirror configuration
 */
export function useEditorState({
  markdown,
  onMarkdownChange,
}: UseEditorStateProps): UseEditorStateReturn {
  // Editor change handler
  const handleEditorChange = useCallback(
    (value: string) => {
      onMarkdownChange(value);
    },
    [onMarkdownChange]
  );

  // CodeMirror extensions (memoized for performance)
  const extensions = useMemo(() => [markdownLang.markdown()], []);

  // CodeMirror basic setup (memoized for performance)
  const basicSetup = useMemo(
    () => ({
      lineNumbers: true,
      foldGutter: true,
      dropCursor: false,
      allowMultipleSelections: false,
    }),
    []
  );

  // CodeMirror style (memoized for performance)
  const style = useMemo(
    () => ({
      height: "100%",
      overflow: "auto" as const,
    }),
    []
  );

  return {
    // Editor state
    displayMarkdown: markdown,

    // Editor operations
    handleEditorChange,

    // CodeMirror configuration
    extensions,
    basicSetup,
    style,
  };
}
