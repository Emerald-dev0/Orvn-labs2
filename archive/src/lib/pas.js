// Single source of truth for links into the PAS backend / dashboard.
// The PAS app lives on its own infrastructure. The website never imports PAS code —
// it just routes users to the PAS URL via these helpers.
//
// Configure VITE_PAS_APP_URL in Vercel env vars when the production PAS host is finalized.
// TODO: Confirm final production URL with the PAS team before launch.
const DEFAULT_PAS_URL = 'https://app.orvnlabs.com';

export const PAS_APP_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PAS_APP_URL) ||
  DEFAULT_PAS_URL;

export const pasUrl = (path = '') => {
  const base = PAS_APP_URL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : path ? `/${path}` : '';
  return `${base}${suffix}`;
};

export const PAS_LINKS = {
  login: pasUrl('/login'),
  controlRoom: pasUrl('/control-room'),
  earlyAccess: 'mailto:hello@orvnlabs.com',
  signup: pasUrl('/signup'),
};
