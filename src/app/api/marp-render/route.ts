import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import { ServerErrorHandler } from "@/lib/server";
import type { ExecError } from "@/types/server";
import { API_CONFIG, calculateRetryDelay, shouldRetry } from "@/lib/config/api";

const execAsync = promisify(exec);

// Helper function to create unique temporary files with retry
async function createTempFiles(_retryCount = 0) {
  const tempDir = tmpdir();
  const uniqueId = `${Date.now()}-${nanoid(8)}`;
  const tempFile = join(tempDir, `marp-${uniqueId}.md`);
  const outputFile = join(tempDir, `marp-output-${uniqueId}.html`);

  return { tempFile, outputFile, uniqueId };
}

// Helper function to clean up files with error handling
async function cleanupFiles(files: string[], operationId: string) {
  const cleanupPromises = files.map(async (file: string) => {
    try {
      await unlink(file);
      // 削除: クリーンアップ成功ログは不要
    } catch (error) {
      logger.warn(LOG_CATEGORIES.CLEANUP, "Failed to cleanup file", {
        operationId,
        file,
        error: (error as Error).message,
      });
    }
  });

  await Promise.all(cleanupPromises);
}

// Helper function to execute marp-cli with timeout
async function executeMarpCli(
  tempFile: string,
  outputFile: string,
  operationId: string
) {
  const command = `npx @marp-team/marp-cli "${tempFile}" --html --output "${outputFile}" --no-stdin --allow-local-files --theme-set default --theme-set gaia --theme-set uncover`;

  logger.debug(LOG_CATEGORIES.MARP_CLI, "Executing marp-cli command", {
    operationId,
  });

  const startTime = Date.now();

  try {
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: API_CONFIG.LIMITS.maxBufferSize,
      timeout: API_CONFIG.TIMEOUT.marpCliTimeout,
    });

    const executionTime = Date.now() - startTime;

    // Filter out normal warnings that are not actual issues
    if (stderr) {
      const normalWarnings = [
        "Not found additional theme CSS files",
        "Deprecated directive",
      ];

      const hasRealWarning =
        stderr.includes("[  WARN ]") &&
        !normalWarnings.some((warning) => stderr.includes(warning));

      if (hasRealWarning) {
        logger.warn(LOG_CATEGORIES.MARP_CLI, "Marp CLI warning", {
          operationId,
          stderr,
          executionTime,
        });
      } else if (stderr.includes("[  ERROR ]")) {
        logger.error(LOG_CATEGORIES.MARP_CLI, "Marp CLI error", {
          operationId,
          stderr,
          executionTime,
        });
      }
      // INFO レベルと正常な WARN は無視（ログノイズ削減）
    }

    return { stdout, stderr, executionTime };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(LOG_CATEGORIES.MARP_CLI, "Marp CLI execution failed", {
      operationId,
      error: errorMessage,
      executionTime,
      command: command.substring(0, 100) + "...",
    });
    throw error;
  }
}

// Helper function to perform rendering with retry logic
async function renderWithRetry(markdown: string, operationId: string) {
  let lastError = null;

  for (let attempt = 0; attempt < API_CONFIG.RETRY.maxRetries; attempt++) {
    try {
      logger.debug(
        LOG_CATEGORIES.MARP_CLI,
        `Rendering attempt ${attempt + 1}/${API_CONFIG.RETRY.maxRetries}`,
        { operationId }
      );

      // Create temp files with unique names
      const { tempFile, outputFile } = await createTempFiles(attempt);

      try {
        // Write markdown to temp file
        const writeStartTime = Date.now();
        await writeFile(tempFile, markdown, "utf8");
        const writeTime = Date.now() - writeStartTime;

        // Execute marp-cli
        const { executionTime } = await executeMarpCli(
          tempFile,
          outputFile,
          operationId
        );

        // Read the generated HTML file
        const readStartTime = Date.now();
        const { readFile } = require("fs/promises");
        const htmlContent = await readFile(outputFile, "utf8");
        const readTime = Date.now() - readStartTime;

        // Clean up temp files
        await cleanupFiles([tempFile, outputFile], operationId);

        // Log performance metrics only if slow
        const totalTime = writeTime + executionTime + readTime;
        if (totalTime > 5000) {
          // Only log if > 5 seconds
          logger.warn(LOG_CATEGORIES.MARP_CLI, "Slow rendering performance", {
            operationId,
            totalTime,
            executionTime,
            htmlSize: htmlContent.length,
          });
        }

        return htmlContent;
      } catch (error) {
        // Clean up temp files on error
        await cleanupFiles([tempFile, outputFile], operationId);
        throw error;
      }
    } catch (error) {
      lastError = error;
      logger.error(LOG_CATEGORIES.MARP_CLI, `Attempt ${attempt + 1} failed`, {
        operationId,
        error: (error as ExecError).message,
        code: (error as ExecError).code,
        signal: (error as ExecError).signal,
      });

      // If this is not the last attempt, wait before retrying
      if (shouldRetry(attempt + 1)) {
        const delay = calculateRetryDelay(attempt);
        logger.debug(
          LOG_CATEGORIES.MARP_CLI,
          `Waiting ${delay}ms before retry`,
          { operationId }
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  logger.error(
    LOG_CATEGORIES.MARP_CLI,
    `All ${API_CONFIG.RETRY.maxRetries} attempts failed`,
    { operationId }
  );
  throw lastError;
}

export async function POST(request: Request) {
  const operationId = nanoid(8);
  const startTime = Date.now();

  logger.debug(LOG_CATEGORIES.API, "Marp render API called", { operationId });

  try {
    const body = await request.json();
    const { markdown, theme = "default" } = body;

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

    try {
      // Render with retry logic
      const htmlContent = await renderWithRetry(markdown, operationId);

      const totalTime = Date.now() - startTime;
      const response = {
        html: htmlContent,
        theme: theme,
        success: true,
        operationId,
        processingTime: totalTime,
      };

      logger.debug(LOG_CATEGORIES.API, "Sending successful response", {
        operationId,
        totalTime,
        htmlSize: htmlContent.length,
      });
      return NextResponse.json(response);
    } catch (renderError) {
      // 統一エラーハンドリング: レンダリングエラー
      const totalTime = Date.now() - startTime;
      return ServerErrorHandler.handleApiError(
        renderError as Error,
        {
          operation: "marp-render",
          processingTime: totalTime,
          retriesAttempted: API_CONFIG.RETRY.maxRetries,
          stderr: (renderError as ExecError).stderr || "",
        },
        operationId
      );
    }
  } catch (error) {
    // 統一エラーハンドリング: 予期しないエラー
    const totalTime = Date.now() - startTime;
    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "render-general",
        processingTime: totalTime,
        theme: "unknown",
      },
      operationId
    );
  }
}

// Also support GET for testing
export async function GET() {
  const operationId = nanoid(8);

  try {
    // Test if marp-cli is available
    await execAsync("npx @marp-team/marp-cli --version");

    return NextResponse.json({
      status: "Marp CLI is available",
      success: true,
      operationId,
    });
  } catch (error) {
    // 統一エラーハンドリング: Marp CLI利用不可エラー
    return ServerErrorHandler.handleApiError(
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "marp-render-test",
        isHealthCheck: true,
      },
      operationId
    );
  }
}
