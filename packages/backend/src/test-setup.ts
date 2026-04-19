import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeEach, mock } from 'bun:test';
import { Pool } from 'pg';

const LIVE = process.env.TESTING_E2E_CALLS_REAL_VLM_API === 'true';

// Fake bucket so storage.getBucketName() doesn't throw in tests.
if (!process.env.GCS_BUCKET) {
  process.env.GCS_BUCKET = LIVE ? 'bartools-staging-photos' : 'bartools-test-bucket';
}

// Stub @google-cloud/storage at the SDK level so the real ./storage module
// runs unchanged against a fake client. Tests stage bytes under
// packages/backend/data/uploads/<object> before exercising inference;
// FakeFile.download() reads back from that path. In LIVE mode we skip the
// stub so uploads/downloads hit real GCS with ADC.
//
// FakeFile records the most recent getSignedUrl() call config on a shared
// globalThis slot so storage.test.ts can assert both PUT and GET paths
// without installing its own module mock (which loses on modules that
// were already imported before the test file ran).
type RecordedSignedUrl = {
  objectName: string;
  config: {
    version?: string;
    action?: string;
    contentType?: string;
    expires?: number | Date | string;
  };
} | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__bartoolsLastSignedUrl = null as RecordedSignedUrl;

if (!LIVE) {
  const UPLOAD_DIR = resolve(import.meta.dir, '../data/uploads');

  mock.module('@google-cloud/storage', () => {
    class FakeFile {
      constructor(public readonly name: string) {}
      async download(): Promise<[Buffer]> {
        const buf = await readFile(resolve(UPLOAD_DIR, this.name));
        return [buf];
      }
      async getSignedUrl(config?: {
        version?: string;
        action?: string;
        contentType?: string;
        expires?: number | Date | string;
      }): Promise<[string]> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).__bartoolsLastSignedUrl = {
          objectName: this.name,
          config: config ?? {},
        } as RecordedSignedUrl;
        return [`https://storage.googleapis.com/test/${this.name}`];
      }
      async delete(): Promise<void> {}
    }
    class FakeBucket {
      constructor(public readonly name: string) {}
      file(object: string): FakeFile {
        return new FakeFile(object);
      }
      async upload(): Promise<void> {}
    }
    class FakeStorage {
      bucket(name: string): FakeBucket {
        return new FakeBucket(name);
      }
    }
    return { Storage: FakeStorage };
  });
}

// Tests run against a dedicated `bartools_test` database on the same dev
// Postgres (docker-compose at localhost:5432). Isolation from dev data
// comes from the separate database, not a separate instance. DATABASE_URL
// must point at the main Postgres — we derive the test URL by swapping
// the database name.
const rootUrl = process.env.DATABASE_URL;
if (!rootUrl) {
  throw new Error('DATABASE_URL must be set (copy .env.example to .env).');
}

const TEST_DB_NAME = 'bartools_test';
const adminDbUrl = new URL(rootUrl);
adminDbUrl.pathname = '/postgres';
const testUrl = new URL(rootUrl);
testUrl.pathname = `/${TEST_DB_NAME}`;

// Drop and recreate the test database each run so drizzle-kit/api's
// pushSchema always sees an empty DB. pushSchema has known issues doing
// a proper diff against an existing schema — fresh is simplest and stays
// fast on a local Postgres (<100ms).
const t0 = Date.now();
const adminPool = new Pool({ connectionString: adminDbUrl.toString() });
try {
  await adminPool.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DB_NAME]
  );
  await adminPool.query(`DROP DATABASE IF EXISTS ${TEST_DB_NAME}`);
  await adminPool.query(`CREATE DATABASE ${TEST_DB_NAME}`);
} finally {
  await adminPool.end();
}

// Point the app's db at the freshly created test database before any module
// reads DATABASE_URL.
process.env.DATABASE_URL = testUrl.toString();

const [{ pushSchema }, schemaModule, { db, pool }] = await Promise.all([
  import('drizzle-kit/api'),
  import('./schema'),
  import('./db'),
]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const push = await pushSchema(schemaModule as unknown as Record<string, unknown>, db as any);
await push.apply();
console.error(`[test-setup] fresh ${TEST_DB_NAME} in ${Date.now() - t0}ms`);

// All tables truncated between tests for isolation. Individual tests that
// need bottle catalog rows call seedBottles() themselves.
const TRUNCATE_SQL = `
  TRUNCATE TABLE
    inference_attempts,
    inference_jobs,
    report_records,
    scans,
    reports,
    inventory,
    locations,
    venue_members,
    venues,
    users,
    bottles
  RESTART IDENTITY CASCADE
`;

beforeEach(async () => {
  await pool.query(TRUNCATE_SQL);
});

afterAll(async () => {
  await pool.end();
});
