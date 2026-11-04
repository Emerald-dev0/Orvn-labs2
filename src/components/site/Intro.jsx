import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mark } from './Logo';

/**
 * A 1.2s curtain on first arrival. Short enough to feel like a handshake,
 * long enough to set the tone. Skipped on reduced motion and repeat visits.
 */
export default function Intro() {
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    try {
      return sessionStorage.getItem('larei-intro') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (done) return;
    try {
      sessionStorage.setItem('larei-intro', '1');
    } catch {
      /* storage unavailable — the intro still plays */
    }
    document.documentElement.style.overflow = 'hidden';
    const t = setTimeout(() => {
      setDone(true);
      document.documentElement.style.overflow = '';
    }, 1250);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = '';
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'var(--paper)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'clamp(20px, 4vw, 48px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label-mono">LAREI — by ORVN Labs</span>
            <span className="label-mono">Est. 2026</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Mark size={40} />
              <motion.span
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '0.14em', opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(34px, 7vw, 76px)',
                  lineHeight: 1,
                  fontVariationSettings: "'opsz' 144, 'WONK' 1, 'wght' 400",
                }}
              >
                LAREI
              </motion.span>
            </div>
            <span className="label-mono" style={{ paddingBottom: 8 }}>
              Property, presented properly
            </span>
          </div>

          <div style={{ height: 1, background: 'rgba(18,18,15,0.16)', position: 'relative', overflow: 'hidden' }}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: '100%', background: 'var(--ember)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
