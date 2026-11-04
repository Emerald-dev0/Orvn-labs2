import { AwsClient } from 'aws4fetch';
import { serverEnv } from './env';

/**
 * Object storage (Cloudflare R2, S3 API).
 *
 * Buckets are private. Nothing is ever served from a predictable public URL: the only way
 * bytes leave storage is through /api/media/[...key], which checks release state first.
 *
 * The presigned URL below is created server-side and used immediately; it is never handed to
 * a browser.
 */

let client: AwsClient | null = null;

function credentials() {
  const env = serverEnv();
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET) {
    return null;
  }
  return {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
  };
}

export function storageConfigured(): boolean {
  return credentials() !== null;
}

function getClient(): AwsClient {
  if (!client) {
    const creds = credentials();
    if (!creds) throw new Error('Object storage is not configured.');
    client = new AwsClient({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      service: 's3',
      region: 'auto',
    });
  }
  return client;
}

/** Fetches an object by key for streaming back through an authorised route. */
export async function fetchObject(key: string): Promise<Response | null> {
  const creds = credentials();
  if (!creds) return null;

  const url = new URL(
    `https://${creds.accountId}.r2.cloudflarestorage.com/${creds.bucket}/${encodeURI(key)}`,
  );

  // Signed for a single server-side fetch, then discarded. No browser ever sees this URL.
  const signed = await getClient().sign(new Request(url.toString(), { method: 'GET' }), {
    aws: { signQuery: true },
  });

  const response = await fetch(signed.url, { method: 'GET' });
  return response.ok ? response : null;
}

export function storageKeyFor(workspaceId: string, filename: string): string {
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .slice(-80);
  const id = crypto.randomUUID();
  return `w/${workspaceId}/${id}/${safe}`;
}
