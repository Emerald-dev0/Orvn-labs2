import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  { label: 'Product', to: '/product', n: '01' },
  { label: 'How it works', to: '/how-it-works', n: '02' },
  { label: 'Who it’s for', to: '/who-its-for', n: '03' },
  { label: 'Journal', to: '/blog', n: '04' },
  { label: 'FAQ', to: '/faq', n: '05' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    document.body.style.overflow = open ? 'hidden' : '';
    root.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      root.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className="site-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 900,
          height: 'var(--nav-h)',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${scrolled ? 'var(--line)' : 'transparent'}`,
          background: scrolled ? 'rgba(239,234,225,0.82)' : 'transparent',
          backdropFilter: scrolled ? 'saturate(150%) blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'saturate(150%) blur(14px)' : 'none',
          transition: 'background-color .5s var(--ease-out), border-color .5s var(--ease-out)',
        }}
      >
        <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Link to="/" aria-label="LAREI — home" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <Logo size={22} wordSize={19} />
            <span className="hide-mobile nav-byline">by ORVN Labs</span>
          </Link>

          <nav className="nav-links" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                <span className="nav-link-stack">
                  <span>{l.label}</span>
                  <span aria-hidden>{l.label}</span>
                </span>
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/sign-in" className="nav-signin">
              Sign in
            </Link>
            <Link to="/early-access" className="btn-primary nav-cta">
              Request access
              <ArrowUpRight size={15} strokeWidth={1.75} />
            </Link>

            <button
              type="button"
              className="nav-burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`burger-line ${open ? 'is-open' : ''}`} />
              <span className={`burger-line ${open ? 'is-open' : ''}`} />
            </button>
          </div>
        </div>

        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            bottom: -1,
            height: 1,
            width: '100%',
            background: 'var(--ember)',
            scaleX: progress,
            transformOrigin: 'left',
            opacity: scrolled ? 1 : 0,
            transition: 'opacity .4s',
          }}
        />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 890,
              background: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingTop: 'calc(var(--nav-h) + 32px)',
              paddingBottom: 28,
              overflowY: 'auto',
            }}
          >
            <div className="shell" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.16 + i * 0.055, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ borderBottom: '1px solid var(--line)' }}
                >
                  <Link
                    to={l.to}
                    style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '18px 0' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(34px, 9vw, 56px)',
                        lineHeight: 1,
                        letterSpacing: '-0.03em',
                        fontVariationSettings: "'opsz' 96, 'WONK' 1, 'wght' 400",
                      }}
                    >
                      {l.label}
                    </span>
                    <span className="label-mono">{l.n}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="shell"
              style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 40 }}
            >
              <Link to="/early-access" className="btn-primary" style={{ width: '100%' }}>
                Request early access
                <ArrowUpRight size={16} strokeWidth={1.75} />
              </Link>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <a href="mailto:hello@orvnlabs.com" className="label-mono">
                  hello@orvnlabs.com
                </a>
                <span className="label-mono">Private beta · 2026</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
