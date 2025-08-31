/**
 * Marpレンダリングエンジン
 */

import { Marp } from "@marp-team/marp-core";
import type { MarpSettings, MarpTheme } from "../settings/settingsTypes";
import { FrontmatterProcessor } from "../settings/frontmatterProcessor";
import { MarpValidator } from "./marpValidator";

export class MarpRenderer {
  private static marpInstance: Marp | null = null;

  /**
   * Marpインスタンスを取得（シングルトン）
   */
  static getMarpInstance(): Marp {
    if (!this.marpInstance) {
      try {
        this.marpInstance = new Marp({
          html: true,
          emoji: {
            shortcode: true,
            unicode: true,
          },
          math: "katex",
        });
      } catch (error) {
        throw new Error(
          `Marp Core initialization failed: ${(error as Error).message}`
        );
      }
    }
    return this.marpInstance;
  }

  /**
   * Markdownをレンダリング
   */
  static async renderMarkdown(
    markdown: string,
    theme: string,
    settings: MarpSettings
  ): Promise<{ html: string; css: string }> {
    // バリデーション
    if (!MarpValidator.validateMarkdown(markdown)) {
      throw new Error("Invalid markdown content");
    }

    const validatedTheme = await MarpValidator.validateTheme(theme);
    const validatedSettings = MarpValidator.validateSettings(settings);

    // カスタムテーマの読み込み
    await this.ensureThemeLoaded(validatedTheme);

    // フロントマター処理
    const { content, hasManualFrontmatter } =
      FrontmatterProcessor.extractFrontmatter(markdown);

    let finalMarkdown: string;

    if (hasManualFrontmatter) {
      // 手動フロントマターがある場合はそのまま使用
      finalMarkdown = markdown;
    } else {
      // UI設定からフロントマターを生成
      const fullSettings: MarpSettings = {
        ...validatedSettings,
        theme: validatedTheme as MarpTheme,
      };
      const generatedFrontmatter =
        FrontmatterProcessor.generateFrontmatter(fullSettings);
      finalMarkdown = content
        ? `${generatedFrontmatter}\n\n${content}`
        : generatedFrontmatter;
    }

    // レンダリング実行
    try {
      const marp = this.getMarpInstance();
      const { html, css } = marp.render(finalMarkdown);

      return { html, css };
    } catch (error) {
      throw new Error(`Rendering failed: ${(error as Error).message}`);
    }
  }

  /**
   * カスタムテーマが読み込まれていることを確認
   */
  private static async ensureThemeLoaded(theme: string): Promise<void> {
    // 組み込みテーマの場合は何もしない
    const builtInThemes = ["default", "gaia", "uncover"];
    if (builtInThemes.includes(theme)) {
      return;
    }

    try {
      // カスタムテーマのCSS取得
      const response = await fetch("/api/themes");

      if (!response.ok) {
        throw new Error(
          `Themes API failed: ${response.status} ${response.statusText}`
        );
      }

      const themes = await response.json();

      const customTheme = themes.find(
        (t: { name: string; fileName?: string; isBuiltIn: boolean }) =>
          t.name === theme && !t.isBuiltIn && t.fileName
      );

      if (!customTheme) {
        throw new Error(
          `Custom theme "${theme}" not found in available themes`
        );
      }

      if (customTheme?.fileName) {
        const cssResponse = await fetch(`/api/themes/${customTheme.fileName}`);

        if (!cssResponse.ok) {
          throw new Error(
            `Theme CSS fetch failed: ${cssResponse.status} ${cssResponse.statusText}`
          );
        }

        const css = await cssResponse.text();

        // Marp Coreにテーマを追加
        const marp = this.getMarpInstance();
        marp.themeSet.add(css);
      }
    } catch (error) {
      // エラー時は詳細ログと通知
      console.error(`Failed to load custom theme "${theme}":`, error);

      if (typeof window !== "undefined") {
        const { toast } = await import("sonner");
        toast.error(
          `カスタムテーマ "${theme}" の読み込みに失敗しました。デフォルトテーマを使用します。`,
          {
            description: error instanceof Error ? error.message : String(error),
          }
        );
      }
    }
  }

  /**
   * Marpインスタンスをリセット（テスト用）
   */
  static resetInstance(): void {
    this.marpInstance = null;
  }
}
