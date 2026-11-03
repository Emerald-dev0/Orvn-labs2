import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlMenu, SlClose } from 'react-icons/sl';
import Logo from './Logo';
import { PAS_LINKS } from '../lib/pas';

const NAV_LINKS = [
  { label: 'Product', to: '/product' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Who it’s for', to: '/who-its-for' },
  { label: 'FAQ', to: '/faq' },
];

const linkStyle = ({ isActive }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: isActive ? 'var(--primary)' : 'var(--ink-mid)',
  textDecoration: 'none',
  padding: '8px 14px',
  borderRadius: 'var(--radius-pill)',
  transition: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
  background: isActive ? 'var(--primary-glow)' : 'transparent',
  fontFamily: 'var(--font-body)',
  letterSpacing: '-0.01em',
});

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Close the mobile drawer on route change. setState in effect is intentional here:
    // location is the external "system" we're synchronising the UI back to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          background: scrolled ? 'rgba(245,241,234,0.82)' : 'rgba(245,241,234,0.98)',
          backdropFilter: scrolled ? 'saturate(180%) blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(216,216,213,0.7)' : '1px solid transparent',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          boxShadow: scrolled ? '0 1px 12px rgba(10,10,15,0.04)' : 'none',
        }}
      >
        <div
          className="container-page"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo size={34} />
            <span
              style={{
                fontWeight: 800,
                fontSize: 19,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-display)',
                color: 'var(--ink)',
              }}
            >
              ORVN <span style={{ color: 'var(--primary)' }}>Labs</span>
            </span>
          </Link>

          <nav
            aria-label="Main Navigation"
            style={{ display: 'none', alignItems: 'center', gap: 4 }}
            className="nav-desktop"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} style={linkStyle} aria-label={`Navigate to ${link.label}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-desktop" style={{ display: 'none', alignItems: 'center', gap: 10 }}>
            <Link to="/sign-in" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-mid)', textDecoration: 'none', padding: '8px 14px', fontFamily: 'var(--font-body)' }}>Sign in</Link>
            {/* <a
              href={PAS_LINKS.login}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '9px 16px', fontSize: 14 }}
            >
              Login
            </a> */}
            <Link
              to="/early-access"
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: 14, borderRadius: 'var(--radius-pill)' }}
            >
              Request early access
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="nav-mobile-toggle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              background: '#fff',
              cursor: 'pointer',
              color: 'var(--ink)',
              transition: 'all 0.2s',
            }}
          >
            {open ? <SlClose size={20} /> : <SlMenu size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(10,10,15,0.25)',
                backdropFilter: 'blur(4px)',
                zIndex: 88,
              }}
            />
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: 'fixed',
                top: 72,
                left: 0,
                right: 0,
                zIndex: 89,
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--line)',
                padding: '20px clamp(20px, 5vw, 64px) 28px',
                boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
              }}
            >
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      style={({ isActive }) => ({
                        display: 'block',
                        padding: '16px 0',
                        fontSize: 17,
                        fontWeight: 600,
                        color: isActive ? 'var(--primary)' : 'var(--ink)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--line-strong)',
                        letterSpacing: '-0.01em',
                      })}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {/* <a
                  href={PAS_LINKS.login}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Login
                </a> */}
                <Link to="/early-access" className="btn-primary" style={{ flex: 1 }}>
                  Request early access
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 860px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-toggle { display: none !important; }
        }
      `}</style>
    </>
  );
}
