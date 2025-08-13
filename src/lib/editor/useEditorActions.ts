/**
 * エディタアクション統合フック
 * 分割された各機能を統合して、元のAPIと互換性を保つ
 */

import { useMemo } from "react";
import type { EditorRef } from "./types";
import { useCoreEditorOperations } from "./coreEditorOperations";
import { useTextDecorations } from "./textDecorations";
import { useMarkdownInsertions } from "./markdownInsertions";
import { useMarpFeatures } from "./marpFeatures";

/**
 * エディタアクション統合フック
 * @param editorRef - CodeMirrorエディタの参照
 * @returns 全てのエディタアクション関数
 */
export function useEditorActions(editorRef: EditorRef) {
  // コア操作
  const coreOperations = useCoreEditorOperations(editorRef);

  // テキスト装飾
  const textDecorations = useTextDecorations(editorRef);

  // Markdown挿入（コア操作のinsertTextを依存として渡す）
  const markdownInsertions = useMarkdownInsertions(
    editorRef,
    coreOperations.insertText
  );

  // Marp機能（コア操作のinsertTextを依存として渡す）
  const marpFeatures = useMarpFeatures(editorRef, coreOperations.insertText);

  const compatibilityAPI = useMemo(
    () => ({
      // 元のAPIとの互換性を保つためのエイリアス
      handleInsertText: coreOperations.insertText,
      handleHeadingToggle: textDecorations.handleHeadingToggle,
      handleTextDecoration: textDecorations.handleTextDecoration,

      // エディタユーティリティ
      focusEditor: coreOperations.focusEditor,
      getCursorPosition: coreOperations.getCursorPosition,
      getSelectedText: () => coreOperations.getSelectionInfo()?.text || "",
      replaceSelectedText: coreOperations.replaceSelectedText,

      // Markdown要素挿入
      insertHeading: markdownInsertions.insertHeading,
      insertList: markdownInsertions.insertList,
      insertLink: markdownInsertions.insertLink,
      insertImage: markdownInsertions.insertImage,
      insertCodeBlock: markdownInsertions.insertCodeBlock,
      insertTable: markdownInsertions.insertTable,
      insertHorizontalRule: markdownInsertions.insertHorizontalRule,

      // Marp固有機能
      insertSlideBreak: marpFeatures.insertSlideBreak,
      insertMarpDirective: marpFeatures.insertMarpDirective,
    }),
    [coreOperations, textDecorations, markdownInsertions, marpFeatures]
  );

  return {
    // 新しい構造化されたAPI
    core: coreOperations,
    decorations: textDecorations,
    markdown: markdownInsertions,
    marp: marpFeatures,

    ...compatibilityAPI,
  };
}

export default useEditorActions;
