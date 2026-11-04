"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, animate, useScroll } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

/* ── Fade + rise on enter ───────────────────────────────────────────── */
export function Reveal({ children, delay = 0, y = 26, duration = 0.9, className, style, once = true, as = 'div' }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, ease: EASE, delay }}
      className={className}
      style={style}
    >
      {children}
    </MotionTag>
  );
}

/* ── Clip-path line reveal for headlines ────────────────────────────── */
export function MaskedLines({ lines, as: Tag = 'h2', className, style, delay = 0, stagger = 0.09, once = true }) {
  return (
    <Tag className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em', marginBottom: '-0.06em' }}>
          <motion.span
            style={{ display: 'block', willChange: 'transform' }}
            initial={{ y: '112%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once, margin: '-60px' }}
            transition={{ duration: 1.15, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ── Word-by-word reveal (for long statements) ──────────────────────── */
export function WordReveal({ text, className, style, stagger = 0.02, delay = 0 }) {
  const words = text.split(' ');
  return (
    <span className={className} style={style}>
      {words.map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            style={{ display: 'inline-block', willChange: 'transform' }}
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ── Scroll-linked word highlight (manifesto paragraph) ─────────────── */
export function ScrollHighlight({ text, className, style }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className} style={style}>
      {words.map((w, i) => (
        <HighlightWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1.6) / words.length]}>
          {w}
        </HighlightWord>
      ))}
    </p>
  );
}

function HighlightWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity, display: 'inline' }}>
      {children}
      {' '}
    </motion.span>
  );
}

/* ── Magnetic wrapper for buttons ───────────────────────────────────── */
export function Magnetic({ children, strength = 0.28, className, style }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 });

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', x: sx, y: sy, ...style }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.span>
  );
}

/* ── Number counter ─────────────────────────────────────────────────── */
export function Counter({ to = 100, from = 0, duration = 1.8, suffix = '', prefix = '', decimals = 0, className, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [val, setVal] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, from, to, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ── Reveal the underline of a hairline rule ────────────────────────── */
export function RuleDraw({ delay = 0, className, style }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      className={className}
      style={{ height: 1, background: 'var(--line)', transformOrigin: 'left', ...style }}
    />
  );
}

export { EASE };
