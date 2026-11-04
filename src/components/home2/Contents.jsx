import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';

const FINE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

const ITEMS = [
  {
    n: '01',
    title: 'Professional identity',
    desc: 'A branded profile with markets, services, credentials and contact preferences — reviewed before it is published.',
    img: '/images/prop-2.jpg',
    to: '/product',
  },
  {
    n: '02',
    title: 'Your portfolio',
    desc: 'Choose which approved properties appear publicly. The underlying record stays the single source.',
    img: '/images/interior-1.jpg',
    to: '/product',
  },
  {
    n: '03',
    title: 'Property records',
    desc: 'Start from notes, forms or supported files. LAREI organises the supported facts into a record you can review.',
    img: '/images/prop-5.jpg',
    to: '/how-it-works',
  },
  {
    n: '04',
    title: 'Fact verification',
    desc: 'Sources, conflicts and unknowns are surfaced — not smoothed over. Nothing unapproved becomes public.',
    img: '/images/prop-1.jpg',
    to: '/how-it-works',
  },
  {
    n: '05',
    title: 'Your voice',
    desc: 'Writing samples and business context shape the copy. Everything stays editable before it leaves the workspace.',
    img: '/images/prop-4.jpg',
    to: '/product',
  },
  {
    n: '06',
    title: 'Property pages',
    desc: 'Each approved property gets its own page, its own URL and a route for inquiries.',
    img: '/images/prop-3.jpg',
    to: '/product',
  },
  {
    n: '07',
    title: 'Deal sheets',
    desc: 'Print-ready A4 summaries generated from the same approved facts — no second pass in a design tool.',
    img: '/images/prop-2.jpg',
    to: '/product',
  },
  {
    n: '08',
    title: 'Engagement insight',
    desc: 'Views, link clicks and inquiries on observable behaviour. Anonymous visitors are not identified.',
    img: '/images/interior-1.jpg',
    to: '/product',
  },
];

export default function Contents() {
  const [hovered, setHovered] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });
  const fine = FINE_POINTER;

  const onMove = (e) => {
    const maxX = (typeof window !== 'undefined' ? window.innerWidth : 1440) - 300;
    x.set(Math.min(e.clientX + 28, maxX));
    y.set(Math.max(16, Math.min(e.clientY - 160, (typeof window !== 'undefined' ? window.innerHeight : 800) - 340)));
  };

  return (
    <section className="section-y contents" id="inside" onMouseMove={fine ? onMove : undefined}>
      <div className="shell">
        <ChapterHead
          index="03 / Inside LAREI"
          label="Eight parts, one system"
          title={['Everything a deal needs,', <>in <span className="em">one place.</span></>]}
          note="Not eight products bolted together. Eight surfaces on the same underlying property record."
        />

        <div className="index-list">
          {ITEMS.map((item, i) => (
            <Link
              key={item.n}
              to={item.to}
              className="index-row"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="index-num">{item.n}</span>
              <div className="index-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <span className="index-arrow">
                <ArrowUpRight size={18} strokeWidth={1.4} />
              </span>
            </Link>
          ))}
        </div>

        {fine && (
          <AnimatePresence>
            {hovered !== null && (
              <motion.div
                className="index-preview"
                style={{ x: sx, y: sy }}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden
              >
                <img src={ITEMS[hovered].img} alt="" />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
