import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import { ServerErrorHandler } from "@/lib/server";
import { generateImageSecurityHeaders } from "@/lib/imageUpload/securityUtils";
import { prisma } from "@/lib/database/prisma";
import { UPLOAD_CONFIG } from "@/lib/config/upload";

/**
 * Generate ETag for caching
 */
function generateETag(buffer: Buffer): string {
  const hash = require("crypto").createHash("md5").update(buffer).digest("hex");
  return `"${hash}"`;
}

/**
 * GET /api/images/[imageId]
 * Serve an uploaded image by its ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
): Promise<NextResponse> {
  const operationId = nanoid(8);
  const startTime = Date.now();
  const { imageId } = await params;

  try {
    // Validate imageId parameter
    if (!imageId || typeof imageId !== "string") {
      logger.warn(LOG_CATEGORIES.API, "Invalid image ID provided", {
        operationId,
        imageId,
      });

      return ServerErrorHandler.validationError(
        "Invalid image ID",
        operationId
      );
    }

    // Look up image in database
    const imageRecord = await prisma.uploadedImage.findUnique({
      where: { id: imageId },
      select: {
        storedName: true,
        mimeType: true,
        filename: true,
        size: true,
        uploadedAt: true,
      },
    });

    if (!imageRecord) {
      logger.warn(LOG_CATEGORIES.API, "Image not found in database", {
        operationId,
        imageId,
      });

      return ServerErrorHandler.notFoundError("Image not found", operationId);
    }

    // Check if file exists on disk
    const filePath = path.join(
      UPLOAD_CONFIG.UPLOAD_DIR,
      imageRecord.storedName
    );
    if (!existsSync(filePath)) {
      logger.error(LOG_CATEGORIES.FILE_OP, "Image file missing from disk", {
        operationId,
        imageId,
        storedName: imageRecord.storedName,
        filePath,
      });

      return ServerErrorHandler.notFoundError(
        "Image file not found",
        operationId
      );
    }

    // Read file from disk
    const fileBuffer = await readFile(filePath);

    // Generate ETag for caching
    const etag = generateETag(fileBuffer);

    // Check if client has cached version
    const clientETag = request.headers.get("if-none-match");
    if (clientETag === etag) {
      logger.debug(LOG_CATEGORIES.API, "Serving cached image (304)", {
        operationId,
        imageId,
        etag,
      });

      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: etag,
        },
      });
    }

    const processingTime = Date.now() - startTime;

    logger.debug(LOG_CATEGORIES.API, "Image served successfully", {
      operationId,
      imageId,
      filename: imageRecord.filename,
      mimeType: imageRecord.mimeType,
      size: imageRecord.size,
      processingTime,
    });

    // Generate security headers
    const securityHeaders = generateImageSecurityHeaders(imageRecord.mimeType);

    // Serve the image with comprehensive security headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        ...securityHeaders,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
        "Last-Modified": imageRecord.uploadedAt.toUTCString(),
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(imageRecord.filename)}`,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error(LOG_CATEGORIES.API, "Image serving failed", {
      operationId,
      imageId,
      error: (error as Error).message,
      processingTime,
    });

    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "image-serving",
        imageId,
        processingTime,
      },
      operationId
    );
  }
}
