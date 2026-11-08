"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import { Reveal } from '../site/Reveal';

/**
 * Shared feature row: approved copy on one side, a product visual on the other.
 */
export default function FeatureSplit({ id, eyebrow, title, body, note, points, media, reverse = false, link = true }) {
  return (
    <section id={id} className={`split feature-split ${reverse ? 'is-reverse' : ''}`}>
      <Reveal className="split-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="split-title">{title}</h2>
        <p className="lead">{body}</p>

        {points && (
          <ul className="list-check">
            {points.map((p) => (
              <li key={p}>
                <span className="list-check-icon"><Check size={12} strokeWidth={3} /></span>
                {p}
              </li>
            ))}
          </ul>
        )}

        {note && <p className="feature-note">{note}</p>}

        {link && (
          <Link href="/product" className="arrow-link">
            Explore ORREI
            <ArrowUpRight strokeWidth={2} />
          </Link>
        )}
      </Reveal>

      <Reveal delay={0.08} className="split-media">
        {media}
      </Reveal>
    </section>
  );
}
