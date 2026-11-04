import { authoriseMediaRequest } from '@/lib/media';
import { fetchObject, storageConfigured } from '@/lib/storage';
import { isImageKey, parseWidthParam, variantKeyFor } from '@/lib/images';

/**
 * The only route that can emit a stored file.
 *
 * It answers 404 for private, unpublished and unknown keys alike: a buyer cannot tell a
 * deleted document from one that never existed, and a guessed object key is worthless.
 *
 * `?w=480|960|1600` selects a pre-rendered WebP. The width is resolved against the stored
 * original, so authorisation always runs against the file the publisher actually owns — a
 * caller cannot address a rendition the release check has never seen.
 *
 * Cache policy: `private, no-cache` plus a strong ETag. Bytes are not reused without a
 * revalidation, which means withdrawing a publication reaches a browser on its very next
 * request instead of whenever a TTL happens to lapse. A revalidation costs one indexed row
 * read and no storage fetch.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NOT_FOUND = { 'Cache-Control': 'no-store' } as const;

function notFound() {
  return new Response(null, { status: 404, headers: NOT_FOUND });
}

export async function GET(request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const storageKey = key.join('/');

  let decision;
  try {
    decision = await authoriseMediaRequest(storageKey);
  } catch (error) {
    // A release check that cannot run is a refusal, never an error page: a 500 would tell a
    // caller that this key differs from the keys that 404.
    console.error('[media] authorisation failed', { message: (error as Error).message });
    return notFound();
  }
  if (!decision.allowed) return notFound();

  if (!storageConfigured()) {
    console.warn('[media] storage is not configured; refusing to serve', { storageKey });
    return notFound();
  }

  // A width on a PDF is ignored rather than rejected: documents have no renditions.
  const requested = parseWidthParam(new URL(request.url).searchParams.get('w'));
  const width = requested && isImageKey(decision.key) ? requested : null;
  const targetKey = width ? variantKeyFor(decision.key, width) : decision.key;
  const etag = `"${targetKey}"`;

  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag, 'Cache-Control': 'private, no-cache' },
    });
  }

  let object = await fetchObject(targetKey);
  let contentType = width ? 'image/webp' : decision.contentType;
  let servedEtag = etag;

  // Photos uploaded before renditions existed have none. Serving the original keeps old pages
  // working; the browser simply gets a larger file than it asked for.
  if (!object && width) {
    object = await fetchObject(decision.key);
    contentType = decision.contentType;
    // The tag follows the bytes, not the request, so a fallback is never cached as a rendition.
    servedEtag = `"${decision.key}"`;
  }

  if (!object?.body) return notFound();

  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': object.headers.get('content-length') ?? '',
      'Cache-Control': 'private, no-cache',
      ETag: servedEtag,
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    },
  });
}
