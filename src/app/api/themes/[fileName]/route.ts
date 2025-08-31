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

    return new NextResponse(css, {
      headers: {
        "Content-Type": "text/css",
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("Failed to get theme CSS:", error);
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }
}
