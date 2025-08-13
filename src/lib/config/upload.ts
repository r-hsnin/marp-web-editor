/**
 * Upload configuration constants
 * Centralized configuration for file upload functionality
 */

import { ENV_CONFIG } from "./env";

export const UPLOAD_CONFIG = {
  UPLOAD_DIR: ENV_CONFIG.uploadDir,
  MAX_FILE_SIZE: ENV_CONFIG.maxFileSize,
  ALLOWED_MIME_TYPES: [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
  ] as const,
  ALLOWED_EXTENSIONS: [".png", ".jpg", ".jpeg", ".gif", ".webp"] as const,
} as const;

export type AllowedMimeType = (typeof UPLOAD_CONFIG.ALLOWED_MIME_TYPES)[number];
export type AllowedExtension =
  (typeof UPLOAD_CONFIG.ALLOWED_EXTENSIONS)[number];

/**
 * Validate if a MIME type is allowed
 */
export function isAllowedMimeType(
  mimeType: string
): mimeType is AllowedMimeType {
  return UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
}

/**
 * Validate if a file extension is allowed
 */
export function isAllowedExtension(
  extension: string
): extension is AllowedExtension {
  return UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(
    extension as AllowedExtension
  );
}
