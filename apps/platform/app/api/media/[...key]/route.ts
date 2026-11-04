import { authoriseMediaRequest } from '@/lib/media';
import { fetchObject, storageConfigured } from '@/lib/storage';

/**
 * The only route that can emit a stored file.
 *
 * It answers 404 for private, unpublished and unknown keys alike: a buyer cannot tell a
 * deleted document from one that never existed, and a guessed object key is worthless.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const storageKey = key.join('/');

  const decision = await authoriseMediaRequest(storageKey);
  if (!decision.allowed) {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!storageConfigured()) {
    console.warn('[media] storage is not configured; refusing to serve', { storageKey });
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  const object = await fetchObject(decision.key);
  if (!object?.body) {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': decision.contentType,
      'Content-Length': object.headers.get('content-length') ?? '',
      'Cache-Control': 'private, max-age=60',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    },
  });
}
