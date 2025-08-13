import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import { ServerErrorHandler } from "@/lib/server";
import type { ApiResponse } from "@/types/api";
import {
  validateImageMagicNumber,
  sanitizeFilename,
  validateFileExtension,
} from "@/lib/imageUpload/securityUtils";
import { prisma } from "@/lib/database/prisma";
import { UPLOAD_CONFIG, isAllowedMimeType } from "@/lib/config/upload";

// Response types
interface UploadSuccessResponse {
  imageId: string;
  filename: string;
  size: number;
  mimeType: string;
}

interface UploadErrorResponse {
  error: string;
  code:
    | "FILE_TOO_LARGE"
    | "INVALID_TYPE"
    | "UPLOAD_FAILED"
    | "NO_FILE"
    | "VALIDATION_ERROR";
}

type UploadResponse = ApiResponse<UploadSuccessResponse>;

/**
 * Ensure upload directory exists
 */
async function ensureUploadDirectory(): Promise<void> {
  if (!existsSync(UPLOAD_CONFIG.UPLOAD_DIR)) {
    await mkdir(UPLOAD_CONFIG.UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validate uploaded file with enhanced security checks
 */
async function validateFile(file: File): Promise<{
  valid: boolean;
  error?: UploadErrorResponse;
}> {
  // Check file size
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        error: "ファイルサイズが5MBを超えています",
        code: "FILE_TOO_LARGE",
      },
    };
  }

  // Check MIME type
  if (!isAllowedMimeType(file.type)) {
    return {
      valid: false,
      error: {
        error:
          "サポートされていないファイル形式です。PNG、JPEG、GIF、WebPのみ対応しています",
        code: "INVALID_TYPE",
      },
    };
  }

  // Validate file extension matches MIME type
  if (!validateFileExtension(file.name, file.type)) {
    return {
      valid: false,
      error: {
        error: "ファイル拡張子とファイル形式が一致しません",
        code: "INVALID_TYPE",
      },
    };
  }

  // Validate magic number (file signature)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!validateImageMagicNumber(buffer, file.type)) {
      return {
        valid: false,
        error: {
          error: "ファイル内容が画像形式と一致しません",
          code: "INVALID_TYPE",
        },
      };
    }
  } catch {
    return {
      valid: false,
      error: {
        error: "ファイルの検証中にエラーが発生しました",
        code: "VALIDATION_ERROR",
      },
    };
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext || ".bin";
}

/**
 * Store file to disk with sanitized filename
 */
async function storeFile(file: File): Promise<{
  storedName: string;
  originalName: string;
  sanitizedName: string;
  size: number;
  mimeType: string;
}> {
  const originalName = file.name;
  const sanitizedName = sanitizeFilename(originalName);
  const extension = getFileExtension(sanitizedName);
  const storedName = `${nanoid()}${extension}`;
  const filePath = path.join(UPLOAD_CONFIG.UPLOAD_DIR, storedName);

  // Convert file to buffer and write to disk
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await writeFile(filePath, buffer);

  return {
    storedName,
    originalName,
    sanitizedName,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Create database record for uploaded image
 */
async function createImageRecord(fileData: {
  storedName: string;
  originalName: string;
  sanitizedName: string;
  size: number;
  mimeType: string;
}): Promise<{ id: string }> {
  const record = await prisma.uploadedImage.create({
    data: {
      filename: fileData.sanitizedName, // Use sanitized name for display
      storedName: fileData.storedName,
      mimeType: fileData.mimeType,
      size: fileData.size,
    },
  });

  return { id: record.id };
}

/**
 * POST /api/images/upload
 * Upload an image file and return the image ID
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const operationId = nanoid(8);
  const startTime = Date.now();

  try {
    // Ensure upload directory exists
    await ensureUploadDirectory();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      logger.warn(LOG_CATEGORIES.API, "No file provided in upload request", {
        operationId,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_FILE",
            message: "ファイルが選択されていません",
            statusCode: 400,
          },
        } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    // Validate file with enhanced security checks
    const validation = await validateFile(file);
    if (!validation.valid) {
      logger.warn(LOG_CATEGORIES.VALIDATION, "File validation failed", {
        operationId,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        error: validation.error?.code,
      });

      const validationError = validation.error;
      if (!validationError) {
        throw new Error("Validation failed but no error details provided");
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: validationError.code,
            message: validationError.error,
            statusCode: 400,
          },
        } satisfies ApiResponse<never>,
        { status: 400 }
      );
    }

    // Store file to disk
    const fileData = await storeFile(file);

    // Create database record
    const { id: imageId } = await createImageRecord(fileData);

    const processingTime = Date.now() - startTime;

    logger.debug(LOG_CATEGORIES.IMAGE_UPLOAD, "Image uploaded successfully", {
      operationId,
      imageId,
      filename: fileData.originalName,
      storedName: fileData.storedName,
      size: fileData.size,
      mimeType: fileData.mimeType,
      processingTime,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          imageId,
          filename: fileData.sanitizedName,
          size: fileData.size,
          mimeType: fileData.mimeType,
        },
      } satisfies UploadResponse,
      { status: 201 }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error(LOG_CATEGORIES.API, "Image upload failed", {
      operationId,
      error: (error as Error).message,
      processingTime,
    });

    return ServerErrorHandler.handleApiError(
      error as Error,
      {
        operation: "image-upload",
        processingTime,
      },
      operationId
    );
  }
}
