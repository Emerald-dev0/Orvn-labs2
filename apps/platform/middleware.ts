import { NextResponse, type NextRequest } from 'next/server';
import { strictCsp } from './lib/security/headers.mjs';

/**
 * Nonce-based CSP for every route that renders a form, a private record or a published page.
 *
 * Marketing pages are prerendered and keep the header baseline from next.config.mjs; adding a
 * per-request nonce there would force them to render dynamically for no security gain.
 */
export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const csp = strictCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  // Next reads this header and stamps its script tags with the nonce.
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', csp);
  response.headers.set('x-nonce', nonce);
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*',
    '/website/:path*',
    '/inquiries/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/w/:path*',
    '/invite/:path*',
    '/sign-in',
  ],
};
