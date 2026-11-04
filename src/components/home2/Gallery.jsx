import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ChapterHead from '../site/ChapterHead';
import { Reveal } from '../site/Reveal';

const ITEMS = [
  {
    img: '/images/prop-3.jpg',
    title: 'Adeola Court',
    loc: 'Ikoyi, Lagos · 4-bed detached',
    meta: '₦685m · 3 sources verified',
    cls: 'g-a',
    tag: 'Published',
  },
  {
    img: '/images/interior-1.jpg',
    title: 'Adaora House',
    loc: 'Ikoyi, Lagos · interior',
    meta: 'Detail set · 8 photographs',
    cls: 'g-b',
    tag: 'Published',
  },
  {
    img: '/images/prop-5.jpg',
    title: 'Marina Heights',
    loc: 'Victoria Island · 5-bed villa',
    meta: '₦1.2b · 4 sources verified',
    cls: 'g-c',
    tag: 'Draft',
  },
  {
    img: '/images/prop-4.jpg',
    title: 'Palm Grove',
    loc: 'Lekki Phase 1 · 4-bed + pool',
    meta: '₦410m · 2 sources verified',
    cls: 'g-d',
    tag: 'Published',
  },
];

export default function Gallery() {
  return (
    <section className="section-y" id="published">
      <div className="shell">
        <ChapterHead
          index="04 / Published"
          label="Sample property pages"
          title={['Pages a buyer', <>can actually <span className="em">use.</span></>]}
          note="One link. The facts, the photography, the terms — and a way to ask. No login walls, no dead ends."
        />

        <div className="gallery-grid" data-cursor="View page">
          {ITEMS.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.06}
              as="figure"
              className={`g-item ${item.cls}`}
              style={{ margin: 0 }}
            >
              <img src={item.img} alt={`${item.title}, ${item.loc}`} loading="lazy" />
              <figcaption className="g-cap">
                <div>
                  <h4>{item.title}</h4>
                  <div className="g-meta">{item.loc}</div>
                  <div className="g-meta" style={{ color: 'rgba(246,241,231,0.55)' }}>{item.meta}</div>
                </div>
                <span className="g-tag">{item.tag}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
              marginTop: 28,
              paddingTop: 16,
              borderTop: '1px solid var(--line)',
            }}
          >
            <p className="label-mono" style={{ maxWidth: '46ch' }}>
              Sample listings shown for demonstration. Photography and pricing are illustrative.
            </p>
            <Link to="/early-access" className="arrow-link">
              Publish yours
              <ArrowRight size={15} strokeWidth={1.6} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
