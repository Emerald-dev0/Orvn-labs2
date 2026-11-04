# Security model

Written 4 November 2026, alongside the first backend slice. It describes what exists in the
code today, not what is planned. Where something is missing it says so.

## 1. What is being protected

| Asset | Worst outcome if lost |
|---|---|
| Workspace records (drafts, facts, internal notes) | A competitor reads somebody's pipeline, or a seller's private data leaks |
| Unpublished pages and private files | A deal is disclosed before the owner is ready |
| Inquiries | A buyer's name, address and question become public, or land in the wrong business |
| Seller documents inside a record | Contract, ID or personal data exposure |
| Beta membership | The private beta becomes an open sign-up |
| Credentials | Everything above |

The design rule underneath all of it: **a thing that has not been published does not exist on
the public internet**, and a published thing is a frozen copy, not a window into a live record.

## 2. Trust boundaries

```
browser  ──HTTPS──▶  Next.js server (Workers)  ──TLS──▶  Neon Postgres
                            │
                            └──▶  R2 (private bucket, signed, proxied)
```

- No browser code holds a database URL, an R2 key or a service token.
- Every read and write goes through server code that first establishes *who* is asking and
  *which workspace* they are allowed to act in.
- The database is the second check, not the first. Both must be wrong for a leak.

Two database URLs exist on purpose:

| Variable | Role | Used by |
|---|---|---|
| `DATABASE_URL_ADMIN` | table owner | migrations, `db:policies`, operator scripts |
| `DATABASE_URL` | `larei_app`, no bypass | the application at runtime |

## 3. Authentication and membership

**Invitation only.** There is no reachable sign-up path. Every way of creating a user —
password, magic link, or a future provider — passes through one gate in
`lib/auth.ts` (`databaseHooks.user.create.before`), which requires a usable invitation for that
exact address, or an address on `ADMIN_EMAILS`. The gate cannot be bypassed by calling an
endpoint directly, because it is inside account creation rather than in front of a form.

**Invitations** (`lib/invitations.ts`):

- 256-bit random token, URL-safe; only its SHA-256 hash is stored.
- Bound to one email, seven-day expiry, single use, revocable.
- Acceptance runs inside `app_accept_invitation()`, a `SECURITY DEFINER` function that
  validates the token, the expiry, the used flag and the signed-in address *in one statement*,
  then writes the membership and the audit entry. Application code cannot accept an invitation
  by forgetting a check.
- The signed-in address is read from the session, never from the form, so a forwarded link is
  useless to the recipient.

**Sessions** (Better Auth): httpOnly, `SameSite=Lax`, `Secure` in production, 30-day expiry with
daily rotation, five-minute cookie cache. Signing out revokes the session row.

**No account enumeration.** The sign-in form answers identically whether or not an address has an
account; the magic-link call swallows a beta-gate rejection and returns the same sentence. The
invite page shows a masked address (`d•••@example.com`), never the full one.

**Account recovery.** `/forgot-password` requests a single-use link (one hour) and `/reset-password`
consumes it. The request form answers identically whether or not the address exists. A password
change invalidates the other sessions on the account, which is the only safe behaviour when the
reason for resetting might be a compromise.

**Rate limits** on auth endpoints (Better Auth, per route) plus the application limiter below.
Caveat: Better Auth's limiter is in-memory, so on Workers it is per-isolate. The
application-level limiter is the one that holds.

## 4. Authorisation: two checks, not one

### 4.1 Scoped data layer

Every tenant query goes through `withUserDb(userId, fn)` or `withPublicDb(fn)` in
`lib/db/tenant.ts`. Each opens a transaction, sets `app.user_id`, and issues `SET LOCAL ROLE`
to demote the connection before the callback runs. Application code never receives a raw
pool; it receives a transaction that already knows who is asking.

Workspace ids are never read from a form field. `requireWorkspace()` resolves the caller's
membership, and the resolved id is what queries use.

### 4.2 Row level security

`db/sql/policies.sql`. Thirteen tables carry `workspace_id` (directly or through a property)
and all thirteen have RLS enabled with explicit policies.

- `larei_app` — members read; `owner`/`editor` write; deletes restricted to owners; beta
  invitations (no workspace) are invisible to tenants entirely.
- `larei_public` — read-only over published projections: published properties, approved and
  public facts, public media, publications that are not withdrawn, published profiles. It can
  insert an inquiry (with consent, matching workspace, published property) and a view counter.
  It cannot read inquiries, invitations, audit entries, memberships or drafts back.
