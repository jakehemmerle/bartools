import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env at the repo root, or export DATABASE_URL in your shell.'
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  dbCredentials: {
    url: databaseUrl,
  },
});
