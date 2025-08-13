/**
 * Security utilities for image upload validation
 */

/**
 * Magic number signatures for supported image formats
 */
const IMAGE_SIGNATURES = {
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/gif": [0x47, 0x49, 0x46, 0x38], // GIF87a or GIF89a
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header, followed by WEBP
} as const;

/**
 * Validate image file using magic number (file signature)
 * Provides additional security beyond MIME type checking
 */
export function validateImageMagicNumber(
  buffer: Buffer,
  mimeType: string
): boolean {
  const signature = IMAGE_SIGNATURES[mimeType as keyof typeof IMAGE_SIGNATURES];
  if (!signature) {
    return false;
  }

  // Check if buffer is large enough
  if (buffer.length < signature.length) {
    return false;
  }

  // For WEBP, we need additional validation
  if (mimeType === "image/webp") {
    // Check RIFF header first
    if (!signature.every((byte, i) => buffer[i] === byte)) {
      return false;
    }
    // Check WEBP signature at offset 8
    const webpSignature = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
    return webpSignature.every((byte, i) => buffer[8 + i] === byte);
  }

  // For GIF, check both GIF87a and GIF89a
  if (mimeType === "image/gif") {
    const gif87a = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]; // "GIF87a"
    const gif89a = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; // "GIF89a"

    return (
      gif87a.every((byte, i) => buffer[i] === byte) ||
      gif89a.every((byte, i) => buffer[i] === byte)
    );
  }

  // Standard signature check
  return signature.every((byte, i) => buffer[i] === byte);
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 * Removes dangerous characters while preserving readability
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "untitled";
  }

  return (
    filename
      // Remove dangerous characters
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
      // Remove leading dots (hidden files)
      .replace(/^\.+/, "")
      // Remove trailing dots and spaces
      .replace(/[\.\s]+$/, "")
      // Limit length
      .substring(0, 255) ||
    // Ensure we have something left
    "untitled"
  );
}

/**
 * Generate comprehensive security headers for image serving
 */
export function generateImageSecurityHeaders(
  mimeType: string
): Record<string, string> {
  return {
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // Prevent embedding in frames (clickjacking protection)
    "X-Frame-Options": "DENY",
    // Basic CSP for images
    "Content-Security-Policy":
      "default-src 'none'; img-src 'self'; style-src 'none'; script-src 'none';",
    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Content type
    "Content-Type": mimeType,
  };
}

/**
 * Validate file extension matches MIME type
 */
export function validateFileExtension(
  filename: string,
  mimeType: string
): boolean {
  const extension = filename.toLowerCase().split(".").pop();
  if (!extension) return false;

  const validExtensions: Record<string, string[]> = {
    "image/png": ["png"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/gif": ["gif"],
    "image/webp": ["webp"],
  };

  const allowedExtensions = validExtensions[mimeType];
  return allowedExtensions ? allowedExtensions.includes(extension) : false;
}
