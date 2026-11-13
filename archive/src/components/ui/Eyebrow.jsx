import React from 'react';

export default function Eyebrow({ children, className = '' }) {
  return <span className={`eyebrow ${className}`.trim()}>{children}</span>;
}
