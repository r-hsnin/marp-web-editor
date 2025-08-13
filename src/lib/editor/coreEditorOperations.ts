/**
 * コアエディタ操作
 * 基本的なテキスト挿入、カーソル操作、選択操作を担当
 */

import { useCallback } from "react";
import type { EditorRef, CursorPosition, SelectionInfo } from "./types";

export function useCoreEditorOperations(editorRef: EditorRef) {
  // テキストをカーソル位置に挿入または選択範囲を置換
  const insertText = useCallback(
    (text: string): boolean => {
      if (!editorRef.current?.view) return false;

      try {
        const view = editorRef.current.view;
        const { state } = view;
        const { selection } = state;
        const { from, to } = selection.main;

        const transaction = state.update({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });

        view.dispatch(transaction);
        view.focus();
        return true;
      } catch (error) {
        console.error("Failed to insert text:", error);
        return false;
      }
    },
    [editorRef]
  );

  // エディタにフォーカスを設定
  const focusEditor = useCallback((): boolean => {
    if (!editorRef.current?.view) return false;

    try {
      editorRef.current.view.focus();
      return true;
    } catch (error) {
      console.error("Failed to focus editor:", error);
      return false;
    }
  }, [editorRef]);

  // 現在のカーソル位置を取得
  const getCursorPosition = useCallback((): CursorPosition | null => {
    if (!editorRef.current?.view) return null;

    try {
      const { state } = editorRef.current.view;
      const offset = state.selection.main.head;
      const line = state.doc.lineAt(offset);

      return {
        line: line.number,
        column: offset - line.from + 1,
        offset,
      };
    } catch (error) {
      console.error("Failed to get cursor position:", error);
      return null;
    }
  }, [editorRef]);

  // 選択されたテキストの情報を取得
  const getSelectionInfo = useCallback((): SelectionInfo | null => {
    if (!editorRef.current?.view) return null;

    try {
      const { state } = editorRef.current.view;
      const { selection } = state;
      const { from, to } = selection.main;
      const text = state.doc.sliceString(from, to);

      return {
        from,
        to,
        text,
        isEmpty: from === to,
      };
    } catch (error) {
      console.error("Failed to get selection info:", error);
      return null;
    }
  }, [editorRef]);

  // 選択されたテキストを置換
  const replaceSelectedText = useCallback(
    (newText: string): boolean => {
      if (!editorRef.current?.view) return false;

      try {
        const view = editorRef.current.view;
        const { state } = view;
        const { selection } = state;
        const { from, to } = selection.main;

        const transaction = state.update({
          changes: { from, to, insert: newText },
          selection: { anchor: from + newText.length },
        });

        view.dispatch(transaction);
        view.focus();
        return true;
      } catch (error) {
        console.error("Failed to replace selected text:", error);
        return false;
      }
    },
    [editorRef]
  );

  // 指定した範囲のテキストを取得
  const getTextRange = useCallback(
    (from: number, to: number): string | null => {
      if (!editorRef.current?.view) return null;

      try {
        const { state } = editorRef.current.view;
        return state.doc.sliceString(from, to);
      } catch (error) {
        console.error("Failed to get text range:", error);
        return null;
      }
    },
    [editorRef]
  );

  return {
    insertText,
    focusEditor,
    getCursorPosition,
    getSelectionInfo,
    replaceSelectedText,
    getTextRange,
  };
}
