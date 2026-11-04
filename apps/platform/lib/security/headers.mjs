/**
 * HTTP security policy for the product. Plain JS so both next.config.mjs (Node ESM) and
 * middleware.ts can import the same definition — one source of truth, no drift.
 *
 * Two profiles:
 * - baselineHeaders: safe everywhere, no nonce needed. Applied to every route by next.config.
 * - strictCsp(nonce): applied by middleware to authenticated and public-page routes, where a
 *   per-request nonce is affordable. Marketing pages stay static and keep the baseline.
 *
 * Next reads the CSP request header and stamps its own script tags with the nonce, so
 * 'strict-dynamic' does the work instead of 'unsafe-inline'.
 */

const isDev = process.env.NODE_ENV !== 'production';

export const baselineHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

export function strictCsp(nonce) {
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const connectSrc = isDev
    ? "'self' ws: wss: http://localhost:* http://127.0.0.1:*"
    : "'self' https://*.neon.tech wss://*.neon.tech";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // The design system ships one CSS file; the only inline style attributes in the product
    // come from React props we control.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}
