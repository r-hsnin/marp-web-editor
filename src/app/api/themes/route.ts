/**
 * テーマ一覧取得API
 */

import { NextResponse } from "next/server";
import { getAvailableThemes } from "@/lib/themes";
import type { ThemeInfo } from "@/types/marp";

export async function GET() {
  try {
    const themes: ThemeInfo[] = await getAvailableThemes();
    return NextResponse.json(themes);
  } catch (error) {
    console.error("Failed to get themes:", error);

    // エラー時は組み込みテーマのみ返す
    const fallbackThemes: ThemeInfo[] = [
      { name: "default", displayName: "Default", isBuiltIn: true },
      { name: "gaia", displayName: "Gaia", isBuiltIn: true },
      { name: "uncover", displayName: "Uncover", isBuiltIn: true },
    ];

    return NextResponse.json(fallbackThemes);
  }
}