- Append-only tables are append-only in policy, not convention: `analytics_events` and
  `audit_events` have no update or delete policy for either role.
- A trigger refuses any update to a publication snapshot except `unpublished_at`.

The two privileged functions (`app_accept_invitation`, `app_create_workspace`) are
`SECURITY DEFINER`, are revoked from `PUBLIC`, and are granted only to `larei_app`.

### 4.3 Roles and write permissions

`owner` and `editor` may write records; only `owner` may change membership or delete a
property. A `viewer` can read and cannot write — enforced in `lib/access.ts` and again by the
`app_can_write()` predicate in every write policy.

## 5. The public boundary

**Publishing takes a snapshot.** `publishProperty()` builds a `PublicationSnapshot` from
approved, public values only, stores it with a version number, and flips the property to
`published`. The public page reads the snapshot. Editing a draft afterwards cannot alter what a
buyer already has open.

**What the snapshot can never contain** (enforced in `lib/publication/snapshot.ts`, tested in
`test/publication.test.ts`):

- a fact that is not `approved`, or not `is_public`, or empty;
- a private file;
- a street address unless the owner allowed it *and* the pin is exact;
- a price amount when the seller chose “on request” — the amount is not written into the
  snapshot at all, so it cannot leak through the page, the metadata or the JSON;
- a value that was never supplied. A blank flood field is absent; it is never rendered as
  “not in a flood zone”.

**Unpublishing** sets `unpublished_at` on every open publication *and* changes the property
status, in one transaction. The public page, the portfolio card and the media route all require
a published property with an open publication, so withdrawing one row removes the page, its
files and its card together.

**Unavailable means unavailable.** `/w/{username}/p/{slug}` answers the same 404 page for a
draft, an archived record, an unpublished record and a slug that never existed. It does not
name the property or hint that a record exists.

**Files** are never linked directly. `/api/media/[...key]` checks the key's shape, then the row:
public visibility, published property, allowed content type (jpg/png/webp/avif/pdf — never svg,
html or js). Anything else is a 404, and storage stays private behind a signed request that never
reaches the browser.

**Metadata is derived from the same snapshot.** `generateMetadata` builds title, description and
image from approved values only; the OG image renders the same fields. A private file cannot
become a preview card.

## 6. Inquiries

- Workspace and property are resolved server-side from the published slug; the client cannot
  choose a recipient.
- Consent is required by the Zod schema *and* the insert policy (`consent = true`).
- `inquiries.dedupe_key` is a unique index over a hash of the property and a per-render token,
  so a retried submit returns the same inquiry instead of a second one. “Exactly once” is a
  database guarantee, not a UI behaviour.
- Two fixed-window limits: per visitor (5 / 10 min) and per visitor per property (3 / hour). If
  the limiter is unreachable the submission is refused, not allowed.
- A hidden honeypot field: filled, the form answers normally and stores nothing.
- The confirmation says the owner has **not** opened it. No read receipts are implied anywhere.
- Owner notification is a best-effort email keyed to the inquiry id; failure to deliver never
  loses the inquiry.

## 7. Analytics and retention

- No IP address is stored. A daily-salted HMAC of address + user agent is kept to avoid double
  counting, and the salt rotation makes the hash useless across days.
- Link-preview fetchers (WhatsApp, iMessage, Slack, LinkedIn, generic crawlers) are recorded as
  bots, so a shared link does not look like a buyer.
- Events are append-only and scoped to a published property by policy.
- Archiving a property does not delete its history; nothing in the UI promises deletion windows
  that the infrastructure cannot honour.

## 8. Transport and browser surface

- HSTS (production), `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`,
  `Cross-Origin-Opener-Policy: same-origin`.
- Product and public routes get a per-request **nonce-based CSP** from `middleware.ts`
  (`'strict-dynamic'`, no `'unsafe-inline'` for scripts). Marketing pages stay static and keep the
  baseline header set.
- Authenticated routes send `X-Robots-Tag: noindex, nofollow, noarchive` and
  `Cache-Control: private, no-store`.
- `poweredByHeader` is off.

## 9. Secrets and configuration

`lib/env.ts` is the only place environment variables are read. It is server-only, parsed with
Zod, and cached. `missingProductionConfig()` lists what a production deployment must have; the
build does not require them, so CI can compile without secrets, but `/api/health` reports
`misconfigured` and returns 503 in production when something is missing. Health reports
booleans only — never a value.

Rotating `ANALYTICS_HASH_SALT` invalidates every stored visitor hash. Rotating
`BETTER_AUTH_SECRET` invalidates every session and password reset link. Both are intended
effects; document them in the incident runbook, not in a commit message.

