import { loadAgentSystemPrompt, loadModificationSystemPrompt } from "./loader";

// ===================================================================
// ユーザープロンプトテンプレート（軽量なもののみ）
// ===================================================================

const MODIFICATION_USER_PROMPT = `元の内容の情報量と構造を維持しながら、以下の改善要求に基づいて部分的に改善してください。
元の詳細な内容は保持し、指示された部分のみを改善して、完全なMarkdown全文を出力してください。
フロントマター（theme、paginate等）は含めず、純粋なMarkdown内容のみを出力してください。

{instructions}

対象コンテンツ:
\`\`\`markdown
{targetContent}
\`\`\`

改善要求に基づいて、元の内容をベースに部分的な改善を行ってください。`;

const ANALYSIS_USER_PROMPT = `以下のMarkdownスライドを分析してください。

対象コンテンツ:
\`\`\`markdown
{content}
\`\`\`

詳細な分析結果と改善提案を提供してください。`;

// ===================================================================
// プロンプト生成関数
// ===================================================================

/**
 * プロンプトテンプレート変数を置換
 */
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  return Object.entries(variables).reduce(
    (result, [key, value]) =>
      result.replace(new RegExp(`{${key}}`, "g"), value),
    template
  );
}

/**
 * スライド修正用のシステムプロンプトを生成
 */
export async function createModificationSystemPrompt(): Promise<string> {
  return await loadModificationSystemPrompt();
}

/**
 * スライド修正用のユーザープロンプトを生成
 */
export function createModificationUserPrompt(
  targetContent: string,
  instructions?: string
): string {
  const instructionsText = instructions ? `追加指示: ${instructions}\n\n` : "";

  return replaceVariables(MODIFICATION_USER_PROMPT, {
    targetContent,
    instructions: instructionsText,
  });
}

/**
 * スライド分析用のユーザープロンプトを生成
 */
export function createAnalysisUserPrompt(content: string): string {
  return replaceVariables(ANALYSIS_USER_PROMPT, {
    content,
  });
}

/**
 * エージェント用のシステムプロンプトを生成（Markdown埋め込みなし）
 */
export async function createAgentSystemPrompt(): Promise<string> {
  return await loadAgentSystemPrompt();
}
