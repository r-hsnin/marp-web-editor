/**
 * Markdown要素挿入機能
 * 標準的なMarkdown要素の挿入を担当
 */

import { useCallback } from "react";
import type { EditorRef } from "./types";

export function useMarkdownInsertions(
  _editorRef: EditorRef,
  insertText: (text: string) => boolean
) {
  // 見出しを挿入
  const insertHeading = useCallback(
    (level: number): boolean => {
      if (level < 1 || level > 6) return false;
      const headingText = "#".repeat(level) + " ";
      return insertText(headingText);
    },
    [insertText]
  );

  // リストを挿入
  const insertList = useCallback(
    (ordered: boolean = false): boolean => {
      const listText = ordered ? "1. " : "- ";
      return insertText(listText);
    },
    [insertText]
  );

  // リンクを挿入
  const insertLink = useCallback(
    (text: string = "", url: string = ""): boolean => {
      const linkText = `[${text}](${url})`;
      return insertText(linkText);
    },
    [insertText]
  );

  // 画像を挿入
  const insertImage = useCallback(
    (alt: string = "", src: string = ""): boolean => {
      const imageText = `![${alt}](${src})`;
      return insertText(imageText);
    },
    [insertText]
  );

  // コードブロックを挿入
  const insertCodeBlock = useCallback(
    (language: string = ""): boolean => {
      const codeBlockText = `\`\`\`${language}\n\n\`\`\``;
      return insertText(codeBlockText);
    },
    [insertText]
  );

  // テーブルを挿入
  const insertTable = useCallback((): boolean => {
    const tableText = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`;
    return insertText(tableText);
  }, [insertText]);

  // 水平線を挿入
  const insertHorizontalRule = useCallback((): boolean => {
    return insertText("\n---\n");
  }, [insertText]);

  // 引用を挿入
  const insertBlockquote = useCallback(
    (text: string = ""): boolean => {
      const blockquoteText = `> ${text}`;
      return insertText(blockquoteText);
    },
    [insertText]
  );

  // インラインコードを挿入
  const insertInlineCode = useCallback(
    (text: string = ""): boolean => {
      const inlineCodeText = `\`${text}\``;
      return insertText(inlineCodeText);
    },
    [insertText]
  );

  // チェックリストを挿入
  const insertCheckList = useCallback(
    (checked: boolean = false): boolean => {
      const checkListText = checked ? "- [x] " : "- [ ] ";
      return insertText(checkListText);
    },
    [insertText]
  );

  return {
    insertHeading,
    insertList,
    insertLink,
    insertImage,
    insertCodeBlock,
    insertTable,
    insertHorizontalRule,
    insertBlockquote,
    insertInlineCode,
    insertCheckList,
  };
}
