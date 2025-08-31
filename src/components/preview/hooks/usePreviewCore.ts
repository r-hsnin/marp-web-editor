import { useCallback } from "react";
import { useMarpCore } from "@/lib/marp";
import type { MarpSettings } from "@/types/marp";

/**
 * Preview core functionality hook
 * Handles Marp rendering, content management, and error handling
 */
export interface UsePreviewCoreProps {
  markdown: string;
  theme?: string;
  settings?: MarpSettings;
}

export interface UsePreviewCoreReturn {
  // Marp core data
  html: string;
  css: string;
  isLoading: boolean;
  renderTime: number;

  // Retry functionality
  handleRetry: () => void;
}

/**
 * Core preview functionality hook
 * Manages Marp rendering and content processing
 */
export default function usePreviewCore({
  markdown,
  theme,
  settings = {
    theme: "default",
    paginate: true,
    header: "",
    footer: "",
  },
}: UsePreviewCoreProps): UsePreviewCoreReturn {
  // useMarpCoreフックでクライアントサイドレンダリング（フロントマター設定を含む）
  const { html, css, isLoading, renderTime } = useMarpCore(
    markdown,
    theme || "default",
    settings
  );

  // リトライ機能（将来の拡張用）
  const handleRetry = useCallback((): void => {
    // 現在のuseMarpCoreフックは自動的に再試行するため、
    // ここでは単純にページリロードまたは状態リセットを行う
    window.location.reload();
  }, []);

  return {
    // Marp core data
    html,
    css,
    isLoading,
    renderTime,

    // Retry functionality
    handleRetry,
  };
}
