import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import type { ImageStorage } from './index.js';

const UPLOADS_DIR = resolve(process.cwd(), 'uploads');

export class LocalStorage implements ImageStorage {
  private initialized = false;

  private async ensureDir() {
    if (this.initialized) return;
    await mkdir(UPLOADS_DIR, { recursive: true });
    this.initialized = true;
  }

  async upload(file: File): Promise<{ id: string; url: string }> {
    await this.ensureDir();

    const ext = file.name.split('.').pop() || 'png';
    const id = `${uuidv4()}.${ext}`;
    const filePath = join(UPLOADS_DIR, id);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return { id, url: `/api/images/${id}` };
  }

  getPath(id: string): string | null {
    // セキュリティ: パストラバーサル防止
    if (id.includes('..') || id.includes('/') || id.includes('\\')) {
      return null;
    }
    return join(UPLOADS_DIR, id);
  }
}
