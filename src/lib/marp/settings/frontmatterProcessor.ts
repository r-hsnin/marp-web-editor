/**
 * フロントマター処理システム
 */

import type {
  FrontmatterExtraction,
  MarpSettings,
  ManualSettingsFlags,
} from "./settingsTypes";

export class FrontmatterProcessor {
  /**
   * Markdownからフロントマター部分を抽出
   */
  static extractFrontmatter(markdown: string): FrontmatterExtraction {
    try {
      if (!markdown || typeof markdown !== "string") {
        return {
          frontmatter: "",
          content: markdown || "",
          hasManualFrontmatter: false,
        };
      }

      const trimmedMarkdown = markdown.trim();

      // フロントマターの開始を確認
      if (!trimmedMarkdown.startsWith("---")) {
        return {
          frontmatter: "",
          content: markdown,
          hasManualFrontmatter: false,
        };
      }

      // 2番目の---を探す
      const lines = trimmedMarkdown.split("\n");
      let endIndex = -1;

      for (let i = 1; i < lines.length; i++) {
        if (lines[i]?.trim() === "---") {
          endIndex = i;
          break;
        }
      }

      if (endIndex === -1) {
        // 終了の---が見つからない場合
        console.warn(
          "Frontmatter opening found but no closing delimiter, treating as regular content"
        );
        return {
          frontmatter: "",
          content: markdown,
          hasManualFrontmatter: false,
        };
      }

      // フロントマターが空でないかチェック
      const frontmatterContent = lines.slice(1, endIndex);
      if (
        frontmatterContent.length === 0 ||
        frontmatterContent.every((line) => line.trim() === "")
      ) {
        console.warn("Empty frontmatter detected, treating as no frontmatter");
        return {
          frontmatter: "",
          content: markdown,
          hasManualFrontmatter: false,
        };
      }

      const frontmatterLines = lines.slice(0, endIndex + 1);
      const contentLines = lines.slice(endIndex + 1);

      return {
        frontmatter: frontmatterLines.join("\n"),
        content: contentLines.join("\n").trim(),
        hasManualFrontmatter: true,
      };
    } catch (error) {
      console.warn(
        "Failed to extract frontmatter, treating as regular content:",
        error
      );
      // エラー時は通常のコンテンツとして扱う
      return {
        frontmatter: "",
        content: markdown || "",
        hasManualFrontmatter: false,
      };
    }
  }

