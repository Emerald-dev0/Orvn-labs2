import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Next reads .env.local; drizzle-kit's usual dotenv import only reads .env. Load both so the
// commands in docs/neon-setup.md work with the file pattern the rest of the app uses.
config({ path: ['.env.local', '.env'], quiet: true });

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
  verbose: true,
  strict: true,
});
