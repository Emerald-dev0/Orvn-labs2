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
