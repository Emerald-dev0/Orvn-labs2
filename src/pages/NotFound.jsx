import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Compass, Gauge, Calculator, Phone, Home, Mail } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useDocumentMeta } from '../lib/seo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay },
});

const ROUTES = [
  {
    to: '/pas',
    icon: Phone,
    title: 'PAS — the product',
    desc: 'How PAS answers, qualifies, routes, books, and logs every inbound lead.',
    cta: 'See PAS',
    accent: 'var(--primary)',
  },
  {
    to: '/calculators/leakage',
    icon: Gauge,
    title: 'Lead Leakage Scorecard',
    desc: 'Five-minute diagnostic of your first-contact layer. Find your bottleneck.',
    cta: 'Run scorecard',
    accent: 'var(--risk)',
  },
  {
    to: '/calculators/revenue',
    icon: Calculator,
    title: 'Revenue Recovery Calculator',
    desc: 'Model the annual revenue recoverable through consistent first contact.',
    cta: 'Calculate recovery',
    accent: 'var(--ok)',
  },
  {
    to: '/blog',
    icon: Compass,
    title: 'First-Contact Intelligence',
    desc: 'Field notes on lead conversion, response infrastructure, and operations.',
    cta: 'Read the blog',
    accent: 'var(--warn)',
  },
];

export default function NotFound() {
  const location = useLocation();
  useDocumentMeta({
    title: 'Page not found',
    description: 'This route leaked. The page you asked for does not exist — here are the routes that do.',
    path: '/404',
  });

  useEffect(() => {
    let el = document.head.querySelector('meta[name="robots"]');
    const prev = el ? el.getAttribute('content') : null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (el) el.setAttribute('content', prev || 'index,follow');
    };
  }, []);

  return (
    <PageWrapper>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#fff',
          padding: 'clamp(56px, 9vw, 110px) 0 clamp(48px, 7vw, 88px)',
        }}
      >
        {/* backdrop */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(91, 63, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(91, 63, 212, 0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(70% 60% at 50% 30%, #000 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(70% 60% at 50% 30%, #000 30%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -120,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(720px, 90vw)',
            height: 320,
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(91, 63, 212, 0.12), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container-page" style={{ position: 'relative', maxWidth: 980 }}>
          <motion.div {...fadeUp(0)}>
            <span className="label-mono-primary" style={{ display: 'inline-block', marginBottom: 16 }}>
              404 — route leaked
            </span>
          </motion.div>

          <div style={{ display: 'grid', gap: 24, alignItems: 'end' }}>
            <motion.div
              {...fadeUp(0.06)}
              aria-label="404"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
                fontSize: 'clamp(96px, 22vw, 220px)',
                background: 'linear-gradient(135deg, var(--ink) 20%, var(--primary) 55%, var(--primary-light) 80%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                userSelect: 'none',
              }}
            >
              404
            </motion.div>

            <motion.h1
              {...fadeUp(0.1)}
              className="h-display-2"
              style={{ maxWidth: 720, lineHeight: 1.05 }}
            >
              This inquiry never got a{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500 }}>
                response.
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.14)} className="lead-2" style={{ maxWidth: 640 }}>
              The route <span className="body-mono" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '2px 10px', wordBreak: 'break-all' }}>{location.pathname}</span>{' '}
              doesn&apos;t exist — it moved, it was never built, or the link decayed.
              Unlike most brokerages, we log what leaked and route you somewhere useful.
            </motion.p>

            {/* mini pipeline: where it broke */}
            <motion.div
              {...fadeUp(0.18)}
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
              }}
              aria-label="Request path"
            >
              {['Inquiry', 'Answer', 'Qualify', 'Route', '404'].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <span
                    style={{
                      padding: '8px 16px',
                      borderRadius: 100,
                      fontSize: 12.5,
                      fontWeight: 700,
                      fontFamily: 'var(--font-body)',
                      background: i === arr.length - 1 ? '#FEF2F2' : i === 0 ? 'var(--primary)' : 'var(--primary-pale)',
                      color: i === arr.length - 1 ? 'var(--risk)' : i === 0 ? '#fff' : 'var(--primary)',
                      border: i === arr.length - 1 ? '1px solid #FECACA' : '1px solid rgba(91, 63, 212, 0.12)',
                    }}
                  >
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <span aria-hidden="true" style={{ width: 18, height: 2, background: 'var(--line-strong)', borderRadius: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

            <motion.div {...fadeUp(0.22)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <Link to="/" className="btn-primary">
                <Home size={16} /> Go home <ArrowRight size={15} />
              </Link>
              <Link to="/pas" className="btn-secondary">
                See PAS
              </Link>
              <a
                className="btn-ghost"
                href={`mailto:hello@orvnlabs.com?subject=${encodeURIComponent(`Missing route: ${location.pathname}`)}`}
              >
                <Mail size={15} /> Report this route
              </a>
            </motion.div>
          </div>

          {/* recovery routes */}
          <motion.div {...fadeUp(0.26)} style={{ marginTop: 'clamp(40px, 6vw, 64px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span className="label-mono">Recovered routes</span>
              <span aria-hidden="true" style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {ROUTES.map((r, i) => (
                <motion.div key={r.to} {...fadeUp(0.05 * i)}>
                  <Link
                    to={r.to}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      padding: 24,
                      height: '100%',
                      borderTop: `3px solid ${r.accent}`,
                    }}
                  >
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--surface)',
                        color: r.accent,
                      }}
                    >
                      <r.icon size={20} />
                    </span>
                    <span style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                      {r.title}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.6 }}>{r.desc}</span>
                    <span className="label-mono-primary" style={{ marginTop: 'auto', paddingTop: 8 }}>
                      {r.cta} →
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.3)} style={{ marginTop: 28 }}>
            <Link
              to="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--ink-mid)',
              }}
            >
              <ArrowLeft size={15} /> Or browse everything from the homepage
            </Link>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
