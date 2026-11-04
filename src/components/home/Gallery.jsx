import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../site/Reveal';
import { ArrowUpRight } from 'lucide-react';

const HOMES = [
  {
    img: '/images/interior-1.jpg',
    name: 'Adaora House',
    place: 'Ikoyi, Lagos',
    price: '₦480,000,000',
    tone: 'warm',
  },
  {
    img: '/images/prop-2.jpg',
    name: 'Kaduna Row',
    place: 'Ikoyi, Lagos',
    price: '₦210,000,000',
    tone: 'plain',
  },
  {
    img: '/images/prop-5.jpg',
    name: 'Marina Heights',
    place: 'Victoria Island, Lagos',
    price: '₦1,150,000,000',
    tone: 'plain',
  },
  {
    img: '/images/prop-4.jpg',
    name: 'Ikate Courtyard',
    place: 'Lekki Phase 1, Lagos',
    price: '₦320,000,000',
    tone: 'warm',
  },
];

export default function Gallery() {
  return (
    <section className="gallery">
      <div className="shell">
        <div className="gallery-head">
          <Reveal>
            <h2 className="gallery-title">Published with LAREI.</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="lead">
              A property page should sell the place, not the template. These are sample listings used
              to show how a finished page looks.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/product" className="arrow-link gallery-link">
              See the property page
              <ArrowUpRight strokeWidth={2} />
            </Link>
          </Reveal>
        </div>

        <div className="gallery-grid">
          {HOMES.map((home, i) => (
            <Reveal
              key={home.name}
              delay={0.05 * i}
              className={`gallery-card ${i === 0 || i === 3 ? 'is-tall' : ''}`}
            >
              <div className="gallery-media">
                <img src={home.img} alt={`${home.name}, ${home.place}`} loading="lazy" />
                <span className="gallery-badge">For sale</span>
              </div>
              <div className="gallery-meta">
                <div>
                  <p className="gallery-name">{home.name}</p>
                  <p className="gallery-place">{home.place}</p>
                </div>
                <p className="gallery-price">{home.price}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
