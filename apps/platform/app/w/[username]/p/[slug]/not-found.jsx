import Link from 'next/link';

/**
 * The page a visitor gets when a property was unpublished, archived or never existed.
 *
 * It deliberately reveals nothing: not the title, not the owner, not whether the record is
 * a draft. "Gone" and "never existed" look identical, which is the point.
 */
export const metadata = {
  title: 'Property unavailable',
  robots: { index: false, follow: false },
};

export default function PropertyUnavailable() {
  return (
    <div className="pub">
      <main id="main" className="pub-wrap">
        <div className="pub-empty-site">
          <p className="pub-eyebrow" style={{ justifyContent: 'center' }}>Not available</p>
          <h1 className="pub-title" style={{ fontSize: 'clamp(28px, 5vw, 40px)', marginTop: 10 }}>
            This property page is no longer public
          </h1>
          <p className="pub-lede" style={{ margin: '16px auto 0' }}>
            It may have been unpublished, or the link may be incomplete. Nothing about the record
            is shown here.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
            <Link className="pub-btn is-dark" href="/">Go to ORVN Labs</Link>
            <Link className="pub-btn" href="/early-access">Request access</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
