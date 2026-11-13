import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import Logo from '../components/Logo';
import { useDocumentMeta } from '../lib/seo';
import { PAS_LINKS } from '../lib/pas';

// Login lives in the PAS app (separate infrastructure). This page is a brief
// explainer + redirect, not a fake auth form. The website never holds PAS credentials.
export default function Login() {
  useDocumentMeta({
    title: 'Login',
    description:
      'PAS Control Room login. ORVN Labs’ public website routes customers to the PAS dashboard.',
    path: '/login',
  });

  return (
    <PageWrapper>
      <section
        style={{
          minHeight: 'calc(100vh - 240px)',
          background: '#F7F8FB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(40px, 8vw, 96px) 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: '#fff',
            border: '1px solid #E5E8F0',
            borderRadius: 18,
            padding: 'clamp(28px, 4vw, 40px)',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 12px 28px rgba(15,23,42,0.06)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Logo size={42} />
          </div>
          <h1
            style={{
              fontSize: 30,
              color: '#0F172A',
              margin: '0 0 10px',
              fontWeight: 800,
            }}
          >
            PAS Control Room
          </h1>
          <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.7, margin: '0 0 28px' }}>
            PAS lives on its own infrastructure. Login, dashboard, and brokerage settings are in
            the PAS app — separate from this website.
          </p>

          <a
            href={PAS_LINKS.login}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: '100%', marginBottom: 12 }}
          >
            Open PAS Control Room <ExternalLink size={15} />
          </a>
          <a
            href={PAS_LINKS.earlyAccess}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            Apply for early access
          </a>

          <hr style={{ border: 'none', borderTop: '1px solid #E5E8F0', margin: '28px 0 18px' }} />
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
            Not a customer yet?{' '}
            <Link to="/pas" style={{ color: '#5B3FD4', fontWeight: 500 }}>
              See what PAS controls <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </p>
        </div>
      </section>
    </PageWrapper>
  );
}
