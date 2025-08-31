"use client";

import React from "react";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTemplates } from "./useTemplates";

interface TemplateDropdownProps {
  currentMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
}

export const TemplateDropdown: React.FC<TemplateDropdownProps> = ({
  currentMarkdown,
  onMarkdownChange,
}) => {
  const {
    templates,
    confirmDialog,
    handleTemplateSelect,
    handleConfirmApply,
    handleConfirmCancel,
  } = useTemplates({ currentMarkdown, onMarkdownChange });

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-md"
            aria-label="テンプレート選択"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <div className="space-y-1 p-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="ghost"
                onClick={() => handleTemplateSelect(template)}
                className="w-full justify-start h-auto p-3 flex flex-col items-start gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{template.icon}</span>
                  <span className="font-medium text-sm">{template.name}</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">
                  {template.description}
                </span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* 確認ダイアログ */}
      <Dialog open={confirmDialog.open} onOpenChange={handleConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>テンプレートを適用</DialogTitle>
            <DialogDescription>
              「{confirmDialog.template?.name}
              」を適用すると、現在の内容がすべて置き換えられます。
              <br />
              この操作は元に戻すことができます（Ctrl+Z）。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleConfirmCancel}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmApply}>適用する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
