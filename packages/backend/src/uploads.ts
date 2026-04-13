import { mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

export const uploadRoot = resolve(import.meta.dir, '../data/uploads');

function sanitizeExtension(name: string): string {
  const extension = extname(name).toLowerCase();
  return extension && extension.length <= 10 ? extension : '.jpg';
}

export async function saveUploadedPhoto(reportId: string, file: File): Promise<string> {
  await mkdir(uploadRoot, { recursive: true });

  const extension = sanitizeExtension(file.name);
  const filename = `${reportId}-${crypto.randomUUID()}${extension}`;
  const absolutePath = resolve(uploadRoot, filename);
  const bytes = new Uint8Array(await file.arrayBuffer());

  await writeFile(absolutePath, bytes);

  return `/uploads/${filename}`;
}

export function resolveUploadPathFromUrl(photoUrl: string): string {
  const pathname = photoUrl.startsWith('http') ? new URL(photoUrl).pathname : photoUrl;
  const filename = pathname.replace(/^\/uploads\//, '');
  return resolve(uploadRoot, filename);
}

