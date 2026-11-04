'use client';

import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

/**
 * Browser-side auth. Passwordless is the default during the beta: an email link cannot be
 * phished out of a form, and it proves the address before the account exists.
 */
export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});
