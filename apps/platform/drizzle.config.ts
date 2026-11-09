import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Next reads .env.local; drizzle-kit's usual dotenv import only reads .env. Load both so the
// commands in docs/neon-setup.md work with the file pattern the rest of the app uses.
config({ path: ['.env.local', '.env'], quiet: true });

const databaseUrl = (process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL || '').trim();

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Migrations are DDL, so the direct string wins over the pooled one; `npm run db:migrate`
    // makes the same choice. An empty value counts as unset — a half-filled .env.local otherwise
    // sends drizzle-kit at a placeholder host, where it fails without saying so.
    url: databaseUrl || 'postgresql://set-DATABASE_URL-and-retry@localhost:0/none',
  },
  verbose: true,
  strict: true,
});
