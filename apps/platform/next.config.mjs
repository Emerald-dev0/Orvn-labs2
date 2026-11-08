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
  // Retired pages. Every route the previous site published is accounted for here, so old links
  // and search results land somewhere that still answers instead of falling through to the 404.
  // The full inventory, with the reason for each destination, is in docs/legacy-routes.md.
  async redirects() {
    return [
      // Company material that replaced the archived product page.
      { source: '/pas', destination: '/about', permanent: true },
      { source: '/pas/:path*', destination: '/about', permanent: true },
      { source: '/test-pas', destination: '/about', permanent: true },
      { source: '/thesis', destination: '/about', permanent: true },
      { source: '/why-orvn', destination: '/about', permanent: true },
      { source: '/test', destination: '/', permanent: true },

      // Policies that were split up and merged.
      { source: '/legal/ai-disclosure', destination: '/legal/privacy', permanent: true },
      { source: '/legal/data-retention', destination: '/legal/privacy', permanent: true },
      { source: '/legal/acceptable-use', destination: '/legal/terms', permanent: true },
      { source: '/legal/fair-housing', destination: '/legal/terms', permanent: true },
      { source: '/privacy', destination: '/legal/privacy', permanent: true },
      { source: '/terms', destination: '/legal/terms', permanent: true },
      { source: '/fair-housing', destination: '/legal/terms', permanent: true },
      { source: '/ai-call-disclosure', destination: '/legal/privacy', permanent: true },

      // Journals and lead magnets that are no longer published. The closest live page is the
      // product explanation; nothing here pretends to be the old page.
      { source: '/blog', destination: '/about', permanent: true },
      { source: '/blog/:slug', destination: '/about', permanent: true },
      { source: '/newsletter', destination: '/about', permanent: true },
      { source: '/resources', destination: '/about', permanent: true },
      { source: '/calculators', destination: '/product', permanent: true },
      { source: '/calculators/:slug', destination: '/product', permanent: true },
      { source: '/calculate', destination: '/product', permanent: true },
      { source: '/scorecard', destination: '/product', permanent: true },
      { source: '/lead-leakage-scorecard', destination: '/product', permanent: true },

      // Pricing is not published, deliberately. Send price questions to the questions page.
      { source: '/pricing', destination: '/faq', permanent: true },

      // Old auth entry point. /admin is deliberately absent: it is a live route now, gated by
      // ADMIN_EMAILS in lib/admin-guard.ts, and a redirect here would shadow the queue entirely.
      { source: '/login', destination: '/sign-in', permanent: true },
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
