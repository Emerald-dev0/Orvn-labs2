# ORVN Labs — Roadmap

Status: working plan, dated 2026-11-11. Owner: Daniel (engineering) with the founder (product and market).
This file replaces nothing. `docs/PLATFORM-BUILD-PLAN.md` holds the detailed M0–M4 build notes for the
operator workspace; this roadmap places that work inside the wider product blueprint and sets the rule
for when each step counts as done.

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
| Phase 0 — Foundation | M0 + launch hardening (Stage 0 below) | Closed by the founder 2026-11-11 with named exceptions (§2) |
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

Nothing in Phase 1 starts until every **P0** item in Stage 0 is Verified.

### S0.1 — Production configuration (P0)

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

- **Done when:** a message submitted at `/contact` is stored in `contact_messages` and the inbox is notified.
- **Status (2026-11-11):** `npm run db:status` reports 14 of 19 tables with RLS. `policies.sql` enables RLS on 15,
  so `contact_messages` is the likely missing one until `db:policies` runs on production. Not yet confirmed.
- **Verify by:** submit it; `npm run db:status` shows a `contact form` row with count 1 after `npm run db:policies` has
  been run on production (so RLS is on for the table).
- **Evidence:** `db:status` output after the submission.
- **Blocked by:** S0.2, S0.3.

### S0.6 — Invitation and first sign-in (P0)

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

- **Done when:** every user-facing time in email and on the site is labelled with its zone; no template still says UTC
  without saying so.
- **Verify by:** grep for `toUTCString` and `timeZone: 'UTC'` in templates (only logs and the database should remain UTC);
  read every email template once in the preview.
- **Evidence:** the grep output and the preview screenshots.
- **Blocked by:** S0.2.

**Phase 0 closed by the founder, 2026-11-11.** The exit criteria below were not all met when this was declared. Open items
carried into Stage 1 as named exceptions:

- S0.1: redeploy after the last env change, and `/api/health` check (health is `ready`, `storage: false`).
- S0.2: decide whether Calder click tracking is turned off for sign-in mail (button link goes through `awstrack.me`).
- S0.3: fix the duplicate DMARC record (see above); confirm Gmail inbox placement with DMARC pass.
- S0.4: confirmation email, reply-to and duplicate check on production.
- S0.5: run `db:policies` on production; submit `/contact`; confirm 15 of 19 tables with RLS.
- S0.6: tester invitation and uninvited-address refusal on production (operator path verified).
- S0.7: monitoring is not built. No error alerting exists in the code.
- S0.8: read every email template once in preview.

**Stage 0 exit criteria (as written):** S0.1–S0.7 Verified. The founder has signed in on production. One real early-access
applicant and one invited tester have completed their journeys. This is the only point at which Phase 1 starts.

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

- **Done when:** publishing creates an immutable snapshot; editing the record afterwards does not change the live page
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

## 10. Decisions the founder must make (and when)

These block the phases named. Record each decision in this section with a date.

| ID | Decision | Blocks | Recommendation | Decided |
| --- | --- | --- | --- | --- |
| D1 | Product name (LAREI is rejected; ORREI is used in code and emails) | Public copy, domain, email sender name | Decide before Phase 2 so the sender name and profile URLs are stable | Open |
| D2 | Buyer data: what a buyer can declare vs what is verified | Phase 3 schema | Declared preferences only, labelled; verified status later, with defined evidence | Open |
| D3 | Buyer contact details: shared immediately, or routed through ORVN first | Phase 3 and 4 | Controlled sharing with the buyer's explicit choice; routed through ORVN by default | Open |
| D4 | Can a wholesaler request several JV partners at once | Phase 5 | Yes; each request tracked and disclosed separately | Open |
| D5 | Company accounts and personal profiles | Phase 2 and 5 | Both, linked through an organisation | Open |
| D6 | Distribution pricing: per send or monthly allowance | Phase 4 billing | Monthly allowance with transparent limits; no prices announced until real wholesalers have been interviewed | Open |
| D7 | Market scope at launch | Phase 1 defaults | Florida first; the data model stores Florida counties and ZIP codes from day one | Recommended, not yet confirmed |
| D8 | Non-account interest on a deal | Phase 3 | Allowed; account invitation afterwards | Open |
| D9 | Compliance and legal advisers engaged | P4.5, P5.6 | Engage before any bulk send or JV request leaves the platform | Open |

---

## 11. Milestones that define success

Measured by outcomes, not registrations. The blueprint's North Star is **qualified deals progressing through the network**:
a deal that is published or distributed, receives a meaningful buyer or JV response, and reaches a documented next step.

- **M-A — Launch-ready (Stage 0 exit).** Real applicant, real tester, founder signed in, mail delivered.
- **M-B — First deal on the platform (Phase 1 exit).** One real Florida opportunity published, shared and responded to.
- **M-C — First buyer reached (Phase 4 exit).** One real deal sent to a consented audience, with recorded responses.
- **M-D — First JV connection (Phase 5 exit).** One request answered by an eligible partner.
- **M-E — First closed transactions.** Two independent wholesalers close a deal they sourced and distributed through the platform.
  Evidence per deal: created on the platform; distributed through it; a buyer or partner discovered it through it; the parties
  connected; the opportunity progressed; the transaction closed. This is the product's first real validation.

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
