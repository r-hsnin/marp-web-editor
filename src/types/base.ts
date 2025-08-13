/**
 * 基本的な共通型定義
 * 複数の機能で使用される基盤型を定義
 */

// 基本的なJSON型
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// 安全なRecord型（any型の代替）
export type SafeRecord<T = JSONValue> = Record<string, T>;

// エラーコンテキスト用の型
export type ErrorContext = SafeRecord<string | number | boolean>;

// ログコンテキスト用の型
export type LogContext = SafeRecord<string | number | boolean>;

// 基本的なエンティティ型
export type ID = string;
export type Timestamp = Date;

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ページネーション関連の型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// HTTP関連の基本型
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type ContentType =
  | "application/json"
  | "text/plain"
  | "text/html"
  | "application/pdf";

// 非同期処理結果の型
export interface AsyncResult<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// バリデーション結果の型
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}
