import { ImageResponse } from 'next/og';
import { getPublishedProperty } from '../../../../../lib/data/public-site';
import { formatPrice, locationLabel } from '../../../../../lib/publication/snapshot';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Property page preview';
export const dynamic = 'force-dynamic';

/**
 * Generated card for chat apps.
 *
 * WhatsApp and iMessage fetch this themselves, so it must render without a session and
 * without JavaScript: exactly the record's approved values, nothing else.
 */
export default async function Image({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params;
  const data = await getPublishedProperty(username, slug);

  const title = data?.snapshot.title ?? 'Property unavailable';
  const place = data ? locationLabel(data.snapshot) : '';
  const business = data?.site.businessName ?? 'LAREI';
  const price = data ? formatPrice(data.snapshot.price) : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0e1512',
          color: '#fffdf8',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#c9f26e',
              color: '#22380c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {business.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ fontSize: 24, letterSpacing: -0.5 }}>{business}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 66, lineHeight: 1.05, letterSpacing: -2, maxWidth: 940 }}>{title}</div>
          <div style={{ fontSize: 28, color: 'rgba(255,253,248,0.66)', display: 'flex', gap: 18 }}>
            <span>{place}</span>
            {price ? <span>·</span> : null}
            {price ? <span>{price}</span> : null}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,253,248,0.14)',
            paddingTop: 26,
            fontSize: 22,
            color: 'rgba(255,253,248,0.55)',
          }}
        >
          <span>Published with LAREI</span>
          <span>orvnlabs.com</span>
        </div>
      </div>
    ),
    size,
  );
}
