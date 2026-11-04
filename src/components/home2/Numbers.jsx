import React from 'react';
import { Counter } from '../site/Reveal';

export default function Numbers() {
  return (
    <section className="numbers">
      <div className="shell">
        <div className="numbers-grid">
          <div className="number-cell">
            <span className="v">01</span>
            <span className="k">Record per property</span>
          </div>
          <div className="number-cell">
            <span className="v">04</span>
            <span className="k">Outputs generated from it</span>
          </div>
          <div className="number-cell">
            <span className="v">00</span>
            <span className="k">Facts published without approval</span>
          </div>
          <div className="number-cell">
            <span className="v">
              <Counter to={100} duration={2.2} />
              <small>%</small>
            </span>
            <span className="k">Of public pages reviewed first</span>
          </div>
        </div>
      </div>
    </section>
  );
}
