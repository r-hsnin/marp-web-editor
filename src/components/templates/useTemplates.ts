import { useState, useCallback } from "react";
import type { Template, TemplateMetadata } from "./types";
import { templateMetadata } from "./templateData";

interface UseTemplatesProps {
  currentMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
}

export const useTemplates = ({
  currentMarkdown,
  onMarkdownChange,
}: UseTemplatesProps) => {
  const [templateContents, setTemplateContents] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState<Map<string, boolean>>(new Map());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    template: Template | null;
  }>({
    open: false,
    template: null,
  });

  const loadTemplateContent = useCallback(
    async (templateId: string): Promise<string> => {
      // 既にロード済みの場合はキャッシュから返す
      const cachedContent = templateContents.get(templateId);
      if (cachedContent) {
        return cachedContent;
      }

      // ローディング状態を設定
      setLoading((prev) => new Map(prev).set(templateId, true));

      try {
        const response = await fetch(`/templates/${templateId}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load template: ${response.statusText}`);
        }

        const content = await response.text();

        // キャッシュに保存
        setTemplateContents((prev) => new Map(prev).set(templateId, content));

        return content;
      } catch (error) {
        console.error(`Failed to load template ${templateId}:`, error);
        throw error;
      } finally {
        setLoading((prev) => new Map(prev).set(templateId, false));
      }
    },
    [templateContents]
  );

  const getTemplate = useCallback(
    async (templateId: string): Promise<Template> => {
      const metadata = templateMetadata.find((t) => t.id === templateId);
      if (!metadata) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const content = await loadTemplateContent(templateId);

      return {
        ...metadata,
        content,
      };
    },
    [loadTemplateContent]
  );

  const handleTemplateSelect = async (templateMetadata: TemplateMetadata) => {
    try {
      const template = await getTemplate(templateMetadata.id);

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
    } catch (error) {
      console.error("Failed to load template:", error);
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

  const isLoading = useCallback(
    (templateId: string): boolean => {
      return loading.get(templateId) || false;
    },
    [loading]
  );

  return {
    templates: templateMetadata,
    confirmDialog,
    handleTemplateSelect,
    handleConfirmApply,
    handleConfirmCancel,
    isLoading,
  };
};