## 10. Audit

`audit_events` records who did what to which record: workspace creation, invitation acceptance,
publication, unpublish/archive, inquiry received. It is append-only for both roles. It is not a
debug log and it holds no message bodies.

## 11. What is tested, and what is not

`npm test` — 68 tests, all green.

- **Snapshot boundary** (11): approval + public + non-empty; private media excluded; address
  gating; “on request” cannot leak an amount; missing price is not zero; leading-zero parcel
  numbers survive; approximate location is labelled.
- **Validation** (12): consent required; short messages rejected; request tokens constrained;
  reserved usernames cover the real routes; amounts reject bad precision; slugs deterministic.
- **Security primitives** (12): token entropy and hashing; constant-time compare; salted
  identifiers; storage-key shape; dangerous content types refused; bot filtering; window maths.
- **Policy coverage** (5): every tenant table has RLS; the public role has no read grant on
  inquiries, invitations, audit or memberships; inquiries are insert-only for a visitor;
  consent and publication are required by the policy; snapshots are immutable and analytics
  append-only.
- **Workspace layer** (17): money formatting never invents an amount, relative time, record
  completeness, label humanising, property update schema (uuid ids, money precision, location
  precision default), creation schema, and that the member form cannot mint an owner.
- **Upload validation** (8): type comes from magic bytes, not the filename; HTML renamed to
  `.jpg` is refused; declared/actual mismatch is refused; empty and oversized files are refused;
  traversal fragments are stripped from stored names.
- Existing email tests (4).

Not covered yet, stated plainly:

- No live-database integration test. The policies are checked statically, not executed.
- No Playwright suite for the spec's T01–T25.
- No load or fuzz testing of the inquiry endpoint.
- No Sentry or alerting.
- No Turnstile on the inquiry form (rate limits only).

## 12. Operator runbook

```bash
# 1. Migrations, as the owner role
DATABASE_URL_ADMIN=... npm run db:migrate

# 2. Roles, grants, RLS policies (idempotent)
DATABASE_URL_ADMIN=... npm run db:policies

# 3. Confirm posture
curl -s https://app.example.com/api/health | jq
```

Creating a beta invitation is currently an operator action (no admin UI yet):

```ts
import { createInvitation } from './lib/invitations';
await createInvitation({ email: 'person@example.com', role: 'owner' });
```

Incident responses that exist today:

- **A link leaked**: revoke the invitation row (`revoked_at`); existing sessions are unaffected —
  sign the person out by deleting their `session` rows.
- **Something was published by mistake**: unpublish from the property. That closes the snapshot,
  removes the card and makes every file 404 in one step.
- **A secret leaked**: rotate `BETTER_AUTH_SECRET` (all sessions die), rotate `CALDER_API_KEY` and
  `R2_SECRET_ACCESS_KEY` at the provider, then redeploy.

## 13. Gaps, in the order they matter

1. **The workspace is half-wired.** `lib/data/workspace.ts` and `lib/actions/*` now cover
   creating a property, editing it, recording facts and decisions, attesting rights,
   publish/unpublish/archive, inquiry status, the professional profile and member invitations.
   `/properties`, `/properties/[id]`, `/properties/new`, `/inquiries` and `/dashboard` read from
   the database and call those actions. `/website`, `/analytics` and `/settings` still render the
   sample workspace. Without `DATABASE_URL` the whole app falls back to that sample workspace
   behind a visible "Preview build" banner, so the preview is never mistaken for live data.
2. **No live policy test.** A Neon branch plus a test that runs as `larei_app` and asserts
   cross-tenant reads return zero rows would turn the static checks into proof.
3. **Better Auth rate limiting is per-isolate.** Move to the Postgres limiter or Workers rate
   limiting before the beta opens.
4. **Uploads are server-side only.** `uploadMedia` validates bytes, writes to R2 and records a
   row; files start private and `setCoverMedia` / `setMediaVisibility` / `removeMedia` follow the
   same rules. Still missing: image resizing and thumbnails, HEIC acceptance, per-workspace
   storage quota, and a background sweep for objects whose rows were deleted mid-failure.
5. **No admin surface.** Beta invitations are a script; there is no UI for the waitlist or for
   revoking a member, and `revokeMember` is a stub that says so rather than pretending.
6. **No CSP reporting.** `report-uri` plus a collector would tell us what breaks rather than
   waiting for a user to say the page is blank.
7. **No integration tests against a live database.** CI now typechecks, runs the unit suite,
   re-checks policy coverage and builds on every push, but nothing in CI opens a connection.
