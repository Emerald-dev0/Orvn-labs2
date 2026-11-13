# ORVN Labs — Roadmap

Status: working plan, dated 2026-11-13, aligned to Documents 02, 03, 04 and 06 (see §A). §2B covers the public website corrections in Document 04. Owner: Daniel (engineering) with the founder (product and market).
This file replaces nothing. `docs/PLATFORM-BUILD-PLAN.md` holds the detailed M0–M4 build notes for the
operator workspace; this roadmap places that work inside the wider product blueprint and sets the rule
for when each step counts as done.

---

## A. Source of truth and spec alignment

**Precedence.** Three Drive documents dated 13 November 2026 are the source of truth for product scope, requirement IDs,
stage gates, permissions and decisions:

- **Document 02**: product strategy and phased roadmap. Stage gates (§9), the V1 definition (§5), and the validation program.
- **Document 03**: complete feature specification. Requirement IDs (AUTH-01 … JV-03), acceptance tests (T01–T18), and the
  decision register SPEC-D01–D14 (§15 of that document).
- **Document 06**: technical architecture. Boundaries, state machines, engineering gates, and decisions D10–D21 in §10 below.

This roadmap decides the order of work, the status of each step, and the evidence for it. Where the roadmap and a document
disagree, the document wins. Each disagreement is listed in §15 until the founder resolves it.

**Stage names.** "Stage 0" in §2 of this file means launch hardening. Document 02's Stage 0 means product readiness, with an exit
test of three realistic deals run end to end. These are different gates. §15, item 1, explains the consequence.

**Mapping of roadmap items to requirement IDs**

| Roadmap item | Spec requirement IDs | Spec stage | Note |
| --- | --- | --- | --- |
| S0.1–S0.8 launch hardening | AUTH-01, SYS-01 | Pre-Stage 1 | Document 02 Stage 0 exit not yet met (§15-1) |
| S0.9 operator admin console | SYS-01 | Stage 1 | Admin is least-privilege and logged |
| P1.1 property record | PROP-01, PROP-02, PROP-04 | V1 required | |
| P1.2 facts and missing information | AI-01, AI-02, PROP-02 | V1 required | AI is not a verifier |
| P1.3 uploads and per-file visibility | PROP-03 | V1 required | Needs secure storage (§1) |
| P1.4 publish snapshot and public page | PUB-01, PUB-04, PUB-05 | V1 required | Each output has its own state |
| P1.5 share and link behaviour | PUB-03 | V1 required | Link-only is unlisted, not secret |
| P1.6 inquiry intake | INQ-01, INQ-02 | V1 required | Owner inbox included |
| P1.7 AI drafting | AI-03 | V1 required | Facts unchanged by tone edits |
| P1.8 deal lifecycle statuses | PUB-05; Doc 06 §3 | V1 required | Record and publication states kept separate |
| P1.9 PDF deal sheet | PUB-02; SPEC-D02 | V1 core target | Depends on D13 |
| P2.1 profile and branding | AUTH-02, PRO-01, PRO-02 | V1 lean | No "verified" badge without evidence |
| P2.2 website sections | none | not in spec | Spec rules out a general builder (§15-2) |
| P2.3 replace sample data | Document 03 honesty boundary; AN-01 | V1 release blocker | Mock figures must not appear as real |
| P2.4 follow | none | not in spec | §15-3 |
| P2.5 updates | none | not in spec | §15-3 |
| P3.1–P3.4 buyer network | NET-01, NET-04 | Stage 3 | Buyer preferences are declared, not verified |
| P3.5 buyer inquiry without account | INQ-01 | V1 required | Already a V1 requirement |
| P4.1–P4.6 distribution | none | Document 02 defers auto-email blasts | §15-4 |
| P5.1–P5.6 JV network | JV-01, JV-02 | Stage 3 manual pilot | §15-5 |
| P6 advanced distribution | JV-03, NET-03 | Stage 4 | Automation only after manual proof |
| P7 network intelligence | INTEL-01 | Ecosystem, separate product | §15-6 |

---

## 0. The rule that governs everything below

**Nothing moves to the next step until the current step has been verified by someone other than the person who built it, on the deployed site, with evidence written down.**

Every item in this roadmap has four parts:

| Field | Meaning |
| --- | --- |
| **Done when** | The observable outcome. Not "code written" — something a user or operator can see or do. |
| **Verify by** | The exact check: a test name, a live URL to open, a command to run, or a screen to walk through. |
| **Evidence** | What gets recorded: a PR link, a screenshot or log line, a `db:status` output, a message id from Calder. |
| **Blocked by** | Items that must be verified first. |

A PR merges only when: CI is green (typecheck, unit tests, RLS coverage, build), the Verify steps were run
against a preview or production deployment, and the Evidence is pasted into the PR description.

A step is **not** done because the code exists. It is done because the Verify step passed on the live site.

### Gate states

- **Open** — not started.
- **Built** — code merged to `main`, Verify not yet run.
- **Verified** — Verify passed on production; Evidence recorded.
- **Accepted** — the founder has used it with real data and agreed it does the job.

Only **Verified** unblocks the next step. **Accepted** is required before a phase closes.

---

## 1. Where we are now (2026-11-11)

What is live or verified:

- Marketing site on Next.js (App Router) — 16 routes, server-rendered.
- Neon Postgres: 6 migrations applied, 19 tables, row-level security on tenant tables, 35 policies. Verified with `npm run db:status`.
- Better Auth with magic links and an invitation gate. Creating an account is refused for anyone without an invitation or an `ADMIN_EMAILS` entry.
- Early-access form: validates, rate-limits, stores once per address, emails the inbox. Confirmed in code; **one real submission still to be verified on production**.
- Contact form writes to `contact_messages` through the admin connection. RLS enabled on the table (PR #12).
- Outbound email through Calder: a test send succeeded (`em_4e07a3a1c8b74147bc3c924b`) once `MAIL_FROM` was a bare address. The `from` format was the cause of the 400.
- Sign-in emails now show Lagos time (WAT) and point at the deployed origin.

What is blocking real use:

- **Production environment variables** are all set in Vercel (confirmed by the founder, 2026-11-11). The redeploy and `/api/health` check in S0.1 are still open.
- **No real operator or tester has completed sign-in on production yet.**
- **Phase 0 is reopened (founder, 2026-11-04).** The earlier closure is withdrawn. Stage 0 exits when Document 02 §9 is met: three realistic deals run end to end on the live site.
- **R2 file storage is not configured.** Document 03 PROP-03 and Document 06 §1 require secure object storage for uploads. Uploads, P1.3, and the Stage 0 deal test all depend on it. Env names: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- **Deliverability is unverified.** Test messages have arrived, but SPF/DKIM completeness has not been confirmed with `npm run dns:check`.
- The public site still uses the name LAREI in some copy; the product name is undecided (see §10).

What exists in the operator workspace:

- `/properties` (list, detail with tabs, new), publish/unpublish/archive, uploads to R2 with per-file visibility, image renditions.
- `/inquiries`, `/dashboard`, `/w/{username}` public pages from immutable publication snapshots.
- Still on sample data: `/website`, `/analytics`, `/settings`.
- Drafting (M3) not started. Brand voice, roles beyond the basics, maps: not started.

Blueprint phases map onto the repo as follows:

| Blueprint phase | Repo milestone | Status |
| --- | --- | --- |
| Phase 0 — Foundation | M0 + launch hardening (Stage 0 below) | **Reopened by the founder 2026-11-04.** Closure of 2026-11-11 is withdrawn. Spec Stage 0 exit test pending (§15-1) |
| Phase 1 — Core deal preparation | M1 property record, M2 publish and inquire, M3 AI drafting | M1–M2 built; M3 open |
| Phase 2 — Professional presence | M4 breadth (website, profile, branding) | Open; `/website` is sample data |
| Phase 3 — Buyer network | Not in M0–M4 | Open; needs a design decision (§10) |
| Phase 4 — Deal distribution | Not in M0–M4 | Open |
| Phase 5 — JV network | Not in M0–M4 | Open |
| Phase 6 — Advanced distribution | Not in M0–M4 | Open |
| Phase 7 — Network intelligence | Not in M0–M4 | Open |

---

## 2. Stage 0 — Make what exists work for real people (now)

Goal: a real early-access applicant, a real invited tester and the founder can each complete their
first journey on the live site, and the emails they receive are correct.

**Reopened 2026-11-04 by the founder.** Stage 0 exits only when Document 02 §9 is met: three realistic deals run end to end on the live site (including missing data, an import conflict, an update, private files and link withdrawal), with no critical auth or privacy issue, and secure uploads working on R2.

Nothing in Phase 1 starts until every **P0** item in Stage 0 is Verified.

### S0.1 — Production configuration (P0)

- **Verified (2026-11-11):** `curl https://orvnlabs.com/api/health` returns `"status":"ready"`, database, auth secret,
  auth URL, email and analytics salt all `true`. `storage: false` is expected until R2 is set up. The redeploy-after-env-change
  check is still open.

- **Status (2026-11-11):** variables confirmed set in Vercel by the founder. `/api/health` returns `ready` in production,
  but `storage: false` (R2 not configured). Storage is not a Stage 0 gate, but uploads (P1.3) need it. Redeploy still open.
- **Done when:** every required variable is set in Vercel for Production and Preview, and the latest
  deployment was built after the last change.
- **Verify by:**
  1. [x] In Vercel → Settings → Environment Variables, confirm: `DATABASE_URL`, `DATABASE_URL_ADMIN`,
     `BETTER_AUTH_SECRET` (≥32 chars), `BETTER_AUTH_URL=https://orvnlabs.com`, `ADMIN_EMAILS`,
     `ANALYTICS_HASH_SALT` (≥16 chars), `CALDER_API_KEY` (a `calder_sk_live_` key), `CALDER_API_URL=https://api.calder.click/v1`,
     `MAIL_FROM=hello@orvnlabs.com` (bare, no name, no quotes), `EARLY_ACCESS_INBOX`.
  2. [ ] Redeploy. Check the deployment's build timestamp is after the last env change.
  3. [ ] `curl -sS https://orvnlabs.com/api/health` returns OK.
- **Evidence:** screenshot of the env list with values masked; deployment id and timestamp.
- **Blocked by:** nothing.

### S0.2 — Outbound mail path (P0)

- **Decision (2026-11-11, founder):** click tracking on sign-in mail stays on for now. Risk: a mail scanner can open a
  single-use sign-in link before the person does. Revisit before inviting external testers to sign in.

- **Status (2026-11-11):** a production sign-in email arrived from `hello@orvnlabs.com` with expiry in WAT and the
  right link text. Open issue: the button link is wrapped by a click tracker (`awstrack.me`), so the visible host is
  not `orvnlabs.com`. Single-use links behind a tracker can be consumed by a mail scanner before the person clicks.
  Decide: turn off click tracking for sign-in mail in Calder, or use the plain link only.

- **Done when:** `npm run mail:test -- --to <founder address>` prints `ok sent` locally, and a live
  sign-in link from `orvnlabs.com` arrives in the inbox (not spam) within a minute.
- **Verify by:**
  1. Local: `npm run mail:test -- --dry` then `npm run mail:test -- --to …`.
  2. Production: request a sign-in link from `https://orvnlabs.com/sign-in` for an invited address.
  3. Open the email. Check: the link host is `orvnlabs.com`; the expiry shows WAT; the link opens
     `/dashboard` after sign-in.
- **Evidence:** message id; screenshot of the inbox and the expiry line; the Calder email status in the dashboard.
- **Blocked by:** S0.1.

### S0.3 — Deliverability (P0)

- **Verified (2026-11-11):** a message from `hello@orvnlabs.com` to Gmail shows `SPF: PASS`, `DKIM: PASS (orvnlabs.com)`,
  `DMARC: PASS (p=NONE)` and was delivered to the inbox. Fix applied: the duplicate `_dmarc` TXT record was removed.

- **Status (2026-11-11):** a test message from `hello@orvnlabs.com` to Gmail shows SPF pass, DKIM pass (`orvnlabs.com`), and
  **DMARC FAIL**. Cause: `_dmarc.orvnlabs.com` has **two** DMARC TXT records (`p=none; pct=100; adkim=s; aspf=s` and
  `p=none; rua=mailto:danieloye@orvnlabs.com`). Receivers treat duplicate DMARC records as invalid. Fix: keep one record,
  e.g. `v=DMARC1; p=none; pct=100; adkim=s; aspf=s; rua=mailto:danieloye@orvnlabs.com`, and delete the other in Cloudflare.
  `dns:check` reported DMARC as ok and did not flag the duplicate; that check needs fixing too.
- **Earlier (2026-11-11):** `npm run dns:check` reports nothing missing (SPF, DKIM google/cf2024-1/resend, DMARC present).
  The `mail:test` run that reported `replayed` was a replay of an earlier send that day (fixed in b28e952: a fresh key per run).
  Re-run it and check Gmail headers.
  Notes: DMARC is `p=none` (monitoring only). Gmail inbox placement not yet checked.
- **Done when:** `npm run dns:check` reports SPF and DKIM for the sending domain with nothing missing, and
  a test message lands in the Gmail inbox, not spam.
- **Verify by:** `npm run dns:check`; send to a Gmail address; check "Show original" for `spf=pass` and `dkim=pass`.
- **Evidence:** the `dns:check` output and the headers excerpt.
- **Blocked by:** S0.2.

### S0.4 — Early-access applicant journey (P0)

- **Verified (2026-11-11):** applicant confirmation delivered; duplicate submission leaves the count unchanged and shows the already-received screen; reply to the founder notification goes to the applicant.

- **Evidence (2026-11-11):** `db:status` shows 2 applications stored (was 1). Still open: confirmation email arrival, duplicate check (count unchanged on resubmit), reply-to.

- **Status (2026-11-11):** one real application is stored (Daniel Oluwadare, status `new`). Confirmation email,
  reply-to, and duplicate check not yet confirmed.
- **Done when:** a real applicant submits `/early-access` on production, the row is stored once, the
  founder receives the notification with a reply-to set to the applicant, and the applicant receives the
  confirmation email.
- **Verify by:**
  1. Submit the form with a test address you control.
  2. `npm run db:status` shows `early access 1 application stored`.
  3. Submit the same address again: the row count stays at 1 and the screen says the request is already received.
  4. Reply to the notification email: the reply goes to the applicant's address.
- **Evidence:** `db:status` before and after; the two emails.
- **Blocked by:** S0.2.

### S0.5 — Contact form (P0)

- **Verified (2026-11-11):** message stored (`contact message stored 1`), and the founder inbox received the notification (confirmed by the founder's contact).

- **Verified (2026-11-11):** `db:policies` applied: 35 policies across 15 protected tables. `db:status`: 15 of 19 tables with RLS; `contact message stored 1`. Still open: founder inbox notification.

- **Done when:** a message submitted at `/contact` is stored in `contact_messages` and the inbox is notified.
- **Status (2026-11-11):** `npm run db:status` reports 14 of 19 tables with RLS. `policies.sql` enables RLS on 15,
  so `contact_messages` is the likely missing one until `db:policies` runs on production. Not yet confirmed.
- **Verify by:** submit it; `npm run db:status` shows a `contact form` row with count 1 after `npm run db:policies` has
  been run on production (so RLS is on for the table).
- **Evidence:** `db:status` output after the submission.
- **Blocked by:** S0.2, S0.3.

### S0.6 — Invitation and first sign-in (P0)

- **Tester (2026-11-11):** accepted the invitation and created their own workspace. Verified.
- **Refusal (2026-11-11):** the backend refusal is in the Vercel log. The on-page result is raw JSON, not the notice. See the defect in the Phase 0 closure below.

- **Evidence (2026-11-11):** Vercel log `[auth] refused account creation` for a non-invited address (10:06:58 UTC), reason `no usable invitation`. `phase0:check`: one invited non-operator has accepted. Still open: the on-screen early-access notice, and the tester's first dashboard.

- **Operator first run (built 2026-11-11):** an address on `ADMIN_EMAILS` with no workspace is taken to
  `/no-workspace`, names its workspace and address once, and lands on `/dashboard`. No invitation needed.
  Verify: sign in as the operator address on a fresh account, create the workspace, confirm the dashboard
  loads, sign out, sign in again and confirm no second workspace can be created. A non-operator with no
  workspace sees the invitation guidance, not the form.

- **Done when:** the founder issues an invitation to a tester, the tester accepts it, creates a password or uses a
  magic link, and lands on an empty private workspace. An uninvited address is refused with the early-access notice.
- **Verify by:**
  1. Issue an invitation from the admin path (`/admin` or `npm run invite`). Confirm it appears in the queue.
  2. Accept it in a private browser window. Confirm `/dashboard` loads with no other workspace's data.
  3. Try an uninvited address at sign-up. Confirm the refusal names early access and links to `/early-access`.
  4. Check the server log for `[auth] refused account creation` for the uninvited attempt.
- **Evidence:** screenshots of steps 2 and 3; the log line.
- **Blocked by:** S0.2.

### S0.9 — Operator admin console (P1)

- **Status:** not started as a redesign. `/admin/early-access` works: requests list, status filter, status
  form, copy-invite command. The founder has said the admin pages are not good enough yet, and this is part
  of the product, not a finishing touch. Admin pages are out of scope for Stage 0 but must be upgraded before
  the first real batch of applicants is reviewed at volume.
- **Done when:** the early-access queue, the invitation flow and the operator dashboard have been reviewed by
  the founder on a real screen and approved; the layout works on a laptop and a phone; each row shows what
  the operator needs to decide without opening it.
- **Verify by:** the founder walks through reviewing three applications and issuing one invitation end to end
  and signs off in writing.
- **Evidence:** screenshots before and after; the founder's sign-off note.
- **Blocked by:** S0.4 (real applications to design against).

### S0.7 — Monitoring (P0)

- **Done when:** an error on production creates a visible alert the founder receives.
- **Verify by:** trigger a controlled error on a staging path or a test route; confirm the alert arrives.
- **Evidence:** the alert screenshot. (Sentry is listed in PLATFORM-BUILD-PLAN M0 as remaining.)
- **Blocked by:** S0.1.

### S0.8 — Time and copy correctness (P1)

- **Partly done (2026-11-11):** `npm run email:preview` wrote 7 templates to `public/preview-emails`. Still open: a person reads each one and confirms WAT and the links.

- **Done when:** every user-facing time in email and on the site is labelled with its zone; no template still says UTC
  without saying so.
- **Verify by:** grep for `toUTCString` and `timeZone: 'UTC'` in templates (only logs and the database should remain UTC);
  read every email template once in the preview.
- **Evidence:** the grep output and the preview screenshots.
- **Blocked by:** S0.2.

**Phase 0 closed by the founder, 2026-11-11 (second closure, after the evidence in S0.3–S0.6).** Exceptions carried into Stage 1:

- S0.1: redeploy after the last env change not evidenced. Confirm the production `BETTER_AUTH_URL` is `https://orvnlabs.com`.
- S0.2: click tracking on sign-in mail stays on (founder decision, deferred). Risk recorded in S0.2.
- S0.6: **defect (narrowed).** Uninvited addresses are now refused before any email is sent (`lib/magic-link-gate.ts`, `[auth] magic link not sent` in logs). Links sent before that change can still land on the JSON below. After a sign-in link for an uninvited address, the browser shows raw JSON at `/api/auth/magic-link/verify`: `{"message":"This address does not have beta access yet. Request access at orvnlabs.com/early-access."}`. The sign-in page notice is not shown, and the wording says "beta" where the product says "early access". Fix: redirect to `/sign-in` with the notice.
- S0.7: monitoring not built (founder decision, deferred).
- S0.8: template read-through by a person not evidenced.

**Stage 0 exit criteria (as written):** S0.1–S0.7 Verified. The founder has signed in on production. One real early-access
applicant and one invited tester have completed their journeys. This is the only point at which Phase 1 starts.

---

## 2A. Platform foundations (`apps/platform`)

Source: `ORVN_Labs_Document_06_Technical_Architecture_and_Engineering.docx` (Google Drive, 13 Nov 2026, v1.0).
Status: **proposed working specification, subject to founder approval.** Choices marked OPEN in §10 wait until decided.
The existing Vercel deployment does not establish that any application feature is ready.

Applies to every phase. Each phase has frontend and backend work (see `AGENTS.md`).

**Boundaries and architecture**

- Keep these as separate routes with separate permissions: marketing site (`orvnlabs.com`), signed-in application (proposed `app.orvnlabs.com`, OPEN D19), public profile routes, and public property pages.
- Use a modular monolith in `apps/platform`: web UI, business rules, background jobs, relational database, protected object storage.
- Reserve interfaces only, not active V1 services: payment entitlements, discovery, messaging, JV matching, country-specific transaction services.
- Store timestamps in UTC. Store money as integer minor units with an ISO currency code. Store measurements with the original unit and a normalised comparison unit. Store addresses with country-aware fields.
- Require staging and production environments, managed secrets, backups, logging, a rollback plan and documented admin access.

**Two state machines, kept separate**

- Property record: `DRAFT → NEEDS_REVIEW → APPROVED → ARCHIVED`, with reopen transitions.
- Publication: `NOT_PUBLISHED → LINK_ONLY` or `PUBLIC → UNPUBLISHED / WITHDRAWN`.
- A property can stay private while one approved output is shared by link. Portfolio exposure is controlled on its own. A JV request is not a visibility level.
- Editing an approved, published snapshot must not change it silently. Offer review and an explicit republish.
- A PDF that was already downloaded cannot be revoked. Show its revision and date. Do not promise "no stale copies anywhere".
- A withdrawn public page shows an unavailable state and leaks no source material.

**Facts and AI input**

- Every fact has a source, a candidate value and a review state. Unknown values stay blank.
- No silent AI verification. Do not claim verified title, zoning, ARV, boundaries, ownership or comparable sales without authoritative evidence and a scoped workflow.
- Do not show confidence scores to users until they are validated.
- Business tone memory must never change numerical or legal facts.
- Guard against prompt injection in uploads. Apply cost, rate and size limits. Log errors without private source text.
- If parsing or AI is down, allow manual entry and retry. Do not block the workspace.

**Authorisation and privacy**

- Check record-level permission on every read and write, on the server.
- Roles: anonymous, individual, workspace editor, workspace publisher, workspace admin, ORVN support (logged, narrowly scoped). Support never browses source files routinely. Admins cannot impersonate users silently.
- Required automated tests: owner A cannot fetch owner B's private files; private, link-only and public access boundaries; revoked links; form anti-spam; missing-field and source-conflict workflows.
- Idempotency keys for publishing, email sending and payment operations.
- Background jobs (file processing, extraction, rendering, notifications, analytics) show honest pending and failed states.

**Engineering gates**

- Test laptop, tablet and narrow mobile widths. Check keyboard navigation, labels, contrast and screen readers.
- Staging seed data is fictional and labelled as such. Remove placeholder metrics before public production.
- Monitoring covers uptime, failed sign-ins, upload failures, AI latency and cost, failed publication, inquiry delivery and broken routes. S0.7 is deferred by the founder; OPEN D20 must be decided before public launch.

**Repository cleanup**

- The retired Vite app's `src/`, `api/` and `supabase/` have been moved into `archive/` (kept, not deleted; history preserved). Nothing in `apps/platform` imports from them. This was checked by resolving every relative import in the platform.
- `.github/workflows/keep-supabase-active.yml` still pings a Supabase project daily, using secrets. It is unrelated to the platform. Decide whether to keep it (OPEN).
- The root `package.json`, `vite.config.js`, `index.html` and root `ROADMAP.md` still exist. They relate to the retired app and are not yet archived (OPEN).

**Known discrepancy to resolve before P1.3 is marked Verified**

- §1 says uploads to R2 with per-file visibility are built. The last production check reported file storage as not configured (`storage: false`). Confirm with `/api/health` and a real upload before accepting this line.

---

## 2B. Public website corrections (Document 04, 2026-11-13)

Source: Document 04, "Website audit and corrections" (working specification, 13 Nov 2026). It audits the public marketing site and the sign-in, early-access and legal pages. It is a separate workstream from the operator platform, but it shares the same rule: no claim on the site may be stronger than the feature behind it.

**Claims rule (Document 04 §5), adopted as the working default until the founder approves it (D22).** Use the allowed substitute until proof exists:

| Do not say | Say instead (until proof) |
| --- | --- |
| Verified (for a fact) | "Supplied by you", "User approved", or "Based on uploaded source" |
| Live (for an unbuilt feature) | "Illustrative product preview" or "Planned" |
| Automatically import any portal | "Supported source import, where available" |
| No stale brochures / recall of downloaded files | "Revise and republish; downloaded copies are separate and may need reissuing" |
| 1,284 views / 37 inquiries | "Illustrative figures, not customer results" |
| Buyer engaged / qualified buyer | "Page opened" or "Inquiry submitted" |
| Your AI remembers | "Save approved style preferences when available" (planned) |
| Twenty minutes | "Designed to reduce manual assembly" |
| Cross-border transactions | "Long-term vision" |

**Status column.** "Found in code" means a string or component was found by search on 2026-11-13. It does not mean the page was checked in a browser. Every item needs a browser check on the live site before it is marked Verified.

### W0 — P0 corrections (before any beta invitation or public announcement)

**W0.1 — Claim inventory (P0-01, P0-05).** *Done when:* every product promise on `/`, `/how-it-works`, `/who-its-for`, `/about`, `/faq` and `/early-access` is listed with one status: implemented and tested, beta, planned, illustrative, or remove. *Verify by:* the inventory file exists in `docs/` and each claim cites its route. *Evidence:* the inventory. *Found in code:* "Twenty minutes" and "portal import" in `src/views/HowItWorks.jsx` (lines 26, 66, 74, 198); "No stale brochures" and "regenerated" in `HowItWorks.jsx` (lines 50–51, 86, 173); unbuilt outputs listed as "Deal sheet regenerated" in `HowItWorks.jsx`.

**W0.2 — Privacy notice and terms (P0-02).** *Done when:* `/legal/privacy` and `/legal/terms` contain text that matches the real systems (hosting, email, storage, AI providers, retention, cookies), with an effective date and the operator's legal name and contact, and counsel has approved both. *Verify by:* the founder checks each claim against the code and the vendor list. *Evidence:* the approved text and the counsel sign-off. *Status:* routes exist; contents not reviewed; counsel not booked. *Blocks:* processing any real user document (Document 04 P0-02).

**W0.3 — Sign-in, early access, confirmation and unsubscribe (P0-03).** *Done when:* every endpoint works on the live site; the sign-in and access forms do not reveal whether an address exists; marketing unsubscribe works without signing in and suppresses later optional updates; essential account notices stay separate. *Verify by:* S0.4 (applicant confirmation) is already Verified. Still open: unsubscribe, suppression log, and a check that the password links on `/forgot-password` and `/reset-password` do not appear to users until the password path is decided (SPEC-D01). *Found in code:* `/forgot-password` and `/reset-password` routes exist and are linked from the sign-in flow.

**W0.4 — Sticky navigation contrast (P0-04).** *Done when:* the header is readable at every scroll position over dark and cream sections, and near the footer, at 360, 390, 768, 1024 and 1440 px. *Verify by:* screenshots at each position listed. *Evidence:* the screenshot set. *Found in code:* `src/components/site/Nav.jsx` and `src/styles/sections.css`. Not yet checked in a browser.

**W0.5 — Remove "Verified" badges (P0-05, P1-02).** *Done when:* no fact or sample is labelled "Verified" unless an independent check supports it. Badges use "Supplied by you", "Source conflict", "Needs review" or "User approved". *Found in code:* the "Verified" label in `src/components/home/Showcase.jsx` (line 79); the `hero-card-verified` styles in `sections.css`; the text "verified" in `apps/platform/app/w/[username]/page.jsx` (line 211). Confirm the public-page wording there is not a claim about a fact.

**W0.6 — Illustrative labels and no live-looking figures (P0-01, HOME-03, HOME-07).** *Done when:* every sample figure (1,284 views, 37 inquiries, "Site views 1,284") has the label "Illustrative example — not real customer results" directly above it, inside the card. *Found in code:* `src/components/home/Showcase.jsx` (line 149), `src/components/home/mocks.jsx` (lines 118, 145), `src/views/Product.jsx` (line 154), `src/app/data.js` (line 16). This overlaps with P2.3, which removes sample data from `/analytics` and `/website` in the signed-in app.

**W0.7 — Remove "twenty minutes" (WORK-01).** *Done when:* the phrase is removed from the site until beta timing is measured. *Found in code:* `src/views/HowItWorks.jsx` (lines 66 and 198). Check the FAQ and the home page for the same claim.

**W0.8 — AI claims (HOME-06, FAQ-01, FAQ-02).** *Done when:* the site separates extraction, drafting and independent verification; it says the AI drafts only from approved facts; it does not say the AI "only helps with wording" (FAQ-01 found this contradicts the intake proposition); and "Your AI remembers" is removed or marked planned. *Found in code:* the business-context block in `src/views/Home.jsx` (line 51) and the AI section of `src/views/FAQ.jsx`. Not yet checked for the exact FAQ wording.

**W0.9 — Cross-border and transaction claims (§5).** *Done when:* no page presents cross-border transactions, escrow, legal closing or title checks as current. *Verify by:* search the built site for these terms. *Status:* not searched yet.

**W0.10 — Founder and counsel sign-off (§9, §10).** *Done when:* the founder has approved the promises in the inventory and counsel has approved W0.2. Until then no beta invitation or public announcement is sent. *Blocked by:* W0.1 and W0.2.

### W1 — P1 corrections (before public marketing)

**W1.1 — Hero and supporting copy (HOME-01, HOME-02).** Replace with the Document 04 copy. Keep the comparison visual. Label the sample as illustrative next to it. Primary CTA "Request early access"; secondary "See how it works".

**W1.2 — Audience and first segment (WHO-01, HOME-08, P1-04).** Wholesalers and disposition operators first, in every section, then investors, agents and brokers, and property teams with availability notes. Do not claim full coverage for every profession. Include a US vacant-land or single-family example.

**W1.3 — Professional profile (HOME-04).** Rename "My Website" to "Professional profile" in `src/app/AppShell.jsx` (line 13), `src/app/views/Website.jsx` (lines 35 and 54), `app/(app)/website/page.jsx` (title) and `src/components/home/mocks.jsx` (line 18). Coordinate with P2.1 and P2.2.

**W1.4 — Property imagery (HOME-05, P1-03).** Keep premium photography. Add one vacant-infill-lot example and one average single-family example, both clearly fictional, with currency and locale stated.

**W1.5 — About page (ABOUT-01).** State the broader vision as a direction, not as current capability. Add named founder details only after the founder confirms permission and accuracy.

**W1.6 — Early-access form (ACCESS-01).** Required fields: name, work email, role, primary market. One workflow question is optional. Other fields are optional. Split consent into operational (application) and optional product updates. Store consent time, source and version. Show the confirmation without revealing whether the email already exists. Check mobile layout and the consent link size.

**W1.7 — Founder confirmation email (§6.2, P1-06).** Use the approved copy once the founder approves the exact identity and title. Include the postal address and a working opt-out for optional updates. Keep the operational receipt separate from marketing. Review classification with counsel (CAN-SPAM). *Found in code:* the applicant confirmation was verified (S0.4); compare its text with §6.2.

**W1.8 — Metadata, canonical and indexing (P1-05, §8).** Unique title, H1 and meta description per public marketing route, using the table in §8. Canonical host chosen and 301 redirects set. Sitemap and robots. `noindex` on `/sign-in`, `/forgot-password`, `/reset-password`, `/no-workspace`, `/invite/*`, and on the app routes. Unlisted and link-only property pages (`/w/[username]/p/[slug]`) must not be indexed. Robots is not access control; the private pages must also be protected by the server.

**W1.9 — Retired PAS routes (§8).** Inventory old routes against `docs/legacy-routes.md`. Each route gets a deliberate 404/410 or a redirect to the semantically closest page. No blanket redirects.

**W1.10 — Responsive and accessibility pass (§4, §9).** Capture every route at 320, 390, 768, 1024 and 1440 px and at 200% zoom, with menus, forms and FAQ open. Keyboard test tabs and accordions. Check focus, contrast of grey support text, and the size of the legal links in the footer.

### W2 — P2 (after launch and real use)

**W2.1 — Walkthrough (P2-01).** Only after P1.4 publishes a real page. No CGI-only demo presented as shipping software.

**W2.2 — Case studies and testimonials (P2-02).** Only from verified customers, with their consent. None now.

**W2.3 — Editorial pilot (§8).** Five proposed topics, to be validated for search demand before writing.

### Owners (Document 04 §10)

| Workstream | Owner | Gate |
| --- | --- | --- |
| Copy and target segment (W1.1, W1.2) | Founder and product lead | Founder approves replacement copy |
| Claim audit (W0.1, W0.5–W0.9) | Engineering | Each claim shown as working, beta, planned or removed |
| Visual, nav and mobile (W0.4, W1.10) | Engineering and design | Pass all viewport screenshots and accessibility checks |
| Privacy, terms, AI notices (W0.2) | Founder, counsel, engineering | Published text matches real systems |
| Early access and email (W0.3, W1.6, W1.7) | Engineering and founder | Logged end-to-end test and opt-out working |
| SEO and retired URLs (W1.8, W1.9) | Engineering and growth | Crawl test, canonical and routing verified |

---

## 3. Phase 1 — Core deal preparation (M1–M3)

Blueprint goal: a wholesaler can take a real property opportunity, prepare a presentation and share it without
assembling several documents.

Repo milestones: M1 property record, M2 publish and inquire, M3 AI drafting.

### P1.1 — Property record with provenance (M1, P0)

- **Done when:** a property can be created from manual fields or pasted notes, saved, reloaded, edited, and every
  detail value records where it came from (user-entered, pasted, extracted, approved). A price conflict between two
  sources is visible, not silently resolved.
- **Verify by:** the M1 demo in PLATFORM-BUILD-PLAN: a property built from notes survives reload; an APN with leading zeros
  keeps them; an unresolved price conflict shows on the record. Run the unit tests for detail provenance.
- **Evidence:** a recorded walkthrough (screen capture) of the three checks; test output.
- **Blocked by:** Stage 0 exit.

### P1.2 — Facts and missing-information review (M1, P0)

- **Done when:** the review screen separates **Confirmed by user**, **Extracted from supplied material**,
  **Conflicting**, **Missing** and **Awaiting verification**. Missing critical facts block publication with a plain reason.
- **Verify by:** create a property with no lot size and a conflicting asking price. Confirm both states show and
  publish is blocked until resolved.
- **Evidence:** screenshot of the review; a failing-then-passing test.
- **Blocked by:** P1.1.

### P1.3 — Uploads and per-file visibility (M1, P0)

- **Done when:** photos, floor plans and documents upload to private storage; each file has its own visibility; a
  file marked private is never served by the public route.
- **Verify by:** upload one photo marked public and one document marked private; open the public page; request the private
  file's URL directly and confirm it is refused.
- **Evidence:** the two requests and their responses.
- **Blocked by:** P1.1.

### P1.4 — Publish snapshot and public page (M2, P0)

- **Done when:** each output (page, PDF, summary, card) has its own publication state (Document 03 PUB-04); publishing creates an immutable snapshot; editing the record afterwards does not change the live page
  until republished; unpublishing removes the page and its files.
- **Verify by:** publish; edit the price; confirm the live page still shows the old price; republish; confirm the change;
  unpublish; confirm `/w/{username}/p/{slug}` returns not found and the file URLs are refused.
- **Evidence:** the three page states, captured.
- **Blocked by:** P1.2, P1.3.

### P1.5 — Share and unfurl (M2, P0)

- **Done when:** the share link produces a useful preview card in WhatsApp and Facebook (title, location, price, image).
- **Verify by:** paste the link into WhatsApp to yourself; check the card. Check `og:image` in the page source.
- **Evidence:** a screenshot of the unfurled card.
- **Blocked by:** P1.4.

### P1.6 — Inquiry intake (M2, P0)

- **Done when:** a visitor can send an inquiry on a published deal; it requires consent; it is rate-limited; it appears once
  in the right workspace's inquiry list; and it is not visible to any other workspace.
- **Verify by:** submit an inquiry on a published page; submit it again quickly and confirm the rate limit; confirm it
  appears in `/inquiries` for the owner; sign in as a second workspace and confirm it cannot see it.
- **Evidence:** the screens and the RLS test result.
- **Blocked by:** P1.4.

### P1.7 — AI drafting against approved facts only (M3, P0)

- **Done when:** a description is generated only from approved facts; the draft lists which facts it used; it never
  introduces a figure that is not in the approved facts; regenerating shows a diff; a stale-copy warning appears when a
  fact changes after drafting.
- **Verify by:** draft a description for a property with a known price. Change the price. Confirm the stale warning. Check
  the draft contains no figure absent from the facts (an automated test should assert this on a fixed fixture set).
- **Evidence:** the fixture test; the draft screenshot with its "used in this draft" list.
- **Blocked by:** P1.2.

### P1.8 — Deal lifecycle statuses (P1)

- **Done when:** a deal moves through Draft → Needs review → Published → Reserved → Under contract → Pending closing → Closed,
  with Withdrawn, Expired and Archived as exits; each change is audited; invalid transitions are refused.
- **Verify by:** a unit test for every allowed and refused transition; walk one deal through the path on production.
- **Evidence:** the test list; the audit log entries for that deal.
- **Blocked by:** P1.4.

### P1.9 — PDF deal sheet (P1)

- **Done when:** the founder can produce a PDF from the same approved facts, choose which sections appear, and it
  carries the publisher's identity and a disclosure line.
- **Verify by:** generate two PDFs from one property with different section selections; check the figures match the record.
- **Evidence:** both PDFs attached to the PR.
- **Blocked by:** P1.4.

**Phase 1 exit criteria (accepted by the founder):** a real Florida property opportunity has been entered, reviewed,
published, shared and received at least one inquiry through the platform. Record the property's reference in the
evidence log, not its address in the repository.

---

## 4. Phase 2 — Professional presence (M4)

> **Spec status (2026-11-04):** P2.2 is controlled templates only. P2.4 and P2.5 are Stage 3 candidates. P2.3 is a release blocker (no mock figures). See §15.

Blueprint goal: a wholesaler has one professional destination that shows who they are and their selected deals.

### P2.1 — Profile and branding (P0)

- **Done when:** name, business, title, markets, bio, contact and a logo can be edited and appear on `/w/{username}`.
- **Verify by:** edit each field; reload the public page; confirm each change; confirm a hidden field stays hidden.
- **Evidence:** before and after screenshots.
- **Blocked by:** Phase 1 exit.

### P2.2 — Website sections and publish control (P0)

- **Done when:** the owner can show or hide each section, select which published deals appear in the portfolio, preview
  the page before publishing, and publish or unpublish the page.
- **Verify by:** hide a section; confirm it disappears from the live page; unpublish the site; confirm it returns not found.
- **Evidence:** the preview and the live page.
- **Blocked by:** P2.1.

### P2.3 — Replace sample data on `/website` (P0)

- **Done when:** `/website` reads and writes the real profile and site records; no sample data is shown to a signed-in user
  with a real workspace.
- **Verify by:** sign in as a new workspace; confirm `/website` shows the empty state, not sample deals.
- **Evidence:** the empty-state screenshot.
- **Blocked by:** P2.2.

### P2.4 — Follow (P1)

- **Done when:** a visitor can follow a public profile with their email; the follower can unsubscribe; following does not
  expose the follower to anyone else.
- **Verify by:** follow, confirm the confirmation email, unsubscribe via the link, confirm the record is suppressed.
- **Evidence:** the emails and the suppression row.
- **Blocked by:** P2.2.

### P2.5 — Updates (P2)

- **Done when:** the owner can post short updates to the profile; they are published, dated and unlisted from the feed on request.
- **Verify by:** post, view publicly, unpublish one.
- **Evidence:** screenshots.
- **Blocked by:** P2.2.

**Phase 2 exit:** a wholesaler who has never seen the product can create a professional page and send the link without help.
Verified by the founder watching them do it (record the session with permission).

---

## 5. Phase 3 — Buyer network

Blueprint goal: buyers can describe what they buy, and wholesalers can find relevant buyers without seeing private data they
should not see.

**Design decisions must be made first (see §10, items D1–D3).** No code in this phase starts until they are recorded in this file.

### P3.1 — Buyer profile and acquisition criteria (P0)

- **Done when:** a buyer records geography (state, counties, cities, ZIP), property types, price range, bedrooms and bathrooms,
  strategy, and purchase method. Criteria are stored as declared preferences, labelled as such.
- **Verify by:** create a buyer profile; confirm the stored record and the labels; confirm no criterion is presented as a
  purchase commitment.
- **Evidence:** screenshots; schema reviewed against §D2.
- **Blocked by:** Phase 2 exit; decision D2.

### P3.2 — Visibility controls (P0)

- **Done when:** the buyer chooses public, visible-to-approved-wholesalers, or private; contact details are never shown on a
  public profile by default.
- **Verify by:** set each visibility level; sign in as a wholesaler and as an anonymous visitor; confirm what each sees.
- **Evidence:** the three views, captured.
- **Blocked by:** P3.1.

### P3.3 — Deterministic buyer discovery (P0)

- **Done when:** a wholesaler can search buyers by location, property type and price range using database filters; results
  respect visibility; AI is not the decider of who matches.
- **Verify by:** a fixture set of ten buyers with known criteria; the search returns exactly the expected set; a test asserts
  each private buyer is absent for an unapproved wholesaler.
- **Evidence:** the fixture test results.
- **Blocked by:** P3.2.

### P3.4 — Saved deals and saved searches (P1)

- **Done when:** a buyer can save a deal and a search; a new eligible deal triggers an in-app notification; a digest is the
  default frequency.
- **Verify by:** save a search; publish a matching deal in a test workspace; confirm one notification, not one per edit.
- **Evidence:** the notification and the digest settings.
- **Blocked by:** P3.3, Phase 1 P1.4.

### P3.5 — Buyer inquiry without an account (P1)

- **Done when:** a buyer can express interest on a deal without creating an account; they are invited to create one afterwards.
- **Verify by:** express interest signed out; confirm the inquiry arrives; confirm the account invitation appears after.
- **Evidence:** the inquiry and the invitation email.
- **Blocked by:** P1.6.

**Phase 3 exit:** a wholesaler can find at least one relevant registered buyer for a real deal, and the buyer has seen it.

---

## 6. Phase 4 — Deal distribution

> **Spec status (2026-11-04):** moved after Stage 2. Auto-email blasts and SMS campaigns are deferred (Document 02 §10). See §15-4.

Blueprint goal: a wholesaler can send a deal to a relevant audience and see what happened.

### P4.1 — Audience preview (P0)

- **Done when:** for a deal, the wholesaler sees the count of eligible buyers by category before sending, and only permitted
  fields are shown.
- **Verify by:** compare the count with a manual count on the fixture set.
- **Evidence:** the preview and the fixture comparison.
- **Blocked by:** Phase 3 exit.

### P4.2 — Internal distribution with consent checks (P0)

- **Done when:** sending to registered buyers only reaches buyers who opted in to deal notifications; each send is a recorded
  event; a buyer can change preferences and unsubscribe.
- **Verify by:** opt one buyer out; send; confirm they receive nothing; confirm the event record lists recipients and
  excludes the opted-out buyer.
- **Evidence:** the event record and the buyer's inbox.
- **Blocked by:** P4.1.

### P4.3 — Email list import with suppression (P0)

- **Done when:** a CSV import validates addresses, removes duplicates, removes previously suppressed addresses, and records
  the source of each contact.
- **Verify by:** import a file with duplicates and a suppressed address; confirm the counts before sending.
- **Evidence:** the import report.
- **Blocked by:** P4.2.

### P4.4 — Campaign send, unsubscribe and delivery reporting (P0)

- **Done when:** a campaign shows name, deal, audience count, subject, preview, schedule, and status; every message has a
  working unsubscribe link and sender identification; delivery, bounce and complaint events are recorded.
- **Verify by:** a test campaign to three internal addresses; unsubscribe one; confirm the suppression; confirm the bounce
  handling with a deliberately invalid address.
- **Evidence:** the campaign report; the bounce event.
- **Blocked by:** P4.3, S0.3.

### P4.5 — Compliance review (P0, non-code)

- **Done when:** a qualified adviser has reviewed the consent, unsubscribe, sender identification and bulk-email practices
  against the rules that apply to US marketing email (CAN-SPAM and, for texts, TCPA) and the sending provider's policy.
- **Verify by:** written review on file.
- **Evidence:** the review letter, stored outside the repository.
- **Blocked by:** P4.4. Must be complete before any campaign reaches a list the founder did not personally collect.

### P4.6 — Distribution analytics (P1)

- **Done when:** the wholesaler sees recipients, sent, delivered, clicks, inquiries and responses per campaign. Open rates are
  either omitted or shown with a clear caveat that privacy protections make them unreliable.
- **Verify by:** run a campaign with two clicks; confirm the counts.
- **Evidence:** the report.
- **Blocked by:** P4.4.

**Phase 4 exit:** a real deal has been sent to a real, consented audience, and the founder can show the recipients,
the responses and the unsubscribes.

---

## 7. Phase 5 — JV network

> **Spec status (2026-11-04):** a manual concierge pilot after Stage 2 (JV-01, JV-02). Automation is Stage 4 (JV-03). See §15-5.

Blueprint goal: a wholesaler without a buyer can reach an eligible JV or disposition partner.

### P5.1 — JV partner profile with explicit opt-in (P0)

- **Done when:** a user can enable JV participation; it is off by default; markets, property types, collaboration
  arrangements and availability are recorded.
- **Verify by:** new account shows JV off; enable; confirm the profile appears in matching; disable; confirm it disappears.
- **Evidence:** screenshots and the matching test.
- **Blocked by:** Phase 3 exit.

### P5.2 — Partner search (P0)

- **Done when:** from a deal, the wholesaler gets a shortlist from geographic coverage, property type and availability, with
  only opted-in partners.
- **Verify by:** fixture with five partners; the shortlist equals the expected three.
- **Evidence:** fixture test.
- **Blocked by:** P5.1.

### P5.3 — Disclosure-controlled request (P0)

- **Done when:** the wholesaler chooses which deal fields a partner sees; seller details, contracts and private documents are
  never included by default; each request is tracked separately, and several can go out at once.
- **Verify by:** send requests to two partners with different disclosure selections; confirm each recipient sees only their
  selection; confirm a seller field is absent in both.
- **Evidence:** the two request views.
- **Blocked by:** P5.2.

### P5.4 — Respond, decline, request information (P0)

- **Done when:** the partner can accept, decline or ask for more information; each response is recorded and notified.
- **Verify by:** exercise all three; confirm the wholesaler's view updates.
- **Evidence:** the request history.
- **Blocked by:** P5.3.

### P5.5 — Collaboration record (P1)

- **Done when:** on acceptance, a shared record exists with the deal reference, both parties, a discussion thread, shared
  documents and status. Access is limited to the two parties and the deal's permitted fields.
- **Verify by:** a third workspace cannot see the record; both parties can.
- **Evidence:** RLS test and screenshots.
- **Blocked by:** P5.4.

### P5.6 — Legal review of arrangements (P0, non-code)

- **Done when:** a qualified adviser has reviewed the JV request and collaboration wording and the platform's position as
  introducer rather than party to any deal.
- **Verify by:** written review on file.
- **Evidence:** stored outside the repository.
- **Blocked by:** P5.4. Must be complete before any real JV request is sent.

**Phase 5 exit:** a wholesaler without a buyer used the platform to reach a partner, the partner responded, and the record
reflects the outcome.

---

## 8. Phase 6 — Advanced distribution

> **Spec status (2026-11-04):** Stage 4 at the earliest, after manual proof. See §15-6.

Only start if Phase 4 is accepted and real campaigns are being sent weekly.

- **P6.1 — Social posting (P1):** platform-specific copy (Facebook, Instagram, X, LinkedIn) generated from approved facts;
  the user approves each post. Verify each network's current API permissions before promising automatic posting. Verify:
  post to one test account per network; confirm the approval step cannot be skipped.
- **P6.2 — Scheduled sends (P1):** verify a scheduled campaign sends once at the time, and not after a cancel.
- **P6.3 — SMS (P2):** only with consent records, opt-out handling and TCPA review (P4.5 extended). Verify opt-out by text.
- **P6.4 — Connected email responses (P2):** only through a supported forwarding arrangement or an authorised integration.
  Verify a reply lands in the correct deal conversation and that the user controls what is connected.
- **P6.5 — CRM integration (P2):** one connector at a time, chosen by user demand. Verify one-way sync first.
- **P6.6 — Campaign analytics (P2):** advanced breakdowns, based only on platform events.

---

## 9. Phase 7 — Network intelligence

> **Spec status (2026-11-04):** a separate product line (INTEL-01), not part of this roadmap's V1 or Stage 2 work. See §15-6.

Only start after two wholesalers have closed deals through the platform (§11, the first milestone).

- **P7.1 — Verified transaction history (P2):** only from licensed data or user-documented transactions. Never inferred from
  a buyer's preferred market. Verify each displayed figure's source label.
- **P7.2 — Network dashboard for the founder (P1):** wholesalers, buyers and JV partners by market; weak markets flagged.
  Verify the counts against a direct database query.
- **P7.3 — Market insights (P2):** clearly labelled as information, not valuation or investment advice.
- **P7.4 — Advanced matching (P2):** ranking added on top of deterministic filters, with the ranking inputs visible to the user.
- **P7.5 — Additional markets (P2):** Florida counties and ZIP codes are supported in the data model from Phase 1. Expansion
  outside Florida waits for the Florida milestone in §11.

---

## 10. Decisions (roadmap, Document 06, and Document 03)

Record each decision here with a date. Code that depends on an open decision waits.

**10a. Roadmap decisions**

| ID | Decision | Blocks | Recommendation | Decided |
| --- | --- | --- | --- | --- |
| D1 | Product name. ORREI is in use (Document 02 §16). Clearance is open (SPEC-D14) | Public copy, domain, email sender name | Keep ORREI as the working name; clear it before broad spend | Name confirmed as ORREI by the founder 2026-11-13; clearance open |
| D2 | Buyer data: what a buyer can declare vs what is verified | Phase 3 schema | Declared preferences only, labelled; verified status later, with defined evidence | Open |
| D3 | Buyer contact details: shared immediately, or routed through ORVN first | Phase 3 and 4 | Controlled sharing with the buyer's explicit choice; routed through ORVN by default | Open |
| D4 | Can a wholesaler request several JV partners at once | Phase 5 | Yes; each request tracked and disclosed separately (matches JV-02) | Open |
| D5 | Company accounts and personal profiles | Phase 2 and 5 | Both, linked through an organisation; publishing rights explicit (SPEC-D05) | Open |
| D6 | Distribution pricing: per send or monthly allowance | Phase 4 billing | Monthly allowance with transparent limits; no prices announced until real wholesalers have been interviewed | Open |
| D7 | Market scope at launch | Phase 1 defaults | Florida first as the proposed pilot; US-first data model (Document 02 §16) | Recommended, not yet confirmed |
| D8 | Non-account interest on a deal | Phase 3 | Allowed; account invitation afterwards | Open |
| D9 | Compliance and legal advisers engaged | P4.5, P5.6 | Engage before any bulk send or JV request leaves the platform | Open |

**10b. Document 06 decisions (its §9 list)**

| ID | Decision | Overlaps | Status |
| --- | --- | --- | --- |
| D10 | Auth approach: email link only, or passwords too | SPEC-D01 (same question) | Open. Current build is email link only |
| D11 | Team role model within a workspace | Document 03 §8 permissions matrix | Open |
| D12 | Minimum media and file limits (size, count, types) | PROP-03 "declared limits" | Open |
| D13 | Do PDFs and buyer summaries ship in the first beta | SPEC-D02 (same question) | Open |
| D14 | Public profile structure | SPEC-D06 | Open |
| D15 | Saving a profile or deal requires an account | Document 02 §7: "save profile: no, sign-in prompt" | Decided by Document 02: saving needs sign-in |
| D16 | Anonymous inquiry policy | Document 02 §6.7 and INQ-01: allowed, with safeguards | Decided by Document 02: allowed with rate limits and anti-spam |
| D17 | Link-only security behaviour | Document 02 §7: "link-only is unlisted, not secret" | Principle decided. Token expiry and revocation mechanism open |
| D18 | Data retention periods and deletion process | SPEC-D12 | Open |
| D19 | Hosting and database providers, and the app subdomain | Document 06 §1 | Open. Current: Vercel and Neon |
| D20 | Error monitoring provider | S0.7 (deferred by the founder) | Open. Decide before public launch |
| D21 | Fee and payment provider | SPEC-D10 (free vs paid) | Open |
| D22 | Website claim policy (Document 04 §5 substitutes) | §2B, all public copy | Adopt substitutes as default until proof exists | Open (working default) |
| D23 | Early-access form: minimum fields, consent split, founder signoff (Document 04 §6) | W1.6, W1.7 | Name, email, role, market required; others optional; founder approves signoff | Fields confirmed by the founder 2026-11-13. Signoff title still open |

**10c. Document 03 decision register (SPEC-D01–D14)**

Each is the spec's proposed default until the founder approves it.

| ID | Pending decision | Roadmap link | Spec default | Status |
| --- | --- | --- | --- | --- |
| SPEC-D01 | Email link only, or password-based auth | D10 | One secure primary path; add another only if needed | Decided by the founder 2026-11-13: both. Email link for everyone; approved people may set a password at /set-password |
| SPEC-D02 | Are deal sheet PDFs V1 release blockers | P1.9, D13 | Yes for primary wholesale use, unless beta narrows the promise | Open |
| SPEC-D03 | Which property categories and countries launch | D7 | US-first vacant land and houses; other types after QA | Open |
| SPEC-D04 | Which source import formats are supported | none | Pasted notes and direct file uploads first; provider integrations later | Open |
| SPEC-D05 | Who can publish under a company account | D5 | Explicit admin or publisher role; never all members by default | Open |
| SPEC-D06 | Are public profiles indexable by default | D14 | Only after explicit publish; never index private or link-only | Open |
| SPEC-D07 | How much location is exposed | none | User-controlled approximate or exact level | Open |
| SPEC-D08 | Which public analytics are implemented | P2.3 | Page-open and inquiry counts only at first | Open |
| SPEC-D09 | Withdrawn links and previously downloaded files | D17 | Withdraw the URL; existing exports cannot be recalled; use version stamps | Open |
| SPEC-D10 | Free vs paid | D6, D21 | Undecided; instrument usage and test willingness to pay | Open |
| SPEC-D11 | When messaging, connect and JV arrive | P3, P5 | After manual network validation and legal and privacy review | Open |
| SPEC-D12 | Data retained, exported, deleted and processed by AI | D18 | Finalise operational policy and contracts before beta | Open |
| SPEC-D13 | Waitlist confirmation text and marketing consent | none | Founder note; opt-out of optional updates. Applicant confirmation already verified (S0.4) | Open |
| SPEC-D14 | Brand clearance for ORREI | D1 | Working name; seek trademark and domain clearance before broad spend | Open |

---

## 11. Milestones that define success

Measured by outcomes, not registrations. The blueprint's North Star is **qualified deals progressing through the network**:
a deal that is published or distributed, receives a meaningful buyer or JV response, and reaches a documented next step.

- **M-A — Launch-ready (Stage 0 exit).** Real applicant, real tester, founder signed in, mail delivered.
- **M-B — First deal on the platform (Phase 1 exit).** One real Florida opportunity published, shared and responded to.
- **M-C — First buyer reached (Phase 4 exit).** One real deal sent to a consented audience, with recorded responses.
- **M-D — First JV connection (Phase 5 exit).** One request answered by an eligible partner.
- **M-E — First validated deals (founder decision, 2026-11-04).** Two independent wholesalers each source, publish and share a deal through ORREI, and the deal reaches a documented next step (for example, a buyer or partner response, or a request for a viewing). The closing happens outside the platform and is not required for M-E.
  Evidence per deal: created on the platform; published and shared through it; a buyer or partner reached through it; the opportunity progressed to a recorded next step. Closings reported by the wholesalers are recorded as reported, not verified by ORREI. This is the product's first real validation.

Do not begin Phase 7 or any expansion beyond Florida before M-E is accepted.

---

## 12. What we are deliberately not building yet

- Full CRM replacement.
- Automated property valuation or ARV prediction. Any ARV shown is labelled as a user-supplied estimate.
- Parcel boundary interpretation, title verification, escrow, contract negotiation automation, in-platform payments between parties.
- A social network. Updates stay lightweight.
- Unrestricted drag-and-drop website editing. Controlled templates only.
- Nationwide buyer-data aggregation.
- Autonomous AI negotiation or closing coordination.
- Predictive buyer scoring. AI does not decide who matches a deal.
- Active messaging, JV matching, payment entitlements or country transaction services. Their interfaces are reserved in code, not built as V1 features (§2A).

Each of these needs a written reason before it enters a phase.

---

## 13. Working agreements

1. **One step per pull request** where practical. A PR names the roadmap item it delivers (for example `P1.4`).
2. **Every PR states Done when, Verify by and Evidence**, copied from this file, with the evidence attached.
3. **Verification happens on the deployed site** for anything user-facing. Local runs are necessary but not enough.
4. **Tests come with the rule they protect.** Permission rules, visibility rules and suppression rules each have a test that fails
   if the rule is removed.
5. **No real data in the repository.** Property addresses, applicant details and buyer lists stay in the database or in documents
   outside Git. Fixtures use invented names and addresses.
6. **Secrets never appear in chat, logs or commits.** Keys live in Vercel or `.env.local`.
7. **The founder is the acceptance gate for each phase.** Engineering can mark a step Verified; only the founder can mark a phase Accepted.
8. **Decisions in §10 are recorded here** with a date when made. Code that depends on an open decision waits.
9. **Update this file** when a step's status changes. A stale roadmap is a bug.

---

## 14. Immediate next actions (this week)

1. Complete S0.1 steps 2–3 (redeploy and health check). Record evidence.
2. Complete S0.2 (sign-in email on production, correct time, correct link).
3. Run `npm run dns:check` and complete S0.3.
4. Ask one applicant to use `/early-access`; complete S0.4.
5. Run `npm run db:policies` on production (contact table RLS), then `npm run db:status`; complete S0.5.
6. Invite one tester; complete S0.6.
7. Decide D1 and D7. Both are needed before Phase 2 copy.
8. Book the compliance and legal review (D9) so P4.5 and P5.6 are not on the critical path later.
9. Configure R2 (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`) in Vercel; confirm `/api/health` shows `storage: true`. Steps: `docs/r2-setup.md`.
10. Run the Stage 0 deal test (Document 02 §9): three realistic deals, end to end, on the live site.
11. Website: complete W0.1 (claim inventory) and W0.2 (privacy and terms, counsel booked). Replace "Verified" and "twenty minutes" on the live site (W0.5, W0.7).

---

## 15. Where this roadmap disagrees with the spec

Each item is a question for the founder, not a decision. Until one is resolved, the spec is followed and the roadmap item is
marked as conflicting.

1. **RESOLVED 2026-11-04 (founder): Stage 0 reopened.** It exits only on the spec's test (see §2).
   Original question: **Phase 0 closure against the spec's Stage 0 exit.** Document 02 §9 requires three realistic deals run end to end, including
   missing data, an import conflict, an update, private files and link withdrawal, with no critical auth or privacy issues.
   Phase 0 was closed on 2026-11-11 with named exceptions, and no deal was run end to end. *Founder: reopen the spec's Stage 0
   exit, or accept it as met in part.* Document 02 §18 says the gaps "block claiming a completed feature". I recommend the deal
   test before any beta invitation.
2. **RESOLVED per spec (2026-11-04): no website section editor.** P2.2 is controlled templates only (Document 02 §10: "do not build a general-purpose website builder").
3. **RESOLVED per spec (2026-11-04): P2.4 and P2.5 move to Stage 3 candidates.** Document 02 §6.1 excludes full social networking, and neither feature has a V1 spec ID. Document 02 §10 lists saved profiles and connections as a Stage 3 candidate.
4. **RESOLVED per spec (2026-11-04): P4 moves after Stage 2.** Document 02 §10 defers auto-email blasts and SMS campaigns. Opt-out and consent must exist for any optional mail (Document 02 §14).
5. **RESOLVED per spec (2026-11-04): P5 becomes a manual concierge pilot after Stage 2.** Document 02 §3 says JV is not required for V1. Document 03 places it in Stage 3 (JV-01, JV-02), with automation only in Stage 4 (JV-03).
6. **RESOLVED per spec (2026-11-04): P6 is Stage 4, and P7 is a separate product line.** Document 03 §7 places network intelligence (INTEL-01) outside V1 and outside this roadmap's critical path.
7. **RESOLVED (founder, 2026-11-04): M-E reworded to progress, not closing.** Two wholesalers each source, publish and share a deal, and it reaches a documented next step. The platform does not run the closing (Document 02 §3; no transaction automation). §11 is updated.
8. **RESOLVED as a requirement, not yet met: R2 storage.** §1 said uploads were built, but R2 is not configured (`storage: false`).
   The spec requires secure object storage for uploads (Document 03 PROP-03 dependency; Document 06 §1; Document 02 Stage 0
   "secure uploads"; acceptance test T13). *Founder or engineering: create the R2 bucket and set the four `R2_*` variables in Vercel.
   P1.3 cannot be Verified, and the Stage 0 deal test cannot run, until `/api/health` reports `storage: true`.*
9. **RESOLVED per spec (2026-11-04): no mock figures in any real account.** Document 03 AN-01 and acceptance test T11 require it. `/analytics` and `/website` must be fixed under P2.3, before the Stage 0 deal test.
10. **RESOLVED per spec (2026-11-04): each output has its own state.** Document 03 PUB-04 requires page, PDF, summary and card to have independent states. P1.4 is amended to say so.
11. **RESOLVED (founder, 2026-11-13): the public name is ORREI.** LAREI copy is retired (Document 04 header). Trademark and domain clearance (D1, SPEC-D14) stays open. Any remaining LAREI text on the site is a defect under W1.1.
12. **Website claim policy (Document 04 §5, D22).** The allowed substitutes in §2B are the working default. *Founder: approve or amend.*
13. **Founder signoff identity (Document 04 §6.2, D23).** Founder name given by the founder on 2026-11-13: Daniel Oyegoke. *Founder: the title to show in the signoff is still open. The required early-access fields are confirmed (D23).* The owner label in this file reads "Daniel (engineering)"; confirm whether that is the same person.

