"use client";

import React from 'react';
import Link from 'next/link';

/** The ORREI mark, served from /logo.png so the same asset carries everywhere. */
export function Mark({ size = 30, className = '' }) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden="true"
      focusable="false"
    />
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
    <Link href={to} className="logo" aria-label="ORVN Labs home">
      <Mark size={compact ? 26 : 30} className="logo-mark" />
      <Wordmark dark={dark} />
    </Link>
  );
}
