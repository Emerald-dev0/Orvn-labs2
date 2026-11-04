# LAREI platform build plan

Working document. Answers two questions: what we build first, and which third-party tools we
buy. Revised for the stack agreed on 4 Nov: Next.js, Neon, Cloudflare Workers, Groq.

## 1. Status

- Marketing site lives in **`apps/platform`** now: Next.js 16 (App Router), same design system,
  same copy, server-rendered. 16 routes build and render.
- The original Vite app at the repo root is frozen. It still holds the blog, the two
  calculators and the blog admin, which are PAS-era pages and are not part of the port yet.
- The workspace UI is built against demo data in `src/app/data.js`: `/dashboard`, `/properties`,
  `/properties/[id]` (seven tabs), `/properties/new`, `/website`, `/inquiries`, `/analytics`,
  `/settings`. Append `?state=empty` to any list screen to see its empty state.
- Icons: Hugeicons free set through `src/app/icons.jsx`, one module so the family can be swapped.
- **Backend M0 is built** (4 Nov): invite-only auth with a single account-creation gate,
  invitation acceptance in a `SECURITY DEFINER` function, a scoped-by-default data layer
  (`withUserDb` / `withPublicDb`), RLS on all thirteen tenant tables, audit log, rate limiter,
  environment validation, nonce-based CSP and a security header baseline. `docs/SECURITY.md`
  documents the model, the runbook and the gaps.
- **Public pages are real**: `/w/{username}` and `/w/{username}/p/{slug}` render server-side from
  an immutable publication snapshot, with generated OG metadata and an `og:image` route.
  Media is served only through `/api/media/[...key]`, which checks release state first.
  With no database configured these routes 404 — nothing published means nothing to show.
- **Workspace backend**: `lib/data/workspace.ts` (tenant-scoped read models for records,
  inquiries, overview, analytics, profile, members) and `lib/actions/*` (create, edit, facts and
  decisions, rights attestation, publish/unpublish/archive, inquiry status, site, invitations).
  Every action resolves the workspace and role from the session, validates with Zod, writes
  inside `withUserDb` and appends an audit entry.
- **Uploads**: server-side validate-then-write to R2, per-file visibility, cover selection and
  removal; the media route still gates every read on release state.
- **CI**: `.github/workflows/ci.yml` typechecks, runs the unit suite, re-checks RLS coverage and
  builds on every push, with no secrets required.
- **Wired**: `/properties`, `/properties/[id]` (with real publish/unpublish and uploads),
  `/properties/new`, `/inquiries`, `/dashboard`. **Still sample data**: `/website`, `/analytics`, `/settings`.
  With no `DATABASE_URL` the whole app shows the sample workspace behind a "Preview build"
  banner rather than pretending to be live.

## 2. Build first: the publishing spine

Not the AI. One complete path:

> Sign in by invitation → create a workspace → enter one property by hand → review it →
> publish it → a buyer opens the public page on a phone and sends an inquiry → the owner sees
> that inquiry and the page views.

Why:

- It is the product's whole claim. If a record cannot reach a page a buyer can use, anything
  built on top is decoration.
- It forces the decisions that are expensive to reverse: tenancy, the public/private boundary,
  publication state, file authorisation, anonymous analytics.
- Everything else is additive. AI drafting, deal sheets and brand voice all read from this
  record and write into the same approval flow.
- It is demoable to early-access applicants in days.

Out of scope for the first slice: AI generation, brand voice, deal-sheet export, maps, team
roles beyond owner, billing.

Exit criteria, taken from the spec and turned into tests:

- A non-approved applicant cannot reach a workspace, or guess a URL into one.
- Unpublishing a property makes the page and its files unreachable, not merely unlinked.
- Two workspaces never see each other's records, pages or inquiries.
- APNs keep leading zeros. Prices store amount plus currency. Unknown stays unknown.
- A published link unfurls correctly in WhatsApp and iMessage.
- An inquiry reaches the right workspace exactly once and does not claim the owner read it.

## 3. Stack

### Application

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16, App Router** | Published pages must render on the server: chat apps fetch `og:` tags themselves, and a client-rendered SPA cannot produce them per property. |
| Language | **TypeScript for new code**, JSX kept for ported marketing components | The product code gets types from day one; the ported static pages do not need a rewrite to ship. |
| Hosting | **Cloudflare Workers** via **OpenNext** | Agreed target. Workers + R2 + WAF in one account, no egress bill, edge latency. |
| Styling | **The existing hand-written CSS** | `index.css` tokens and `sections.css` port as-is. Tailwind stays configured but the product surface uses the design system. |

