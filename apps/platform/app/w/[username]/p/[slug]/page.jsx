import Link from 'next/link';
import { SIZES, aspectRatio, mediaUrl, srcSetFor } from '@/lib/images';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { headers } from 'next/headers';
import { getPublishedProperty } from '../../../../../lib/data/public-site';
import { formatPrice, locationLabel } from '../../../../../lib/publication/snapshot';
import { isLikelyBot, recordPropertyView, visitorHash } from '../../../../../lib/analytics';
import { randomToken } from '../../../../../lib/crypto';
import InquiryForm from './InquiryForm';
import CopySummary from './CopySummary';

export const dynamic = 'force-dynamic';

function humanise(key) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bApn\b/, 'APN');
}

export async function generateMetadata({ params }) {
  const { username, slug } = await params;
  const data = await getPublishedProperty(username, slug);

  if (!data) {
    return {
      title: 'Property unavailable',
      robots: { index: false, follow: false },
    };
  }

  const { snapshot, site, listed } = data;
  const place = [snapshot.place.city, snapshot.place.region].filter(Boolean).join(', ');
  const title = `${snapshot.title}${place ? ` — ${place}` : ''}`;
  const description =
    snapshot.description?.slice(0, 200) ??
    `${snapshot.title}${place ? ` in ${place}` : ''}. Details, photos and a direct inquiry route.`;
  const cover = snapshot.media[0]?.key;

  return {
    title: { absolute: `${title} · ${site.businessName}` },
    description,
    alternates: { canonical: `/w/${site.username}/p/${snapshot.slug}` },
    // Link-only pages are unlisted, not confidential: keep them out of indexes, keep the page open.
    robots: listed ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/w/${site.username}/p/${snapshot.slug}`,
      siteName: site.businessName,
      images: cover
        ? [{ url: `/api/media/${cover}`, alt: snapshot.title }]
        : [{ url: `/w/${site.username}/p/${snapshot.slug}/opengraph-image`, width: 1200, height: 630, alt: snapshot.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cover ? [`/api/media/${cover}`] : [`/w/${site.username}/p/${snapshot.slug}/opengraph-image`],
    },
  };
}

export default async function PublicPropertyPage({ params }) {
  const { username, slug } = await params;
  const data = await getPublishedProperty(username, slug);
  if (!data) notFound();

  const { snapshot, site } = data;
  const cover = snapshot.media[0]?.key ?? null;
  const gallery = snapshot.media.slice(1, 7);
  const price = formatPrice(snapshot.price);
  const requestToken = randomToken(16);

  // Counting happens after the response is flushed: a metrics failure never costs a page.
  after(async () => {
    try {
      const headerList = await headers();
      const forwarded = headerList.get('x-forwarded-for') ?? '';
      const ip = headerList.get('cf-connecting-ip') ?? forwarded.split(',')[0]?.trim() ?? null;
      const userAgent = headerList.get('user-agent');
      await recordPropertyView({
        username,
        slug,
        visitorHash: await visitorHash(ip, userAgent ?? null),
        referrer: headerList.get('referer'),
        isBot: isLikelyBot(userAgent),
      });
    } catch (error) {
      console.error('[analytics] view not recorded', { message: error.message });
    }
  });

  return (
    <div className="pub">
      <header className="pub-bar">
        <div className="pub-wrap pub-bar-inner">
          <Link href={`/w/${site.username}`} className="pub-brand">
            <span className="pub-mark" aria-hidden="true">
              {site.businessName.slice(0, 1).toUpperCase()}
            </span>
            {site.businessName}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href={`/w/${site.username}`} className="pub-bar-link">
              All properties
            </Link>
            <a className="pub-cta" href="#inquire">
              Ask a question
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="pub-hero">
          <div className="pub-wrap">
            <div className="pub-hero-media">
              {cover ? (
                <img
                  src={mediaUrl(cover, { width: 960 })}
                  srcSet={srcSetFor(cover)}
                  sizes={SIZES.hero}
                  alt={snapshot.title}
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="pub-hero-empty">No photo published for this property</div>
              )}
            </div>

            <div className="pub-hero-body">
              <div style={{ display: 'grid', gap: 14 }}>
                <div className="pub-eyebrow">
                  <span className={`pub-badge ${snapshot.availability === 'available' ? '' : 'is-quiet'}`}>
                    {snapshot.availability}
                  </span>
                  <span>{locationLabel(snapshot)}</span>
                </div>
                <h1 className="pub-title">{snapshot.title}</h1>
                {snapshot.description ? <p className="pub-lede">{snapshot.description}</p> : null}
              </div>

              <div className="pub-hero-side">
                {price ? <span className="pub-price">{price}</span> : null}
                {snapshot.price.visibility === 'on_request' ? (
                  <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                    The seller answers pricing questions directly.
                  </span>
                ) : null}
                <a className="pub-btn is-dark" href="#inquire" style={{ width: '100%' }}>
                  Ask about this property
                </a>
                {site.contactEmail ? (
                  <a className="pub-btn" href={`mailto:${site.contactEmail}`} style={{ width: '100%' }}>
                    Email {site.businessName}
                  </a>
                ) : null}

                <div className="pub-take">
                  <a
                    className="pub-take-link"
                    href={`/w/${site.username}/p/${snapshot.slug}/sheet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Deal sheet
                    <span>print or save as PDF</span>
                  </a>
                  <CopySummary summaryUrl={`/w/${site.username}/p/${snapshot.slug}/summary`} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {snapshot.facts.length > 0 ? (
          <section className="pub-section">
            <div className="pub-wrap">
              <div className="pub-section-head">
                <h2 className="pub-h2">Property facts</h2>
                <span className="pub-h2-note">Approve-and-publish only</span>
              </div>
              <dl className="pub-facts">
                {snapshot.facts.map((fact) => (
                  <div className="pub-fact" key={fact.key}>
                    <dt>{humanise(fact.key)}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
                Values the seller has not confirmed are left out, not guessed. A missing field means
                unknown, not “none”.
              </p>
            </div>
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section className="pub-section" style={{ paddingTop: 0 }}>
            <div className="pub-wrap">
              <div className="pub-section-head">
                <h2 className="pub-h2">Photos</h2>
                <span className="pub-h2-note">{snapshot.media.length} published</span>
              </div>
              <div className="pub-gallery">
                {gallery.map((item) => (
                  <img
                    key={item.key}
                    src={mediaUrl(item.key, { width: 960, sourceWidth: item.width })}
                    srcSet={srcSetFor(item.key, { sourceWidth: item.width })}
                    sizes={SIZES.galleryThird}
                    width={item.width || undefined}
                    height={item.height || undefined}
                    style={{ aspectRatio: aspectRatio(item.width, item.height) }}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="pub-section" style={{ paddingTop: 0 }}>
          <div className="pub-wrap">
            <InquiryForm
              propertySlug={snapshot.slug}
              username={site.username}
              businessName={site.businessName}
              contactEmail={site.contactEmail}
              requestToken={requestToken}
            />
          </div>
        </section>
      </main>

      <footer className="pub-footer">
        <div className="pub-wrap pub-footer-inner">
          <span>{snapshot.disclaimer}</span>
          <span>
            Published {new Date(snapshot.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
            Unpublishing removes this page and its files.
          </span>
          <span>
            <Link href={`/w/${site.username}`}>{site.businessName}</Link> · Published with ORVN Labs ·{' '}
            <Link href="/">ORVN Labs</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