  /**
   * フロントマターYAMLを解析して手動設定を検出
   */
  static parseManualFrontmatter(markdown: string): ManualSettingsFlags {
    try {
      const { frontmatter, hasManualFrontmatter } =
        this.extractFrontmatter(markdown);

      if (!hasManualFrontmatter) {
        return {
          theme: false,
          paginate: false,
          header: false,
          footer: false,
        };
      }

      // 簡単なYAML解析（キー: 値の形式を検出）
      const manualDetected: ManualSettingsFlags = {
        theme: false,
        paginate: false,
        header: false,
        footer: false,
      };

      const lines = frontmatter.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();

        // コメント行や区切り行をスキップ
        if (trimmedLine.startsWith("#") || trimmedLine === "---") {
          continue;
        }

        // キー: 値の形式を検出
        const colonIndex = trimmedLine.indexOf(":");
        if (colonIndex > 0) {
          const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();

          // 設定キーの検出
          if (key === "theme") {
            manualDetected.theme = true;
          } else if (key === "paginate") {
            manualDetected.paginate = true;
          } else if (key === "header") {
            manualDetected.header = true;
          } else if (key === "footer") {
            manualDetected.footer = true;
          }
        }
      }

      return manualDetected;
    } catch (error) {
      console.warn("Failed to parse manual frontmatter:", error);
      return {
        theme: false,
        paginate: false,
        header: false,
        footer: false,
      };
    }
  }

  /**
   * 手動フロントマターから実際の設定値を抽出
   */
  static parseManualFrontmatterValues(markdown: string): Partial<MarpSettings> {
    try {
      const { frontmatter, hasManualFrontmatter } =
        this.extractFrontmatter(markdown);

      if (!hasManualFrontmatter) {
        return {};
      }

      const values: Record<string, unknown> = {};
      const lines = frontmatter.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();

        // コメント行や区切り行をスキップ
        if (trimmedLine.startsWith("#") || trimmedLine === "---") {
          continue;
        }

        // キー: 値の形式を解析
        const colonIndex = trimmedLine.indexOf(":");
        if (colonIndex > 0) {
          const key = trimmedLine.substring(0, colonIndex).trim().toLowerCase();
          const value = trimmedLine.substring(colonIndex + 1).trim();

          // 値の型変換とサニタイゼーション
          if (key === "theme") {
            values.theme = ["default", "gaia", "uncover"].includes(value)
              ? value
              : "default";
          } else if (key === "paginate") {
            values.paginate = value === "true";
          } else if (key === "header") {
            values.header = value.replace(/^['"]|['"]$/g, "").slice(0, 100);
          } else if (key === "footer") {
            values.footer = value.replace(/^['"]|['"]$/g, "").slice(0, 100);
          }
        }
      }

      return values;
    } catch (error) {
      console.warn("Failed to parse manual frontmatter values:", error);
      return {};
    }
  }

  /**
   * UI設定からフロントマターYAMLを生成
   */
  static generateFrontmatter(settings: MarpSettings): string {
    try {
      const frontmatterLines = ["---"];

      // marp: trueは常に含める
      frontmatterLines.push("marp: true");

      // テーマ設定
      if (settings.theme && settings.theme !== "default") {
        frontmatterLines.push(`theme: ${settings.theme}`);
      }

      // サイズ設定は16:9固定のため、フロントマターには含めない

      // ページネーション設定
      if (settings.paginate) {
        frontmatterLines.push("paginate: true");
      }

      // ヘッダー設定
      if (settings.header && settings.header.trim()) {
        const escapedHeader = settings.header.trim().replace(/'/g, "''");
        frontmatterLines.push(`header: '${escapedHeader}'`);
      }

      // フッター設定
      if (settings.footer && settings.footer.trim()) {
        const escapedFooter = settings.footer.trim().replace(/'/g, "''");
        frontmatterLines.push(`footer: '${escapedFooter}'`);
      }

      frontmatterLines.push("---");

      return frontmatterLines.join("\n");
    } catch (error) {
      console.warn("Failed to generate frontmatter:", error);
      return "---\nmarp: true\n---";
    }
  }

  /**
   * 手動設定とUI設定をマージしたフロントマターを生成
   */
  static generateMergedFrontmatter(
    manualValues: Partial<MarpSettings>,
    uiSettings: MarpSettings,
    manualFlags: ManualSettingsFlags
  ): string {
    const frontmatterLines = ["---"];

    // marp: trueは常に含める
    frontmatterLines.push("marp: true");

    // テーマ設定（手動設定優先）
    const theme = manualFlags.theme ? manualValues.theme : uiSettings.theme;
    if (theme && theme !== "default") {
      frontmatterLines.push(`theme: ${theme}`);
    }

    // サイズ設定は16:9固定のため処理しない

    // ページネーション設定（手動設定優先）
    const paginate = manualFlags.paginate
      ? manualValues.paginate
      : uiSettings.paginate;
    if (paginate) {
      frontmatterLines.push("paginate: true");
    }

    // ヘッダー設定（手動設定優先）
    const header = manualFlags.header ? manualValues.header : uiSettings.header;
    if (header && header.trim()) {
      const escapedHeader = header.trim().replace(/'/g, "''");
      frontmatterLines.push(`header: '${escapedHeader}'`);
    }

    // フッター設定（手動設定優先）
    const footer = manualFlags.footer ? manualValues.footer : uiSettings.footer;
    if (footer && footer.trim()) {
      const escapedFooter = footer.trim().replace(/'/g, "''");
      frontmatterLines.push(`footer: '${escapedFooter}'`);
    }

    frontmatterLines.push("---");

    return frontmatterLines.join("\n");
  }

  /**
   * エディタ表示用Markdown（フロントマター除去済み）
   */
  static getDisplayMarkdown(markdown: string): string {
    const { content } = this.extractFrontmatter(markdown);
    return content;
  }

  /**
   * レンダリング用Markdown（フロントマター付き）
   */
  static getRenderMarkdown(markdown: string, settings: MarpSettings): string {
    const { content, hasManualFrontmatter } = this.extractFrontmatter(markdown);

    if (hasManualFrontmatter) {
      // 手動フロントマターがある場合はそのまま使用
      return markdown;
    } else {
      // UI設定からフロントマターを生成
      const generatedFrontmatter = this.generateFrontmatter(settings);
      return content
        ? `${generatedFrontmatter}\n\n${content}`
        : generatedFrontmatter;
    }
  }
}
