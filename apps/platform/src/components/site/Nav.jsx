"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  { to: '/product', label: 'Product' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/who-its-for', label: "Who it's for" },
  { to: '/about', label: 'Company' },
  { to: '/faq', label: 'FAQ' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const onHero = pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    document.body.style.overflow = open ? 'hidden' : '';
    root.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      root.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className={`site-nav ${scrolled ? 'is-scrolled' : ''} ${onHero ? 'on-hero' : ''}`}>
        <div className="nav-bar">
          <Logo compact={scrolled} />

          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className={`nav-link ${pathname === link.to ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <Link href="/sign-in" className="nav-signin">
              Sign in
            </Link>
            <Link href="/early-access" className="btn btn-primary btn-sm nav-cta">
              Request early access
              <ArrowUpRight strokeWidth={2} />
            </Link>
            <button
              type="button"
              className="nav-burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-sheet on-dark"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="nav-sheet-inner">
              <p className="nav-sheet-kicker">Menu</p>
              <ul className="nav-sheet-links">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link href={link.to} className="nav-sheet-link" onClick={() => setOpen(false)}>
                      {link.label}
                      <ArrowUpRight size={22} strokeWidth={1.8} />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="nav-sheet-foot">
                <Link href="/early-access" className="btn btn-lime btn-block" onClick={() => setOpen(false)}>
                  Request early access
                </Link>
                <div className="nav-sheet-meta">
                  <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
