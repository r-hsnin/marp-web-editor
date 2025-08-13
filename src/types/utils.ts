/**
 * ユーティリティ型定義
 */

// 条件付き型
export type ConditionalProps<T extends boolean> = T extends true
  ? { required: string }
  : { optional?: string };

// 部分的な型の作成
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 必須プロパティの抽出
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// オプショナルプロパティの抽出
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// 型安全なキーの取得
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// 関数の型
export type AsyncFunction<T = void, P extends unknown[] = []> = (
  ...args: P
) => Promise<T>;
export type SyncFunction<T = void, P extends unknown[] = []> = (
  ...args: P
) => T;

// イベントハンドラーの型
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// ストレージ関連の型
export type StorageValue<T> = T | null;
export type StorageSerializer<T> = {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
};

// リトライ関連の型
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: "linear" | "exponential";
  retryIf: (error: Error) => boolean;
}

// 型ガード関数の型
export type TypeGuard<T> = (value: unknown) => value is T;

// 型安全なオブジェクトのマージ
export type Merge<T, U> = Omit<T, keyof U> & U;

// 配列の要素型を取得
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Promise の解決型を取得
export type Awaited<T> = T extends Promise<infer U> ? U : T;
