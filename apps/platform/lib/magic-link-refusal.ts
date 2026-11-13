/**
 * Where a failed magic-link verification lands. A refused or unusable link must never show raw
 * JSON from the auth library: the person is sent back to the sign-in page with a notice that
 * says the link cannot be used, which is true for everyone and reveals nothing about the address.
 */
export const MAGIC_LINK_VERIFY_PATH = '/api/auth/magic-link/verify';

/**
 * Returns the absolute URL to redirect to, or null when the response should pass through
 * unchanged. Only the verify endpoint is affected.
 */
export function refusalRedirect(pathname: string, status: number, origin: string): string | null {
  if (pathname !== MAGIC_LINK_VERIFY_PATH) return null;
  if (status < 400) return null;
  return new URL('/sign-in?refused=1', origin).toString();
}
