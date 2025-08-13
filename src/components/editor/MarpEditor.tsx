/**
 * Marp Editor Component
 *
 * Responsibilities:
 * - Markdown editing with CodeMirror integration
 * - Editor-specific functionality (text insertion, decoration, etc.)
 * - Toolbar integration for editor operations
 * - Editor state management
 */

"use client";

import React, { useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import * as oneDarkTheme from "@codemirror/theme-one-dark";
import { ToolbarButtons } from "./Toolbar";
import { useEditorState } from "./hooks/useEditorState";
import type { MarpEditorProps } from "./types";
import type { EditorRef } from "@/components/layout/layoutTypes";

// CodeMirrorの完全メモ化コンポーネント（フォーカス保持のため）
const MemoizedCodeMirror = React.memo(CodeMirror, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.theme === nextProps.theme &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.height === nextProps.height &&
    prevProps.extensions === nextProps.extensions &&
    prevProps.basicSetup === nextProps.basicSetup &&
    prevProps.style === nextProps.style
  );
});

/**
 * MarpEditor Component
 *
 * Focused on editor functionality only:
 * - CodeMirror integration for Markdown editing
 * - Toolbar buttons for text operations
 * - Editor-specific state management
 * - Text insertion and decoration features
 */
const MarpEditor: React.FC<MarpEditorProps> = React.memo(
  ({
    markdown,
    isDark,
    onMarkdownChange,
    onInsertText,
    onHeadingToggle,
    onTextDecoration,
    editorRef,
  }) => {
    const editorState = useEditorState({
      markdown,
      onMarkdownChange,
    });

    // Wrapper function to handle onTextDecoration type compatibility
    const handleTextDecoration = useCallback(
      (decorationType: string) => {
        if (
          onTextDecoration &&
          (decorationType === "bold" ||
            decorationType === "italic" ||
            decorationType === "code")
        ) {
          return onTextDecoration(decorationType);
        }
        return false;
      },
      [onTextDecoration]
    );

    return (
      <div className="h-full flex flex-col bg-card/30 backdrop-blur-sm animate-slide-in-left">
        {/* Editor Header with Toolbar */}
        <div className="border-b bg-gradient-to-r from-muted/50 to-muted/30 px-4 py-3 flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-sm font-semibold text-foreground">
              Markdown Editor
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onInsertText && onHeadingToggle && onTextDecoration && (
              <ToolbarButtons
                onInsert={onInsertText}
                onHeadingToggle={onHeadingToggle}
                onTextDecoration={handleTextDecoration}
                editorRef={editorRef as EditorRef}
              />
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden relative">
          <MemoizedCodeMirror
            ref={editorRef}
            value={editorState.displayMarkdown}
            onChange={editorState.handleEditorChange}
            extensions={editorState.extensions}
            theme={isDark ? oneDarkTheme.oneDark : "light"}
            height="100%"
            style={editorState.style}
            basicSetup={editorState.basicSetup}
          />
        </div>
      </div>
    );
  }
);

MarpEditor.displayName = "MarpEditor";

export default MarpEditor;
