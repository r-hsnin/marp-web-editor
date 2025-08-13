/**
 * エディタ関連型定義
 * Markdownエディタとその操作に関する型定義
 */

// テキスト装飾タイプ
export type TextDecorationType =
  | "bold"
  | "italic"
  | "strikethrough"
  | "code"
  | "link";

// 見出しレベル
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// エディタ状態
export interface EditorState {
  markdown: string;
  cursorPosition: number;
  selection: {
    start: number;
    end: number;
  } | null;
  hasUnsavedChanges: boolean;
}

// エディタアクション
export interface EditorActions {
  insertText: (text: string) => void;
  replaceSelection: (text: string) => void;
  toggleHeading: (level: HeadingLevel) => void;
  applyDecoration: (type: TextDecorationType) => void;
  insertList: (ordered: boolean) => void;
  insertTable: (rows: number, cols: number) => void;
  insertCodeBlock: (language?: string) => void;
  insertImage: (url: string, alt?: string) => void;
  insertLink: (url: string, text?: string) => void;
}

// カーソル位置情報
export interface CursorInfo {
  line: number;
  column: number;
  position: number;
}

// 選択範囲情報
export interface SelectionInfo {
  start: CursorInfo;
  end: CursorInfo;
  selectedText: string;
}

// エディタ設定
export interface EditorSettings {
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  tabSize: number;
  theme: "light" | "dark";
  vim: boolean;
  emacs: boolean;
}

// エディタイベント
export interface EditorChangeEvent {
  value: string;
  previousValue: string;
  changes: Array<{
    from: number;
    to: number;
    text: string;
  }>;
}

// ツールバーボタン設定
export interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ComponentType;
  action: () => void;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
  shortcut?: string;
}

// ツールバーグループ
export interface ToolbarGroup {
  id: string;
  label: string;
  buttons: ToolbarButton[];
}
