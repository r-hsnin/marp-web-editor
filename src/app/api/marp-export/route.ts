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

    try {
      // 3) Execute marp-cli with absolute URLs
      const command = `npx @marp-team/marp-cli "${tempFile}" --${format} --output "${outputFile}" --no-stdin --allow-local-files --theme-set default --theme-set gaia --theme-set uncover`;

      await execAsync(command, {
        maxBuffer: ENV_CONFIG.marpExportMaxBuffer,
        timeout: ENV_CONFIG.marpExportTimeout,
      });

      // Read the generated file as buffer
      const fileBuffer = await readFile(outputFile);

      // Clean up temp files
      await Promise.all([
        unlink(tempFile).catch(() => {}),
        unlink(outputFile).catch(() => {}),
      ]);

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

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="presentation.${format}"`,
          "Content-Length": fileBuffer.length.toString(),
          "X-Operation-Id": operationId,
          "X-Processing-Time": processingTime.toString(),
        },
      });
    } catch (execError) {
      // Clean up temp file on error
      await unlink(tempFile).catch(() => {});

      // 統一エラーハンドリング: Marp CLIエラー
      const processingTime = Date.now() - startTime;
      return ServerErrorHandler.handleApiError(
        execError as Error,
        {
          operation: "marp-export",
          format,
          processingTime,
          stderr: (execError as ExecError).stderr || "",
        },
        operationId
      );
    }
  } catch (error) {
    // 統一エラーハンドリング: 一般的なエラー
    const processingTime = Date.now() - startTime;
    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "export-general",
        processingTime,
        format: "unknown",
      },
      operationId
    );
  }
}

// Test endpoint
export async function GET() {
  const operationId = nanoid(8);

  try {
    // Test if marp-cli can generate PDF/PPTX
    await execAsync("npx @marp-team/marp-cli --version");

    return NextResponse.json({
      status: "Marp CLI export service is available",
      supportedFormats: ["pdf", "pptx", "html"],
      success: true,
      operationId,
    });
  } catch (error) {
    // 統一エラーハンドリング: Marp CLI利用不可エラー
    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "marp-export-test",
        isHealthCheck: true,
      },
      operationId
    );
  }
}
