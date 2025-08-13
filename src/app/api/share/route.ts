import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import { nanoid } from "nanoid";
import { ServerErrorHandler } from "@/lib/server";
import { prisma } from "@/lib/database/prisma";

// Create a new shared presentation
export async function POST(request: Request) {
  const operationId = nanoid(8);
  const startTime = Date.now();

  try {
    const {
      markdown,
      theme = "default",
      title,
      password,
      expirationDays = 7,
    } = await request.json();

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

    if (expirationDays < 1 || expirationDays > 30) {
      return ServerErrorHandler.validationError(
        "Expiration days must be between 1 and 30",
        operationId
      );
    }

    // Generate unique share ID
    const shareId = nanoid(12);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Hash password if provided
    let hasPassword = false;
    let passwordHash = null;
    if (password && password.trim()) {
      hasPassword = true;
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Extract title from markdown if not provided
    let presentationTitle = title;
    if (!presentationTitle) {
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      presentationTitle = titleMatch ? titleMatch[1] : "Untitled Presentation";
    }

    // Save to database
    const sharedPresentation = await prisma.sharedPresentation.create({
      data: {
        shareId,
        title: presentationTitle,
        markdown,
        theme,
        hasPassword,
        passwordHash,
        expiresAt,
      },
    });

    const processingTime = Date.now() - startTime;

    logger.debug(LOG_CATEGORIES.SHARE, "Share created successfully", {
      shareId: sharedPresentation.shareId,
      hasPassword,
      expirationDays,
      processingTime,
      operationId,
    });

    return NextResponse.json({
      success: true,
      shareId: sharedPresentation.shareId,
      shareUrl: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/share/${sharedPresentation.shareId}`,
      expiresAt: sharedPresentation.expiresAt,
      operationId,
      processingTime,
    });
  } catch (error) {
    // 統一エラーハンドリング: データベースエラー
    const processingTime = Date.now() - startTime;
    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "share-create",
        processingTime,
      },
      operationId
    );
  }
}
