> **Operations doc — current** (vendor choice permitted by PRD §20.3 / D16). Read `docs/PRD.md` first for what the product must do; this doc only explains how to stand the infrastructure up.

# Environment values, and where each one comes from

The short version of what goes in `.env.local` (local) or the Vercel project (deployed), in the order
you can actually obtain them. Nothing here is a secret worth committing — `.env.local` is git-ignored.

## Where the file goes

**`apps/platform/.env.local`** — next to `next.config.mjs`, never at the repository root.

Next reads env files from the directory containing the app it is building, so a root-level
`.env.local` is silently ignored: the app starts in demo mode and nothing tells you why. The root also
still holds the old Vite app, whose own `.env` would load into that build instead.

Nothing lives in a file once deployed. Vercel → **project → Settings → Environment Variables**, with
**Root Directory set to `apps/platform`** (it already is — that is how the deployment finds
`vercel.json`). If the root directory is ever changed to the repo root, the build breaks and every
variable has to move.

The operator scripts load the same two files themselves, in this order of precedence:

1. a real environment variable (shell export, or Vercel)
2. `apps/platform/.env.local`
3. `apps/platform/.env`

So `npm run db:status`, `db:migrate`, `db:policies` and `npm run invite` work with one file and no
`export`. `next dev` and `next build` use `.env.local` the same way.

---

## 1. You can fill these in right now, no DNS needed

| Variable | Value | Where it comes from |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | 48 random bytes | `openssl rand -base64 48` |
| `BETTER_AUTH_URL` | `http://localhost:5174` locally, `https://orvnlabs.com` deployed | this file, by hand |
| `ADMIN_EMAILS` | the address **you sign in with** | see §3 — it is not a `@orvnlabs.com` address yet |
| `ANALYTICS_HASH_SALT` | 32 random hex bytes | `openssl rand -hex 32` |
| `CALDER_API_URL` | `https://api.calder.click/v1` | this file, by hand |
| `CALDER_API_KEY` | `calder_sk_live_…` | Calder → project `proj_dd2355404c90` → **API keys** → create one. The full key is shown once |
| `MAIL_FROM` | `hello@orvnlabs.com` (bare: no name, no `<>`, no quotes) | only after that address exists as a **sender identity** in Calder (§4) |
| `EARLY_ACCESS_INBOX` | `hello@orvnlabs.com` | one inbox for everything — the same address the site publishes (§5 forwards it to your Gmail) |
| `GROQ_API_KEY` | `gsk_…` | `console.groq.com` → API Keys. Optional: without it the drafting panel says so instead of inventing text |

`MAIL_FROM` note: it must match a **verified sender identity** in Calder, character for character on the
address. The dashboard currently lists one identity, `intakeorvn`. Until you add `hello@orvnlabs.com`,
set `MAIL_FROM` to whatever address that identity is, or Calder answers 200 and nothing arrives.

## 2. Needs the database created first

Neon dashboard → your project → **Connection string**:

| Variable | Value | Note |
| --- | --- | --- |
| `DATABASE_URL` | pooled string for the `orrei_app` role | this is the one the app uses; row-level security applies to it |
| `DATABASE_URL_ADMIN` | owner role, unpooled | migrations and `db:policies` only, never in a request path |

Then, in order:

```
npm run db:migrate
npm run db:policies
```

Both are safe to re-run. Without `DATABASE_URL` the site runs in demo mode: real pages, sample rows,
and every write path answers honestly that it is not connected.

## 3. `ADMIN_EMAILS` — and why it is not your domain address

Sign-in is by single-use magic link (PRD D01 — there is no password), so the identity is whatever address you sign in with.
The admin queue compares your **session email** against `ADMIN_EMAILS`, exactly:

```
ADMIN_EMAILS=danieloyegoke001@gmail.com
```

That works today, before any mail change. Later, once `hello@orvnlabs.com` forwards reliably and Calder
delivers, you can register an account on `hello@orvnlabs.com` and move the value — but there is no
reason to wait for that to use the queue.

Anyone not on this list gets a **404** on `/admin`, not a 403. Changing the list is a redeploy.

## 3a. Signing in — single-use email link, always

There is no password anywhere in ORREI (PRD D01). Everyone signs in the same way:

1. Open `/sign-in`.
2. Enter the address on `ADMIN_EMAILS` and request the sign-in link.
3. Open the link — the account is created on first sign-in. The link works once and expires in
   fifteen minutes.

The beta gate decides who may create one: an address on `ADMIN_EMAILS`, or one holding a usable
invitation. Everybody else gets the same "Check your inbox" page, so the form cannot be used to
find out who has an account.

### 3b. A `403` on `/api/auth/*`

Two things answer with exactly that status, and the browser shows only the number.

| Server log line | Means | Fix |
| --- | --- | --- |
| `[auth] refused account creation { email: … }` | the beta gate — the address holds no invitation and is not on `ADMIN_EMAILS` | add it to `ADMIN_EMAILS`, redeploy, try again |
| `[auth] magic link not sent { email: … }` | the pre-send gate — no account, no invitation, not on `ADMIN_EMAILS`, so no mail was sent | add it to `ADMIN_EMAILS`, redeploy; the page told the visitor "check your inbox" either way |
| `[auth] ADMIN_EMAILS is empty` | nobody can create an account or receive a link; invitations only | set `ADMIN_EMAILS` and redeploy |
| `Invalid origin: https://…` | the page you are on is not a trusted address (a preview URL, a different port, a tunnel) | open the site on the address in `BETTER_AUTH_URL`, or add the origin via `EXTRA_TRUSTED_ORIGINS` |

`ADMIN_EMAILS` is **not** in the fatal-config list on purpose: the public site must keep serving
without it. The consequence is that a deployment missing it looks like a broken sign-in page rather
than a missing variable, which is why both warnings are logged rather than swallowed.

The deployment's own Vercel URL is trusted automatically, so preview builds can be signed into
without listing them. An `Origin` that is not trusted still gets a 403 — that check is what stops
another site from posting to the auth endpoints with a session cookie.

**More than one admin** is a comma-separated list, and each person signs in with their own link:

```
ADMIN_EMAILS=daniel@orvnlabs.com,ops@orvnlabs.com   # no spaces needed; spaces either side also work
```

Everyone on the list sees the same queue, because the queue is the database, not a mailbox.

### Creating an account without the form

```bash
cd apps/platform
npm run admin:create -- --email you@example.com
```

Checks the address against `ADMIN_EMAILS` and the required variables, and prints the exact three
steps to sign in. It creates nothing and stores no credential — the account comes into existence
on the first link, which is the only way accounts are created.

### Why magic link only

One door, one failure mode, no credentials to leak or reuse anywhere else, and the address is
proven before the account exists. A password option added later re-opens account enumeration and
support load the beta has not earned yet — that is why PRD D01 removed it, and why the sign-in
page contains no password control at all.

### The way in

Mail sends through Calder, so the link works only once the sender identity is verified:

- **Magic link** — one use, fifteen minutes. The only way in.

Locally, with no `DATABASE_URL`, there is no sign-in at all: the site runs in demo mode and the
queue is not reachable. That is the honest behaviour, not a broken sign-in.

## 4. Calder: sender identity and sending domain

Calder → **Domains & DNS**:

1. **Add Sending Domain** → `orvnlabs.com` (the root, not a subdomain).
2. Copy the records it generates into Cloudflare, **proxy off on any CNAME**.
3. Wait for Calder to show verified — the domain row, not the identity row.
4. **Add Sender Identity** → `hello@orvnlabs.com`, display name `ORREI`.

Only then is `MAIL_FROM=hello@orvnlabs.com` true. Sending from an identity that is not verified
is the single most common cause of "the API said 200 and nothing arrived".

## 5. Receiving: Cloudflare Email Routing

Cloudflare dashboard → `orvnlabs.com` → **Email** → *Email Routing* → enable. Cloudflare replaces the
MX records for you; you are not on Google Workspace, so there is nothing to preserve.

1. Add a **destination address** — the Gmail you actually read. Cloudflare emails it a confirmation
   link; the destination does not activate until you click it.
2. Add **custom addresses**, all routing to that destination:

   | Address | Purpose |
   | --- | --- |
   | `hello@orvnlabs.com` | everything — the site, deal sheets, invoices, and every submission |

   One address, not a set of role addresses. Every form and notification points at `hello@`, so
   there is no question of which inbox to check and nothing to forget to route.

