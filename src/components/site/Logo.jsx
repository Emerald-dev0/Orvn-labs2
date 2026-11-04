import React from 'react';
import { Link } from 'react-router-dom';

/** The ORVN Studios mark: a soft square holding a roofline cut from the accent. */
export function Mark({ size = 30, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="10" fill="currentColor" />
      <path
        d="M8 19.6 16 12l8 7.6"
        stroke="var(--lime, #c9f26e)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="22.4" r="1.7" fill="var(--lime, #c9f26e)" />
    </svg>
  );
}

export function Wordmark({ dark = false }) {
  return (
    <span className={`wordmark ${dark ? 'wordmark-dark' : ''}`}>
      ORVN
      <span className="wordmark-labs">Labs</span>
    </span>
  );
}

export default function Logo({ dark = false, compact = false, to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="ORVN Labs home">
      <Mark size={compact ? 26 : 30} className="logo-mark" />
      <Wordmark dark={dark} />
    </Link>
  );
}
