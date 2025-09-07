import {
  createGetGuidelinesTool,
  createGetTemplateTool,
  createReadContentTool,
  createWriteContentTool,
  createAnalyzeStructureTool,
} from "./index";

/**
 * 現在のMarkdownコンテンツを使用してツールセットを作成
 */
export function createToolsWithContext(
  getCurrentMarkdown: () => string,
  setMarkdown: (content: string) => void
) {
  return {
    getGuidelines: createGetGuidelinesTool(),
    getTemplate: createGetTemplateTool(),
    readContent: createReadContentTool(getCurrentMarkdown),
    writeContent: createWriteContentTool(getCurrentMarkdown, setMarkdown),
    analyzeStructure: createAnalyzeStructureTool(getCurrentMarkdown),
  };
}

/**
 * ツール名の配列を取得（デバッグ用）
 */
export function getToolNames(): string[] {
  return [
    "getGuidelines",
    "getTemplate",
    "readContent",
    "writeContent",
    "analyzeStructure",
  ];
}
