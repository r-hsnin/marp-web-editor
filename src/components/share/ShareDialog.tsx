/**
 * 共有ダイアログメインコンポーネント
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { useShareDialog } from "./hooks/useShareDialog";
import ShareForm from "./ShareForm";
import ShareResult from "./ShareResult";
import type { ShareDialogProps } from "./types";

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen = false,
  markdown,
  theme,
  onClose,
  getRenderMarkdown = null,
}) => {
  const {
    isSharing,
    shareResult,
    formData,
    hasError,
    errorMessage,
    handleShare,
    handleFormDataChange,
    handleCopyToClipboard,
    clearError,
    reset,
  } = useShareDialog({
    markdown,
    theme,
    getRenderMarkdown,
  });

  // ダイアログが閉じられる時の処理
  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Memoize ShareResult props to prevent unnecessary re-renders
  const shareResultProps = useMemo(
    () =>
      shareResult
        ? {
            result: shareResult,
            onClose: handleClose,
            onCopyToClipboard: handleCopyToClipboard,
            password: formData.password.trim() || undefined,
          }
        : null,
    [shareResult, handleClose, handleCopyToClipboard, formData.password]
  );

  // Memoize ShareForm props to prevent unnecessary re-renders
  const shareFormProps = useMemo(
    () => ({
      formData,
      onFormDataChange: handleFormDataChange,
      onSubmit: handleShare,
      onClose: handleClose,
      isSharing,
      hasError,
      errorMessage,
      onClearError: clearError,
    }),
    [
      formData,
      handleFormDataChange,
      handleShare,
      handleClose,
      isSharing,
      hasError,
      errorMessage,
      clearError,
    ]
  );

  // isOpenがfalseの場合は何も表示しない
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      {shareResult && shareResultProps ? (
        <ShareResult {...shareResultProps} />
      ) : (
        <ShareForm {...shareFormProps} />
      )}
    </div>
  );
};

export default ShareDialog;
