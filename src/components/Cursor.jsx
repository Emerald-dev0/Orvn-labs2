import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setEnabled(true);
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, x: sx, y: sy, translateX: '-50%', translateY: '-50%', width: 14, height: 14, borderRadius: '50%', background: 'var(--primary)', pointerEvents: 'none', zIndex: 9999, mixBlendMode: 'difference' }}
      />
      <motion.div
        style={{ position: 'fixed', top: 0, left: 0, x: sx, y: sy, translateX: '-50%', translateY: '-50%', width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(57,125,119,0.5)', pointerEvents: 'none', zIndex: 9998 }}
      />
    </>
  );
}
