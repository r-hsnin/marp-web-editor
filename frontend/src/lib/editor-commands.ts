import { EditorSelection, Transaction } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

/**
 * 選択範囲の前後に指定された文字列をトグルする（Bold, Italic, Strikethrough等）
 */
export const toggleFormat = (
  view: EditorView,
  prefix: string,
  suffix: string,
  placeholder = 'text',
) => {
  const { state, dispatch } = view;
  const changes = state.changeByRange((range) => {
    const text = state.sliceDoc(range.from, range.to);
    const from = range.from;
    const to = range.to;

    // 選択範囲の前後のテキストを確認
    const before = state.sliceDoc(from - prefix.length, from);
    const after = state.sliceDoc(to, to + suffix.length);

    // 既にフォーマットされている場合は解除
    if (before === prefix && after === suffix) {
      return {
        changes: {
          from: from - prefix.length,
          to: to + suffix.length,
          insert: text,
        },
        range: EditorSelection.range(from - prefix.length, to - prefix.length),
      };
    }

    // 選択範囲内にフォーマットが含まれている場合（簡易的なチェック）
    // 例: **text** を選択している場合
    if (
      text.startsWith(prefix) &&
      text.endsWith(suffix) &&
      text.length >= prefix.length + suffix.length
    ) {
      return {
        changes: {
          from: from,
          to: to,
          insert: text.slice(prefix.length, text.length - suffix.length),
        },
        range: EditorSelection.range(from, to - (prefix.length + suffix.length)),
      };
    }

    // フォーマットを適用
    // テキストが空の場合はプレースホルダーを挿入
    if (!text) {
      return {
        changes: {
          from: from,
          to: to,
          insert: `${prefix}${placeholder}${suffix}`,
        },
        range: EditorSelection.range(
          from + prefix.length,
          from + prefix.length + placeholder.length,
        ),
      };
    }

    return {
      changes: {
        from: from,
        to: to,
        insert: `${prefix}${text}${suffix}`,
      },
      range: EditorSelection.range(from + prefix.length, to + prefix.length),
    };
  });

  dispatch(
    state.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of('input'),
    }),
  );
  view.focus();
};

/**
 * 行頭に指定された文字列をトグルする（Heading, List等）
 * 異なる種類のプレフィックス（例: # と ##）の切り替えも考慮する
 */
export const toggleLineStart = (
  view: EditorView,
  prefix: string,
  regexPattern?: RegExp, // 既存のプレフィックスを検出するための正規表現（例: /^#{1,6}\s/）
) => {
  const { state, dispatch } = view;
  const changes = state.changeByRange((range) => {
    const line = state.doc.lineAt(range.from);
    const text = line.text;

    // 既に指定されたプレフィックスで始まっている場合は削除
    if (text.startsWith(prefix)) {
      return {
        changes: {
          from: line.from,
          to: line.from + prefix.length,
          insert: '',
        },
        range: EditorSelection.cursor(range.from - prefix.length),
      };
    }

    // 正規表現が指定されている場合、他のパターン（例: 別のレベルの見出し）にマッチするか確認して置換
    if (regexPattern) {
      const match = text.match(regexPattern);
      if (match) {
        return {
          changes: {
            from: line.from,
            to: line.from + match[0].length,
            insert: prefix,
          },
          range: EditorSelection.cursor(range.from - match[0].length + prefix.length),
        };
      }
    }

    // 単純に追加
    return {
      changes: {
        from: line.from,
        to: line.from,
        insert: prefix,
      },
      range: EditorSelection.cursor(range.from + prefix.length),
    };
  });

  dispatch(
    state.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of('input'),
    }),
  );
  view.focus();
};

// 各機能ごとのヘルパー関数

export const toggleBold = (view: EditorView) => toggleFormat(view, '**', '**', 'bold');
export const toggleItalic = (view: EditorView) => toggleFormat(view, '*', '*', 'italic');
export const toggleStrikethrough = (view: EditorView) =>
  toggleFormat(view, '~~', '~~', 'strikethrough');

export const toggleHeading = (view: EditorView, level: 1 | 2 | 3 | 4 | 5 | 6) => {
  const prefix = `${'#'.repeat(level)} `;
  // 任意の見出しレベル(# 1-6個 + 空白)にマッチする正規表現
  const regex = /^#{1,6}\s/;
  toggleLineStart(view, prefix, regex);
};

export const toggleUnorderedList = (view: EditorView) => {
  // -, *, + のいずれかのリストマーカーにマッチ
  const regex = /^[-*+]\s/;
  toggleLineStart(view, '- ', regex);
};

export const toggleOrderedList = (view: EditorView) => {
  // 数字 + . + 空白 にマッチ
  const regex = /^\d+\.\s/;
  toggleLineStart(view, '1. ', regex);
};

export const toggleTaskList = (view: EditorView) => {
  // - [ ] または - [x] にマッチ
  const regex = /^-\s\[[ x]\]\s/;
  toggleLineStart(view, '- [ ] ', regex);
};

export const insertLink = (view: EditorView) => toggleFormat(view, '[', '](url)', 'link text');
export const insertImage = (view: EditorView) => toggleFormat(view, '![', '](url)', 'alt text');
export const insertCodeBlock = (view: EditorView) => toggleFormat(view, '```\n', '\n```', 'code');
