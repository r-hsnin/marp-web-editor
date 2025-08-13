/**
 * Marp固有機能
 * スライド区切り、ディレクティブ等のMarp特有の機能を担当
 */

import { useCallback } from "react";
import type { EditorRef, MarpDirectiveType } from "./types";

export function useMarpFeatures(
  _editorRef: EditorRef,
  insertText: (text: string) => boolean
) {
  // スライド区切りを挿入
  const insertSlideBreak = useCallback((): boolean => {
    return insertText("\n---\n\n");
  }, [insertText]);

  // Marpディレクティブを挿入
  const insertMarpDirective = useCallback(
    (directive: MarpDirectiveType, value: string = ""): boolean => {
      const directiveText = `<!-- ${directive}${value ? `: ${value}` : ""} -->`;
      return insertText(directiveText);
    },
    [insertText]
  );

  // よく使用されるMarpディレクティブのヘルパー関数
  const insertThemeDirective = useCallback(
    (theme: string): boolean => {
      return insertMarpDirective("theme", theme);
    },
    [insertMarpDirective]
  );

  const insertPaginateDirective = useCallback(
    (enabled: boolean = true): boolean => {
      return insertMarpDirective("paginate", enabled.toString());
    },
    [insertMarpDirective]
  );

  const insertHeaderDirective = useCallback(
    (headerText: string): boolean => {
      return insertMarpDirective("header", headerText);
    },
    [insertMarpDirective]
  );

  const insertFooterDirective = useCallback(
    (footerText: string): boolean => {
      return insertMarpDirective("footer", footerText);
    },
    [insertMarpDirective]
  );

  const insertClassDirective = useCallback(
    (className: string): boolean => {
      return insertMarpDirective("class", className);
    },
    [insertMarpDirective]
  );

  const insertBackgroundColorDirective = useCallback(
    (color: string): boolean => {
      return insertMarpDirective("backgroundColor", color);
    },
    [insertMarpDirective]
  );

  const insertColorDirective = useCallback(
    (color: string): boolean => {
      return insertMarpDirective("color", color);
    },
    [insertMarpDirective]
  );

  // スライドテンプレートを挿入
  const insertSlideTemplate = useCallback(
    (title: string = "New Slide"): boolean => {
      const template = `\n---\n\n# ${title}\n\n- Point 1\n- Point 2\n- Point 3\n\n`;
      return insertText(template);
    },
    [insertText]
  );

  // タイトルスライドテンプレートを挿入
  const insertTitleSlideTemplate = useCallback(
    (
      title: string = "Presentation Title",
      subtitle: string = "Subtitle"
    ): boolean => {
      const template = `---\nmarp: true\ntheme: default\npaginate: true\n---\n\n# ${title}\n\n## ${subtitle}\n\n---\n\n`;
      return insertText(template);
    },
    [insertText]
  );

  // 2カラムレイアウトを挿入
  const insertTwoColumnLayout = useCallback((): boolean => {
    const layout = `\n<div class="columns">\n<div>\n\n## Left Column\n\nContent for left column\n\n</div>\n<div>\n\n## Right Column\n\nContent for right column\n\n</div>\n</div>\n\n`;
    return insertText(layout);
  }, [insertText]);

  return {
    // 基本的なMarp機能
    insertSlideBreak,
    insertMarpDirective,

    // ディレクティブヘルパー
    insertThemeDirective,
    insertPaginateDirective,
    insertHeaderDirective,
    insertFooterDirective,
    insertClassDirective,
    insertBackgroundColorDirective,
    insertColorDirective,

    // テンプレート
    insertSlideTemplate,
    insertTitleSlideTemplate,
    insertTwoColumnLayout,
  };
}
