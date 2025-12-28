import { LocalStorage } from './local.js';

export type ResolveResult =
  | { type: 'file'; path: string }
  | { type: 'redirect'; url: string }
  | null;

export interface ImageStorage {
  upload(file: File): Promise<{ id: string; url: string }>;
  resolve(id: string): Promise<ResolveResult>;
}

export type StorageType = 'local' | 's3';

const storageType = (Bun.env.IMAGE_STORAGE || 'local') as StorageType;

async function createStorage(): Promise<ImageStorage> {
  if (storageType === 's3') {
    if (!Bun.env.S3_BUCKET || !Bun.env.S3_REGION) {
      throw new Error('S3_BUCKET and S3_REGION are required when IMAGE_STORAGE=s3');
    }
    const { S3Storage } = await import('./s3.js');
    return new S3Storage();
  }
  return new LocalStorage();
}

export const storage = await createStorage();
