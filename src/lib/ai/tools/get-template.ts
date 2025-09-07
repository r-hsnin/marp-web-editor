import { tool } from "ai";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

/**
 * テンプレート取得ツール
 */
export function createGetTemplateTool() {
  return tool({
    description:
      "Get Marp presentation templates for different use cases - basic learning manual, business presentations, technical talks, or theme documentation with professional layouts",
    inputSchema: z.object({
      template: z
        .enum([
          "marp-basic-manual",
          "business-presentation",
          "tech-presentation",
          "professional-theme-manual",
        ])
        .describe(
          "Template type: 'marp-basic-manual' for learning Marp basics, 'business-presentation' for business use cases, 'tech-presentation' for technical talks and demos, 'professional-theme-manual' for theme documentation and examples"
        ),
    }),
    execute: async ({ template }) => {
      try {
        const templatePath = path.join(
          process.cwd(),
          "public",
          "templates",
          `${template}.md`
        );

        const content = await fs.readFile(templatePath, "utf-8");

        return {
          template,
          content,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Template loading error:", error);
        return {
          error: `Failed to load template: ${template}`,
          availableTemplates: [
            "marp-basic-manual",
            "business-presentation",
            "tech-presentation",
            "professional-theme-manual",
          ],
        };
      }
    },
  });
}
