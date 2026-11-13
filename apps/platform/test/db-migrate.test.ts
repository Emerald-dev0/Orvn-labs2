import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * `npm run db:migrate` must never look like it succeeded when it did not.
 *
 * The whole reason `scripts/db-migrate.mjs` exists is that drizzle-kit is silent on success, so a
 * run that never opened a socket is indistinguishable from a run that applied six migrations. These
 * tests pin the two behaviours that make the wrapper worth having: it reports when there is nothing
 * to connect to, and it exits non-zero when the migration itself fails.
 *
 * Both cases are driven through a real child process, because the failure mode being tested lives in
 * process exit codes and stdout — exactly the part that cannot be unit-tested in-process.
 */

const script = fileURLToPath(new URL('../scripts/db-migrate.mjs', import.meta.url));

function run(args: string[], env: Record<string, string>) {
  return new Promise<{ code: number; out: string }>((resolve) => {
    execFile(
      process.execPath,
      [script, ...args],
      // A closed local port: no network, no credentials, no chance of touching a real database.
      { env: { ...process.env, DATABASE_URL: '', DATABASE_URL_ADMIN: '', ...env }, timeout: 20_000 },
      (error, stdout, stderr) => {
        resolve({ code: error ? Number((error as { code?: number }).code ?? 1) : 0, out: stdout + stderr });
      },
    );
  });
}

describe('db:migrate reports instead of going quiet', () => {
  it('says what is missing when no connection string is set', async () => {
    const { code, out } = await run([], {});
    expect(code).toBe(1);
    expect(out).toContain('No DATABASE_URL');
    expect(out).toContain('.env.local');
  });

  it('counts the migrations on disk before it connects', async () => {
    const { readFileSync } = await import('node:fs');
    const journal = JSON.parse(
      readFileSync(new URL('../db/migrations/meta/_journal.json', import.meta.url), 'utf8'),
    ) as { entries: unknown[] };
    const { out } = await run([], {});
    expect(out).toMatch(new RegExp(`migrations on disk\\s+${journal.entries.length} in db/migrations`));
  });

  it('fails loudly, and names the migration step, when the connection fails', async () => {
    const { code, out } = await run(['--dry'], {
      DATABASE_URL: 'postgresql://nobody:nothing@127.0.0.1:1/none',
    });
    expect(code).toBe(1);
    expect(out).toContain('MISS');
    expect(out).toContain('migration');
  });

  it('never prints the connection string it was given', async () => {
    const { out } = await run(['--dry'], {
      DATABASE_URL: 'postgresql://secret-user:secret-password@127.0.0.1:1/none',
    });
    expect(out).not.toContain('secret-password');
  });
});
