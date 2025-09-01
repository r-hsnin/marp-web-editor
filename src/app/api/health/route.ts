import { NextResponse } from "next/server";

export async function GET() {
  try {
    // データベース接続確認
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "0.4.0",
    });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", error: "Database connection failed" },
      { status: 503 }
    );
  }
}
