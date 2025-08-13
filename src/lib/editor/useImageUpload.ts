import { useCallback, useState, useRef } from "react";
import { nanoid } from "nanoid";
import type { EditorRef } from "@/lib/editor/types";
import type { ImageUploadResponse, ImageUploadError } from "@/types/api";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import {
  useImageUploadErrorHandler,
  createErrorContext,
  shouldShowImmediateNotification,
} from "@/lib/imageUpload/errorHandler";
import {
  retryImageUpload,
  validateFileForUpload,
  createRetryErrorMessage,
} from "@/lib/imageUpload/retryUtils";

interface UseImageUploadReturn {
  uploadAndInsert: (file: File) => Promise<void>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

interface PlaceholderInfo {
  id: string;
  text: string;
  insertPosition: number;
}

interface EditorActionsWithUtils {
  insertText: (text: string) => void;
  getCursorPosition: () => {
    line: number;
    column: number;
    offset: number;
  } | null;
}

/**
 * Hook for handling image uploads with editor integration
 * Provides upload functionality with progress tracking and automatic text insertion
 *
 * @example
 * ```tsx
 * import { useImageUpload } from "@/lib/editor/useImageUpload";
 * import useEditorActions from "@/lib/editor/useEditorActions";
 *
 * function ImageUploadComponent({ editorRef }: { editorRef: EditorRef }) {
 *   const editorActions = useEditorActions(editorRef);
 *   const { uploadAndInsert, isUploading, error, clearError } = useImageUpload(
 *     editorActions,
 *     editorRef
 *   );
 *
 *   const handleFileSelect = (file: File) => {
 *     uploadAndInsert(file);
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         accept="image/*"
 *         onChange={(e) => {
 *           const file = e.target.files?.[0];
 *           if (file) handleFileSelect(file);
 *         }}
 *         disabled={isUploading}
 *       />
 *       {isUploading && <p>アップロード中...</p>}
 *       {error && <p>エラー: {error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useImageUpload(
  editorActions: EditorActionsWithUtils,
  editorRef: EditorRef
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Toast functionality is now handled by errorHandler
  const activePlaceholders = useRef<Map<string, PlaceholderInfo>>(new Map());
  const errorHandler = useImageUploadErrorHandler();

  const clearError = useCallback(() => {
    setError(null);
    errorHandler.clearError();
  }, [errorHandler]);

  /**
   * Find and replace placeholder text in the editor
   */
  const replacePlaceholder = useCallback(
    (placeholderId: string, replacementText: string): boolean => {
      if (!editorRef.current?.view) return false;

      try {
        const view = editorRef.current.view;
        const { state } = view;
        const docText = state.doc.toString();
        const placeholderText = `![アップロード中...](uploading-${placeholderId})`;

        const placeholderIndex = docText.indexOf(placeholderText);
        if (placeholderIndex === -1) {
          // Placeholder not found, try to find it with a more flexible search
          const flexiblePattern = new RegExp(
            `!\[アップロード中\.\.\.\]\(uploading-${placeholderId}\)`,
            "g"
          );
          const flexibleMatch = flexiblePattern.exec(docText);

          if (flexibleMatch) {
            // Found with flexible search, replace it
            const from = flexibleMatch.index;
            const to = flexibleMatch.index + flexibleMatch[0].length;

            const transaction = state.update({
              changes: { from, to, insert: replacementText },
              selection: { anchor: from + replacementText.length },
            });

            view.dispatch(transaction);
            view.focus();
            return true;
          } else {
            // Still not found, insert at current cursor position
            editorActions.insertText(replacementText);
            return true;
          }
        }

        // Replace the placeholder with the actual image markdown
        const from = placeholderIndex;
        const to = placeholderIndex + placeholderText.length;

        const transaction = state.update({
          changes: { from, to, insert: replacementText },
          selection: { anchor: from + replacementText.length },
        });

        view.dispatch(transaction);
        view.focus();
        return true;
      } catch (error) {
        console.error("Failed to replace placeholder:", error);
        return false;
      }
    },
    [editorRef, editorActions]
  );

  /**
   * Remove placeholder text from editor (for cleanup on error)
   */
  const removePlaceholder = useCallback(
    (placeholderId: string): boolean => {
      if (!editorRef.current?.view) return false;

      try {
        const view = editorRef.current.view;
        const { state } = view;
        const docText = state.doc.toString();
        const placeholderText = `![アップロード中...](uploading-${placeholderId})`;

        const placeholderIndex = docText.indexOf(placeholderText);
        if (placeholderIndex === -1) return false;

        // Remove the placeholder
        const from = placeholderIndex;
        const to = placeholderIndex + placeholderText.length;

        const transaction = state.update({
          changes: { from, to, insert: "" },
          selection: { anchor: from },
        });

        view.dispatch(transaction);
        view.focus();
        return true;
      } catch (error) {
        console.error("Failed to remove placeholder:", error);
        return false;
      }
    },
    [editorRef]
  );

