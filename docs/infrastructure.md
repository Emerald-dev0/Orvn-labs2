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
| Cloudflare's job | DNS, TLS, R2 (files), optionally WAF | Nameservers are already moved; R2 is in the stack |
| Mail host | **Zoho Mail** (or Cloudflare Email Routing, receive-only) | Leaving Google Workspace; see §4.1 |
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
| **Email Routing** | Inbound mail forwarding | Only if you choose it as the mailbox host (§4.1) |
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

Three systems, three jobs. The one that trips people up is that **receiving and sending are separate**
— the host that holds your mailboxes does not have to be the service that sends the product's mail.

| Job | System | Record it owns |
| --- | --- | --- |
| Receiving `hello@` | a mailbox host (§4.1) | `MX` |
| Sending the app's mail | **Calder** | its DKIM selector + an SPF include |
| Saying who may speak for the domain | **DMARC** | `_dmarc` |
| DNS | **Cloudflare** | everything above |

### 4.1 Choose a mailbox host, without Google Workspace

The domain currently has five Google Workspace MX hosts and Google DKIM. Moving off it means two
choices, and they are not equivalent:

| | **Zoho Mail, Forever Free** | **Cloudflare Email Routing** |
| --- | --- | --- |
| Cost | free tier, one domain | free |
| Mailboxes | up to 5, 5 GB each | **none** — forwarding only |
| Send as `hello@` | **yes** | **no** |
| Webmail | yes — `mail.zoho.com`, nothing to install | n/a |
| Phone | Zoho Mail app (iOS/Android) is free to install, but Zoho has moved some client access behind the paid tiers — **check the live plan page before relying on it** | your own mail app, via the forward |
| IMAP/POP | not on the free tier, so no Apple Mail, Outlook or Spark | n/a |

**Recommendation: Zoho Mail.** Not because it is the best mail product, but because `hello@orvnlabs.com`
is printed on every page of the site and on every deal sheet. Somebody will answer it, and an answer
that comes from a personal Gmail address undoes the whole "professional page" promise. Cloudflare
Email Routing is excellent at what it does — and what it does is *receive*, with no identity to send
back from.

Take Email Routing only if you decide that replies will come from the app (inquiry replies) and from
a personal address otherwise, and you are comfortable with that.

### 4.2 The cutover, in an order that loses no mail

Do not delete the Google MX until the new host is answering. Steps:

1. **Lower the MX TTL first.** In Cloudflare, edit the existing Google MX records to TTL `300` and
   wait an hour. Otherwise the old TTL (often 3600) keeps some senders pointed at Google after you
   switch, and those messages bounce.
2. **Create the account and the mailboxes.** `hello@` (the one on the site), the founder's own
   address, and `early@` if you want a separate intake. Aliases are free and better than a second
   mailbox for addresses only ever used in one direction.
3. **Verify the domain** with the TXT record Zoho gives you.
4. **Publish Zoho's DKIM** (`zmail._domainkey`) *before* switching MX, and confirm it resolves:
   `npm run dns:check` should list it.
5. **Switch the MX.** Delete all five `aspmx.l.google.com` records, add Zoho's three
   (`mx.zoho.com` 10, `mx2.zoho.com` 20, `mx3.zoho.com` 50 — copy the exact values Zoho prints,
   including the regional domain if your account is in `.eu` or `.in`).
6. **Send a real message in and out.** From a personal address to `hello@`, then a reply from Zoho
   back. Check the headers: `spf=pass`, `dkim=pass`, `dmarc=pass`.
7. **Only now remove the Google records**: `google._domainkey`, and the `google-site-verification`
   TXT entries if you are not using Search Console.
8. **Delete `resend._domainkey`.** Nothing in this product sends through Resend; a stale private key
   in the zone is a liability, not clutter.

### 4.3 Calder: add the sending domain

Calder → **Domains & DNS** → *Add Sending Domain* → **`orvnlabs.com`**, the root.

Not a subdomain. The product sends as `hello@orvnlabs.com`, and DMARC alignment is judged on the
domain in the From address. Registering the root means Calder signs `d=orvnlabs.com`, which aligns.
A `mail.orvnlabs.com` subdomain would sign as a different domain and would need strict-alignment
gymnastics — or an uglier From — for no benefit at this volume.

Publish what Calder generates, and **turn the proxy off (grey cloud) on any CNAME**. A proxied CNAME
never resolves to Calder's target, so verification sits at "pending" forever.

