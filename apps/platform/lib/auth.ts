import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import * as schema from '../db/schema';

/**
 * Better Auth: users, sessions and invitations live in our Neon database.
 *
 * Email delivery (Resend) is wired in when RESEND_API_KEY exists; until then the beta is
 * invite-only and sign-in links are printed by Better Auth in development.
 */
export const auth = betterAuth({
  appName: 'LAREI',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5174',
  secret: process.env.BETTER_AUTH_SECRET,
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
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
