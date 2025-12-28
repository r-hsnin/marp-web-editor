import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import type { ImageStorage, ResolveResult } from './index.js';

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

  async resolve(id: string): Promise<ResolveResult> {
    // セキュリティ: パストラバーサル防止
    if (id.includes('..') || id.includes('/') || id.includes('\\')) {
      return null;
    }
    const filePath = join(UPLOADS_DIR, id);
    if (!existsSync(filePath)) {
      return null;
    }
    return { type: 'file', path: filePath };
  }
}