Workers caveat, stated plainly: OpenNext runs Next.js on Workers but not every Node API is
available. Anything needing `fs`, native modules or long CPU has to become a Worker-compatible
route or a queue job. We find those at build time, not in production.

### Data

| Layer | Choice | Why |
|---|---|---|
| Database | **Neon Postgres** | Branching for preview databases, serverless driver over HTTP/WebSocket, plain Postgres underneath. |
| Query layer | **Drizzle ORM + drizzle-kit** | Typed schema in the repo, SQL migrations reviewed like code, no runtime magic. |
| Driver | **`@neondatabase/serverless`** | Works inside Workers; pooled HTTP for reads, WebSocket session for transactions. |
| Tenancy | `workspace_id` on every private row + **Postgres RLS** as defence in depth | Authorisation is checked in the database as well as in the data layer. Cross-tenant access is tested with Playwright, not assumed. |
| File storage | **Cloudflare R2** | S3 API, no egress fees, signed URLs. Private bucket; public delivery only through a Worker route that checks release state. |

RLS on Neon needs a per-request session variable (`set_config('app.user_id', $1, true)`) inside
the transaction, because there is no Supabase auth context. That lives in one data-access
module: every query goes through it, and the policies are written against the same variable.

### Identity and mail

| Layer | Choice | Why |
|---|---|---|
| Auth | **Better Auth** (recommended) | Users, sessions, magic links and invitations live in our own Postgres. No per-MAU bill, no vendor lock, works on Workers. |
| Email | **Calder** (`api.calder.click`) | Invitations, sign-in links, inquiry notifications. Bearer keys, `Idempotency-Key` on every send, machine-readable codes (`suppressed`, `domain_not_verified`, `idempotency_conflict`). Behind a provider seam in `lib/email.ts`, so the app never calls the vendor directly. |

Calder requires the `from` address to belong to a verified sending domain (or the connected
Gmail account); anything else fails closed with `domain_not_verified`. Until `orvnlabs.com` is
verified in Calder, invitation and sign-in mail go out from the test key and will be refused,
so verifying the domain is a launch task, not a detail.

### AI

- **Vercel AI SDK** with **`@ai-sdk/groq`**. Model IDs come from env, so switching provider is a
  config change plus one adapter.
- Default: **`openai/gpt-oss-120b`** on Groq (131k context, production tier, $0.15/$0.60 per
  million tokens). Fallback: `openai/gpt-oss-20b`.
- Groq does not serve embeddings. Brand-voice retrieval starts as curated few-shot examples and
  Postgres full-text search; embeddings arrive when we move to a provider that offers them.
- Every generation is logged with model, prompt version, cost and output so a claim can be
  traced to the run that produced it. Prompts live in the repo, versioned. Facts come from the
  database, never from the prompt.

### Everything else

| Need | Choice |
|---|---|
| Validation | **Zod** (one schema for forms and server actions) |
| Forms | **React Hook Form** |
| OG images | **`next/og`** (Satori), 1200×630 generated from the record |
| Maps (M4) | **MapLibre + OpenStreetMap/Protomaps**, approximate pin only |
| Marketing analytics | **PostHog** free tier |
| Product analytics | Our own Postgres event table and bot filter, because "observable activity" is a customer feature with our retention rules |
| Errors | **Sentry** (Workers SDK) |
| Abuse | **Cloudflare Turnstile** + Workers rate limiting |
| Documents | **`unpdf`** (PDF), **`mammoth`** (DOCX) |
| Deal sheet export | Print CSS first; headless rendering only if print quality is not enough |
| Tests | **Vitest** for units, **Playwright** for the spec's 25 negative cases |
| CI | **GitHub Actions** |

### Deliberately not chosen

Supabase (auth, storage and RLS are now ours to run: replaced by Better Auth, R2 and Postgres
RLS), Vercel hosting (Workers is the target; Next.js does not care where it runs), Clerk/Auth0
(per-MAU cost, data leaves our database), Stripe/Paystack (no public pricing yet), Inngest
(Workers queues first), Algolia, Cloudinary, any ARV or valuation data.

## 4. Data model, first pass

