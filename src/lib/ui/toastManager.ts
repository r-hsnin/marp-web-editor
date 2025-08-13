/**
 * 汎用Toast通知管理システム
 */

import type {
  ToastOptions,
  ToastUpdateOptions,
  SonnerToastSystem,
} from "./toastTypes";
import { TOAST_DURATION } from "./toastTypes";

export class ToastManager {
  private static toastSystem: SonnerToastSystem | null = null;
  private static isLoading = false;

  /**
   * Toast表示システムを初期化
   */
  static async initialize(): Promise<void> {
    if (this.toastSystem || this.isLoading) return;

    this.isLoading = true;
    try {
      if (typeof window !== "undefined") {
        const { toast } = await import("sonner");
        this.toastSystem = toast;
      }
    } catch (error) {
      console.warn("Failed to load toast system:", error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 成功Toastを表示
   */
  static async showSuccess(
    message: string,
    options: Partial<ToastOptions> = {}
  ): Promise<void> {
    await this.initialize();

    if (!this.toastSystem) {
      console.log(`Success: ${message}`);
      return;
    }

    this.toastSystem.success(message, {
      duration: options.duration || TOAST_DURATION.MEDIUM,
      description: options.description,
      dismissible: true,
      ...options,
    });
  }

  /**
   * エラーToastを表示
   */
  static async showError(
    message: string,
    options: Partial<ToastOptions> = {}
  ): Promise<void> {
    await this.initialize();

    if (!this.toastSystem) {
      console.warn(`Error: ${message}`);
      return;
    }

    this.toastSystem.error(message, {
      duration: options.duration || TOAST_DURATION.LONG,
      description: options.description,
      dismissible: true,
      ...options,
    });
  }

  /**
   * 情報Toastを表示
   */
  static async showInfo(
    message: string,
    options: Partial<ToastOptions> = {}
  ): Promise<void> {
    await this.initialize();

    if (!this.toastSystem) {
      console.info(`Info: ${message}`);
      return;
    }

    this.toastSystem.info(message, {
      duration: options.duration || TOAST_DURATION.MEDIUM,
      description: options.description,
      dismissible: true,
      ...options,
    });
  }

  /**
   * 警告Toastを表示
   */
  static async showWarning(
    message: string,
    options: Partial<ToastOptions> = {}
  ): Promise<void> {
    await this.initialize();

    if (!this.toastSystem) {
      console.warn(`Warning: ${message}`);
      return;
    }

    this.toastSystem.warning(message, {
      duration: options.duration || TOAST_DURATION.MEDIUM,
      description: options.description,
      dismissible: true,
      ...options,
    });
  }

  /**
   * ローディングToastを表示
   */
  static async showLoading(
    message: string,
    options: Partial<ToastOptions> = {}
  ): Promise<string | number | null> {
    await this.initialize();

    if (!this.toastSystem) {
      console.log(`Loading: ${message}`);
      return null;
    }

    return this.toastSystem.loading(message, {
      id: options.id,
      description: options.description,
      dismissible: false,
    });
  }

  /**
   * Toastを更新
   */
  static async updateToast(
    toastId: string,
    message: string,
    options: ToastUpdateOptions = {}
  ): Promise<void> {
    await this.initialize();

    if (!this.toastSystem) {
      console.log(`Update: ${message}`);
      return;
    }

    const updateOptions = {
      id: toastId,
      duration: options.duration,
      description: options.description,
    };

    switch (options.type) {
      case "success":
        this.toastSystem.success(message, updateOptions);
        break;
      case "error":
        this.toastSystem.error(message, updateOptions);
        break;
      case "info":
        this.toastSystem.info(message, updateOptions);
        break;
      default:
        this.toastSystem.message(message, updateOptions);
    }
  }

  /**
   * 特定のToastを削除
   */
  static async dismiss(toastId?: string): Promise<void> {
    await this.initialize();

    if (this.toastSystem?.dismiss) {
      this.toastSystem.dismiss(toastId);
    }
  }

  /**
   * 全てのToastを削除
   */
  static async dismissAll(): Promise<void> {
    await this.dismiss();
  }
}
