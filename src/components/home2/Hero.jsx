import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Magnetic } from '../site/Reveal';
import Marquee from '../site/Marquee';

const TICKER = [
  'Professional profile',
  'Property portfolio',
  'Verified facts',
  'Property pages',
  'Deal sheets',
  'Publish with control',
  'Engagement insight',
];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const figureY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [2.2, -2.2]), { stiffness: 140, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-3.2, 3.2]), { stiffness: 140, damping: 20 });

  const onMouse = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section className="hero" ref={ref} id="top">
      <div className="shell">
        <div className="hero-inner">
          {/* ── Copy ── */}
          <motion.div style={{ y: copyY }}>
            <motion.div
              className="hero-eyebrow-row"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="eyebrow">LAREI · Real-estate publishing</span>
              <span className="hero-status">
                <i />
                Private beta · 2026
              </span>
            </motion.div>

            <h1 className="hero-title">
              {[
                <>A better</>,
                <>place to be</>,
                <>
                  <span className="em">seen.</span>
                </>,
              ].map((line, i) => (
                <span className="line" key={i}>
                  <motion.span
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.12 + i * 0.085 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="hero-lead"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            >
              One professional home for your brand, your portfolio and every deal you present.
              LAREI keeps the underlying record clean, prepares the materials, and publishes only
              what you approve.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            >
              <Magnetic strength={0.18}>
                <Link to="/early-access" className="btn-primary">
                  Request early access
                  <ArrowUpRight size={16} strokeWidth={1.6} />
                </Link>
              </Magnetic>
              <Link to="/product" className="arrow-link">
                Explore the product
                <ArrowRight size={15} strokeWidth={1.6} />
              </Link>
            </motion.div>

            <motion.div
              className="hero-meta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <div>
                <strong>One record</strong>
                <span>No re-typing</span>
              </div>
              <div>
                <strong>Four outputs</strong>
                <span>Page · sheet · summary · print</span>
              </div>
              <div>
                <strong>You approve</strong>
                <span>Before anything is public</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Artefact: a published property page ── */}
          <motion.div className="hero-visual" style={{ y: figureY }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              onMouseMove={onMouse}
              onMouseLeave={() => {
                mx.set(0);
                my.set(0);
              }}
            >
            <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 1400 }}>
              <div className="hero-figure">
                <div className="fig-bar">
                  <div className="fig-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span className="fig-url">larei.page/adeola-court</span>
                  <span className="fig-live">published</span>
                </div>

                <div className="hero-photo">
                  <img src="/images/prop-3.jpg" alt="Published property page for a timber-clad residence" loading="eager" />
                  <span className="hero-photo-tag">Sample listing · verified</span>
                </div>

                <div className="hero-card">
                  <div className="hero-card-row">
                    <div>
                      <h3>Adeola Court</h3>
                      <div className="addr">Ikoyi, Lagos · 4-bed detached</div>
                    </div>
                    <div className="price">₦ 685m</div>
                  </div>
                  <div className="spec-row">
                    <div>
                      <b>4</b>
                      <span>Beds</span>
                    </div>
                    <div>
                      <b>5</b>
                      <span>Baths</span>
                    </div>
                    <div>
                      <b>420</b>
                      <span>m² built</span>
                    </div>
                    <div>
                      <b>3</b>
                      <span>Sources</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                className="hero-chip"
                style={{ top: -14, right: -10 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="dot">
                  <ShieldCheck size={10} strokeWidth={2} />
                </span>
                Facts verified
              </motion.div>

              <div className="hero-caption">
                <span>Fig. 01 — Property page</span>
                <span>1 link · 1 inquiry route</span>
              </div>
            </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Ticker ── */}
      <motion.div
        className="hero-ticker"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
      >
        <Marquee
          items={TICKER.map((t) => (
            <span className="ticker-item">{t}</span>
          ))}
          separator={<span className="ticker-dot" />}
        />
      </motion.div>
    </section>
  );
}
