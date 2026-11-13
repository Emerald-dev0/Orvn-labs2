import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import { useDocumentMeta } from '../../lib/seo';

const LEGAL_LINKS = [
  { label: 'Privacy policy', to: '/legal/privacy' },
  { label: 'Terms of use', to: '/legal/terms' },
  { label: 'AI disclosure', to: '/legal/ai-disclosure' },
  { label: 'Data retention', to: '/legal/data-retention' },
  { label: 'Acceptable use', to: '/legal/acceptable-use' },
  { label: 'Fair housing', to: '/legal/fair-housing' },
];

// Shared shell for legal pages. Pass a `sections` array of { heading, body } where body is JSX.
//
// IMPORTANT: All policies on this site are drafts pending review by counsel. The "Last updated"
// header makes that visible to readers; the underlying content is structured so a lawyer can edit
// in place rather than rewrite from scratch.
export default function LegalPage({ title, intro, sections, lastUpdated, path, description }) {
  useDocumentMeta({ title, description: description || intro?.slice(0, 160), path });
  const location = useLocation();

  return (
    <PageWrapper>
      <section className="page-hero" style={{ paddingBottom: 'clamp(24px,3vw,40px)' }}>
        <div className="shell">
          <div className="page-hero-grid">
            <div>
              <span className="eyebrow">Legal</span>
              <h1 className="page-title" style={{ fontSize: 'clamp(32px,4.8vw,64px)' }}>
                {title}
              </h1>
            </div>
            <div>
              {intro && <p className="page-lede">{intro}</p>}
              <p className="label-mono" style={{ marginTop: 16 }}>
                Last updated · {lastUpdated}
              </p>
            </div>
          </div>

          <div className="legal-notice">
            <strong>Draft policy — pending legal review.</strong> The intent and scope below
            represent ORVN Labs’ current operating practice. Final language will be confirmed with
            counsel before launch.
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(56px,8vw,104px)' }}>
        <div className="shell">
          <div className="legal-shell">
            <aside className="legal-nav">
              <span className="label-mono" style={{ marginBottom: 8 }}>
                Policies
              </span>
              {LEGAL_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className={location.pathname === l.to ? 'is-active' : ''}>
                  {l.label}
                </Link>
              ))}
            </aside>

            <div className="legal-body">
              {sections.map((s) => (
                <section key={s.heading}>
                  <h2>{s.heading}</h2>
                  <div>{s.body}</div>
                </section>
              ))}

              <div className="legal-foot">
                <span className="label-mono">Questions about this policy?</span>
                <a href="mailto:hello@orvnlabs.com" className="arrow-link">
                  hello@orvnlabs.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

/* Small inline primitives used by the individual policy pages. */
export const P = ({ children }) => <p>{children}</p>;

export const UL = ({ items }) => (
  <ul>
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);
