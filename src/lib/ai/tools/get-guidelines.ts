import { tool } from "ai";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

/**
 * Marp特化の詳細ガイドラインを取得するツール
 */
export function createGetGuidelinesTool() {
  return tool({
    description:
      "Get detailed Marp guidelines for slide creation, design principles, theme usage, and best practices to help create high-quality presentations",
    inputSchema: z.object({
      type: z
        .enum([
          "marp-fundamentals",
          "slide-design",
          "theme-professional",
          "best-practices",
        ])
        .describe(
          "Type of guideline: 'marp-fundamentals' for basic syntax and rules, 'slide-design' for design principles and content optimization, 'theme-professional' for layout classes and theme features, 'best-practices' for quality improvement and common issues"
        ),
    }),
    execute: async ({ type }) => {
      try {
        const filePath = path.join(
          process.cwd(),
          "public",
          "guidelines",
          `${type}.md`
        );
        const content = await fs.readFile(filePath, "utf-8");

        return {
          type,
          content,
          timestamp: new Date().toISOString(),
        };
      } catch {
        return {
          type,
          content: `ガイドライン「${type}」が見つかりませんでした。`,
          timestamp: new Date().toISOString(),
          error: true,
        };
      }
    },
  });
}
