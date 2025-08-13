/**
 * テキスト装飾機能
 * Bold、Italic、Code等のMarkdown装飾を担当
 */

import { useCallback } from "react";
import type {
  EditorRef,
  DecorationTypes,
  DecorationState,
  DecorationSymbols,
} from "./types";

// 装飾記号の定義（定数として外部に定義）
const DECORATION_SYMBOLS: Record<DecorationTypes, DecorationSymbols> = {
  bold: { start: "**", end: "**" },
  italic: { start: "*", end: "*" },
  code: { start: "`", end: "`" },
};

export function useTextDecorations(editorRef: EditorRef) {
  // テキストの装飾状態を分析
  const analyzeDecorations = useCallback((text: string): DecorationState => {
    const isBoldItalic = /^\*\*\*.*\*\*\*$/.test(text);
    const isBold = /^\*\*.*\*\*$/.test(text) && !isBoldItalic;
    const isItalic = /^\*.*\*$/.test(text) && !isBold && !isBoldItalic;
    const isCode = /^`.*`$/.test(text);

    return {
      isBold,
      isItalic,
      isCode,
      isBoldItalic,
    };
  }, []);

  // 装飾を適用または削除
  const applyDecoration = useCallback(
    (
      text: string,
      decorationType: DecorationTypes,
      currentState: DecorationState
    ): string => {
      switch (decorationType) {
        case "bold":
          if (currentState.isBoldItalic) {
            // Remove bold, keep italic: ***text*** -> *text*
            const innerText = text.slice(3, -3);
            return `*${innerText}*`;
          }
          if (currentState.isBold) {
            // Remove bold: **text** -> text
            return text.slice(2, -2);
          }
          if (currentState.isItalic) {
            // Add bold to italic: *text* -> ***text***
            const innerText = text.slice(1, -1);
            return `***${innerText}***`;
          }
          // Add bold: text -> **text**
          return `**${text}**`;

        case "italic":
          if (currentState.isBoldItalic) {
            // Remove italic, keep bold: ***text*** -> **text**
            const innerText = text.slice(3, -3);
            return `**${innerText}**`;
          }
          if (currentState.isItalic) {
            // Remove italic: *text* -> text
            return text.slice(1, -1);
          }
          if (currentState.isBold) {
            // Add italic to bold: **text** -> ***text***
            const innerText = text.slice(2, -2);
            return `***${innerText}***`;
          }
          // Add italic: text -> *text*
          return `*${text}*`;

        case "code":
          if (currentState.isCode) {
            // Remove code: `text` -> text
            return text.slice(1, -1);
          }
          // Add code: text -> `text`
          return `\`${text}\``;

        default:
          return text;
      }
    },
    []
  );

  // テキスト装飾を処理（メイン関数）
  const handleTextDecoration = useCallback(
    (type: DecorationTypes): boolean => {
      if (!editorRef.current?.view) return false;

      try {
        const view = editorRef.current.view;
        const { state } = view;
        const { selection } = state;
        const { from, to } = selection.main;

        if (from === to) {
          // 選択なし: 装飾記号を挿入してカーソルを中央に配置
          const decoration = DECORATION_SYMBOLS[type];
          if (!decoration) return false;

          const insertText = decoration.start + decoration.end;
          const transaction = state.update({
            changes: { from, to, insert: insertText },
            selection: {
              anchor: from + decoration.start.length,
              head: from + decoration.start.length,
            },
          });

          view.dispatch(transaction);
          view.focus();
          return true;
        } else {
          // 選択あり: 装飾を分析して適用/削除
          const selectedText = state.doc.sliceString(from, to);
          const currentState = analyzeDecorations(selectedText);
          const newText = applyDecoration(selectedText, type, currentState);

          const transaction = state.update({
            changes: { from, to, insert: newText },
            selection: {
              anchor: from,
              head: from + newText.length,
            },
          });

          view.dispatch(transaction);
          view.focus();
          return true;
        }
      } catch (error) {
        console.error(`Failed to apply ${type} decoration:`, error);
        return false;
      }
    },
    [editorRef, analyzeDecorations, applyDecoration]
  );

  // 見出しレベルの切り替え
  const handleHeadingToggle = useCallback(
    (level: number): boolean => {
      if (!editorRef.current?.view || level < 1 || level > 6) return false;

      try {
        const view = editorRef.current.view;
        const { state } = view;
        const { selection } = state;
        const cursorPos = selection.main.head;

        // カーソルがある行を取得
        const line = state.doc.lineAt(cursorPos);
        const lineText = line.text;

        // 現在の見出しレベルを分析
        const headingMatch = lineText.match(/^(#{1,6})\s*/);
        const currentLevel = headingMatch ? headingMatch[1]?.length || 0 : 0;

        let newText: string;
        if (currentLevel === level) {
          // 同じレベル: 見出しを削除
          newText = lineText.replace(/^#{1,6}\s*/, "");
        } else if (currentLevel > 0) {
          // 異なる見出しレベル: 新しいレベルに変更
          newText = lineText.replace(/^#{1,6}\s*/, "#".repeat(level) + " ");
        } else {
          // 見出しなし: 見出しを追加
          newText = "#".repeat(level) + " " + lineText;
        }

        // 行全体を置換
        const transaction = state.update({
          changes: { from: line.from, to: line.to, insert: newText },
          selection: { anchor: line.from + newText.length },
        });

        view.dispatch(transaction);
        view.focus();
        return true;
      } catch (error) {
        console.error(`Failed to toggle heading level ${level}:`, error);
        return false;
      }
    },
    [editorRef]
  );

  return {
    handleTextDecoration,
    handleHeadingToggle,
    analyzeDecorations,
    applyDecoration,
  };
}
