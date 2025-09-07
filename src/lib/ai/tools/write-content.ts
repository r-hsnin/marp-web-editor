import { tool } from "ai";
import { z } from "zod";
import {
  countSlides,
  splitSlides,
  joinSlides,
  validateSlideNumber,
} from "./utils";

/**
 * Markdownコンテンツ書き込みツール
 */
export function createWriteContentTool(
  getCurrentMarkdown: () => string,
  setMarkdown: (content: string) => void
) {
  return tool({
    description:
      "Update Markdown slide content in the editor by replacing full content, modifying specific slides, inserting new slides, or deleting existing slides",
    inputSchema: z.object({
      operation: z
        .enum(["replace-full", "replace-slide", "insert-slide", "delete-slide"])
        .describe(
          "Update operation: 'replace-full' for entire document replacement, 'replace-slide' for specific slide modification, 'insert-slide' for adding new slide, 'delete-slide' for removing existing slide"
        ),
      content: z
        .string()
        .optional()
        .describe(
          "New slide content in Markdown format (required for 'replace-full', 'replace-slide', and 'insert-slide' operations)"
        ),
      slideNumber: z
        .number()
        .optional()
        .describe(
          "Target slide number (1-based indexing, required for 'replace-slide', 'insert-slide', and 'delete-slide' operations)"
        ),
      position: z
        .enum(["before", "after"])
        .optional()
        .describe(
          "Insert position relative to target slide: 'before' to insert above, 'after' to insert below (required for 'insert-slide' operation)"
        ),
    }),
    execute: async ({ operation, content, slideNumber, position }) => {
      const currentMarkdown = getCurrentMarkdown();

      switch (operation) {
        case "replace-full":
          if (!content) {
            throw new Error("content is required for replace-full operation");
          }
          setMarkdown(content);
          return {
            operation: "replace-full",
            success: true,
            newSlideCount: countSlides(content),
            modifiedContent: content,
          };

        case "replace-slide":
          if (!content || !slideNumber) {
            throw new Error(
              "content and slideNumber are required for replace-slide operation"
            );
          }
          const replacedMarkdown = replaceSlideContent(
            currentMarkdown,
            slideNumber,
            content
          );
          setMarkdown(replacedMarkdown);
          return {
            operation: "replace-slide",
            slideNumber,
            success: true,
            totalSlides: countSlides(replacedMarkdown),
            modifiedContent: replacedMarkdown,
          };

        case "insert-slide":
          if (!content || !slideNumber || !position) {
            throw new Error(
              "content, slideNumber, and position are required for insert-slide operation"
            );
          }
          const insertedMarkdown = insertSlideContent(
            currentMarkdown,
            slideNumber,
            content,
            position
          );
          setMarkdown(insertedMarkdown);
          return {
            operation: "insert-slide",
            slideNumber,
            position,
            success: true,
            newSlideCount: countSlides(insertedMarkdown),
            modifiedContent: insertedMarkdown,
          };

        case "delete-slide":
          if (!slideNumber) {
            throw new Error(
              "slideNumber is required for delete-slide operation"
            );
          }
          const deletedMarkdown = deleteSlideContent(
            currentMarkdown,
            slideNumber
          );
          setMarkdown(deletedMarkdown);
          return {
            operation: "delete-slide",
            slideNumber,
            success: true,
            remainingSlides: countSlides(deletedMarkdown),
            modifiedContent: deletedMarkdown,
          };

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    },
  });
}

/**
 * スライド操作のヘルパー関数
 */
function processSlideOperation(
  markdown: string,
  slideNumber: number,
  operation: (slides: string[], slideIndex: number) => void
): string {
  const slides = splitSlides(markdown);
  validateSlideNumber(slides.length, slideNumber);

  operation(slides, slideNumber - 1);

  return joinSlides(slides);
}

/**
 * 特定スライドの内容を置換
 */
function replaceSlideContent(
  markdown: string,
  slideNumber: number,
  newContent: string
): string {
  return processSlideOperation(markdown, slideNumber, (slides, index) => {
    slides[index] = newContent;
  });
}

/**
 * スライドを挿入
 */
function insertSlideContent(
  markdown: string,
  slideNumber: number,
  content: string,
  position: "before" | "after"
): string {
  const slides = splitSlides(markdown);
  validateSlideNumber(slides.length, slideNumber);

  const insertIndex = position === "before" ? slideNumber - 1 : slideNumber;
  slides.splice(insertIndex, 0, content);

  return joinSlides(slides);
}

/**
 * スライドを削除
 */
function deleteSlideContent(markdown: string, slideNumber: number): string {
  const slides = splitSlides(markdown);
  validateSlideNumber(slides.length, slideNumber);

  if (slides.length === 1) {
    throw new Error("Cannot delete the last remaining slide");
  }

  slides.splice(slideNumber - 1, 1);
  return joinSlides(slides);
}