3. Cloudflare publishes its own SPF record (`include:_spf.mx.cloudflare.net`). **Keep exactly one SPF
   record** — merge, never add a second.
4. Verify: `npm run dns:check` — the mail host should read *Cloudflare Email Routing*.

Cloudflare Email Routing is **receive-only**. There is no mailbox and no SMTP, which is the entire
subject of §6.

## 6. Sending as `hello@` from Gmail

Yes, Gmail can do this — *Send mail as* — and there are two ways to set it up. They are not
equivalent, and the difference decides whether your domain can ever enforce DMARC.

### Path A — "Send through Gmail" (5 minutes, no extra account)

Gmail → Settings → **Accounts and Import** → *Send mail as* → **Add another email address** →
name `ORREI`, address `hello@orvnlabs.com` → choose **Send through Gmail**. Gmail sends a confirmation
code to `hello@orvnlabs.com`; because Email Routing forwards it, the code lands in your Gmail. Enter it.

What you get: mail that appears to come from `hello@orvnlabs.com`. What you do not get:

- Google sends from **Gmail's** infrastructure. Your domain's SPF does not include it, and Gmail does
  not sign with your domain's DKIM key. So SPF, DKIM and DMARC all **fail alignment** for
  `orvnlabs.com` on those messages.
- Gmail adds a `Sender:` header, and some clients show "hello@orvnlabs.com via gmail.com".
- Because of that, you can never move DMARC past `p=none`. `p=quarantine` would start binning your own
  replies.

This is fine for now: the record is `p=none`, so the messages are delivered, and the volume is low.
It is a dead end, not a foundation.

### Path B — "Send through your own SMTP server" (15 minutes, authenticated properly)

Same screen, but choose **Send through your own SMTP server** and point it at a relay that lets you
verify `orvnlabs.com`. Any of these do it on a free tier; pick one, check its current limits:

| Relay | Free allowance | Host |
| --- | --- | --- |
| Brevo | ~300/day | `smtp-relay.brevo.com:587` |
| SMTP2GO | ~1,000/month | `mail.smtp2go.com:2525` |
| Resend | ~100/day | `smtp.resend.com:465` |

Each one gives you a **domain verification** step: it issues DKIM records (usually a `CNAME` and a
`<selector>._domainkey` TXT) plus an SPF include. Publish them, wait for verified, then paste the SMTP
username and password into Gmail. Now your replies carry a DKIM signature on `orvnlabs.com`, alignment
passes, and `p=quarantine` becomes possible later.

**Recommendation:** Path A today if you just want the inbox working, Path B the moment you send
anything to a buyer or supplier — because a "via gmail.com" banner on a first contact is the kind of
detail that costs a wholesale conversation.

### The SPF record, once all of it exists

One record, merged, never two:

```
orvnlabs.com   TXT   "v=spf1 include:_spf.mx.cloudflare.net include:<relay, if using Path B> include:<calder> ~all"
```

`npm run dns:check` warns if SPF does not cover the mail host it detects. After the cutover,
`npm run dns:check -- --expect cloudflare` should pass with nothing missing.

## 7. Cloudflare R2 (property media)

Cloudflare dashboard → **R2** → *Manage R2 API Tokens* → create a token with object read/write on one
bucket.

| Variable | Where |
| --- | --- |
| `R2_ACCOUNT_ID` | R2 overview page, right-hand column |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | shown once when the token is created |
| `R2_BUCKET` | `orrei-media` |

## 8. The checklist

```
[ ] BETTER_AUTH_SECRET, ANALYTICS_HASH_SALT generated
[ ] BETTER_AUTH_URL set per environment
[ ] ADMIN_EMAILS = the address you sign in with
[ ] Neon project created, both URLs pasted, db:migrate and db:policies run
[ ] Calder API key pasted, orvnlabs.com added as a sending domain, hello@ as a sender identity
[ ] Cloudflare Email Routing on, destination confirmed, three custom addresses added
[ ] Gmail Send mail as configured (Path A now, Path B before any buyer conversation)
[ ] npm run mail:test -- --dry shows nothing missing, then npm run mail:test sends one
[ ] EARLY_ACCESS_INBOX set to hello@orvnlabs.com
[ ] npm run dns:check -- --expect cloudflare passes
```
