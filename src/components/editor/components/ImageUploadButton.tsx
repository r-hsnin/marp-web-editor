"use client";

import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { useImageUpload } from "@/lib/editor/useImageUpload";
import { useEditorActions } from "@/lib/editor/useEditorActions";
import { validateFileForUpload } from "@/lib/imageUpload/retryUtils";
import { useImageUploadErrorHandler } from "@/lib/imageUpload/errorHandler";
import type { EditorRef } from "@/components/layout/layoutTypes";
import type { BaseComponentProps } from "@/types/components";

interface ImageUploadButtonProps extends BaseComponentProps {
  editorRef: EditorRef;
  onUploadStart?: () => void;
  onUploadComplete?: (imageId: string) => void;
  onUploadError?: (error: string) => void;
}

/**
 * ImageUploadButton component for toolbar integration
 * Provides file selection dialog and multiple file upload support
 */
const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  editorRef,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorHandler = useImageUploadErrorHandler();

  // Create EditorRef adapter for useEditorActions
  const editorRefAdapter = {
    current: editorRef.current?.view ? { view: editorRef.current.view } : null,
  };

  const editorActions = useEditorActions(editorRefAdapter);

  // Create adapter for useImageUpload hook
  const editorActionsAdapter = {
    insertText: editorActions.handleInsertText,
    getCursorPosition: editorActions.getCursorPosition,
  };

  const { uploadAndInsert, isUploading, error, clearError } = useImageUpload(
    editorActionsAdapter,
    editorRefAdapter
  );

  // Handle file selection from input
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      clearError();
      onUploadStart?.();

      try {
        // Validate and upload files sequentially to maintain order
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file) {
            // Pre-validate file before attempting upload
            const validation = validateFileForUpload(file);
            if (!validation.valid) {
              const errorInfo = errorHandler.handleError(
                new Error(validation.message || "File validation failed"),
                {
                  filename: file.name,
                  fileSize: file.size,
                }
              );
              await errorHandler.showErrorToast(errorInfo);
              onUploadError?.(errorInfo.message);
              continue; // Skip this file but continue with others
            }

            await uploadAndInsert(file);
            onUploadComplete?.(""); // Could be enhanced to return actual imageId
          }
        }
      } catch (uploadError) {
        const errorInfo = errorHandler.handleError(
          uploadError instanceof Error
            ? uploadError
            : new Error(String(uploadError))
        );
        await errorHandler.showErrorToast(errorInfo);
        onUploadError?.(errorInfo.message);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [
      uploadAndInsert,
      clearError,
      onUploadStart,
      onUploadComplete,
      onUploadError,
      errorHandler,
    ]
  );

  // Handle button click to open file dialog
  const handleButtonClick = useCallback(() => {
    if (isUploading) return;
    fileInputRef.current?.click();
  }, [isUploading]);

  // Handle file input change
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(event.target.files);
    },
    [handleFileSelect]
  );

  return (
    <>
      {/* TooltipProvider のスコープに確実に入れるため、内側でも明示的に囲う */}
      <TooltipProvider delayDuration={200} skipDelayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleButtonClick}
              disabled={isUploading}
              className={`h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-md ${
                error ? "text-destructive hover:text-destructive" : ""
              } ${className || ""}`}
              aria-label="画像をアップロード"
            >
              {isUploading ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                />
              ) : error ? (
                <AlertCircle
                  className="h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                />
              ) : (
                <ImageIcon
                  className="h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs font-medium">画像をアップロード</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
    </>
  );
};

export default ImageUploadButton;