Tenant boundary is `workspace_id` on every private row.

- `user`, `session`, `account`, `verification` — Better Auth's tables.
- `workspaces` — name, username, brand fields, plan state, owner.
- `memberships` — user × workspace × role (`owner`, `editor`, later `viewer`).
- `properties` — title, property_type, address fields, city/region/country, lat/lng +
  `location_precision` (`exact` | `approximate` | `unknown`), price amount + currency +
  visibility, availability_status, publication_status, slug, published_at.
- `property_details` — typed key/value rows with `source_type`, `source_reference`, `confidence`,
  `approval_state`. This is where F04's per-value provenance lives. APNs are text.
- `property_media` — R2 key, kind, order, cover flag, `visibility` (`public` | `private`).
- `property_publications` — immutable snapshot of what went live, plus who and when. The public
  page renders the snapshot, so editing a draft cannot silently change a live page.
- `inquiries` — property, workspace, name, email, phone, message, consent, source, status.
- `analytics_events` — workspace, property, event type, anonymous visitor hash, referrer, bot
  flag, timestamp. No IP stored.
- `invitations` — email, workspace, token hash, expiry, accepted, revoked.
- `ai_generations` — workspace, property, kind, model, prompt version, output, usage.

## 5. Why the public pages need a server

A property link is shared in WhatsApp, iMessage, Telegram, email and SMS. Those apps fetch the
URL themselves and render whatever `og:` tags they find. A Vite SPA answers every route with the
same `index.html`, so every shared link would unfurl with one generic card or none. The spec's
F08 requires "link previews show appropriate title/image".

So: published pages render on the server from the publication snapshot, with per-property
metadata and a generated OG image, cached at the edge.

## 6. Order of work

**M0 — Foundation** — code complete, infrastructure pending
Marketing app running on Next (done). Drizzle schema, migrations and RLS policies (done, managed
by `npm run db:migrate` and `npm run db:policies`). Better Auth with magic links plus an
invitation gate (done). Workspace bootstrap via `app_accept_invitation` (done). Remaining: a Neon
project, CI, Sentry, and an admin path for issuing invitations.

*Demo:* an invited email can sign in and lands on an empty private workspace; an uninvited one
cannot; another workspace's URL returns nothing.

**M1 — Property record**
Create, edit, autosave, statuses. Manual fields, R2 uploads with per-file visibility, detail
values with provenance and approval state, visible conflict state.

*Demo:* a property built from notes survives reload, keeps APN leading zeros, shows an
unresolved price conflict.

**M2 — Publish and inquire**
Publication snapshot, public page, dynamic OG image, share sheet, inquiry form with rate limit
and consent, owner inquiry list, view counts.

*Demo:* the link unfurls in WhatsApp; the inquiry lands in the right workspace once;
unpublishing kills the page and its files.

**M3 — AI drafting**
Groq via AI SDK, prompt versions, deal copy against approved facts only, "used in this draft"
traceability, regenerate and diff, stale-copy warning.

**M4 — Breadth**
Brand voice, dashboard analytics, settings, admin invite queue, roles, print polish, maps.

## 7. Cost at beta scale

Cloudflare Workers Paid $5/mo (free tier works for demos but has CPU limits). Neon Launch ~$19/mo
(the free tier is fine for building; paid adds point-in-time restore). R2 pennies at this volume.
Resend free tier 3,000 emails. Sentry and PostHog free tiers. Groq is metered: a full property
package is a few thousand tokens, so well under a cent per generation.

**$25–35/month** plus token usage.

## 8. Decisions

Settled:

- **D1** Public pages render on the server. Yes, Next.js.
- **D2** AI starts on Groq (`openai/gpt-oss-120b`), swappable later.
- **D3** Email goes through Calder, behind `lib/email.ts`.
- **D3** Hosting on Cloudflare Workers, database on Neon.

Open:

- **D4 Auth**: Better Auth (recommended), Clerk, or Auth.js.
- **D5 Public route shape**: `orvnlabs.com/w/{username}` vs `{username}.orvnlabs.com` vs a
  separate domain. Content model is unaffected; URLs are, so decide before M2.
- **D6 Legacy pages**: the blog, the two calculators and the blog admin are PAS-era. Port,
  freeze, or delete.
- **D7 Entity and jurisdiction** for terms, needed before real invitations go out.
- **D8 Pricing model**, needed before billing work, not before M2.
