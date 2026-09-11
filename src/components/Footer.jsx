import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Logo from './Logo';
import { PAS_LINKS } from '../lib/pas';

const COLS = [
  {
    title: 'Product',
    links: [
      { label: 'PAS — Performative AI Superstaff', to: '/pas' },
      // { label: 'Pricing', to: '/pricing' },
      // { label: 'Test PAS', to: '/demo' },
      { label: 'PAS Control Room', href: PAS_LINKS.controlRoom, external: true },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'Lead Leakage Scorecard', to: '/calculators/leakage' },
      { label: 'Revenue Calculator', to: '/calculators/revenue' },
      { label: 'All Calculators', to: '/calculate' },
    ],
  },
  {
    title: 'Insights',
    links: [
      { label: 'First-Contact Intelligence (Blog)', to: '/blog' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/legal/privacy' },
      { label: 'Terms of Use', to: '/legal/terms' },
      { label: 'AI / Call Recording Disclosure', to: '/legal/ai-disclosure' },
      { label: 'Data Retention Policy', to: '/legal/data-retention' },
      { label: 'Acceptable Use Policy', to: '/legal/acceptable-use' },
      { label: 'Fair Housing Compliance', to: '/legal/fair-housing' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: 'var(--background)',
        borderTop: '1px solid var(--line)',
        padding: 'var(--space-lg) 0 36px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container-page">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 40,
            marginBottom: 64,
          }}
        >
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32 }}>
            <div style={{ marginBottom: 8, minWidth: 0 }}>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Logo size={32} />
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                  ORVN <span style={{ color: 'var(--primary)' }}>Labs</span>
                </span>
              </Link>
              <p style={{ color: 'var(--ink-mid)', fontSize: 14, lineHeight: 1.6, maxWidth: 280, margin: 0, fontFamily: 'var(--font-body)' }}>
                Brokerage intelligence infrastructure. PAS controls what happens between inquiry and qualified appointment.
              </p>
              <a
                href="mailto:hello@orvnlabs.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 20,
                  fontSize: 13.5,
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}
              >
                <Mail size={15} /> hello@orvnlabs.com
              </a>
            </div>

            {COLS.map((col) => (
              <div key={col.title}>
                <h4 className="label-mono" style={{ marginBottom: 18 }}>
                  {col.title}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          style={{
                            fontSize: 13.5,
                            color: 'var(--ink-mid)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = 'var(--primary)';
                            e.target.style.paddingLeft = '2px';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = 'var(--ink-mid)';
                            e.target.style.paddingLeft = '0px';
                          }}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          style={{
                            fontSize: 13.5,
                            color: 'var(--ink-mid)',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = 'var(--primary)';
                            e.target.style.paddingLeft = '2px';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = 'var(--ink-mid)';
                            e.target.style.paddingLeft = '0px';
                          }}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingTop: 28,
            borderTop: '1px solid var(--line)',
          }}
        >
          <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', margin: 0, fontWeight: 500, fontFamily: 'var(--font-body)' }}>
            © {year} ORVN Labs. Built for real estate brokerages. PAS is a product of ORVN Labs.
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--ink-dim)', margin: 0, fontWeight: 500, fontFamily: 'var(--font-body)' }}>
            Not affiliated with Fair Housing enforcement agencies. Not a CRM.
          </p>
        </div>
      </div>
    </footer>
  );
}
