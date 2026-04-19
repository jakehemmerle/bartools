import { Storage } from '@google-cloud/storage';

// Singleton GCS client using Application Default Credentials.
// Local dev: `gcloud auth application-default login`.
// Cloud Run: ADC is supplied via the attached service account.
let cachedStorage: Storage | null = null;

function getStorage(): Storage {
  if (!cachedStorage) {
    cachedStorage = new Storage();
  }
  return cachedStorage;
}

export function getBucketName(): string {
  const bucket = process.env.GCS_BUCKET;
  if (!bucket) {
    throw new Error('GCS_BUCKET env var is not set');
  }
  return bucket;
}

export function getTtlSeconds(): number {
  const raw = process.env.GCS_PRESIGNED_PUT_TTL_SECONDS;
  if (!raw) return 300;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
}

// NOTE: the `contentType` passed at signing time must EXACTLY match the
// `Content-Type` header the client sends on PUT, or GCS rejects the upload.
export async function presignPut(
  object: string,
  contentType: string,
  ttlSeconds: number
): Promise<{ putUrl: string; expiresAt: Date }> {
  const bucket = getStorage().bucket(getBucketName());
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const [putUrl] = await bucket.file(object).getSignedUrl({
    version: 'v4',
    action: 'write',
    contentType,
    expires: expiresAt.getTime(),
  });

  return { putUrl, expiresAt };
}

// Mirrors presignPut but produces a read-only signed URL so clients (mobile)
// can GET the object over HTTPS. No contentType — GETs don't carry one.
export async function presignGet(
  object: string,
  ttlSeconds: number
): Promise<{ getUrl: string; expiresAt: Date }> {
  const bucket = getStorage().bucket(getBucketName());
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const [getUrl] = await bucket.file(object).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: expiresAt.getTime(),
  });

  return { getUrl, expiresAt };
}

export async function getObjectBytes(object: string): Promise<Uint8Array> {
  const bucket = getStorage().bucket(getBucketName());
  const [buffer] = await bucket.file(object).download();
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