Set the **sender identity** to `hello@orvnlabs.com` with display name `ORREI`. A From that is not a
verified identity is the classic "the API returned 200, nothing arrived".

This is independent of the mailbox host: Calder does not need MX, and Zoho does not need to be the
signer for the app's mail.

### 4.4 SPF, once

One SPF record per domain, and there is currently **none**:

```
orvnlabs.com   TXT   "v=spf1 include:zoho.com include:<calder's include> ~all"
```

Two rules. Include the mailbox host even though it only sends your replies — replies are your mail,
and dropping the include fails SPF the first time somebody answers a client. And if Calder sends with
a return-path on its own bounce domain, the Calder include is belt-and-braces rather than required;
add it anyway while the total stays well under the ten-lookup limit.

`npm run dns:check` warns if SPF does not cover the mail host it detected.

### 4.5 DMARC

There is already a record: `v=DMARC1; p=none; rua=mailto:danieloye@orvnlabs.com`. Two things to do:

1. **Point `rua` at a mailbox that will still exist after the cutover.** If `danieloye@orvnlabs.com`
   is not recreated on the new host, the reports bounce — and a reporting address that bounces is
   worse than none, because it looks like coverage. `npm run dns:check` checks this: it looks up the
   MX for the `rua` domain and tells you whether reports can land.
2. **Stay at `p=none` until SPF and DKIM both pass on real mail.** Then `p=quarantine`. Do not jump
   to `p=reject` on a domain people send real mail from.

### 4.6 Check it from the outside

```
cd apps/platform
npm run dns:check
npm run dns:check -- --domain example.com
```

It asks public resolvers over DNS-over-HTTPS for nameservers, apex and `www`, the mail host, SPF,
DMARC, the DMARC reporting mailbox and the common DKIM selectors. It prints a verdict per record and
exits non-zero if a required one is missing, so it can gate a deployment.

**Current state, verified from this environment:**

```
ok    nameservers    leia.ns.cloudflare.com. pranab.ns.cloudflare.com.
ok    DNS provider   Cloudflare
ok    apex           64.29.17.1 64.29.17.65            → Vercel, DNS-only
ok    www            A 216.198.79.1 A 216.198.79.65    → Vercel, DNS-only
ok    mail host      Google Workspace · 5 hosts        ← the thing being replaced
MISS  SPF            no v=spf1 record
ok    DMARC          v=DMARC1; p=none; rua=mailto:danieloye@orvnlabs.com
note  DMARC policy   p=none — monitoring only
ok    DMARC reports  danieloye@orvnlabs.com can receive mail
ok    DKIM google    present
ok    DKIM resend    stale, not used by this product
```

So the work is: create the new mailbox host, publish its DKIM, switch MX, add SPF, repoint DMARC
reporting, add the Calder sending domain, delete the Google and Resend keys.

### 4.7 Environment

```
CALDER_API_KEY=...            # the key for project proj_dd2355404c90
CALDER_API_URL=https://api.calder.click/v1
MAIL_FROM="ORREI <hello@orvnlabs.com>"   # must match the verified sender identity
EARLY_ACCESS_INBOX=...        # an address that will still receive mail after the cutover
```

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
4. New mailbox host: DKIM published → MX switched → test mail in and out → Google records removed.
5. Calder sending domain `orvnlabs.com` added → DKIM published (proxy off) → combined SPF → verified.
6. Send a real invitation → check inbox placement and headers → repoint DMARC reporting → tighten
   the policy once the reports are clean.
7. R2 bucket, private, custom domain → upload a photo → confirm the public page serves it and a
   private one does not.
8. `npm run dns:check` → everything it lists as required must be `ok`.
7. Everything else in `.env.example`: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ANALYTICS_HASH_SALT`,
   `GROQ_API_KEY`, `ADMIN_EMAILS`, optional `SENTRY_DSN` and `NEXT_PUBLIC_POSTHOG_KEY`.

**Not done from here, and cannot be:** the dashboard steps. There are no Cloudflare, Neon or Calder
credentials in this environment and outbound requests are limited to the package registries, so I
cannot provision or verify any of it. What is in the repo is the code and the exact records to add.

---

## 7. What happens when somebody submits a form

### The journey, exactly

An early-access request, end to end:

1. **Validate.** `betaApplySchema` (zod) checks the fields; a honeypot field and a rate limit sit in
   front of it. Nothing is stored from an invalid submission.
2. **Store.** The row is written to `beta_applications` first. The table has a unique index on
   email, so a resubmission is a no-op rather than a duplicate — and the applicant is never told
   whether they had applied before.
3. **Notify.** Only then is the email sent, to `EARLY_ACCESS_INBOX` — a real, monitored mailbox.
   `replyTo` is the applicant. The message carries their answers verbatim, a **link to the record in
   the queue** (`/admin/early-access#<id>`) and the invite command.
