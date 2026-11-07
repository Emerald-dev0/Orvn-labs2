import { getPublishedProperty } from '../../../../../../lib/data/public-site';
import { renderDealSheet } from '../../../../../../lib/print/sheet';

/**
 * The deal sheet, as a printable document.
 *
 * It is served from the property's own route so the release check is the same one the page uses:
 * if the page is unpublished, withdrawn or never existed, there is no sheet either. No draft data
 * can reach it, because the only input is the stored publication snapshot.
 *
 * Format is print-first HTML rather than a binary PDF so the document is generated from the same
 * snapshot as the page, needs no renderer in the runtime, and stays selectable and searchable.
 */

export const dynamic = 'force-dynamic';

const HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'x-robots-tag': 'noindex, nofollow',
  'cache-control': 'private, no-store, max-age=0',
};

export async function GET(request: Request, { params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params;
  const data = await getPublishedProperty(username, slug);

  if (!data) {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const origin = new URL(request.url).origin;
  const pageUrl = `${origin}/w/${username}/p/${slug}`;

  const html = renderDealSheet(
    data.snapshot,
    {
      businessName: data.site.businessName,
      username,
      contactEmail: data.site.contactEmail ?? null,
    },
    pageUrl,
  );

  return new Response(html, { headers: HEADERS });
}
