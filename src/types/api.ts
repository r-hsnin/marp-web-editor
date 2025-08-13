/**
 * API関連の共通型定義
 */

import type { SafeRecord } from "./base";

// API共通レスポンス型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// API共通エラー型
export interface ApiError {
  code: string;
  message: string;
  details?: SafeRecord;
  statusCode: number;
}

// HTTP ステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// API リクエスト共通型
export interface ApiRequest {
  headers?: Record<string, string>;
  params?: SafeRecord;
  query?: SafeRecord;
}

// Marp Export API 型
export interface MarpExportRequest extends ApiRequest {
  markdown: string;
  theme: string;
  format: "html" | "pdf" | "pptx" | "png" | "jpeg";
  settings: {
    paginate: boolean;
    header: string;
    footer: string;
  };
}

export interface MarpExportResponse
  extends ApiResponse<{
    content: string | Buffer;
    filename: string;
    mimeType: string;
  }> {}

// Marp Render API 型
export interface MarpRenderRequest extends ApiRequest {
  markdown: string;
  theme: string;
  settings: {
    paginate: boolean;
    header: string;
    footer: string;
  };
}

export interface MarpRenderResponse
  extends ApiResponse<{
    html: string;
    css: string;
    slides: Array<{
      id: string;
      content: string;
      notes?: string;
    }>;
  }> {}

// Share API 型
export interface ShareCreateRequest extends ApiRequest {
  markdown: string;
  theme: string;
  password?: string;
  expiresIn?: number; // hours
}

export interface ShareCreateResponse
  extends ApiResponse<{
    shareId: string;
    shareUrl: string;
    expiresAt: string;
  }> {}

export interface ShareGetResponse
  extends ApiResponse<{
    markdown: string;
    theme: string;
    createdAt: string;
    expiresAt: string;
  }> {}

// 共有プレゼンテーション型（Prismaモデルベース）
export interface SharedPresentationData {
  id: string;
  shareId: string;
  title: string | null;
  markdown: string;
  theme: string;
  hasPassword: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
}

// パスワード認証リクエスト型
export interface SharePasswordRequest extends ApiRequest {
  password: string;
}

// 共有プレゼンテーション取得レスポンス型
export interface SharePresentationResponse
  extends ApiResponse<{
    presentation: SharedPresentationData;
    operationId: string;
    processingTime: number;
  }> {}

// Image Upload API 型
export interface ImageUploadRequest extends ApiRequest {
  // FormData with 'image' field
}

export interface ImageUploadResponse
  extends ApiResponse<{
    imageId: string;
    filename: string;
    size: number;
    mimeType: string;
    storedName?: string;
  }> {}

export interface ImageUploadError {
  error: string;
  code:
    | "FILE_TOO_LARGE"
    | "INVALID_TYPE"
    | "UPLOAD_FAILED"
    | "NO_FILE"
    | "VALIDATION_ERROR"
    | "NETWORK_ERROR"
    | "TIMEOUT_ERROR"
    | "PLACEHOLDER_ERROR";
}

// アップロード画像データ型（Prismaモデルベース）
export interface UploadedImageData {
  id: string;
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}
