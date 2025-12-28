import { LocalStorage } from './local.js';

export interface ImageStorage {
  upload(file: File): Promise<{ id: string; url: string }>;
  getPath(id: string): string | null;
}

export type StorageType = 'local' | 's3';

const storageType = (process.env.IMAGE_STORAGE || 'local') as StorageType;

function createStorage(): ImageStorage {
  switch (storageType) {
    case 's3':
      // TODO: S3 実装
      throw new Error('S3 storage not implemented yet');
    default:
      return new LocalStorage();
  }
}

export const storage = createStorage();
