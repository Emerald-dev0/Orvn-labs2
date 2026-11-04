"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bath, BedDouble, MapPin, Ruler, ShieldCheck } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-frame">
        <motion.img
          src="/images/hero-villa.jpg"
          alt="A concrete and timber house at dusk, warm interior light spilling onto a wet stone drive"
          className="hero-photo"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
          fetchPriority="high"
        />
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-inner shell">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: EASE }}
          >
            <p className="hero-kicker">Real estate publishing and professional presence</p>

            <h1 className="hero-title">
              Your real estate business deserves a better place to be seen.
            </h1>

            <p className="hero-sub">
              LAREI is being built for wholesalers, agents, investors and real-estate operators who
              want one professional home for their brand, property portfolio and deal presentations.
              Organize the details, prepare the materials, publish with control, and share a page
              people can actually use.
            </p>

            <div className="hero-actions">
              <Link href="/early-access" className="btn btn-lime">
                Request early access
                <ArrowRight strokeWidth={2.2} />
              </Link>
              <Link href="/product" className="btn btn-glass">
                Explore the product
              </Link>
            </div>

            <p className="hero-note">
              LAREI is a product of ORVN Labs. Private beta, applications reviewed individually.
            </p>
          </motion.div>

          <motion.aside
            className="hero-card glass"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
          >
            <div className="hero-card-head">
              <span className="hero-card-label">My Website · Draft</span>
              <span className="pill pill-glass hero-card-live">Preview</span>
            </div>

            <div className="hero-site-profile">
              <span className="hero-site-avatar">AP</span>
              <div>
                <p className="hero-card-name">Northaven Property Group</p>
                <p className="hero-card-addr">Wholesaler · 6-person team</p>
              </div>
              <span className="hero-card-verified">
                <ShieldCheck size={13} strokeWidth={2.2} />
                Sample
              </span>
            </div>

            <div className="hero-card-body">
              <img src="/images/prop-3.jpg" alt="" className="hero-card-thumb" />
              <div className="hero-card-info">
                <p className="hero-card-name">Halden House, Harbour district</p>
                <p className="hero-card-addr">
                  <MapPin size={11} strokeWidth={2} /> Harbour district · approximate location
                </p>
                <p className="hero-card-price">$480,000</p>
              </div>
            </div>

            <div className="hero-card-specs">
              <span><BedDouble size={14} strokeWidth={2} /> 4 beds</span>
              <span><Bath size={14} strokeWidth={2} /> 5 baths</span>
              <span><Ruler size={14} strokeWidth={2} /> 620 m²</span>
            </div>

            <div className="hero-card-foot">
              <span className="hero-card-verified">
                <ArrowRight size={14} strokeWidth={2.2} />
                Ask about this property
              </span>
              <span className="hero-card-publish">Publish site</span>
            </div>

            <p className="hero-card-caption">Illustrative sample. Product preview, in development.</p>
          </motion.aside>
        </div>

        <div className="hero-rail">
          <span>Professional site</span>
          <span>Property portfolio</span>
          <span>Property pages</span>
          <span>Inquiries</span>
        </div>
      </div>
    </section>
  );
}
