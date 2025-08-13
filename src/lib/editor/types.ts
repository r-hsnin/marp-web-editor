/**
 * エディタ関連の型定義
 */

import type { EditorView } from "@codemirror/view";

// CodeMirror エディタの参照型
export interface EditorRef {
  current: {
    view: EditorView;
  } | null;
}

// テキスト装飾の種類
export type DecorationTypes = "bold" | "italic" | "code";

// 装飾状態の分析結果
export interface DecorationState {
  isBold: boolean;
  isItalic: boolean;
  isCode: boolean;
  isBoldItalic: boolean;
}

// 装飾記号の定義
export interface DecorationSymbols {
  start: string;
  end: string;
}

// Marpディレクティブの種類
export type MarpDirectiveType =
  | "theme"
  | "paginate"
  | "header"
  | "footer"
  | "class"
  | "backgroundColor"
  | "color";

// エディタアクションの戻り値型
export interface EditorActionResult {
  success: boolean;
  error?: string;
}

// カーソル位置情報
export interface CursorPosition {
  line: number;
  column: number;
  offset: number;
}

// 選択範囲情報
export interface SelectionInfo {
  from: number;
  to: number;
  text: string;
  isEmpty: boolean;
}
