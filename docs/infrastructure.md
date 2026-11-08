# Infrastructure: database, Cloudflare and email

Written 4 November 2026. This is the deployment plan the code already assumes, with the parts you
have to click yourself marked **you**.

---

## 1. The short answers

| Question | Answer | Why |
| --- | --- | --- |
| Database | **Neon Postgres** | The app is built on it: RLS, enums, transactions, `@neondatabase/serverless` |
| MongoDB? | No | It would remove the security boundary this product is built on (see §2) |
| Does Cloudflare cover the database? | No | D1 is SQLite; Hyperdrive is a connector to Postgres, not a database |
| Cloudflare's job | DNS, TLS, Email Routing (inbound), R2 (files), optionally WAF | All of it is already in the stack except the DNS setup |
| Where the app runs | Vercel | Cloudflare DNS points at it, DNS-only |

---

## 2. Database: Neon, and why not the alternatives

The decision is not really open any more — it is in the code:

- `db/schema.ts` is `pg-core` Drizzle: Postgres enums (`publication_status`, `visibility`), `gen_random_uuid()`, `count(*) filter (…)`, `numeric(14,2)`.
- `lib/db/tenant.ts` opens a transaction and runs `set local role orrei_app` / `orrei_public` on every query.
- `db/sql/policies.sql` is 400+ lines of row-level security: a workspace can only read its own rows, and the public code path can only read published rows.
- `publishProperty` writes a publication snapshot inside one transaction, so a page and its facts can never disagree.
- `better-auth` is wired to the Drizzle adapter over Postgres.
- `@neondatabase/serverless` is already a dependency.

### Why not MongoDB

MongoDB has no row-level security. The entire tenant boundary here is "the database refuses rows that
belong to someone else". On Mongo, that boundary moves into application code, and one missing filter
in one query is a cross-tenant leak. Given that security is the stated priority for this product, that
trade is the wrong way round. You would also lose: the transaction that makes publish atomic, the
enums that make invalid states unrepresentable, and every migration in `db/migrations`.

### Why not Cloudflare D1

D1 is SQLite. No roles, no `set local role`, no RLS, no `numeric` decimals, no partial indexes to
match what is written. Porting would mean rewriting the schema and the policy layer and re-running the
security tests against a different engine. It is a different product at that point, not a config change.

### What Cloudflare actually provides here

| Product | What it is | In this stack |
| --- | --- | --- |
| **Hyperdrive** | A connection pooler/proxy in front of *your* Postgres | Optional later, if we ever move the app onto Workers |
| **D1** | Managed SQLite | Not used |
| **KV** | Key-value cache | Not used |
| **R2** | Object storage, no egress fee | **Used** — uploads and images |
| **Email Routing** | Inbound mail forwarding | **Used** — `hello@`, `early@` |
| **Workers** | Edge compute | Not used; the app is Next.js on Vercel |

So Cloudflare covers storage, DNS, TLS and inbound email. The database stays on Neon.

### Setting up Neon

1. **You** — create the project in the same region you will put Vercel (Frankfurt or `us-east-1`
   if your users are in the US; the code does not care, latency does).
2. Copy two connection strings: the **pooled** one (`-pooler`) for `DATABASE_URL`, and the **direct**
   one for `DATABASE_URL_ADMIN` (migrations and the role script cannot run through the pooler).
3. Run, in order, from `apps/platform`:
   ```
   npm run db:migrate
   npm run db:policies     # creates orrei_app / orrei_public and the RLS policies
   ```
4. Set `BETTER_AUTH_SECRET` (32+ random bytes) and `BETTER_AUTH_URL=https://orvnlabs.com`.

The admin connection is only for migrations and role creation. Nothing in a request path uses it.

---

## 3. Cloudflare routing

**You** — none of this can be done from here: this environment has no Cloudflare credentials and
cannot reach `api.cloudflare.com`. Everything below is the exact order to do it in.

### 3.1 Nameservers

The domain must be on Cloudflare DNS before any of this works. Registrar → replace nameservers with
the pair Cloudflare shows you. Propagation is usually minutes, up to 24 hours.

### 3.2 Records

Vercel first, so it can issue the certificate:

| Type | Name | Value | Proxy |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | **DNS only** (grey) |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** (grey) |

Then in Vercel → Project → Domains, add `orvnlabs.com` and `www.orvnlabs.com`, and set **apex as the
canonical** host with `www` redirecting to it.

Why DNS-only and not the orange cloud: with the proxy on, Cloudflare terminates TLS, Vercel cannot
complete its own certificate challenge, and you get the "domain is behind a reverse proxy" warning
plus a second cache in front of Next's cache. If you later want Cloudflare's WAF in front, it is
possible — proxy on, SSL **Full (strict)**, cache level **Bypass** for HTML, Rocket Loader off — but
do that deliberately and verify the certificate renews.

### 3.3 The one redirect that matters

Choose apex as canonical, then add a Redirect Rule:

- **When** `hostname eq "www.orvnlabs.com"`
- **Then** dynamic redirect to `concat("https://orvnlabs.com", http.request.uri.path)`, 301.

Legacy paths (`/pas`, `/pricing`, `/blog`, …) are handled inside the app by `next.config.mjs`. Do not
duplicate them in Cloudflare; two redirect layers are how a redirect loop gets born.

### 3.4 Cache

Keep Cloudflare's cache out of the way of the app:

- Cache rule: **Bypass** for `orvnlabs.com/*` except `/images/*`, `/_next/static/*`, `/logo.png`.
- Never cache `/w/*` — those pages are per-business and shift the moment an owner changes visibility.

