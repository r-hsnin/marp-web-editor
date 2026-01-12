/**
 * ツール出力を Markdown 形式に変換する
 * LLM がツール呼び出しをテキストとして出力しないよう、JSON とは異なる形式にする
 */

type PlanOutput = {
  title: string;
  outline: { title: string; description?: string }[];
  rationale?: string;
};

type ReviewOutput = {
  score: number;
  overview: string;
  good: string[];
  improvements: { slideIndex: number; title: string; problem: string; suggestion: string }[];
};

type EditOutput = {
  slideIndex: number;
  newMarkdown: string;
  reason: string;
};

type InsertOutput = {
  insertAfter: number;
  newMarkdown: string;
  reason: string;
};

type ReplaceOutput = {
  newMarkdown: string;
  reason: string;
};

function formatPlan(output: PlanOutput): string {
  const lines = [
    '## 提案した構成',
    '',
    `タイトル: ${output.title || '(未設定)'}`,
    '',
    '### スライド構成',
  ];
  if (output.outline) {
    for (const [i, item] of output.outline.entries()) {
      const desc = item.description ? ` - ${item.description}` : '';
      lines.push(`${i + 1}. ${item.title}${desc}`);
    }
  }
  if (output.rationale) {
    lines.push('', `理由: ${output.rationale}`);
  }
  return lines.join('\n');
}

function formatReview(output: ReviewOutput): string {
  const score = output.score ?? 0;
  const stars = '★'.repeat(score) + '☆'.repeat(5 - score);
  const lines = ['## レビュー結果', '', `評価: ${stars} (${score}/5)`, '', output.overview || ''];
  if (output.good?.length > 0) {
    lines.push('', '### 良い点');
    for (const g of output.good) {
      lines.push(`- ${g}`);
    }
  }
  if (output.improvements?.length > 0) {
    lines.push('', '### 改善点');
    for (const imp of output.improvements) {
      lines.push(`- スライド${imp.slideIndex}「${imp.title}」: ${imp.problem} → ${imp.suggestion}`);
    }
  }
  return lines.join('\n');
}

function formatEdit(output: EditOutput): string {
  return `## 編集提案

対象: スライド ${output.slideIndex}

変更内容:
\`\`\`
${output.newMarkdown}
\`\`\`

理由: ${output.reason}`;
}

function formatInsert(output: InsertOutput): string {
  const position = output.insertAfter === -1 ? '先頭' : `スライド ${output.insertAfter} の後`;
  return `## 挿入提案

挿入位置: ${position}

追加内容:
\`\`\`
${output.newMarkdown}
\`\`\`

理由: ${output.reason}`;
}

function formatReplace(output: ReplaceOutput): string {
  return `## 全体置換提案

新しい内容:
\`\`\`
${output.newMarkdown}
\`\`\`

理由: ${output.reason}`;
}

const formatters: Record<string, (output: unknown) => string> = {
  propose_plan: (o) => formatPlan(o as PlanOutput),
  propose_review: (o) => formatReview(o as ReviewOutput),
  propose_edit: (o) => formatEdit(o as EditOutput),
  propose_insert: (o) => formatInsert(o as InsertOutput),
  propose_replace: (o) => formatReplace(o as ReplaceOutput),
};

export function formatToolOutput(toolName: string, output: unknown): string {
  const formatter = formatters[toolName];
  if (formatter) {
    return formatter(output);
  }
  // フォールバック: JSON をそのまま返す
  return JSON.stringify(output, null, 2);
}
