import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import type { ImageStorage, ResolveResult } from './index.js';

// index.ts で起動時チェック済み
const bucket = Bun.env.S3_BUCKET as string;
const region = Bun.env.S3_REGION as string;
const baseUrl = Bun.env.APP_BASE_URL || 'http://localhost:3001';

const s3Client = new S3Client({ region });

export class S3Storage implements ImageStorage {
  async upload(file: File): Promise<{ id: string; url: string }> {
    const ext = file.name.split('.').pop() || 'png';
    const id = `${uuidv4()}.${ext}`;
    const key = `uploads/${id}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return { id, url: `${baseUrl}/api/images/${id}` };
  }

  async resolve(id: string): Promise<ResolveResult> {
    // セキュリティ: パストラバーサル防止
    if (id.includes('..') || id.includes('/') || id.includes('\\')) {
      return null;
    }

    const key = `uploads/${id}`;
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return { type: 'redirect', url };
  }
}
