import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

const ROUTES = [
  { to: '/', label: 'Home', meta: 'A better place to be seen' },
  { to: '/product', label: 'Product', meta: 'The workspace' },
  { to: '/how-it-works', label: 'How it works', meta: 'Six steps' },
  { to: '/who-its-for', label: 'Who it’s for', meta: 'Roles and fit' },
  { to: '/blog', label: 'Journal', meta: 'Field notes' },
  { to: '/contact', label: 'Contact', meta: 'Talk to a person' },
];

export default function NotFound() {
  const location = useLocation();

  useDocumentMeta({
    title: 'Page not found',
    description: 'This route is not in the record. The page you asked for does not exist — here are the pages that do.',
    path: '/404',
  });

  useEffect(() => {
    const el = document.head.querySelector('meta[name="robots"]');
    const prev = el ? el.getAttribute('content') : null;
    if (el) el.setAttribute('content', 'noindex,follow');
    return () => {
      if (el && prev) el.setAttribute('content', prev);
    };
  }, []);

  return (
    <PageWrapper>
      <section className="notfound">
        <div className="shell">
          <div className="notfound-top">
            <span className="eyebrow">Error · 404</span>
            <span className="label-mono notfound-path">{location.pathname}</span>
          </div>

          <h1 className="notfound-num" aria-hidden="true">
            4<span className="em">0</span>4
          </h1>

          <div className="notfound-grid">
            <h2 className="notfound-h">
              This page is not
              <br />
              in the <span className="em">record.</span>
            </h2>
            <p className="lead" style={{ maxWidth: '40ch' }}>
              The address you followed does not exist, was retired, or was never published. Nothing
              was lost — here are the pages that are.
            </p>
          </div>

          <div className="notfound-list">
            {ROUTES.map((r, i) => (
              <Link key={r.to} to={r.to} className="notfound-link">
                <span className="label-mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="notfound-link-label">{r.label}</span>
                <span className="label-mono">{r.meta}</span>
                <ArrowUpRight size={16} strokeWidth={1.4} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
