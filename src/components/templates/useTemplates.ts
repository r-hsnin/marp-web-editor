import { useState } from "react";
import { templates } from "./templateData";
import type { Template } from "./types";

interface UseTemplatesProps {
  currentMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
}

export const useTemplates = ({
  currentMarkdown,
  onMarkdownChange,
}: UseTemplatesProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    template: Template | null;
  }>({
    open: false,
    template: null,
  });

  const handleTemplateSelect = (template: Template) => {
    if (currentMarkdown.trim().length > 0) {
      // 既存コンテンツがある場合：確認ダイアログ表示
      setConfirmDialog({
        open: true,
        template,
      });
    } else {
      // 空の場合：直接適用
      applyTemplate(template);
    }
  };

  const applyTemplate = (template: Template) => {
    onMarkdownChange(template.content);
    setConfirmDialog({ open: false, template: null });
  };

  const handleConfirmApply = () => {
    if (confirmDialog.template) {
      applyTemplate(confirmDialog.template);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialog({ open: false, template: null });
  };

  return {
    templates,
    confirmDialog,
    handleTemplateSelect,
    handleConfirmApply,
    handleConfirmCancel,
  };
};
