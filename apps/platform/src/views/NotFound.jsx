"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageWrapper from '../components/PageWrapper';
import Icon from '../app/icons';
import { useDocumentMeta } from '../lib/seo';

/**
 * The 404.
 *
 * A house nobody came back to, drawn in pine ink on cream: every window boarded with crossed
 * planks, the door still shut, weeds up to the sills, a blank signpost leaning in the yard.
 *
 * The drawing is the page, edge to edge and behind the navigation, with no card and no frame
 * around it. The number is set as type over the empty ground at the left, the words sit under it,
 * and the drawing is never boxed in.
 */

const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/product', label: 'Product' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/who-its-for', label: 'Who it is for' },
  { to: '/faq', label: 'Questions' },
  { to: '/early-access', label: 'Early access' },
  { to: '/contact', label: 'Contact' },
];

export default function NotFound() {
  const pathname = usePathname();

  useDocumentMeta({
    title: 'Not on the register',
    description: 'That address is not listed here. Every page that does exist is one tap away.',
    path: pathname,
  });

  return (
    <PageWrapper>
      <section className="lost-hero">
        <img
          className="lost-hero-img"
          src="/images/404/lost-house-2000.webp"
          srcSet="/images/404/lost-house-1100.webp 1100w, /images/404/lost-house-2000.webp 2000w"
          sizes="100vw"
          width={2048}
          height={1152}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="lost-hero-veil" aria-hidden="true" />

        <div className="lost-hero-inner">
          <div className="shell">
            <div className="lost-hero-copy">
              <p className="lost-asked">
                You asked for <span className="lost-asked-path">{pathname}</span>
              </p>

              <p className="lost-num" aria-hidden="true">
                <span>4</span>
                <span className="lost-num-hollow">0</span>
                <span>4</span>
              </p>

              <h1 className="lost-title">This address is not listed.</h1>

              <p className="lost-lede">
                No page is built here. The link may be old, the page retired, or the listing
                withdrawn.
              </p>

              <div className="lost-actions">
                <Link href="/" className="btn btn-lime">
                  Back to the beginning
                  <Icon name="arrowRight" size={17} strokeWidth={2.2} />
                </Link>
                <a href="mailto:hello@orvnlabs.com" className="lost-mail">
                  Tell us what you wanted
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lost-index">
        <div className="shell lost-index-inner">
          <span className="lost-index-label">Every page that does exist</span>
          <nav className="lost-index-links" aria-label="Every page on this site">
            {PAGES.map((page) => (
              <Link key={page.to} href={page.to} className="lost-index-link">
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </PageWrapper>
  );
}
