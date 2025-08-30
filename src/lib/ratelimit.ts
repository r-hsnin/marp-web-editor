// ===================================================================
// レート制限設定
// ===================================================================

/**
 * メモリベースのレート制限実装
 * 本番環境ではUpstash Redisの使用を推奨
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class MemoryRateLimit {
  private store = new Map<string, RateLimitEntry>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  async check(
    identifier: string
  ): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // エントリが存在しないか、ウィンドウが過ぎている場合
    if (!entry || now > entry.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { success: true, remaining: this.limit - 1 };
    }

    // 制限に達している場合
    if (entry.count >= this.limit) {
      return { success: false, remaining: 0 };
    }

    // カウントを増加
    entry.count++;
    this.store.set(identifier, entry);

    return { success: true, remaining: this.limit - entry.count };
  }

  // 定期的なクリーンアップ（メモリリーク防止）
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// ===================================================================
// レート制限インスタンス
// ===================================================================

// ワンショット修正: 1分間に10回
export const oneshotRateLimit = new MemoryRateLimit(10, 60 * 1000);

// エージェント型チャット: 1分間に15回
export const agentRateLimit = new MemoryRateLimit(15, 60 * 1000);

// 全体制限: 1分間に20回
export const globalRateLimit = new MemoryRateLimit(20, 60 * 1000);

// ===================================================================
// ユーティリティ関数
// ===================================================================

/**
 * IPアドレスを取得
 */
export function getClientIP(request: Request): string {
  // Vercel/Netlifyなどのプラットフォーム対応
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded && forwarded.length > 0) {
    const firstIP = forwarded.split(",")[0];
    return firstIP ? firstIP.trim() : "anonymous";
  }

  if (realIP && realIP.length > 0) {
    return realIP;
  }

  return "anonymous";
}

/**
 * レート制限チェック
 */
export async function checkRateLimit(
  rateLimit: MemoryRateLimit,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  return await rateLimit.check(identifier);
}

// 定期クリーンアップ（5分ごと）
if (typeof window === "undefined") {
  setInterval(
    () => {
      oneshotRateLimit.cleanup();
      agentRateLimit.cleanup();
      globalRateLimit.cleanup();
    },
    5 * 60 * 1000
  );
}
