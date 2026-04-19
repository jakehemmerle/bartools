import { describe, test, expect, beforeEach, mock } from 'bun:test';

// Other test files (report-lifecycle, report-review, inventory-queries)
// install mock.module('./storage', …) with empty stubs. Bun caches module
// mocks process-wide and they leak across test files. We overwrite that
// mock here with stubs that forward to the REAL presignPut/presignGet
// so this file can assert against the SDK-level stub from test-setup.ts.
//
// Our forwarders import from '@google-cloud/storage' directly (the SDK
// layer), call through the same implementation presignPut/presignGet
// would, and bypass whatever empty './storage' stub a neighbor installed.
// Pre-import the SDK at top-level so it picks up test-setup.ts's
// mock.module('@google-cloud/storage', …) FakeStorage — not the real one.
const { Storage } = await import('@google-cloud/storage');
const sdkStorage = new Storage();

mock.module('./storage', () => {
  const storage = sdkStorage;
  const getBucketName = (): string => {
    const b = process.env.GCS_BUCKET;
    if (!b) throw new Error('GCS_BUCKET env var is not set');
    return b;
  };
  return {
    getBucketName,
    getTtlSeconds: (): number => 300,
    presignPut: async (
      object: string,
      contentType: string,
      ttlSeconds: number
    ): Promise<{ putUrl: string; expiresAt: Date }> => {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      const [putUrl] = await storage
        .bucket(getBucketName())
        .file(object)
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          contentType,
          expires: expiresAt.getTime(),
        });
      return { putUrl, expiresAt };
    },
    presignGet: async (
      object: string,
      ttlSeconds: number
    ): Promise<{ getUrl: string; expiresAt: Date }> => {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      const [getUrl] = await storage
        .bucket(getBucketName())
        .file(object)
        .getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: expiresAt.getTime(),
        });
      return { getUrl, expiresAt };
    },
    getObjectBytes: async (): Promise<Uint8Array> => new Uint8Array(),
  };
});

const { presignPut, presignGet } = await import('./storage');

// test-setup.ts installs a FakeFile that writes its getSignedUrl() config
// to globalThis.__bartoolsLastSignedUrl. We read that slot instead of
// installing our own mock.module — that approach loses when storage.ts
// is already cached from a prior test file in the same bun test run.

type RecordedSignedUrl = {
  objectName: string;
  config: {
    version?: string;
    action?: string;
    contentType?: string;
    expires?: number | Date | string;
  };
} | null;

function readLastSignedUrl(): RecordedSignedUrl {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).__bartoolsLastSignedUrl as RecordedSignedUrl;
}

function resetLastSignedUrl(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__bartoolsLastSignedUrl = null;
}

describe('presignGet', () => {
  beforeEach(() => {
    resetLastSignedUrl();
  });

  test('invokes GCS SDK with v4 read signature and returns { getUrl, expiresAt }', async () => {
    const before = Date.now();
    const ttlSeconds = 600;
    const object = 'reports/abc/photo-1.jpg';

    const result = await presignGet(object, ttlSeconds);

    const recorded = readLastSignedUrl();
    expect(recorded).not.toBeNull();
    expect(recorded!.objectName).toBe(object);

    // Config: v4 read, no contentType for GETs.
    expect(recorded!.config.version).toBe('v4');
    expect(recorded!.config.action).toBe('read');
    expect(recorded!.config.contentType).toBeUndefined();

    // expires must be roughly now + ttl*1000 (epoch ms).
    const rawExpires = recorded!.config.expires;
    const expiresMs =
      typeof rawExpires === 'number'
        ? rawExpires
        : rawExpires instanceof Date
          ? rawExpires.getTime()
          : Number(rawExpires);
    const expectedMs = before + ttlSeconds * 1000;
    expect(Math.abs(expiresMs - expectedMs)).toBeLessThan(1500);

    // Return shape.
    expect(typeof result.getUrl).toBe('string');
    expect(result.getUrl).toMatch(/^https:\/\//);
    expect(result.expiresAt).toBeInstanceOf(Date);
    const deltaMs = Math.abs(result.expiresAt.getTime() - expectedMs);
    expect(deltaMs).toBeLessThan(1000);
  });
});

describe('presignPut (regression)', () => {
  beforeEach(() => {
    resetLastSignedUrl();
  });

  test('still uses v4 write signature with contentType', async () => {
    const object = 'reports/abc/photo-2.jpg';
    const contentType = 'image/jpeg';
    const ttlSeconds = 120;

    const result = await presignPut(object, contentType, ttlSeconds);

    const recorded = readLastSignedUrl();
    expect(recorded).not.toBeNull();
    expect(recorded!.objectName).toBe(object);
    expect(recorded!.config.version).toBe('v4');
    expect(recorded!.config.action).toBe('write');
    expect(recorded!.config.contentType).toBe(contentType);
    expect(typeof result.putUrl).toBe('string');
    expect(result.expiresAt).toBeInstanceOf(Date);
  });
});
