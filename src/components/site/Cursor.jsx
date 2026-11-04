import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Custom cursor: a precision dot + a lagging ring.
 * Elements opt into a labelled state with data-cursor="View" / data-cursor="Drag".
 * Disabled entirely on coarse pointers, reduced motion, and keyboard-only users.
 */
export default function Cursor() {
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [label, setLabel] = useState('');
  const [active, setActive] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const ringX = useSpring(x, { stiffness: 340, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 340, damping: 32, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add('has-custom-cursor');

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const over = (e) => {
      const target = e.target instanceof Element ? e.target.closest('[data-cursor], a, button, input, textarea, select') : null;
      if (!target) {
        setLabel('');
        setActive(false);
        return;
      }
      const custom = target.getAttribute?.('data-cursor');
      setLabel(custom || '');
      setActive(true);
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const hasLabel = Boolean(label);
  const size = hasLabel ? 76 : active ? 40 : 22;

  return (
    <>
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 10000,
          pointerEvents: 'none',
          mixBlendMode: hasLabel ? 'normal' : 'difference',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: hasLabel ? 'var(--ember)' : '#fff',
        }}
      />
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          border: hasLabel ? 'none' : '1px solid rgba(18,18,15,0.55)',
          background: hasLabel ? 'var(--ink)' : 'transparent',
          color: 'var(--paper)',
        }}
        animate={{ width: size, height: size, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        {hasLabel && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1.2,
              padding: 6,
            }}
          >
            {label}
          </span>
        )}
      </motion.div>
    </>
  );
}
