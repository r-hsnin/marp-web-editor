/**
 * Toast通知システムの型定義
 */

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  INFINITE: Infinity,
} as const;

export type ToastDuration =
  (typeof TOAST_DURATION)[keyof typeof TOAST_DURATION];

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

export interface ToastUpdateOptions {
  type?: "success" | "error" | "info";
  duration?: number;
  description?: string;
}

export interface SonnerToastSystem {
  success: (
    message: string,
    options?: Record<string, unknown>
  ) => string | number;
  error: (
    message: string,
    options?: Record<string, unknown>
  ) => string | number;
  info: (message: string, options?: Record<string, unknown>) => string | number;
  warning: (
    message: string,
    options?: Record<string, unknown>
  ) => string | number;
  loading: (
    message: string,
    options?: Record<string, unknown>
  ) => string | number;
  message: (
    message: string,
    options?: Record<string, unknown>
  ) => string | number;
  dismiss: (toastId?: string | number) => void;
}
