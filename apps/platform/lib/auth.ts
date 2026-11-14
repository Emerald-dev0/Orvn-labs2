import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import { APIError } from 'better-auth/api';
import { db } from './db';
import * as schema from '../db/schema';
import { sendEmail } from './email';
import { signInLinkEmail } from './emails/sign-in-link';
import { findUsableInvitation } from './invitations';
import { magicLinkDecision } from './magic-link-gate';
import { adminDb } from './db/admin';
import { user as authUser } from '../db/auth-schema';
import { sql } from 'drizzle-orm';
import { adminEmails } from './admin';
import { trustedOriginsFrom } from './auth-origins';
import { serverEnv } from './env';

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
 * Access model:
 * - The beta is invitation-only. Sign-in — creation included — passes through one gate below:
 *   a usable invitation for that exact address, or an address on the operator allowlist.
 *   There is no open sign-up route to forget to disable.
 * - D01: magic link only. There is no password surface anywhere in the product.
 * - Sessions are httpOnly, secure in production, same-site lax, and rotate their expiry on use.
 * - The sign-in form always answers the same way, so the form cannot be used to enumerate
 *   which addresses have accounts.
 */
const env = serverEnv();
const isProd = env.NODE_ENV === 'production';

const trustedOrigins = trustedOriginsFrom(process.env);

// Said once per process, because the failure it describes is silent otherwise: with an empty
// allow-list and no invitations, every sign-up and every magic link answers 403 "not on the beta
// list", which reads like a broken button rather than a missing environment variable.
let warnedAboutEmptyAllowlist = false;
function warnIfNobodyCanJoin() {
  if (warnedAboutEmptyAllowlist || adminEmails().length > 0) return;
  warnedAboutEmptyAllowlist = true;
  console.warn(
    '[auth] ADMIN_EMAILS is empty: no address can create an account or receive a sign-in link ' +
      'unless it holds an invitation. Set ADMIN_EMAILS to the operator address (comma-separated ' +
      'for several) and redeploy.',
  );
}

export const BETA_GATE_MESSAGE =
  'This address does not have beta access yet. Request access at orvnlabs.com/early-access.';

/**
 * Checked per request rather than at import time, so `next build` can compile without a
 * database or a secret while production still refuses to serve auth without one.
 */
export function assertAuthConfigured() {
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error(
      process.env.NODE_ENV === 'production'
        ? 'BETTER_AUTH_SECRET is required in production.'
        : 'BETTER_AUTH_SECRET is not set. Add it to apps/platform/.env.local.',
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Auth needs the Neon connection string.');
  }
}

export const auth = betterAuth({
  appName: 'ORREI',
  baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5174',
  secret: env.BETTER_AUTH_SECRET ?? 'development-only-secret-not-for-deployment',
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
    },
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      '/send-magic-link': { window: 60 * 15, max: 5 },
    },
  },

  /**
   * The beta gate. Every way of creating a user funnels through here, including magic-link
   * sign-in which would otherwise create an account on the spot.
   */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = String(user.email ?? '').toLowerCase();
          if (!email) return { data: user };

          // Read the list per request rather than snapshotting it at import: lib/admin.ts treats
          // ADMIN_EMAILS as something that can change without a code change, and the gate should
          // agree with the pages that use the same rule.
          if (adminEmails().includes(email)) return { data: user };

          const invitation = await findUsableInvitation(email);
          if (!invitation) {
            warnIfNobodyCanJoin();
            // The address is logged; the reason is what makes a 403 in the browser explainable.
            console.warn('[auth] refused account creation', {
              email,
              reason: 'no usable invitation, and the address is not in ADMIN_EMAILS',
            });
            throw new APIError('FORBIDDEN', { message: BETA_GATE_MESSAGE });
          }
          return { data: user };
        },
      },
    },
  },

  plugins: [
    nextCookies(),
    magicLink({
      // D01: single-use link, 15-minute expiry.
      expiresIn: 60 * 15,
      disableSignUp: false, // Account creation is governed by the hook above, not by the plugin.
      sendMagicLink: async ({ email, url }) => {
        // Decide before sending. An address with no account, no invitation and no operator entry
        // gets no email; the page says "Check your inbox" to everyone, so nothing is revealed.
        const address = String(email).trim().toLowerCase();
        const rows = await adminDb
          .select({ id: authUser.id })
          .from(authUser)
          .where(sql`lower(${authUser.email}) = ${address}`)
          .limit(1);
        const decision = magicLinkDecision({
          isAdmin: adminEmails().includes(address),
          hasAccount: rows.length > 0,
          hasInvitation: Boolean(await findUsableInvitation(address)),
        });
        if (decision === 'skip') {
          console.warn('[auth] magic link not sent', {
            email: address,
            reason: 'no account, no usable invitation, and the address is not in ADMIN_EMAILS',
          });
          return;
        }
        await deliver(
          await signInLinkEmail({ to: email, url, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }),
        );
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
