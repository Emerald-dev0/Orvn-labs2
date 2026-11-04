"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

const LINKS = [
  ['Home', '/', 'Start again'],
  ['Product', '/product', 'What it does'],
  ['How it works', '/how-it-works', 'Four steps'],
  ['Questions', '/faq', 'The practical ones'],
];

export default function NotFound() {
  const pathname = usePathname();

  useDocumentMeta({
    title: 'Page not found',
    description: 'That page does not exist. Here is the way back.',
    path: pathname,
  });

  return (
    <PageWrapper>
      <section className="notfound">
        <div className="shell">
          <div className="notfound-top">
            <span className="eyebrow">404</span>
            <span className="notfound-path">{pathname}</span>
          </div>

          <p className="notfound-num" aria-hidden="true">404</p>

          <div className="notfound-grid">
            <div>
              <h1 className="notfound-h">This page does not exist.</h1>
              <p className="lead" style={{ marginTop: 14 }}>
                The link may be old, or the property may have been retired. Nothing is broken on
                your side.
              </p>
            </div>

            <nav className="notfound-list" aria-label="Suggested pages">
              {LINKS.map(([label, to, note]) => (
                <Link key={to} href={to} className="notfound-link">
                  <span className="notfound-link-label">{label}</span>
                  <span className="label-mono">{note}</span>
                  <span className="label-mono" />
                  <ArrowUpRight size={16} strokeWidth={2} />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
