import React from 'react';

export default function Section({ id, background = 'white', borderTop = false, children, className = '' }) {
  const bg = background === 'surface' ? 'var(--surface)' : background === 'primary' ? 'var(--primary)' : 'var(--background)';
  return (
    <section
      id={id}
      className={`section-y ${className}`}
      style={{
        background: bg,
        borderTop: borderTop ? '1px solid var(--line)' : 'none',
      }}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}
