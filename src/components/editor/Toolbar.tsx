"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
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
import { AIButtons } from "@/components/ai/AIButtons";
import { TemplateDropdown } from "@/components/templates/TemplateDropdown";
import type { EditorRef } from "@/components/layout/layoutTypes";

// 型定義
interface ToolbarProps {
  onInsert?: (text: string) => void;
  onHeadingToggle?: (level: number) => void;
  onTextDecoration?: (decorationType: string) => void;
  editorRef?: EditorRef; // 画像アップロード差し替え用（任意）
  // AI機能用の追加プロパティ
  currentMarkdown?: string;
  onMarkdownChange?: (markdown: string) => void;
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
  currentMarkdown = "",
  onMarkdownChange,
}) => {
  const insertText = (text: string): void => {
    if (onInsert) {
      onInsert(text);
    }
  };

  const toolbarItems: ToolbarGroup[] = [
    {
      group: "templates",
      items: [
        {
          icon: "custom",
          label: "テンプレート",
          type: "custom",
          render: () => (
            <TemplateDropdown
              currentMarkdown={currentMarkdown}
              onMarkdownChange={onMarkdownChange || (() => {})}
            />
          ),
        },
      ],
    },
    {
      group: "editor",
      items: [
        {
          icon: FileText,
          label: "新しいスライド",
          text: "\n---\n\n# 新しいスライド\n\n",
          type: "insert",
        },
        { icon: Heading1, label: "見出し1", level: 1, type: "heading" },
        { icon: Heading2, label: "見出し2", level: 2, type: "heading" },
        {
          icon: Bold,
          label: "太字",
          decorationType: "bold",
          type: "decoration",
        },
        {
          icon: Italic,
          label: "斜体",
          decorationType: "italic",
          type: "decoration",
        },
        {
          icon: Code,
          label: "コード",
          decorationType: "code",
          type: "decoration",
        },
        {
          icon: List,
          label: "箇条書き",
          text: "- リスト項目",
          type: "insert",
        },
        {
          icon: ListOrdered,
          label: "番号付きリスト",
          text: "1. リスト項目",
          type: "insert",
        },
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
        {/* ツールバーボタン */}
        {toolbarItems.map((group, groupIndex) => (
          <React.Fragment key={group.group}>
            {group.items.map((item) => {
              const Icon = item.icon as LucideIcon;
              const isMediaGroup = group.group === "editor";
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

              // カスタムレンダリング対応
              if (item.type === "custom" && item.render) {
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <div>{item.render()}</div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs font-medium">{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
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
            })}

            {/* グループ間のセパレーター */}
            {groupIndex < toolbarItems.length - 1 && (
              <Separator orientation="vertical" className="h-4 mx-1" />
            )}
          </React.Fragment>
        ))}

        {/* AI機能ボタン */}
        {onMarkdownChange && (
          <>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <AIButtons
              currentMarkdown={currentMarkdown}
              onMarkdownChange={onMarkdownChange}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export { ToolbarButtons };
export default ToolbarButtons;