### 3.5 R2

1. **You** — create a bucket (`orrei-media`), enable the custom domain `media.orvnlabs.com` on it.
2. Access keys → `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
3. The bucket stays **private**. Files are served by the app's own authorisation route, not by a
   public bucket URL — a public bucket would defeat every visibility rule in the codebase.

---

## 4. Email

Two directions, two systems, and they do not conflict as long as the DNS is right.

### 4.1 Inbound — Cloudflare Email Routing

**You** — dashboard → Email Service → Email Routing → onboard `orvnlabs.com` → *Add missing records*.
Cloudflare writes and locks these:

```
orvnlabs.com          MX   21 route1.mx.cloudflare.net
orvnlabs.com          MX   43 route2.mx.cloudflare.net
orvnlabs.com          MX   65 route3.mx.cloudflare.net
orvnlabs.com          TXT       "v=spf1 include:_spf.mx.cloudflare.net ~all"
cf2024-1._domainkey   TXT       v=DKIM1; … (generated)
```

Then route the addresses you actually use, all to the inbox you read:

| Address | Purpose |
| --- | --- |
| `hello@orvnlabs.com` | everything, the only address on the site |
| `early@orvnlabs.com` | where `EARLY_ACCESS_INBOX` points for beta requests |

Both are already used by the code (`MAIL_FROM`, `EARLY_ACCESS_INBOX`, the legal pages).

### 4.2 Outbound — Calder

`lib/email.ts` posts to `api.calder.click` with an `Idempotency-Key` on every send. It is the only
sender; nothing in the app talks to an SMTP server.

For mail from `hello@orvnlabs.com` to pass DMARC:

1. **You** — add Calder's DKIM records for `orvnlabs.com` (they give you the selector and value).
2. Merge the SPF so both systems are allowed. Cloudflare's TXT is locked to its own include; if the
   dashboard will not let you edit it, remove and re-add the record as:
   ```
   v=spf1 include:_spf.mx.cloudflare.net include:<calder's spf include> ~all
   ```
   If Calder only publishes a return-path on its own domain, send the envelope from
   `mail.orvnlabs.com` and keep the From as `hello@orvnlabs.com` — DMARC alignment then comes from
   DKIM rather than SPF, which is normal and fine.
3. DMARC, start relaxed and tighten later:
   ```
   _dmarc.orvnlabs.com  TXT  "v=DMARC1; p=none; rua=mailto:hello@orvnlabs.com; adkim=r; aspf=r"
   ```
   Move to `p=quarantine` once a week of reports is clean. Do not start at `p=reject`.
4. Set `MAIL_FROM="ORREI <hello@orvnlabs.com>"` in Vercel.

### 4.3 Verify it

```
dig +short MX orvnlabs.com
dig +short TXT orvnlabs.com
dig +short TXT _dmarc.orvnlabs.com
dig +short TXT cf2024-1._domainkey.orvnlabs.com
```

Then send a real invitation to a Gmail address and check it lands in Primary, not Promotions, and
that the "via" line does not say `calder.click`.

---

## 5. The email design system

Emails are React now, rendered by React Email and delivered through the same Calder seam.

```
emails/
  components/Brand.tsx     the shared shell: pine masthead, ORREI wordmark, bone page, white card
  Invitation.tsx           invitation to a workspace
  ResetPassword.tsx        password reset
  SignInLink.tsx           passwordless sign-in
  InquiryNotification.tsx  one inquiry, forwarded to the publisher
  BetaApplication.tsx      early-access request, sent to the operator inbox
lib/emails/*.tsx           builds the message: subject, idempotency key, plain text, HTML
```

Design rules, matching the site:

- Bone `#f5f2eb` page, pine `#0e1512` masthead, warm-white `#fffdf8` card, lime `#c9f26e` used **once**,
  on the action.
- One column, 560px, table-based internals: Outlook still needs tables.
- System font stack — a webfont that fails to load is worse than a font that was never promised.
- `color-scheme: light` and a viewport meta, so dark-mode clients do not invert the card.
- Every link is also spelled out as a copyable URL; plain-text clients cannot click.
- Plain text is written by hand, not generated, because generated text drops the URLs.

Why React rather than string-built HTML: **escaping is the renderer's job now.** A workspace name or
a buyer's message is inserted as a React child, so `<script>` arrives as characters. The old templates
escaped by hand and one missed call was one injection away. `test/emails.test.tsx` proves both the
escaping and the idempotency keys.

Preview them locally:

```
cd apps/platform
npm run email:preview     # writes public/preview-emails/*.html, gitignored
```

---

## 6. Order of operations

1. Neon project → `DATABASE_URL`, `DATABASE_URL_ADMIN`.
2. `npm run db:migrate && npm run db:policies`.
3. Cloudflare nameservers → A/CNAME (DNS-only) → Vercel domains → certificate active.
4. Email Routing onboarded → addresses routed → test inbound.
5. Calder DKIM + SPF + DMARC → send a real invitation → check inbox placement.
6. R2 bucket, private, custom domain → upload a photo → confirm the public page serves it and a
   private one does not.
7. Everything else in `.env.example`: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ANALYTICS_HASH_SALT`,
   `GROQ_API_KEY`, `ADMIN_EMAILS`, optional `SENTRY_DSN` and `NEXT_PUBLIC_POSTHOG_KEY`.

**Not done from here, and cannot be:** the dashboard steps. There are no Cloudflare, Neon or Calder
credentials in this environment and outbound requests are limited to the package registries, so I
cannot provision or verify any of it. What is in the repo is the code and the exact records to add.
