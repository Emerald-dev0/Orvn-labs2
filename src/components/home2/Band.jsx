import React from 'react';
import Marquee from '../site/Marquee';

const WORDS = ['One record', 'Four outputs', 'Verified facts', 'Your voice', 'Publish with control', 'Zero re-typing'];

export default function Band() {
  return (
    <div className="band">
      <Marquee
        items={WORDS.map((w) => <span className="band-item">{w}</span>)}
        separator={<span className="band-sep">/</span>}
        speed={54}
      />
    </div>
  );
}
