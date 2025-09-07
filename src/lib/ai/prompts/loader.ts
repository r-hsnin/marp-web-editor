import { promises as fs } from "fs";
import path from "path";

/**
 * プロンプトファイルを読み込む
 */
async function loadPromptFile(fileName: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "src",
    "lib",
    "ai",
    "prompts",
    "files",
    fileName
  );
  return await fs.readFile(filePath, "utf-8");
}

/**
 * エージェント用システムプロンプトを読み込む
 */
export async function loadAgentSystemPrompt(): Promise<string> {
  return await loadPromptFile("agent-system.md");
}

/**
 * 修正用システムプロンプトを読み込む
 */
export async function loadModificationSystemPrompt(): Promise<string> {
  return await loadPromptFile("modification-system.md");
}
