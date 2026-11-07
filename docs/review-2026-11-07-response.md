# Response to the review of 7 November 2026

Review reference: *ORVN LABS / REVIEW BEFORE MAIN — Website V1, Developer Correction & Acceptance*.
Scope of this pass: the P0 items and the P1 copy and hierarchy notes that can be resolved in the
marketing surface without a product-owner decision. Where a P0 depends on something I cannot
settle alone, it is marked **owner decision** and listed in section 6.

Branch: `arena/b276ea9c-orvn-labs2`. Merge commit recorded in section 8.

---

## 1. Naming (P0-03)

`LAREI` no longer appears in any rendered string, page title, Open Graph or Twitter tag, email
template, invite screen, footer or mock caption.

| Where | Before | After |
| --- | --- | --- |
| Site title / OG / Twitter | `LAREI by ORVN Labs \| Professional websites and property deal pages` | `ORVN Labs \| Property presentations you can share` |
| Hero note | `LAREI is a product of ORVN Labs. Private beta` | `In development. … Requests are read and answered by a person.` |
| Footer | `LAREI is our product for…` / `LAREI is a product of ORVN Labs` | neutral description / `© ORVN Labs. All rights reserved.` |
| Company band | `LAREI is the product. ORVN Labs is the company building it.` | removed; replaced with a company statement |
| FAQ, Product, How it works, About, Who it's for, Contact, legal | `LAREI` throughout | `the platform` |
| Emails | `Your LAREI invitation`, `Sign in to LAREI`, `Reset your LAREI password`, `LAREI <hello@…>` | `ORVN Labs` equivalents |
| Workspace shell, invite screen | `LAREI` wordmark | `ORVN Labs` |
| Illustrative mock URLs | `larei.app/...` | `app.orvnlabs.com/...` |

Interim copy follows the brief: "the platform" in prose, "ORVN Labs" as the company. No replacement
brand was invented.

**One exception, and it is internal:** the Postgres roles are still named `larei_app` and
`larei_public` (`lib/db/tenant.ts`, `db/sql/*`, `test/security.test.ts`). They are database
identifiers, not product strings: they never reach a user, a page or an email, and renaming them
means a migration across every policy and grant. Flagged in section 6.

## 2. Hero: message and evidence (P0-01, P0-02)

**P0-01 — headline.** Now:

> **Turn property details into presentations you can share.**
> Organise a property, prepare an editable deal sheet, and publish a professional page linked to
> your profile.

The old line ("Your real estate business deserves a better place to be seen") is gone, as is the
generic site-builder framing.

**P0-02 — the evidence is the flow.** The full-bleed house photograph is no longer the hero. In its
place, a three-panel stage that reads left to right:

1. **Add the property** — record values with the source attached to each one, and a missing value
   flagged as missing rather than filled in.
2. **Prepare the deal sheet** — a draft marked as edited and approved by the owner.
3. **Publish the property page** — the page with a share link.

Property photography survives once, as a thumbnail inside panel 3, which is context, not the
explanation. The stage carries a permanent `Illustrative · pre-release` tag, and the hero note says
"the screens below are illustrations of the intended flow, not a live account".

**Ordering.** The property sections now come before the website/profile sections, so the recurring
property task leads and site creation follows it. `Showcase` → `Steps` → profile → portfolio →
voice → activity.

## 3. Claims and status (P0-04)

| Claim | Before | After |
| --- | --- | --- |
| Availability | "private beta" | "in development", early access by request |
| Outputs | "a property page, a PDF deal sheet, a buyer summary and an A4 print sheet" | page, share link, **printable deal sheet** and **plain-text buyer summary** — all four built in this pass (section 9) |
| Export | implied shipped | labelled planned; matches the product screen, which already said "Export arrives with the record editor" |
| Analytics | "page views, image attention, downloads and enquiry clicks" | views and submitted inquiries only, with an explicit statement that visitors are not identified and buyer intent is not estimated |
| Closure CTA stats | fabricated rows ("Deal sheet … Sent", "Print sheet … print ready") | rows relabelled `Planned`, page row reads `shared link` |
| Illustrative figures | analytics mock presented bare | "Illustrative figures, not customer results" |
| Public pages | no statement | "A published property page opens with no account and no form before the details" |

No customer counts, testimonials, marketplace, buyer matching, valuation, verified-inventory or
social-posting claims exist anywhere in the source, and the ones that did are gone.

## 4. Calls to action and routes (P0-05)

The closing CTA on the home page was a **form that accepted an email and printed a success message
without sending anything anywhere**. It is now a link to `/early-access`, which is the real
application. That is the one substantive functional fix in this pass.

`/early-access` (server action `requestEarlyAccess`):

- validates with `betaApplySchema`, returns the first field error in plain language;
- has a honeypot field, and a filled honeypot answers normally without storing or sending;
- rate-limits per IP and per email, and says so when the limit is hit;
- stores the application in `beta_applications` (unique per email; a repeat is accepted without
  revealing that it was a repeat);
