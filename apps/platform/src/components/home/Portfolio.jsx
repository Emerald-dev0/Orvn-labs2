"use client";

import React from 'react';
import { Reveal } from '../site/Reveal';
import { Building2, Eye, Inbox, LayoutGrid } from 'lucide-react';

const HOMES = [
  { img: '/images/interior-1.jpg', name: 'Halden House', place: 'Harbour district', price: '$480,000' },
  { img: '/images/prop-2.jpg', name: 'Kestrel Row', place: 'Harbour district', price: '$210,000' },
  { img: '/images/prop-5.jpg', name: 'Harbour Point', place: 'Riverside', price: '$1,150,000' },
  { img: '/images/prop-4.jpg', name: 'Elm Court', place: 'Old town', price: '$320,000' },
];

const MINI = [
  { icon: Building2, label: 'Structured property records' },
  { icon: LayoutGrid, label: 'Property pages' },
  { icon: Eye, label: 'Selective portfolio visibility' },
  { icon: Inbox, label: 'Buyer inquiries' },
];

export default function Portfolio() {
  return (
    <section className="portfolio">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow">Property &amp; portfolio</span>
          <h2 className="section-title">Every property has its place.</h2>
          <p className="lead">
            Prepare a dedicated page for each published opportunity, with approved details, images,
            location context, supporting materials and an easy inquiry route. Keep the individual
            pages connected to your wider professional profile.
          </p>
        </div>

        <div className="mini-features">
          {MINI.map((m) => {
            const Icon = m.icon;
            return (
              <span className="mini-feature" key={m.label}>
                <Icon size={15} strokeWidth={2} />
                {m.label}
              </span>
            );
          })}
        </div>

        <div className="gallery-grid">
          {HOMES.map((home, i) => (
            <Reveal key={home.name} delay={0.05 * i} className={`gallery-card ${i === 0 || i === 3 ? 'is-tall' : ''}`}>
              <div className="gallery-media">
                <img src={home.img} alt={`${home.name}, ${home.place}`} loading="lazy" />
                <span className="gallery-badge">Sample listing</span>
              </div>
              <div className="gallery-meta">
                <div>
                  <p className="gallery-name">{home.name}</p>
                  <p className="gallery-place">{home.place}</p>
                </div>
                <p className="gallery-price">{home.price}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="portfolio-note">
          Illustrative sample listings used to show how a published page looks. No real customer or
          property is represented.
        </p>
      </div>
    </section>
  );
}
