/**
 * カスタムテーマCSS取得API
 */

import { NextRequest, NextResponse } from "next/server";
import { getThemeCSS } from "@/lib/themes";

interface RouteParams {
  params: Promise<{ fileName: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { fileName } = await params;
    const css = await getThemeCSS(fileName);

    // 開発環境ではキャッシュ無効、本番環境では短時間キャッシュ
    const cacheControl =
      process.env.NODE_ENV === "development"
        ? "no-cache, no-store, must-revalidate"
        : "public, max-age=300"; // 5分キャッシュ

    return new NextResponse(css, {
      headers: {
        "Content-Type": "text/css",
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    console.error("Failed to get theme CSS:", error);
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }
}
