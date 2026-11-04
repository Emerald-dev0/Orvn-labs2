import React from 'react';

/**
 * LAREI mark — a land parcel: hairline plat grid with one surveyed quadrant.
 * The single filled cell is the thing being presented; the grid is the record.
 */
export function Mark({ size = 28, color = 'currentColor', accent = 'var(--ember)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="0.6" y="0.6" width="26.8" height="26.8" stroke={color} strokeWidth="1.2" />
      <path d="M14 0.6V27.4M0.6 14H27.4" stroke={color} strokeWidth="1.2" opacity="0.55" />
      <rect x="14.6" y="1.2" width="12.6" height="12.6" fill={accent} />
    </svg>
  );
}

export default function Logo({ size = 26, showWord = true, wordSize = 20, color = 'var(--ink)', accent = 'var(--ember)' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Mark size={size} color={color} accent={accent} />
      {showWord && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: wordSize,
            letterSpacing: '0.14em',
            lineHeight: 1,
            color,
            fontVariationSettings: "'opsz' 72, 'SOFT' 0, 'WONK' 1, 'wght' 500",
          }}
        >
          LAREI
        </span>
      )}
    </span>
  );
}
