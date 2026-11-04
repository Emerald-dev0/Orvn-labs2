"use client";

import React from 'react';

export default function Marquee({ items, separator = '·', className = '', itemClassName = '', style, speed = 42, reverse = false }) {
  const content = [...items, ...items];
  return (
    <div className={`marquee-wrap ${className}`} style={{ overflow: 'hidden', width: '100%', ...style }} aria-hidden="true">
      <div
        className={`marquee ${reverse ? 'marquee-reverse' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {content.map((item, i) => (
          <span key={i} className={itemClassName} style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            {item}
            <span aria-hidden className="marquee-sep">
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