  const uploadAndInsert = useCallback(
    async (file: File): Promise<void> => {
      const operationId = nanoid(8);
      const placeholderId = nanoid(8);

      try {
        setIsUploading(true);
        setError(null);
        errorHandler.clearError();

        // Validate file before upload
        const validation = validateFileForUpload(file);
        if (!validation.valid) {
          const errorContext = createErrorContext(file, operationId);
          const errorInfo = errorHandler.handleError(
            new Error(validation.message || "File validation failed"),
            errorContext
          );

          if (shouldShowImmediateNotification(errorInfo.code)) {
            await errorHandler.showErrorToast(errorInfo);
          }

          setError(errorInfo.message);
          return;
        }

        // Get current cursor position for placeholder tracking
        // For drag-and-drop, try to get the drop position if available
        const cursorPosition = editorActions.getCursorPosition() || {
          offset: 0,
        };
        const placeholderText = `![アップロード中...](uploading-${placeholderId})`;

        // Store placeholder info for cleanup
        activePlaceholders.current.set(placeholderId, {
          id: placeholderId,
          text: placeholderText,
          insertPosition: cursorPosition.offset,
        });

        // Insert placeholder at current cursor position
        editorActions.insertText(placeholderText);

        logger.debug(
          LOG_CATEGORIES.IMAGE_UPLOAD,
          "Starting image upload with retry",
          {
            operationId,
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            placeholderId,
          }
        );

        // Create upload function for retry mechanism
        const uploadFn = async () => {
          const formData = new FormData();
          formData.append("image", file);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          try {
            const response = await fetch("/api/images/upload", {
              method: "POST",
              body: formData,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const result = await response.json();

            if (!response.ok || !result.success) {
              const errorData = result as { error: ImageUploadError };
              const error = new Error(
                errorData.error?.error || "アップロードに失敗しました"
              );
              // Add error code if available
              if (errorData.error?.code) {
                (error as unknown as ImageUploadError).code =
                  errorData.error.code;
              }
              throw error;
            }

            const uploadData = result as ImageUploadResponse;
            if (!uploadData.data) {
              throw new Error(
                "アップロードレスポンスにデータが含まれていません"
              );
            }

            return uploadData.data;
          } catch (fetchError) {
            clearTimeout(timeoutId);

            if (
              fetchError instanceof Error &&
              fetchError.name === "AbortError"
            ) {
              const timeoutError = new Error(
                "アップロードがタイムアウトしました"
              );
              (timeoutError as unknown as ImageUploadError).code =
                "TIMEOUT_ERROR";
              throw timeoutError;
            }

            throw fetchError;
          }
        };

        // Execute upload with retry logic
        const retryResult = await retryImageUpload(
          uploadFn,
          file,
          (progress) => {
            // Show retry progress to user
            if (progress.attempt > 1) {
              const errorContext = createErrorContext(file, operationId, {
                attempt: progress.attempt,
              });
              const tempError = errorHandler.handleError(
                new Error("Retrying upload"),
                errorContext
              );
              errorHandler.showRetryToast(
                tempError,
                progress.attempt,
                progress.maxRetries
              );
            }
          }
        );

        if (!retryResult.success || !retryResult.data) {
          const errorContext = createErrorContext(file, operationId, {
            attempts: retryResult.attempts,
          });
          const errorInfo = errorHandler.handleError(
            retryResult.error || new Error("Upload failed"),
            errorContext
          );

          const userMessage = createRetryErrorMessage(retryResult);
          setError(userMessage);

          // Clean up placeholder on error
          removePlaceholder(placeholderId);
          activePlaceholders.current.delete(placeholderId);

          await errorHandler.showErrorToast(errorInfo);
          return;
        }

        // retryResult.success && retryResult.data チェック済みのため optional chainingで安全に参照
        const data = retryResult.data;
        if (!data) {
          // ガード（理論上ここには来ないが、型安全のため）
          throw new Error("Upload response data is missing");
        }
        const { imageId, filename, storedName } = data;
        const imageMarkdown = storedName
          ? `![${filename}](uploads/${storedName})`
          : `![${filename}](/api/images/${imageId})`;

        // Replace placeholder with actual image markdown
        const replaced = replacePlaceholder(placeholderId, imageMarkdown);

        if (!replaced) {
          logger.warn(
            LOG_CATEGORIES.IMAGE_UPLOAD,
            "Failed to replace placeholder, inserting at cursor",
            {
              operationId,
              placeholderId,
            }
          );
        }

        // Clean up placeholder tracking
        activePlaceholders.current.delete(placeholderId);

        logger.debug(
          LOG_CATEGORIES.IMAGE_UPLOAD,
          "Image upload completed successfully",
          {
            operationId,
            imageId,
            filename,
            placeholderId,
            replaced,
            attempts: retryResult.attempts,
          }
        );

        // Show success message with retry info if applicable
        await errorHandler.showSuccessToast(filename, retryResult.attempts);
      } catch (uploadError) {
        const errorContext = createErrorContext(file, operationId);
        const errorInfo = errorHandler.handleError(
          uploadError instanceof Error
            ? uploadError
            : new Error(String(uploadError)),
          errorContext
        );

        setError(errorInfo.message);

        // Clean up placeholder on error
        removePlaceholder(placeholderId);
        activePlaceholders.current.delete(placeholderId);

        logger.error(LOG_CATEGORIES.IMAGE_UPLOAD, "Image upload failed", {
          operationId,
          filename: file.name,
          error: errorInfo.originalError.message,
          placeholderId,
        });

        await errorHandler.showErrorToast(errorInfo);
      } finally {
        setIsUploading(false);
      }
    },
    [editorActions, errorHandler, replacePlaceholder, removePlaceholder]
  );

  return {
    uploadAndInsert,
    isUploading,
    error,
    clearError,
  };
}
