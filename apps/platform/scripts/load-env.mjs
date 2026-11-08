/**
 * A tiny .env loader for the scripts that are not run by Next.
 *
 * Next loads `.env.local` and `.env` by itself, from the directory holding next.config.mjs
 * (apps/platform). Plain `node scripts/*.mjs` does not, and drizzle-kit only reads `.env`
 * through `dotenv/config` — which is why `npm run db:status` would report "No DATABASE_URL"
 * while the app worked perfectly.
 *
 * Precedence, highest first:
 *   1. the real environment (a shell export, or Vercel)
 *   2. .env.local
 *   3. .env
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/;

function parse(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    const match = LINE.exec(raw);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue;
    // Quotes protect spaces and trailing whitespace; anything else is taken literally,
    // because passwords legitimately contain "#" and spaces.
    if (value.startsWith('"') && value.endsWith('"') && value.length > 1) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'") && value.length > 1) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

/** Loads .env.local then .env from `dir` without overwriting anything already set. */
export function loadEnv(dir = process.cwd()) {
  const loaded = [];
  for (const file of ['.env.local', '.env']) {
    let text;
    try {
      text = readFileSync(resolve(dir, file), 'utf8');
    } catch {
      continue;
    }
    for (const [key, value] of Object.entries(parse(text))) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
    loaded.push(file);
  }
  return loaded;
}

loadEnv();
