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

    const validatedTheme = MarpValidator.validateTheme(theme);
    const validatedSettings = MarpValidator.validateSettings(settings);

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
   * Marpインスタンスをリセット（テスト用）
   */
  static resetInstance(): void {
    this.marpInstance = null;
  }
}
