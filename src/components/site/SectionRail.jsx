import React, { useEffect, useState } from 'react';

/**
 * A fixed index rail — the running head of the document.
 * Desktop only; it marks where you are in the argument without shouting.
 */
export default function SectionRail({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));

    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [items]);

  return (
    <nav
      aria-label="Section index"
      className={`section-rail ${visible ? 'is-visible' : ''}`}
    >
      {items.map((item, i) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={active === item.id ? 'is-active' : ''}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <span className="rail-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="rail-label">{item.label}</span>
          <span className="rail-tick" />
        </a>
      ))}
    </nav>
  );
}