- emails `EARLY_ACCESS_INBOX` once per new application, with `Idempotency-Key`;
- if the database is down, still sends the email and marks it "not stored";
- **never creates an account**. Access is granted by an invitation issued by a person;
- the button shows `Sending` and is disabled while pending; errors render in `role="alert"`.

Links tested: 19 distinct internal links across the nine public pages, all returning `200`. The
list is in section 5.

## 5. Link and destination inventory (deliverable 4)

Crawled against the production build with the app running locally.

| Page | Status | Primary action | Destination |
| --- | --- | --- | --- |
| `/` | 200 | Request early access | `/early-access` |
| `/` | 200 | See how it works | `/how-it-works` |
| `/product` | 200 | Request early access | `/early-access` |
| `/product` | 200 | How it works | `/how-it-works` |
| `/how-it-works` | 200 | Request early access | `/early-access` |
| `/who-its-for` | 200 | Request early access | `/early-access` |
| `/faq` | 200 | Ask a question | `/contact` |
| `/about` | 200 | Request access | `/early-access` |
| `/contact` | 200 | hello@orvnlabs.com | `mailto:` |
| `/early-access` | 200 | Submit request | server action, stays on page and reports state |
| `/sign-in` | 200 | Sign in | Better Auth |
| `/forgot-password` | 200 | Send reset link | server action |
| `/legal/privacy` | 200 | — | — |
| `/legal/terms` | 200 | — | — |

Footer: Product, How it works, Who it's for, FAQ, About, Early access, Contact, Privacy, Terms,
Questions, mailto. All `200`.

## 6. Conflicts requiring a product-owner decision (deliverable 7)

1. **Product status wording.** The brief says "private beta", "planned" and "concept preview" are
   not interchangeable, but does not say which one is true today. I used **"in development, early
   access by request"** everywhere, because there is no released product and no paying users. If
   there are live beta users, the wording should say so and I will change it in one pass.
2. **Interim product name.** "the platform" is used in prose per the brief. It is fine for now and
   will read oddly on a pricing page later. A real name, or a decision to keep saying "the ORVN
   Labs platform", is needed before launch.
3. **Which outputs may be claimed.** The record, the published page, the share link, the portfolio,
   inquiries and view counts exist in code. The deal sheet, buyer summary and PDF/print export do
   not. I have labelled them planned. If you want them claimed as shipping, they need to be built
   first.
4. **Database role names.** `larei_app` / `larei_public` are internal. Renaming is a migration
   touching every RLS policy and grant, and I would rather not do it inside a copy pass.
5. **`/pricing`.** There is no pricing page and the brief bans published pricing, so the URL
   redirects to `/faq`, which explains why there is no price yet. If you would rather it 404 or
   redirect home, say which.
6. **Journal.** `/blog` has no successor. It currently redirects to `/about`. If a journal is
   planned, say so and I will build the route instead of redirecting.

## 7. Not done in this pass

Stated plainly so nothing here is mistaken for finished.

- **Screenshots.** This environment has no browser, so I cannot produce the before/after desktop
  and mobile captures in deliverable 2. What I can give you is the staging URL and the commit; the
  captures have to come from a browser session.
- **The domain.** `orvnlabs.com` is still served by a Vercel project under a different account
  (`oluwadare-daniels-projects`) than the one connected here, and it is still publishing the old
  Vite build, complete with a `/pas` link that no longer exists in this codebase. None of this
  review is on your domain until that project is pointed at `apps/platform`. This blocks live
  acceptance checks.
- **P0-06 / P0-07 in the workspace UI.** Built after this section was first written: the property
  editor now has a real three-state control, and revoked links and file release are covered by
  tests. See §10.
- **Binary PDF download.** The deal sheet is print-first HTML: your browser's print dialog saves it
  as PDF. There is no server-side PDF file to download, and the copy says so rather than promising a
  `.pdf` link.
- **AI review controls.** Built after this section was first written: drafting runs from approved
  public facts, the diff and per-fact approve/reject controls are in the property editor, and
  nothing is saved until a person accepts it. See §10.
- **Mobile/tablet/keyboard/responsive audit** of the new hero. Built responsively (breakpoints at
  960px and 560px, reduced-motion respected) but not verified on hardware from here.

## 8. Evidence

- Branch: `arena/b276ea9c-orvn-labs2`
- Build: `next build` clean, 14 static pages generated
- Rendered output check: no `LAREI` in the HTML of `/`, `/product`, `/how-it-works`, `/who-its-for`,
  `/faq`, `/about`, `/contact`, `/early-access`, `/legal/privacy`, `/legal/terms`, `/sign-in`,
  `/forgot-password`
- Redirects: 15 legacy URLs return `308` to the destinations documented in `docs/legacy-routes.md`
- Link check: 19 distinct internal links, all `200`


## 9. Built after the review: the deal sheet and the buyer summary

