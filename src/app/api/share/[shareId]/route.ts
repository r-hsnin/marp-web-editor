import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import { ServerErrorHandler } from "@/lib/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/database/prisma";

// Get shared presentation by shareId
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const operationId = nanoid(8);
  const startTime = Date.now();

  try {
    const { shareId } = await params;

    const sharedPresentation = await prisma.sharedPresentation.findUnique({
      where: { shareId },
    });

    if (!sharedPresentation) {
      return ServerErrorHandler.notFoundError(
        "Shared presentation not found",
        operationId
      );
    }

    // Check if expired
    if (new Date() > sharedPresentation.expiresAt) {
      const error = new Error("Shared presentation has expired");
      error.name = "ExpiredError";
      return ServerErrorHandler.handleApiError(
        error,
        {
          operation: "share-access",
          shareId,
          isExpired: true,
        },
        operationId
      );
    }

    // Increment access count
    await prisma.sharedPresentation.update({
      where: { shareId },
      data: { accessCount: { increment: 1 } },
    });

    // Return presentation data (without password hash)
    const { passwordHash: _, ...presentationData } = sharedPresentation;
    const processingTime = Date.now() - startTime;

    logger.debug(LOG_CATEGORIES.SHARE_ACCESS, "Share accessed successfully", {
      shareId,
      hasPassword: sharedPresentation.hasPassword,
      accessCount: sharedPresentation.accessCount + 1,
      processingTime,
      operationId,
    });

    return NextResponse.json({
      success: true,
      presentation: presentationData,
      operationId,
      processingTime,
    });
  } catch (error) {
    // 統一エラーハンドリング: データベースエラー
    const processingTime = Date.now() - startTime;
    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "share-access",
        shareId: (await params).shareId,
        processingTime,
      },
      operationId
    );
  }
}

// Verify password for password-protected presentations
export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const operationId = nanoid(8);
  const startTime = Date.now();

  try {
    const { shareId } = await params;
    const { password } = await request.json();

    const sharedPresentation = await prisma.sharedPresentation.findUnique({
      where: { shareId },
    });

    if (!sharedPresentation) {
      return ServerErrorHandler.notFoundError(
        "Shared presentation not found",
        operationId
      );
    }

    // Check if expired
    if (new Date() > sharedPresentation.expiresAt) {
      const error = new Error("Shared presentation has expired");
      return ServerErrorHandler.handleApiError(
        error as Error,
        {
          operation: "auth",
          shareId,
          httpStatus: 410,
        },
        operationId
      );
    }

    // Check password if required
    if (sharedPresentation.hasPassword) {
      if (!password) {
        return ServerErrorHandler.validationError(
          "Password required",
          operationId
        );
      }

      const isValidPassword = await bcrypt.compare(
        password,
        sharedPresentation.passwordHash || ""
      );
      if (!isValidPassword) {
        return ServerErrorHandler.authenticationError(
          "Invalid password",
          operationId
        );
      }
    }

    // Return presentation data (without password hash)
    const { passwordHash: _, ...presentationData } = sharedPresentation;
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      presentation: presentationData,
      operationId,
      processingTime,
    });
  } catch (error) {
    // 統一エラーハンドリング: 認証エラー
    const processingTime = Date.now() - startTime;
    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "auth",
        shareId: (await params).shareId,
        processingTime,
      },
      operationId
    );
  }
}
