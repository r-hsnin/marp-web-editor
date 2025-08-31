import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import { ServerErrorHandler } from "@/lib/server";
import { nanoid } from "nanoid";
import { ENV_CONFIG } from "@/lib/config/env";
import type { ExecError } from "@/types/server";

const execAsync = promisify(exec);

/**
 * Convert image URLs to absolute URLs for marp-cli processing
 * Converts /api/images/{imageId} URLs to absolute URLs that marp-cli can access
 */
async function convertImagePathsToAbsoluteUrls(markdown: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
  }

  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let processedMarkdown = markdown;

  // Replace image URLs with absolute URLs
  processedMarkdown = processedMarkdown.replace(
    imagePattern,
    (match, alt, pathOrUrl) => {
      // Case A: /api/images/{id} - convert to absolute URL
      if (pathOrUrl.match(/^\/api\/images\/[^?#)]+/)) {
        const absoluteUrl = `${baseUrl}${pathOrUrl}`;
        return `![${alt}](${absoluteUrl})`;
      }

      // Case B: Already absolute URL or other format - keep as is
      return match;
    }
  );

  return processedMarkdown;
}

/**
 * Convert CSS url() paths to absolute URLs for marp-cli processing
 * Converts relative image paths in CSS to absolute URLs
 */
function convertThemeCssUrls(cssContent: string, baseUrl: string): string {
  // Convert various relative path patterns to absolute URLs
  return cssContent.replace(
    /url\(["']?(\.\.?\/)?images\/([^"')]+)["']?\)/g,
    `url("${baseUrl}/images/$2")`
  );
}

export async function POST(request: Request) {
  const operationId = nanoid(8);
  const startTime = Date.now();

  try {
    const { markdown, format } = await request.json();

    // 統一エラーハンドリング: バリデーション
    if (!markdown) {
      return ServerErrorHandler.validationError(
        "Markdown content is required",
        operationId
      );
    }

    if (!markdown.trim()) {
      return ServerErrorHandler.validationError(
        "Markdown content cannot be empty",
        operationId
      );
    }

    if (!["pdf", "pptx", "html"].includes(format)) {
      return ServerErrorHandler.validationError(
        "Format must be pdf, pptx, or html",
        operationId
      );
    }

    // 1) Convert image paths to absolute URLs
    const processedMarkdown = await convertImagePathsToAbsoluteUrls(markdown);

    // 2) Create temporary directory and files
    const baseTmp = tmpdir();
    const workId = `${Date.now()}-${nanoid(8)}`;
    const workDir = join(baseTmp, `marp-export-${workId}`);

    const tempFile = join(workDir, `marp-${Date.now()}.md`);
    const outputFile = join(workDir, `marp-output-${Date.now()}.${format}`);

    // Create temp directory first, then write markdown file
    const { mkdir } = await import("fs/promises");
    await mkdir(workDir, { recursive: true });
    await writeFile(tempFile, processedMarkdown, "utf8");

    // Track temporary CSS files for cleanup
    const tempCssFiles: string[] = [];

    try {
      // 3) Execute marp-cli with theme support
      let command = `npx @marp-team/marp-cli "${tempFile}" --${format} --output "${outputFile}" --no-stdin --allow-local-files --theme-set default --theme-set gaia --theme-set uncover`;

      // カスタムテーマの追加（CSS URL変換付き）
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const themeResponse = await fetch(`${baseUrl}/api/themes`);
        const themes = await themeResponse.json();

        for (const theme of themes) {
          if (!theme.isBuiltIn && theme.fileName) {
            try {
              // 元のCSSファイルを読み込み
              const originalThemePath = join(
                process.cwd(),
                "public",
                "themes",
                theme.fileName
              );
              const cssContent = await readFile(originalThemePath, "utf8");

              // CSS内のurl()を絶対URLに変換
              const modifiedCss = convertThemeCssUrls(cssContent, baseUrl);

              // 変換後のCSSを一時ファイルに保存
              const tempCssPath = join(workDir, `${theme.name}-modified.css`);
              await writeFile(tempCssPath, modifiedCss, "utf8");
              tempCssFiles.push(tempCssPath);

              // 一時CSSファイルを--theme-setで指定
              command += ` --theme-set "${tempCssPath}"`;
            } catch (error) {
              // CSS変換失敗時は元のファイルを使用
              console.warn(
                `Failed to process custom theme ${theme.fileName}:`,
                error
              );
              const originalThemePath = join(
                process.cwd(),
                "public",
                "themes",
                theme.fileName
              );
              command += ` --theme-set "${originalThemePath}"`;
            }
          }
        }
      } catch (error) {
        // カスタムテーマ取得失敗時は組み込みテーマのみで続行
        console.warn("Failed to load custom themes for export:", error);
      }

      await execAsync(command, {
        maxBuffer: ENV_CONFIG.marpExportMaxBuffer,
        timeout: ENV_CONFIG.marpExportTimeout,
      });

      // Read the generated file as buffer
      const fileBuffer = await readFile(outputFile);

      // Clean up temp files (including modified CSS files)
      const filesToCleanup = [tempFile, outputFile, ...tempCssFiles];
      await Promise.all(
        filesToCleanup.map((file) => unlink(file).catch(() => {}))
      );

      // Return file as response
      const mimeType =
        format === "pdf"
          ? "application/pdf"
          : format === "html"
            ? "text/html"
            : "application/vnd.openxmlformats-officedocument.presentationml.presentation";

      const processingTime = Date.now() - startTime;

      logger.debug(LOG_CATEGORIES.EXPORT, "Export completed successfully", {
        format,
        fileSize: fileBuffer.length,
        processingTime,
        operationId,
      });

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="presentation.${format}"`,
          "Content-Length": fileBuffer.length.toString(),
          "X-Operation-Id": operationId,
          "X-Processing-Time": processingTime.toString(),
        },
      });
    } catch (error) {
      // Clean up temp files on error (including modified CSS files)
      const filesToCleanup = [tempFile, outputFile, ...tempCssFiles];
      await Promise.all(
        filesToCleanup.map((file) => unlink(file).catch(() => {}))
      );

      const execError = error as ExecError;

      // 統一エラーハンドリング: marp-cli実行エラー
      const processingTime = Date.now() - startTime;
      return ServerErrorHandler.handleApiError(
        new Error(`marp-cli execution failed: ${execError.message}`),
        {
          operation: "marp-export",
          format,
          processingTime,
          stderr: execError.stderr || "No stderr output",
        },
        operationId
      );
    }
  } catch (error) {
    // 統一エラーハンドリング: その他のエラー
    const processingTime = Date.now() - startTime;
    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "marp-export",
        processingTime,
      },
      operationId
    );
  }
}
