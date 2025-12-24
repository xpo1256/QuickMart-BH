import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || 'us-east-1';

let s3Client = null;
if (S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({ region: S3_REGION });
}

export async function uploadBufferToS3(buffer, key, contentType) {
  if (!s3Client) throw new Error('S3 not configured');
  const cmd = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });
  await s3Client.send(cmd);
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

export function ensureLocalStorageDirs() {
  const base = path.join(process.cwd(), 'storage');
  ['avatars', 'products'].forEach(dir => {
    const full = path.join(base, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  });
}

export function saveBufferToLocal(buffer, filename, subdir) {
  ensureLocalStorageDirs();
  const dir = path.join(process.cwd(), 'storage', subdir || 'products');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fullPath = path.join(dir, filename);
  fs.writeFileSync(fullPath, buffer);
  return `/storage/${subdir || 'products'}/${filename}`;
}
