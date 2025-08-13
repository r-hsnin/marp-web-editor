/**
 * エラー表示システムの型定義
 */

export const DISPLAY_TYPES = {
  TOAST_ONLY: "TOAST_ONLY",
  PERSISTENT_ONLY: "PERSISTENT_ONLY",
  BOTH: "BOTH",
} as const;

export type DisplayType = (typeof DISPLAY_TYPES)[keyof typeof DISPLAY_TYPES];

export const DISPLAY_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  INFINITE: Infinity,
} as const;

export type DisplayDuration =
  (typeof DISPLAY_DURATION)[keyof typeof DISPLAY_DURATION];

export interface ToastOptions {
  id?: string;
  duration?: number;
  description?: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DisplayOptions {
  duration?: number;
  description?: string;
  type?: "success" | "error" | "info";
}

export interface DisplayStats {
  totalDisplayed: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}
