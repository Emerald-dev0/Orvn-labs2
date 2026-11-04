/**
 * The marketing site used a client-side metadata helper because it was a single-page app.
 * On the platform, each route exports Next.js `metadata`, so page-level SEO is rendered
 * on the server. This hook stays as a no-op so ported components keep compiling.
 */
export function useDocumentMeta() {}

export const SITE = {
  name: 'ORVN Labs',
  url: 'https://orvnlabs.com',
};
