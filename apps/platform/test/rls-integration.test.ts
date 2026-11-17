import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { Pool, neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';

/**
 * Black-box checks of the tenant boundary against a real database.
 *
 * Everything else in the suite asserts the shape of the policy file. This one asserts what the
 * database actually does: that a signed-in user from workspace A cannot read, update or guess
 * their way into workspace B, and that the public path sees only published rows.
 *
 * It runs ONLY when TEST_DATABASE_URL is set, and only against a throwaway database with
 * migrations and policies applied:
 *
 *   TEST_DATABASE_URL=postgresql://… npm test -- rls-integration
 *
 * The test creates two disposable users, two disposable workspaces and deletes them
 * afterwards. Never point it at production or at any database you cannot rebuild.
 */

neonConfig.webSocketConstructor = WebSocket as unknown as typeof globalThis.WebSocket;

const TEST_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_URL ? describe : describe.skip;
const TEST_HOST = TEST_URL ? new URL(TEST_URL).host : 'not set';

const pool = TEST_URL ? new Pool({ connectionString: TEST_URL, max: 2 }) : null;
const userA = `test-a-${randomUUID()}`;
const userB = `test-b-${randomUUID()}`;
const wsA = randomUUID();
const wsB = randomUUID();
const propDraftB = randomUUID();
const propPublishedA = randomUUID();
const mediaPrivateB = randomUUID();
const mediaPublicA = randomUUID();

async function seed(): Promise<void> {
  if (!pool) return;
  const sql = (text: string, params: unknown[] = []) => pool.query(text, params);

  await sql(
    `insert into "user" (id, name, email, email_verified) values ($1, 'Test A', $1 || '@example.test', true)`,
    [userA],
  );
  await sql(
    `insert into "user" (id, name, email, email_verified) values ($1, 'Test B', $1 || '@example.test', true)`,
    [userB],
  );
  await sql(
    `insert into workspaces (id, name, username, owner_id) values ($1, 'Workspace A', $1, $2)`,
    [wsA, userA],
  );
  await sql(
    `insert into workspaces (id, name, username, owner_id) values ($1, 'Workspace B', $1, $2)`,
    [wsB, userB],
  );
  await sql(
    `insert into memberships (id, workspace_id, user_id, role) values ($1, $2, $3, 'owner')`,
    [randomUUID(), wsA, userA],
  );
  await sql(
    `insert into memberships (id, workspace_id, user_id, role) values ($1, $2, $3, 'owner')`,
    [randomUUID(), wsB, userB],
  );
  await sql(
    `insert into professional_profiles (id, workspace_id, display_name, contact_email, published_at)
     values ($1, $2, 'Workspace A', 'a@example.test', now())`,
    [randomUUID(), wsA],
  );
  await sql(
    `insert into professional_profiles (id, workspace_id, display_name, contact_email)
     values ($1, $2, 'Workspace B', 'b@example.test')`,
    [randomUUID(), wsB],
  );
  await sql(
    `insert into properties (id, workspace_id, title, slug, property_type, city)
     values ($1, $2, 'Draft property', 'draft-1', 'residential_land', 'Testville')`,
    [propDraftB, wsB],
  );
  await sql(
    `insert into properties (id, workspace_id, title, slug, property_type, city,
       publication_status, published_at, rights_attested_at)
     values ($1, $2, 'Published property', 'published-1', 'residential_land', 'Testville',
       'published', now(), now())`,
    [propPublishedA, wsA],
  );
  await sql(
    `insert into property_media (id, property_id, storage_key, visibility, sort_order)
     values ($1, $2, $3, 'private', 1)`,
    [mediaPrivateB, propDraftB, `w/${wsB}/${randomUUID()}/secret.pdf`],
  );
  await sql(
    `insert into property_media (id, property_id, storage_key, visibility, sort_order)
     values ($1, $2, $3, 'public', 1)`,
    [mediaPublicA, propPublishedA, `w/${wsA}/${randomUUID()}/photo.jpg`],
  );
}

async function teardown(): Promise<void> {
  if (!pool) return;
  await pool.query(`delete from workspaces where id = $1 or id = $2`, [wsA, wsB]);
  await pool.query(`delete from "user" where id = $1 or id = $2`, [userA, userB]);
}

describeDb(`rls integration (TEST_DATABASE_URL=${TEST_HOST})`, () => {
  let tenant: typeof import('../lib/db/tenant');
  let media: typeof import('../lib/media');
  let schema: typeof import('../db/schema');
  let keys: { privateKey: string; publicKey: string };

  beforeAll(async () => {
    if (!TEST_URL) return;
    // Must be set before lib/db/pool is first imported.
    process.env.DATABASE_URL = TEST_URL;
    await seed();
    tenant = await import('../lib/db/tenant');
    media = await import('../lib/media');
    schema = await import('../db/schema');
    const [{ storageKey: privateKey }] = (
      await pool!.query(`select storage_key from property_media where id = $1`, [mediaPrivateB])
    ).rows;
    const [{ storageKey: publicKey }] = (
      await pool!.query(`select storage_key from property_media where id = $1`, [mediaPublicA])
    ).rows;
    keys = { privateKey, publicKey };
  }, 30_000);

  afterAll(async () => {
    try {
      await teardown();
    } finally {
      await pool?.end();
    }
  });

  it('a member of workspace A reads nothing from workspace B', async () => {
    const rows = await tenant.withUserDb(userA, async (tx) => {
      const result = await tx.query.properties.findMany();
      return result;
    });
    const leaked = rows.filter((row) => row.workspaceId === wsB);
    expect(leaked).toHaveLength(0);
  });

  it('a member of workspace A cannot update workspace B, even by guessed id', async () => {
    const updated = await tenant.withUserDb(userA, async (tx) => {
      const { properties } = schema;
      return tx
        .update(properties)
        .set({ title: 'Forged by another workspace' })
        .where(eq(properties.id, propDraftB))
        .returning({ id: properties.id });
    });
    expect(updated).toHaveLength(0);
  });

  it('the public path cannot see a draft or a private file row', async () => {
    const { properties, propertyMedia } = schema;
    const drafts = await tenant.withPublicDb(async (tx) =>
      tx.select({ id: properties.id }).from(properties).where(eq(properties.id, propDraftB)),
    );
    expect(drafts).toHaveLength(0);

    const privateMedia = await tenant.withPublicDb(async (tx) =>
      tx.select({ id: propertyMedia.id }).from(propertyMedia).where(eq(propertyMedia.id, mediaPrivateB)),
    );
    expect(privateMedia).toHaveLength(0);
  });

  it('the public path can see a published property and its public file', async () => {
    const { properties, propertyMedia } = schema;
    const published = await tenant.withPublicDb(async (tx) =>
      tx.select({ id: properties.id }).from(properties).where(eq(properties.id, propPublishedA)),
    );
    expect(published).toHaveLength(1);

    const publicMedia = await tenant.withPublicDb(async (tx) =>
      tx.select({ id: propertyMedia.id }).from(propertyMedia).where(eq(propertyMedia.id, mediaPublicA)),
    );
    expect(publicMedia).toHaveLength(1);
  });

  it('the media gate refuses a private file and serves a public one', async () => {
    const privateDecision = await media.authoriseMediaRequest(keys.privateKey);
    expect(privateDecision.allowed).toBe(false);

    const publicDecision = await media.authoriseMediaRequest(keys.publicKey);
    expect(publicDecision.allowed).toBe(true);
  });
});
