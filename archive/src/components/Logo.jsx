import React from 'react';

export default function Logo({ size = 32 }) {
  return (
    <img
      src="/logo.png"
      alt="ORVN Labs Logo"
      width={size}
      height={size}
    />
  );
}