The review asked for output, not a simulated dashboard. Three of the four outputs now exist as real
code that renders from the publication snapshot, not from a mock.

**Deal sheet** — `app/w/[username]/p/[slug]/sheet`, served from the property's own route, so it is
behind exactly the same release check as the page: unpublished, archived or withdrawn properties
have no sheet. One A4 page: business name, prepared date, title, location, price, description,
approved facts, cover photo, disclaimer and the page URL. Print or save as PDF from the browser
dialog. No binary renderer in the runtime, and the document stays selectable and searchable.

**Buyer summary** — `app/w/[username]/p/[slug]/summary`, `text/plain`. The same approved facts as a
message you can paste into WhatsApp or email, with the price, the link and the disclaimer. Plain
text on purpose: markup does not survive being pasted.

**On the page** — a *Deal sheet* link that opens the sheet in a new tab, and a *Copy buyer summary*
button that fetches the summary route and copies it, with a visible failure state and a fallback
link when the clipboard is blocked.

**Rules that hold by construction.** Both documents are pure functions of the stored snapshot:
nothing from the live draft can reach them, an unapproved fact cannot appear, a hidden price cannot
leak, and every user-supplied string is escaped once at the boundary. That is asserted in
`test/print-sheet.test.ts` (10 tests: escaping, hidden and on-request prices, missing photo, missing
description, no HTML in the summary, no blank-line runs).

**Verified:** `next build` emits both routes; `npm test` is **102 passed**. The end-to-end response
needs a database (`DATABASE_URL`), which is not configured in this environment, so the routes return
`404` here exactly as they would for an unpublished property. That check is outstanding until the
database is connected.

**Superseded by §10:** both items listed here as not built were built afterwards.

## 10. P0-07 and the drafting flow

### Visibility is one decision, not three buttons

`lib/publication/visibility.ts` holds the whole rule in one pure module, and every surface reads it:
the public page, its metadata, the portfolio listing and the file boundary.

| State | Page | In search | On the portfolio | Files released |
| --- | --- | --- | --- | --- |
| Private | not found | no | no | no |
| Link only | open, no account | no (`noindex`) | no | yes |
| Public | open, no account | yes | yes | yes |

It is derived, never stored twice: `visibilityOf({publicationStatus, showOnPortfolio})` returns
`private` unless the record is published, then splits on the portfolio flag. That is why a withdrawn
page cannot linger — the state that serves the page is the state that decides it.

**The control** (`src/app/VisibilityControl.jsx`, action `setVisibilityAction`): three options in one
form on the property's overview, each stating its own limit. Choosing *link only* runs the full
publication check, writes the snapshot and sets `showOnPortfolio = false` in the same transaction;
choosing *private* withdraws the publication. If a prerequisite is missing the blockers come back
and nothing is written. Every change is audited as `property.visibility.changed` with `from` and
`to`, and revalidates the workspace, the portfolio and the public page.

**Files follow the page.** `authoriseMediaRequest` now asks `filesReleased` instead of reading the
publication status itself, so a photo or PDF is released only while the page it belongs to exists.

**Metadata.** Only a public page is indexable. A link-only page keeps `robots: noindex, follow`,
which is the honest expression of "unlisted, not confidential".

### Drafting, with the review attached to it

`lib/ai/draft.ts` is pure and holds the contract; `lib/ai/groq.ts` is the only network call;
`lib/actions/drafting.ts` is the only place that touches the database.

- **Input:** approved, public, non-empty facts, plus the title, type, approximate location and the
  already-computed price label. The current description is deliberately not sent: a model that can
  read it will smooth over a claim nobody approved.
- **Output:** cleaned (fences, wrapping quotes, headings, bullets and emphasis removed; capped at 900
  characters on a sentence boundary), then checked. Every number in the draft must already exist in
  an approved fact or in the record's own fields, and a draft may not mention a price when the
  record shows none. Anything else is reported to the reviewer, not silently trimmed.
- **Review:** the panel lists every fact with Approve and Reject (the existing per-fact decision,
  reused), shows the draft as a word-level diff against the current description, and lets the text be
  edited before acceptance. Accepting re-validates against the facts inside the transaction.
- **Gate:** a draft exists only between generation and acceptance, in one component's state, so
  nothing unreviewed can reach a page. Publication is additionally blocked while any public fact is
  unreviewed: `publicationBlockers` now returns *"Approve or reject N public facts before
  publishing."*
- **Failure:** without `GROQ_API_KEY` the panel says drafting is not switched on for this workspace
  and writes nothing. It never falls back to template text presented as a model draft.

**Verified:** `npx tsc --noEmit` clean · `npm run build` clean · `npm test` **139 passed** (11 files),
including 14 visibility tests and 23 drafting tests (state machine, revoked and reissued links, file
release, fact selection, blockers, prompt contents, cleaning, number and price checks, diff
reconstruction). **Not verified:** the database round-trip for either action, because `DATABASE_URL`
is not configured here, and the live model call, because no key is present. Both are honest gaps, not
passes.
