/**
 * カスタムテーマ管理機能
 */

import { promises as fs } from "fs";
import path from "path";
import type { CustomTheme, ThemeInfo } from "@/types/marp";
import { THEMES } from "@/lib/constants/marp";

const THEMES_DIR = path.join(process.cwd(), "public", "themes");

/**
 * CSS内容からテーマ名を抽出
 */
export function extractThemeName(css: string): string | null {
  const themeMatch = css.match(/\/\*\s*@theme\s+([^\s*]+)\s*\*\//);
  return themeMatch?.[1]?.trim() || null;
}

/**
 * テーマディレクトリをスキャンしてCSSファイル一覧を取得
 */
export async function scanThemeFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(THEMES_DIR);
    return files.filter((file) => file.endsWith(".css"));
  } catch {
    // ディレクトリが存在しない場合は空配列を返す
    return [];
  }
}

/**
 * テーマファイルを読み込んで解析
 */
export async function parseThemeFile(
  fileName: string
): Promise<CustomTheme | null> {
  try {
    // セキュリティ: ファイル名のサニタイゼーション
    const sanitizedFileName = path.basename(fileName);
    if (!sanitizedFileName.endsWith(".css")) {
      return null;
    }

    const filePath = path.join(THEMES_DIR, sanitizedFileName);
    const css = await fs.readFile(filePath, "utf-8");
    const themeName = extractThemeName(css);

    if (!themeName) {
      return null;
    }

    return {
      name: themeName,
      fileName: sanitizedFileName,
      css,
    };
  } catch {
    return null;
  }
}

/**
 * 利用可能なテーマ一覧を取得（組み込み + カスタム）
 */
export async function getAvailableThemes(): Promise<ThemeInfo[]> {
  // 組み込みテーマ
  const builtInThemes: ThemeInfo[] = THEMES.map((theme) => ({
    name: theme.value,
    displayName: theme.label,
    isBuiltIn: true,
  }));

  // カスタムテーマ
  const customThemes: ThemeInfo[] = [];
  try {
    const themeFiles = await scanThemeFiles();

    for (const fileName of themeFiles) {
      const customTheme = await parseThemeFile(fileName);
      if (customTheme) {
        customThemes.push({
          name: customTheme.name,
          displayName: customTheme.name,
          isBuiltIn: false,
          fileName: customTheme.fileName,
        });
      }
    }
  } catch {
    // エラー時はカスタムテーマなしで続行
  }

  return [...builtInThemes, ...customThemes];
}

/**
 * 指定されたカスタムテーマのCSS内容を取得
 */
export async function getThemeCSS(fileName: string): Promise<string> {
  try {
    // セキュリティ: ファイル名のサニタイゼーション
    const sanitizedFileName = path.basename(fileName);
    if (!sanitizedFileName.endsWith(".css")) {
      throw new Error("Invalid file extension");
    }

    const filePath = path.join(THEMES_DIR, sanitizedFileName);
    return await fs.readFile(filePath, "utf-8");
  } catch {
    throw new Error(`Failed to read theme file: ${fileName}`);
  }
}