4. **Work it.** The queue lists every application, newest first, filtered by status:
   `new → reviewing → invited → declined`. The status lives on the row, so two people looking at the
   same applicant see the same state.
5. **If the email fails**, the row is still there. The applicant is told "we saved your request but
   could not email the team", and the queue shows the application regardless. Nothing is lost to a
   mail outage.

Inquiries work the same way in the other direction: the row goes into `inquiries` for the publishing
business, and the notification goes to that business's contact address with `replyTo` set to the
buyer. The record is `/inquiries`; the email is a nudge.

### Why email is not the system of record

The tempting design is "send it to a Gmail and be done". It fails in four specific ways:

| Failure | What it costs |
| --- | --- |
| Spam filing or a filter | The application exists nowhere else; it is simply gone |
| Two people reply | Both answer the same applicant, neither knows |
| No state | Nobody can tell who has been invited, so the same person is chased twice |
| No history | No way to answer "how many asked in October, and what did they say?" |

So: **the database holds the record, the email is a notification that something needs a decision,
and the notification contains a link straight to that record.** That is the professional pattern,
and it is what an applicant implicitly expects — their details were collected by a form, so they
should live somewhere that answers "who has this and what did they do with it".

### What Cloudflare forwarding actually does to the message

If you choose Cloudflare Email Routing as the mailbox host (§4.1) — or add any forward on top of a
real mail host — the forwarded copy
arrives as an ordinary email with the original `From`, `Subject` and body preserved, the original
`Reply-To` intact, and Cloudflare's own envelope sender and trace headers added by the hop. Because
our mail is DKIM-signed by Calder for `orvnlabs.com` and forwarding keeps the signature, DMARC still
aligns at Gmail; you may still see a small "via" hint in the header area. Attachments survive.

That is fine for human mail. It is the wrong path for the product's own notifications, for three
reasons: each hop is another chance to be filed as spam, the forwarded copy is a *second* copy that
can drift from the record, and the queue link is what actually makes the email useful. So:

- `hello@orvnlabs.com` → a Google Workspace mailbox (§4.1). This is for people writing to you.
- App notifications → sent directly to `EARLY_ACCESS_INBOX`. No forwarding involved.

### The admin queue

`/admin/early-access` — built, not proposed:

- Gated by `ADMIN_EMAILS` (comma-separated) on every request, in `lib/admin-guard.ts`. No session →
  redirected to sign in and returned to the queue; session but not on the list → **404**, not 403,
  because "not allowed" confirms the page is there.
- Links in the sidebar only for addresses on that list.
- Filters by status with counts, the applicant's own words preserved rather than summarised, and
  one-click status changes.
- Issuing an invitation is still `npm run invite --email …`, because provisioning a workspace
  creates rows, a role and an owner. The queue offers the command to copy, so the two steps stay
  next to each other without a mis-click being able to create a workspace.

There is no separate audit table for queue changes yet. When a second operator is added, it should
be added in the same pass as the audit row.

### The email's colours

Same tokens as the site, by name and by value:

| Token | Site | Email |
| --- | --- | --- |
| Bone | `#f5f2eb` | `#f5f2eb` |
| Pine | `#0e1512` | `#0e1512` |
| Card / white | `#fffdf8` | `#fffdf8` |
| Lime | `#c9f26e` | `#c9f26e` |
| Lime ink | `#22380c` | `#22380c` |
| Muted | `#55605a` | `#55605a` |
| Hairline | `rgba(16,22,19,0.09)` | `#eae8e3` (the same colour flattened) |

One deliberate difference: the site sets Bricolage Grotesque and Figtree as webfonts; the email asks
for Figtree and falls back to the system stack. Gmail strips `@font-face`, so the sizes and spacing
are designed to look right in the fallback and only the letterforms improve where the font loads.
