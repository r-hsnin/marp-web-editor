"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Image,
  FileText,
  LucideIcon,
} from "lucide-react";
import ImageUploadButton from "./components/ImageUploadButton";
import type { EditorRef } from "@/components/layout/layoutTypes";

// 型定義
interface ToolbarProps {
  onInsert?: (text: string) => void;
  onHeadingToggle?: (level: number) => void;
  onTextDecoration?: (decorationType: string) => void;
  editorRef?: EditorRef; // 画像アップロード差し替え用（任意）
}

interface ToolbarItem {
  icon: LucideIcon | "custom";
  label: string;
  type: "insert" | "heading" | "decoration" | "custom";
  text?: string;
  level?: number;
  decorationType?: string;
  render?: () => React.ReactNode; // custom 描画用
}

interface ToolbarGroup {
  group: string;
  items: ToolbarItem[];
}

// 元のToolbarコンポーネントは削除 - ToolbarButtonsのみを使用

// ヘッダー用のToolbarButtons（メインコンポーネント）
const ToolbarButtons: React.FC<ToolbarProps> = ({
  onInsert,
  onHeadingToggle,
  onTextDecoration,
  editorRef,
}) => {
  const insertText = (text: string): void => {
    if (onInsert) {
      onInsert(text);
    }
  };

  const toolbarItems: ToolbarGroup[] = [
    {
      group: "slides",
      items: [
        {
          icon: FileText,
          label: "New Slide",
          text: "\n---\n\n# New Slide\n\n",
          type: "insert",
        },
        { icon: Heading1, label: "Heading 1", level: 1, type: "heading" },
        { icon: Heading2, label: "Heading 2", level: 2, type: "heading" },
      ],
    },
    {
      group: "formatting",
      items: [
        {
          icon: Bold,
          label: "Bold",
          decorationType: "bold",
          type: "decoration",
        },
        {
          icon: Italic,
          label: "Italic",
          decorationType: "italic",
          type: "decoration",
        },
        {
          icon: Code,
          label: "Code",
          decorationType: "code",
          type: "decoration",
        },
      ],
    },
    {
      group: "lists",
      items: [
        {
          icon: List,
          label: "Bullet List",
          text: "- List item",
          type: "insert",
        },
        {
          icon: ListOrdered,
          label: "Numbered List",
          text: "1. List item",
          type: "insert",
        },
      ],
    },
    {
      group: "media",
      items: [
        {
          icon: Image,
          label: "画像をアップロード",
          type: "insert",
          text: "__UPLOAD_SENTINEL__",
        },
      ],
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {toolbarItems.map((group) =>
          group.items.map((item) => {
            const Icon = item.icon as LucideIcon;
            const isMediaGroup = group.group === "media";
            const isImageUpload =
              isMediaGroup && item.label === "画像をアップロード";

            if (isImageUpload && editorRef) {
              return (
                <ImageUploadButton
                  key={item.label}
                  editorRef={editorRef}
                  className="h-7 w-7 p-0"
                  aria-label="画像をアップロード"
                />
              );
            }

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (
                        item.type === "heading" &&
                        onHeadingToggle &&
                        item.level
                      ) {
                        onHeadingToggle(item.level);
                      } else if (
                        item.type === "decoration" &&
                        onTextDecoration &&
                        item.decorationType
                      ) {
                        onTextDecoration(item.decorationType);
                      } else if (item.type === "insert" && item.text) {
                        insertText(item.text);
                      }
                    }}
                    className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-md"
                    aria-label={item.label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs font-medium">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })
        )}
      </div>
    </TooltipProvider>
  );
};

export { ToolbarButtons };
export default ToolbarButtons;
