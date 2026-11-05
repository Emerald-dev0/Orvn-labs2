import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { baselineHeaders } from './lib/security/headers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: here },
  poweredByHeader: false,
  serverExternalPackages: ['ws', 'sharp'],
  // Retired pages. The archived product page and the policies that only described it are
  // gone; old links land on something that still answers rather than a 404.
  async redirects() {
    return [
      { source: '/pas', destination: '/about', permanent: true },
      { source: '/legal/ai-disclosure', destination: '/legal/privacy', permanent: true },
      { source: '/legal/data-retention', destination: '/legal/privacy', permanent: true },
      { source: '/legal/acceptable-use', destination: '/legal/terms', permanent: true },
      { source: '/legal/fair-housing', destination: '/legal/terms', permanent: true },
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: baselineHeaders },
      // Authenticated surfaces are private by definition: no crawler, no cache, no framing.
      {
        source: '/(dashboard|properties|website|inquiries|analytics|settings)/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
