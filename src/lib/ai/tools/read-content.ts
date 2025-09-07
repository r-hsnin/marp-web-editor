import { tool } from "ai";
import { z } from "zod";
import { countSlides, extractSlide, extractSlideRange } from "./utils";

/**
 * Markdownコンテンツ読み取りツール
 */
export function createReadContentTool(getCurrentMarkdown: () => string) {
  return tool({
    description:
      "Read Markdown slide content from the editor - retrieve full document, specific slides, or slide ranges for analysis or reference",
    inputSchema: z.object({
      scope: z
        .enum(["full", "slide", "range"])
        .describe(
          "Reading scope: 'full' for entire document, 'slide' for one specific slide, 'range' for multiple consecutive slides"
        ),
      slideNumber: z
        .number()
        .optional()
        .describe(
          "Slide number to read (1-based indexing, required when scope is 'slide')"
        ),
      startSlide: z
        .number()
        .optional()
        .describe(
          "Starting slide number for range reading (1-based indexing, required when scope is 'range')"
        ),
      endSlide: z
        .number()
        .optional()
        .describe(
          "Ending slide number for range reading (1-based indexing, required when scope is 'range')"
        ),
    }),
    execute: async ({ scope, slideNumber, startSlide, endSlide }) => {
      const markdown = getCurrentMarkdown();

      switch (scope) {
        case "full":
          return {
            scope: "full",
            content: markdown,
            slideCount: countSlides(markdown),
          };

        case "slide":
          if (!slideNumber) {
            throw new Error("slideNumber is required for slide scope");
          }
          return {
            scope: "slide",
            slideNumber,
            content: extractSlide(markdown, slideNumber),
            totalSlides: countSlides(markdown),
          };

        case "range":
          if (!startSlide || !endSlide) {
            throw new Error(
              "startSlide and endSlide are required for range scope"
            );
          }
          return {
            scope: "range",
            startSlide,
            endSlide,
            content: extractSlideRange(markdown, startSlide, endSlide),
            totalSlides: countSlides(markdown),
          };

        default:
          throw new Error(`Unknown scope: ${scope}`);
      }
    },
  });
}
