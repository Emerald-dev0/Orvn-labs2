import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadEnv } from '../scripts/load-env.mjs';

/**
 * The scripts are plain node, so they load env themselves. This guards the three behaviours the
 * docs depend on: .env.local is found, it beats .env, and a real environment variable beats both.
 */

const touched = new Set<string>();
function setVar(key: string, value: string | undefined) {
  touched.add(key);
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

afterEach(() => {
  for (const key of touched) delete process.env[key];
  touched.clear();
});

function fixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'orrei-env-'));
  for (const [name, contents] of Object.entries(files)) writeFileSync(join(dir, name), contents);
  return dir;
}

describe('loadEnv', () => {
  it('reads .env.local, which plain node scripts would otherwise miss', () => {
    const dir = fixture({ '.env.local': 'DATABASE_URL=postgres://local\n' });
    loadEnv(dir);
    expect(process.env.DATABASE_URL).toBe('postgres://local');
  });

  it('prefers .env.local over .env', () => {
    const dir = fixture({ '.env.local': 'MAIL_FROM=ORREI <hello@local>\n', '.env': 'MAIL_FROM=old@example.com\n' });
    loadEnv(dir);
    expect(process.env.MAIL_FROM).toBe('ORREI <hello@local>');
  });

  it('never overwrites an exported variable', () => {
    setVar('CALDER_API_KEY', 'from-shell');
    const dir = fixture({ '.env.local': 'CALDER_API_KEY=from-file\n' });
    loadEnv(dir);
    expect(process.env.CALDER_API_KEY).toBe('from-shell');
  });

  it('keeps quotes out of the value, and leaves # alone', () => {
    const dir = fixture({ '.env.local': 'A="quoted value"\nB=p@ss#word\n# COMMENTED=no\n' });
    loadEnv(dir);
    expect(process.env.A).toBe('quoted value');
    expect(process.env.B).toBe('p@ss#word');
    expect(process.env.COMMENTED).toBeUndefined();
  });

  it('does nothing when the files are absent', () => {
    const dir = fixture({});
    expect(() => loadEnv(dir)).not.toThrow();
  });
});
