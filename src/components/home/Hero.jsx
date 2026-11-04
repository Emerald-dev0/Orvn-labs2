import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BedDouble, Bath, Ruler, ShieldCheck } from 'lucide-react';

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
            <span className="pill pill-lime hero-badge">
              <span className="hero-badge-dot" aria-hidden="true" />
              Private beta, applications open
            </span>

            <h1 className="hero-title">
              Every property deserves a <span className="em">better page</span>.
            </h1>

            <p className="hero-sub">
              LAREI keeps one verified record for each property, then turns it into a property page,
              a deal sheet, a buyer summary and a print sheet. Check the facts once, publish them
              everywhere.
            </p>

            <div className="hero-actions">
              <Link to="/early-access" className="btn btn-lime">
                Request beta access
                <ArrowRight strokeWidth={2.2} />
              </Link>
              <Link to="/how-it-works" className="btn btn-glass">
                See how it works
              </Link>
            </div>

            <p className="hero-note">No card required. Applications reviewed weekly.</p>
          </motion.div>

          <motion.aside
            className="hero-card glass"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
          >
            <div className="hero-card-head">
              <span className="hero-card-label">Live property page</span>
              <span className="pill pill-glass hero-card-live">Published</span>
            </div>

            <div className="hero-card-body">
              <img src="/images/prop-3.jpg" alt="" className="hero-card-thumb" />
              <div className="hero-card-info">
                <p className="hero-card-name">Adaora House, Ikoyi</p>
                <p className="hero-card-addr">4 bedroom detached · Lagos</p>
                <p className="hero-card-price">₦480,000,000</p>
              </div>
            </div>

            <div className="hero-card-specs">
              <span><BedDouble size={14} strokeWidth={2} /> 4 beds</span>
              <span><Bath size={14} strokeWidth={2} /> 5 baths</span>
              <span><Ruler size={14} strokeWidth={2} /> 620 m²</span>
            </div>

            <div className="hero-card-foot">
              <span className="hero-card-verified">
                <ShieldCheck size={14} strokeWidth={2.2} />
                Facts verified by the listing agent
              </span>
              <ArrowRight size={16} strokeWidth={2} className="hero-card-arrow" />
            </div>
          </motion.aside>
        </div>

        <div className="hero-rail">
          <span>Property page</span>
          <span>Deal sheet</span>
          <span>Buyer summary</span>
          <span>Print sheet</span>
        </div>
      </div>
    </section>
  );
}
