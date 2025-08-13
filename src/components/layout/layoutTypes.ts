/**
 * Layout関連の型定義
 */

import React from "react";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import type { MarpSettings } from "@/types/marp";

// 再エクスポート
export type { MarpSettings };

// モバイルタブの型
export type MobileTab = "editor" | "preview";

// 表示モードの型
export type ViewMode = "single" | "overview";

// ナビゲーションアクションの型
export type NavigationAction = "prev" | "next";

// スライド情報の型
export interface SlideInfo {
  totalSlides: number;
  currentSlideIndex: number;
  viewMode: ViewMode;
  hasNextSlide: boolean;
  hasPrevSlide: boolean;
  handleViewModeChange: ((mode: ViewMode) => void) | null;
  handleSlideNavigation: ((action: NavigationAction) => void) | null;
}

// Marp設定の型は@/types/marpからインポート

// エディタ参照の型
export type EditorRef = React.RefObject<ReactCodeMirrorRef>;

// 基本的なイベントハンドラーの型
export type MarkdownChangeHandler = (value: string) => void;
export type InsertTextHandler = (text: string) => void;
export type HeadingToggleHandler = () => void;
export type TextDecorationHandler = (decoration: string) => void;
export type MobileTabChangeHandler = (tab: MobileTab) => void;
export type SlideInfoChangeHandler = (info: SlideInfo) => void;

// フロントマター処理関数の型
export type GetDisplayMarkdownHandler = (markdown: string) => string;
export type GetRenderMarkdownHandler = (markdown: string) => string;

// メインレイアウトのProps
export interface MarpEditorLayoutProps {
  markdown: string;
  isDark: boolean;
  selectedTheme: string;
  mobileTab: MobileTab;
  editorRef: EditorRef;
  onMarkdownChange: MarkdownChangeHandler;
  onInsertText: InsertTextHandler;
  onHeadingToggle: HeadingToggleHandler;
  onTextDecoration: TextDecorationHandler;
  onMobileTabChange: MobileTabChangeHandler;
  getDisplayMarkdown?: GetDisplayMarkdownHandler;
  getRenderMarkdown?: GetRenderMarkdownHandler;
  marpSettings?: MarpSettings;
}

// エディタペインのProps
export interface EditorPaneProps {
  displayMarkdown: string;
  isDark: boolean;
  editorRef: EditorRef;
  onMarkdownChange: MarkdownChangeHandler;
  // Toolbar関連のprops（テスト用）
  onInsertText: InsertTextHandler;
  onHeadingToggle: HeadingToggleHandler;
  onTextDecoration: TextDecorationHandler;
}

// プレビューペインのProps
export interface PreviewPaneProps {
  renderMarkdown: string;
  selectedTheme: string;
  isDark: boolean;
  mobileTab: MobileTab;
  marpSettings: MarpSettings;
  onSlideInfoChange: SlideInfoChangeHandler;
  slideInfo: SlideInfo;
}

// デスクトップレイアウトのProps
export interface DesktopLayoutProps {
  displayMarkdown: string;
  renderMarkdown: string;
  isDark: boolean;
  selectedTheme: string;
  mobileTab: MobileTab;
  editorRef: EditorRef;
  marpSettings: MarpSettings;
  onMarkdownChange: MarkdownChangeHandler;
  onSlideInfoChange: SlideInfoChangeHandler;
  slideInfo: SlideInfo;
  // Toolbar関連のprops（テスト用）
  onInsertText: InsertTextHandler;
  onHeadingToggle: HeadingToggleHandler;
  onTextDecoration: TextDecorationHandler;
}

// モバイルレイアウトのProps
export interface MobileLayoutProps {
  displayMarkdown: string;
  renderMarkdown: string;
  isDark: boolean;
  selectedTheme: string;
  mobileTab: MobileTab;
  marpSettings: MarpSettings;
  onMarkdownChange: MarkdownChangeHandler;
  onMobileTabChange: MobileTabChangeHandler;
  onSlideInfoChange: SlideInfoChangeHandler;
}

// レイアウト状態管理の型
export interface LayoutState {
  slideInfo: SlideInfo;
  handleSlideInfoChange: SlideInfoChangeHandler;
}
