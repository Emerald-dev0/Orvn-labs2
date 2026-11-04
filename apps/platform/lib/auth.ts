import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import { db } from './db';
import * as schema from '../db/schema';
import { sendEmail } from './email';
import { signInLinkEmail } from './emails/sign-in-link';
import { resetPasswordEmail } from './emails/reset-password';

/**
 * Delivery failures are logged with the provider's code and surfaced to the user as one
 * neutral sentence. The provider's wording, request id and status never reach the browser.
 */
async function deliver(message: Parameters<typeof sendEmail>[0]) {
  try {
    return await sendEmail(message);
  } catch (error) {
    const code = (error as { code?: string }).code ?? 'unknown';
    const requestId = (error as { requestId?: string }).requestId;
    console.error('[email] delivery failed', { code, requestId });
    throw new Error('We could not send that email just now. Try again.');
  }
}

/**
 * Better Auth: users, sessions and invitations live in our Neon database.
 *
 * Email delivery goes through Calder (see lib/email.ts). Without CALDER_API_KEY in
 * development, messages are printed to the console instead of sent. In production a missing
 * key is a hard error: the app will not pretend an email was delivered.
 */
const authSecret = process.env.BETTER_AUTH_SECRET;

// In production a missing secret must stop the app, not fall back to a shared default.
if (!authSecret && process.env.NODE_ENV === 'production') {
  throw new Error('BETTER_AUTH_SECRET is required in production.');
}

export const auth = betterAuth({
  appName: 'LAREI',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5174',
  secret: authSecret ?? 'development-only-secret-not-for-deployment',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    sendResetPassword: async ({ user, url }) => {
      await deliver(resetPasswordEmail({ to: user.email, url }));
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    additionalFields: {
      // Nothing beyond Better Auth's defaults yet; workspace membership lives in `memberships`.
    },
  },
  plugins: [
    nextCookies(),
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        await deliver(
          signInLinkEmail({ to: email, url, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }),
        );
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
