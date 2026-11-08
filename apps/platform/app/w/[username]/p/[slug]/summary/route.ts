import { getPublishedProperty } from '../../../../../../lib/data/public-site';
import { renderBuyerSummary } from '../../../../../../lib/print/sheet';

/**
 * The buyer summary: the same published facts as plain text, built to be pasted into a message.
 *
 * Plain text on purpose. A forwarded WhatsApp message or a pasted email should not carry markup,
 * and a summary that survives being pasted is more use than a file nobody opens.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params;
  const data = await getPublishedProperty(username, slug);

  if (!data) {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const origin = new URL(request.url).origin;
  const text = renderBuyerSummary(
    data.snapshot,
    {
      businessName: data.site.businessName,
      username,
      contactEmail: data.site.contactEmail ?? null,
    },
    `${origin}/w/${username}/p/${slug}`,
  );

  return new Response(text, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
      'cache-control': 'private, no-store, max-age=0',
    },
  });
}
