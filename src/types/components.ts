/**
 * 共通コンポーネント型定義
 * UIコンポーネント全体で使用される基本的な型定義
 */

import React from "react";

// 基本コンポーネントProps
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// エディタ関連Props
export interface EditorProps extends BaseComponentProps {
  markdown: string;
  onChange: (value: string) => void;
  onInsert?: (text: string) => void;
}

// テーマ関連Props
export interface ThemeProps {
  isDark: boolean;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

// モバイルレスポンシブProps
export interface MobileResponsiveProps {
  mobileTab: "editor" | "preview";
  onMobileTabChange: (tab: "editor" | "preview") => void;
}

// 共通イベントハンドラー型
export type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
export type ChangeHandler = (
  event: React.ChangeEvent<HTMLInputElement>
) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// 共通状態型
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | null;
  errorMessage?: string;
}

// フォーム関連型
export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// モーダル・ダイアログ関連型
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// リスト・選択関連型
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ListItemProps {
  id: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (id: string) => void;
}
