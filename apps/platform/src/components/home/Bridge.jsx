"use client";

import React from 'react';
import { Reveal } from '../site/Reveal';

export default function Bridge() {
  return (
    <section className="bridge">
      <div className="shell">
        <Reveal>
          <h2 className="bridge-title">
            Built around the work, not another collection of disconnected tools.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="bridge-body">
            Property information, professional identity and buyer-facing materials often sit in
            different places. That fragmentation costs attention. The platform is designed to bring the
            presentation layer together, so what you share reflects a clear, approved record rather
            than another round of manual assembly.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
