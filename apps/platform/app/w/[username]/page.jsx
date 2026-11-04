import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicSite, listPortfolio } from '../../../lib/data/public-site';

export const dynamic = 'force-dynamic';

function mediaUrl(key) {
  return key ? `/api/media/${key}` : null;
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const site = await getPublicSite(username);
  if (!site) {
    return { title: 'Site unavailable', robots: { index: false, follow: false } };
  }

  const title = `${site.businessName} · Property portfolio`;
  const description =
    site.headline ??
    site.bio?.slice(0, 180) ??
    `${site.businessName} publishes property records and deal pages with LAREI.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/w/${site.username}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/w/${site.username}`,
      siteName: site.businessName,
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function PublicSitePage({ params }) {
  const { username } = await params;
  const site = await getPublicSite(username);
  if (!site) notFound();

  const portfolio = await listPortfolio(site.workspaceId);
  const markets = Array.isArray(site.markets) ? site.markets.slice(0, 6) : [];

  return (
    <div className="pub">
      <header className="pub-bar">
        <div className="pub-wrap pub-bar-inner">
          <Link href={`/w/${site.username}`} className="pub-brand">
            <span className="pub-mark" aria-hidden="true">
              {initials(site.businessName) || 'L'}
            </span>
            {site.businessName}
          </Link>
          {site.contactEmail ? (
            <a className="pub-cta" href={`mailto:${site.contactEmail}`}>
              Get in touch
            </a>
          ) : null}
        </div>
      </header>

      <main id="main">
        <section className="pub-hero">
          <div className="pub-wrap">
            <div className="pub-hero-body" style={{ paddingTop: 0 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="pub-eyebrow">
                  {markets.length > 0 ? <span>{markets.join(' · ')}</span> : <span>Property</span>}
                </div>
                <h1 className="pub-title">{site.headline ?? site.businessName}</h1>
                {site.bio ? <p className="pub-lede">{site.bio}</p> : null}
                <div className="pub-hero-actions">
                  {site.contactEmail ? (
                    <a className="pub-btn is-dark" href={`mailto:${site.contactEmail}`}>
                      Email {site.businessName}
                    </a>
                  ) : null}
                  {portfolio.length > 0 ? (
                    <a className="pub-btn" href="#portfolio">
                      View {portfolio.length} {portfolio.length === 1 ? 'property' : 'properties'}
                    </a>
                  ) : null}
                </div>
              </div>

              {site.coverKey ? (
                <div className="pub-hero-media" style={{ aspectRatio: '4 / 3' }}>
                  <img src={mediaUrl(site.coverKey)} alt="" />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="pub-section" id="portfolio">
          <div className="pub-wrap">
            <div className="pub-section-head">
              <h2 className="pub-h2">Portfolio</h2>
              <span className="pub-h2-note">
                {portfolio.length > 0 ? `${portfolio.length} published` : 'Nothing published yet'}
              </span>
            </div>

            {portfolio.length === 0 ? (
              <div
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-md)',
                  padding: '28px 24px',
                  display: 'grid',
                  gap: 8,
                  maxWidth: 520,
                }}
              >
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.02em' }}>
                  No published properties yet
                </strong>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
                  {site.businessName} publishes property pages here as they are approved. Nothing
                  is shown until the owner releases it.
                </p>
              </div>
            ) : (
              <div className="pub-portfolio">
                {portfolio.map((card) => (
                  <Link key={card.slug} href={`/w/${site.username}/p/${card.slug}`} className="pub-card">
                    {card.coverKey ? (
                      <img src={mediaUrl(card.coverKey)} alt="" loading="lazy" />
                    ) : (
                      <div className="pub-card-empty">Photo on request</div>
                    )}
                    <div className="pub-card-body">
                      <span className="pub-card-title">{card.title}</span>
                      <span className="pub-card-meta">
                        <span>{card.location || 'Location on request'}</span>
                        <span>·</span>
                        <span style={{ textTransform: 'capitalize' }}>{card.availability}</span>
                      </span>
                      {card.priceLabel ? <span className="pub-card-price">{card.priceLabel}</span> : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {Array.isArray(site.services) && site.services.length > 0 ? (
          <section className="pub-section" style={{ paddingTop: 0 }}>
            <div className="pub-wrap">
              <div className="pub-section-head">
                <h2 className="pub-h2">How we work</h2>
              </div>
              <div className="pub-portfolio">
                {site.services.slice(0, 3).map((service) => (
                  <div
                    key={service.title}
                    style={{
                      background: 'var(--white)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-md)',
                      padding: '20px',
                      display: 'grid',
                      gap: 6,
                    }}
                  >
                    <strong style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                      {service.title}
                    </strong>
                    <span style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>
                      {service.body}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="pub-footer">
        <div className="pub-wrap pub-footer-inner">
          <span>
            {site.businessName}
            {markets.length > 0 ? ` · ${markets.join(' · ')}` : ''}
          </span>
          <span>
            Property details are supplied by the seller’s representative and are not independently
            verified.
          </span>
          <span>
            Published with LAREI · <Link href="/">ORVN Labs</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
