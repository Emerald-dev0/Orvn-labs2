# ORVN Labs — Roadmap

Status: **in force from 2026-11-13.** This file is the working plan. It sequences the work; it does not restate the requirements.

**Source of truth:** `docs/PRD.md` (v1.1, 2026-11-13) — the consolidated ORREI product requirements. Wherever this file and the PRD disagree, **the PRD wins** (PRD conflict rule, §"Document status and authority"). The PRD's §0–12 are founder-authored and authoritative; §13–23 are derived from the Drive source set. This roadmap cites requirement IDs (§11: `AUTH-01`…`SYS-01`), test IDs (§18: `AT-01`…`AT-23`) and decision IDs (§20: `D01`…`D18`) from the PRD.

**Drive source documents** (verified against the PRD on 2026-11-13 — see §A): Document 02 (Product Strategy & Roadmap), 03 (Complete Feature Specification), 04 (Website Audit & Correction Specification), 06 (Technical Architecture & Engineering), 07 (Data Dictionary & Product Vocabulary), 08 (Real Estate Terminology Glossary), 10 (Design System & UX Standards). `ORREI_Individual_Mockups_32_Screens.zip` is compositional reference only (PRD §0.3), never a feature specification.

Supersedes: the previous `docs/ROADMAP.md` (the "2A" revision) and `docs/ROADMAP-DRAFT.md` (the 2026-11-04 connected-chain draft). Those files are retained with a superseded banner for provenance.

Owner: Daniel (engineering) with the founder (product). Phase acceptance is the founder's gate, never engineering's.

---

## A. Source-document reconciliation (2026-11-13)

Each Drive document was read in full on 2026-11-13 and compared against `docs/PRD.md`. Findings:

| Doc | Drive file | Feeds PRD | Finding |
|---|---|---|---|
| 02 | `ORVN_Labs_Document_02_ORREI_Product_Strategy_and_Roadmap.docx` | §1, §4–12, §10 | Consistent. Naming unified: source "Stage 0–5" → PRD "Phase 0–5" (PRD §0.5). Its §17 exit checklists match PRD §10.2 / §22.2; its V1 list matches PRD §11 |
| 03 | `ORVN_Labs_Document_03_ORREI_Complete_Feature_Specification.docx` | §11, §12, §18, §20 | Consistent. Requirement IDs identical. Acceptance tests renumbered to PRD `AT-*` and **extended**: `AT-19` (export versioning, from D02/D09), `AT-20` (claims audit), `AT-21` (auth surface, D01), `AT-22` (declared limits, D03/D18), `AT-23` (location disclosure, D07). Decision register merged with Doc 06 §9 and renumbered to PRD `D01`–`D18` (PRD §20 header) |
| 04 | `ORVN_Labs_Document_04_Website_Audit_and_Correction_Specification.docx` | §19 | Consistent. §19.2 copy is the replacement copy from Doc 04 verbatim where Doc 04 provides it. Note: the middle of Doc 04 was not re-read line-by-line this session (connector truncation); PRD §19 reproduces the authoritative copy requirements and wins on any disagreement |
| 06 | `ORVN_Labs_Document_06_Technical_Architecture_and_Engineering.docx` | §17, §20, §13 | Consistent. §17 entities, state machines and AI pipeline match. Its §9 ("founder decisions before engineering locks the architecture") is resolved by PRD §20 |
| 07 | `ORVN_Labs_Document_07_Data_Dictionary_and_Product_Vocabulary.docx` | §14 | Consistent. Canonical enum is `property_type: residential_land, SFR, duplex, multifamily, other` — **not** what the current schema stores (see D-CODE-3) |
| 08 | `ORVN_Labs_Document_08_Real_Estate_Terminology_Glossary.docx` | §15 | Consistent |
| 10 | `ORVN_Labs_Document_10_Design_System_and_UX_Standards.docx` | §16 | Consistent |

Retired: the October 2026 LAREI-era handoff (`docs/source/product-spec.txt`, `docs/source/website-copy.txt`) and the PAS-era material in `archive/`. PRD §2 and §3 retire both names from copy. Kept for provenance only; not in force.

---

## B. The rule that governs everything below

**Nothing moves to the next step until the current step has been verified on the deployed site (or staging for the Phase 0 acceptance pass), with evidence written down.**

| Field | Meaning |
|---|---|
| **Done when** | The observable outcome, per the PRD. Not "code written" — something a user or operator can see or do. |
| **Verify by** | The exact check: an `AT-*` test name, a live URL, a command, or a screen to walk through. |
| **Evidence** | What gets recorded: a PR link, screenshot, log line, `db:status` output, message id. |
| **Blocked by** | Items that must be Verified first. |

A step is **Built** when code merges, **Verified** when its check passes on the deployed site (or staging), **Accepted** when the founder has used it and agreed. Only Verified unblocks the next step. Only the founder marks a phase Accepted. A claim never appears on the site before the behaviour exists (PRD §0.6, §6.1).

---

## C. Where we are now (2026-11-13)

Recorded evidence (kept from prior revision; re-verified only where a date is given):

**Live or previously verified**

- Marketing site in `apps/platform` (Next.js App Router), server-rendered, ~16 routes. Claims audit not done — see D-CODE-8.
- Neon Postgres: 6 migrations applied, 19 tables, RLS on tenant tables, 35 policies (`db:status`, `db:policies`, 2026-11-09/11).
- Better Auth with magic links and an invitation gate; account creation refused for uninvited addresses. One invited tester accepted and created a workspace (2026-11-11). Refusal logged server-side; the on-page raw-JSON defect was fixed (PR #17, 2026-11-13).
- Early-access form: validates, rate-limits, stores once per address, emails the inbox. Two applications stored; duplicate-submit check, confirmation email and reply-to verified (2026-11-11). Marketing unsubscribe and its suppression log: **not built/verified** (PRD §19.4).
- Contact form: stored, RLS enabled, founder inbox notified (2026-11-11).
- Outbound mail via Calder: send test succeeded once `MAIL_FROM` was bare (message id `em_4e07a3a1c8b74147bc3c924b`). SPF/DKIM/DMARC all PASS to Gmail inbox (2026-11-11). Click tracking on sign-in mail remains on by founder decision — risk: scanner consumes single-use link; revisit per D01's reopen trigger.
- R2 object storage configured on production (2026-11-13): `/api/health` reports `storage: true`, all checks true, `missing: []`. Upload end-to-end checks not run (P1.3 below).
- Sign-in emails show Lagos time (WAT) and point at the deployed origin.

**Built, not verified**

- Operator workspace: `/properties` (list, detail with tabs, new), publish/unpublish/archive, uploads with per-file visibility, image renditions (WebP, sharp, EXIF strip), `/inquiries`, `/dashboard`. Public pages `/w/{username}` and `/w/{username}/p/{slug}` render from immutable publication snapshots (og:image included; deal sheet as print HTML; plain-text buyer summary route).
- AI drafting (`lib/ai/*`, `lib/actions/drafting.ts`): generates descriptions only from approved, public, reviewed facts; pure contract, unit-tested.
- Still on sample data: `/website`, `/analytics`, `/settings` (see D-CODE-6).

**Not built / open**

- AI-01 extraction pipeline (paste/notes → structured candidates). Nothing imports anything yet (PRD §11 AI-01; D04).
- SYS-01 monitoring/alerts. Founder deferred (S0.7, 2026-11-11); PRD §20.3/§13.5 require error monitoring with request-ID correlation before live launch — must be scheduled (D-LIVE-1).
- No `AT-01`…`AT-23` has been demonstrated on staging. The Phase 0 exit (three deals end-to-end; PRD §18.3, G0) is **not met**. Phase 0 is reopened/incomplete.
- Counsel has not reviewed the privacy notice, terms or the retention defaults (PRD §20.2). ORREI trademark clearance is not done (D14). Neither blocks building; both block live launch / paid spend.

**Phase mapping** (PRD §10 phases vs old repo milestones)

| PRD Phase | Old label | Status |
|---|---|---|
| Phase 0 — Product readiness / controlled prototype | "Stage 0", M0 | **In progress; exit not met** |
| Phase 1 — Private beta (10–15 operators, Florida, D17) | "Phase 1", M1–M3 | M1–M2 built; M3 partially built (drafting); not Verified |
| Phase 2 — Paid workflow and team fit | "Phase 2", M4 | Open; sample data in `/website`, `/analytics`, `/settings` |
| Phase 3 — Discovery, relationships, concierge JV | "Phase 3–5" | Open; not V1 (D11); no detail here until G3 |
| Phase 4 — Structured network, transaction integrations | "Phase 6" | Open; not V1 |
| Phase 5 — Cross-state and international | "Phase 7" | Open; G4 gate |

---

## D. Phase 0 — Product readiness / controlled prototype

**Exit evidence (PRD §10 Phase 0, §18.3; gate G0):** three realistic deals end-to-end on staging, including missing data, an import conflict, an update, private files and a link withdrawal — plus `AT-01`…`AT-20` passing on staging (founder watches). No critical auth/privacy defect. Website claims reconciled with tested capability (AT-20). **Not declaring done from the landing page's appearance.**

### D.1 Launch hardening (carried forward; statuses retained)

| Item | Status (as of 2026-11-13) | PRD reference |
|---|---|---|
| S0.1 Production config + redeploy-after-env-change check | Verified 2026-11-11; redeploy/build-timestamp check open | §17.1 |
| S0.2 Sign-in mail path; WAT times; click-tracking risk (founder: keep on, revisit ≥20-user friction measure) | Verified in inbox; decision recorded | D01/AUTH-01 |
| S0.3 Deliverability SPF/DKIM/DMARC | Verified 2026-11-11 | §13.5 |
| S0.4 Early-access applicant journey | Verified 2026-11-11 (2 applications, duplicate check, reply-to). **Open:** unsubscribe + suppression log, consent metadata version (D13; PRD §19.4) | ACCESS-01/§19.4 |
| S0.5 Contact form + RLS on `contact_messages` | Verified 2026-11-11 | §13.2 |
| S0.6 Invitation gate + tester sign-in; raw-JSON defect fixed (PR #17) | Built 2026-11-13; formal `AT-02` pending | AUTH-01/AT-02 |
| S0.7 Monitoring + alerts | **Deferred by founder. Must be built before live launch (SYS-01; PRD §13.5, §20.3). Schedule it — see D-LIVE-1** | SYS-01 |
| S0.8 Email template read-through (WAT, links, unsubscribe where applicable) | Open (preview written; not read by a person) | §19.4 |
| S0.9 Operator admin console reviewed by founder at volume | Open; not a Phase 0 gate; required before batches of applicants | SYS-01 |

### D.2 PRD-compliance defects in the current build (found 2026-11-13 — each blocks Phase 0 close)

| ID | Defect (evidence) | Required by |
|---|---|---|
| D-CODE-1 | **Password surface ships contrary to D01**: password sign-up/sign-in on the sign-in page (`src/views/SignIn.jsx`), `/forgot-password`, `/reset-password`, `/set-password` + "create password" links. **Founder must either approve removal or reopen D01 in writing** (PRD §20: reopen only by the founder, in writing, with ATs restated). If reopened, AT-21 is restated to match | D01; AUTH-01; AT-21 |
| D-CODE-2 | **Upload limits contradict D18**: `MAX_UPLOAD_BYTES = 12 MB` (D18: 10 MB), AVIF allowed (D18: JPEG/PNG/WebP only), `MAX_FILES_PER_PROPERTY = 60` (D18: 25 photos ≤ 10 MB + 10 documents ≤ 25 MB), no 500 MB/property total found, UI numbers not verified equal to server numbers | D18; PROP-03; AT-22 |
| D-CODE-3 | **`property_type` enum mismatch**: schema stores `vacant_land \| residential \| package \| project` (`db/schema.ts`); PRD §14.1/D03: `residential_land \| SFR` selectable; `duplex \| multifamily \| other` stored but hidden until QA | D03; PROP-01; §14.1; AT-22 |
| D-CODE-4 | **Location disclosure missing**: no Exact / Street-level / Area-only levels; default for public output must be **Area only**, enforced in the page, the API payload and the map | D07; PUB-01/PUB-03; AT-23 |
| D-CODE-5 | **Deal sheet not versioned**: `lib/print/sheet.ts` stamps only the date; no version identifier; old exports not marked stale in-app after a price change | D02, D09; PUB-02/PUB-05; AT-19 |
| D-CODE-6 | **Sample data in a real account**: `/website`, `/analytics`, `/settings` render demo figures (e.g. `src/app/data.js` 1,284 views) | D08; AN-01; AT-18; PRD §6 |
| D-CODE-7 | **"My Website" label** in nav, page title, mocks — must be **"Professional profile"** ("Never My Website or Publish site") | PRO-01; HOME-04; §16.2 |
| D-CODE-8 | **Website claims outrun the product** (PRD §19; AT-20): "Twenty minutes" (`src/views/HowItWorks.jsx`), "No stale brochures in circulation" (ibid.), "Verified" badge (`src/components/home/Showcase.jsx`), unlabelled 1,284/37-style figures (`src/app/data.js`, `mocks.jsx`, `Showcase.jsx`, `Product.jsx`); no land/SFR example imagery (HOME-05); FAQ-01/02, SIGN-01, ACCESS-01, FOOT-01 copy not confirmed against PRD; `/privacy`/`/terms` contents unreviewed, no effective date; early-access consent split per §19.4 unverified | §19; AT-20 |
| D-CODE-9 | **AI-01 not built** (extraction with source attribution) and `AI-02` conflict path untested (`AT-06`: $480,000 vs $465,000). Until these pass, drafting must not be marketed as intake automation, and `AT-07`/`AT-08` (prompt injection, AI outage) stay red | AI-01/AI-02; AT-06/07/08 |

### D.3 The Phase 0 demonstration (G0)

Three fictional-but-realistic Florida deals, run by the developer with the founder watching, once D.2 is closed:

1. Vacant infill land, missing data (unknown utilities; unknown access) — enters, reviews, publishes **link-only**, guest opens on a phone, sends an inquiry.
2. Single-family, conflicting price sources ($480,000 vs $465,000) — conflict surfaced with both sources, resolved by the user; republished after a price edit; prior snapshot retained.
3. Deal with a private seller document + withdrawn link — private file unreachable from the page/HTML/API; withdrawal shows "This property page is no longer available."; old media URLs refused.

Record each `AT-*` result (pass/fail + evidence link) in `docs/acceptance-results.md` when the run happens. Phase 0 closes only on founder sign-off (PRD §18.3; gate G0 → G1).

---

## E. Phase 1 — Private beta (after G1)

Scope: PRD §11 requirement IDs only — `AUTH-01/02`, `PRO-01`, `PRO-02` (limited), `PROP-01…04`, `AI-01…03`, `PUB-01…05`, `PORT-01`, `INQ-01/02`, `AN-01`, `SYS-01`. 10–15 invited active US operators, Florida-concentrated (D17). Deliverable: repeat creation + sharing + inquiry + maintenance without developer intervention; weekly metrics per PRD §10 Phase 1; interview active **and** inactive invitees. Advance to Phase 2 only on evidence (PRD §10 Phase 1 gate; G2).

## F. Phase 2–5 (G2–G4)

No tickets, no detail, until their gates open. Summary only (PRD §10):

- **Phase 2** — paid workflow and team fit; pricing experiment only after repeated use (D10, D15); multi-property; organization workflows. Requires §22.2 "Ready to charge".
- **Phase 3** — discovery, professional relationships, concierge JV pilot; manual matching before any automation; `Save`/`Connect`/Messaging behind sign-in with return-to-intent (PRD §7.5). Requires G3.
- **Phase 4** — structured network and transaction-support integrations with authorized licensed/title/e-sign partners. Requires G4-adjacent legal approval per jurisdiction.
- **Phase 5** — more US states, then selected countries; country-aware schema is reserved (PRD §17.6); no cross-border claims until partners and compliance exist.

The old detailed Phase 3–7 plan (buyer network, distribution campaigns, JV automation, intelligence) is **not in force** and is not a V1 planning basis (D11; PRD §10.1). It re-enters only through the PRD's gates, in writing.

---

## G. Decision register — reconciled (legacy → PRD §20)

**Resolved by the PRD (all binding unless the founder reopens in writing):**

| Legacy ID | Meaning | PRD §20 |
|---|---|---|
| Roadmap D1 / SPEC-D14 / Doc 06 D14 | Product name | **D14** — ORREI working name; clearance pending; no paid spend until clean |
| Roadmap D2, D3, D8 | Buyer data model, contact sharing, non-account interest | **Phase 3** scope (not V1); anonymous interest = D03-era INQ-01 (allowed, safeguarded); PRD §7 |
| Roadmap D4 | Multi-JV concierge requests | **D11** (Phase 3, manual pilot first) |
| Roadmap D5 / Doc 06 D11 / SPEC-D05 | Company accounts, who publishes | **D05** — explicit publisher/admin only |
| Roadmap D6 / Doc 06 D21 / SPEC-D10 / SPEC-D02-adjacent | Free vs paid, fees, PDF blocking | **D10/D15** no billing in V1; **D02** deal sheet required in V1 |
| Roadmap D7 / SPEC-D03-adjacent | Market scope | **D03/D17** — US only; `residential_land` + `SFR`; Florida-concentrated beta |
| Roadmap D9 / Doc 06 D12 / Doc 06 D18 / SPEC-D12 | Compliance advisors, retention, AI processing | PRD **§20.2/§20.3** (binding defaults; counsel review outstanding) |
| Doc 06 D10 / SPEC-D01 | Auth approach | **D01 — Magic link only** (conflict with shipped code: D-CODE-1) |
| Doc 06 D12 / SPEC-D03/04 / SPEC-D18 | File limits | **D18** (and D04 for import formats: text/PDF/JPEG/PNG only; no portal import) |
| Doc 06 D13 / SPEC-D02 | Deal sheet in first beta | **D02 — yes, V1 blocker** |
| Doc 06 D14 / SPEC-D06 | Public profile structure/indexing | **D06** — never index private/link-only; indexable only after explicit publish-as-public |
| Doc 06 D15 | Save requires account | Decided (PRD §7.2, §16.4) — sign-in prompt, resume after sign-in |
| Doc 06 D16 | Anonymous inquiry | Decided (PRD §7.4, §11 INQ-01) — allowed with safeguards |
| Doc 06 D17 | Link-only behaviour | Decided (PRD §7.3) — unlisted, not secret; **D09** for withdrawal/exports |
| Doc 06 D19 | Hosting/database/subdomain | **D16** — engineering's choice, constrained by §20.3; current: Vercel/Neon/R2/Calder; app subdomain proposal open |
| Doc 06 D20 | Error monitoring | Deferred by founder (S0.7); **required before live launch** (§13.5, §20.3) — D-LIVE-1 |
| Doc 06 D22 / SPEC-D22 | Website claim policy | PRD **§19.1/§6.1** adopted as the rule (not a suggestion) |
| Doc 06 D23 / SPEC-D13 | Early-access fields, signoff, consent | **§19.4/D13** — name, email, role, market, one workflow question; consent split; signoff title still open (founder) |
| SPEC-D07 / Doc 04 D07 | Location exposure | **D07** — three levels; default public = Area only (AT-23) |
| SPEC-D08 | Public analytics | **D08** — page opens + inquiry counts only |
| SPEC-D09 | Withdrawn links / downloaded files | **D09** — withdraw URL; exports cannot be recalled; date/version stamps |
| SPEC-D11 | Messaging/connect/JV timing | **D11** — Phase 3, after G3 |
| SPEC-D14 | ORREI clearance | **D14** — outstanding |

**Still genuinely open (and only these):**

1. Founder decision in writing: remove the password surface, or reopen D01 (D-CODE-1).
2. Counsel review of PRD §20.2 and §19.5 (privacy notice, terms, retention) — blocks **live** launch, not the build.
3. Trademark/domain clearance for ORREI — blocks paid spend (D14), not the build.
4. Founder: the title to use in the early-access signoff (old D23 residual).
5. Engineering: canonical host + 301 map and `noindex` sweep (PRD §19.6); proposal for the app subdomain (PRD §2).
6. Founder + engineering: keep `keep-supabase-active.yml` pinging a retired Supabase project daily? Root-level Vite files (`package.json`, `index.html`, `vite.config.js`, `postcss.config.js`, `tailwind.config.js`, `eslint.config.js`, `public/`, `src/…` at root) still exist and are not archived. Decide and archive (housekeeping; not Phase 0 blocking).
7. Founder: revisit S0.2 click tracking against D01's reopen trigger (measured friction over ≥20 users).

---

## H. Immediate next actions (in order)

1. **Founder: D01 in writing.** Then engineering removes the password surface (D-CODE-1) — or the PRD is reopened with AT-21 restated.
2. **Engineering: D-CODE-2, 3, 4, 5, 6, 7** as small PRs, each citing the PRD ID and the AT it turns green. (`D03` needs a migration; `D04` an upload-pipeline change; `D07` touches record, page, API payload and map.)
3. **Founder + engineering: D-CODE-8** — website claim sweep using PRD §19 copy verbatim; every claim labelled tested/beta/planned/illustrative or removed; W0 items before any invitation or announcement.
4. **Engineering: D-CODE-9** — build AI-01 extraction + conflict path on the three demo deals, or descope it **in writing** before invites; close AT-06/07/08.
5. **Engineering: AT-01…AT-23 on staging.** Record results in `docs/acceptance-results.md`. Fix until they pass (or an AT is formally restated by the founder in writing).
6. **G0 demonstration** (§D.3) with the founder watching. Evidence → close Phase 0.
7. **G1:** claims audit (AT-20) across all routes; privacy/terms counsel sign-off; founder sign-off → first invites (10–15, Florida, D17).
8. **Before live launch:** SYS-01 monitoring live (S0.7 / D-LIVE-1); §19.6 SEO/`noindex` sweep; unsubscribe + suppression log proven (S0.4 / D13); legal documents approved.

---

## I. Milestones (PRD gates, not calendar)

| Gate | Meaning | PRD §22.1 |
|---|---|---|
| **G0** | Three realistic deals end-to-end on staging | §18.3, §22.1 |
| **G1** | Private beta invites (AT-01…AT-20, no critical defects, claims reconciled, legal copy approved, founder sign-off) | §18.3, §22.1 |
| **G2** | Paid pilot (independent repeated use; costs measured; payment lifecycle ready; real willingness to pay) | §22.1 |
| **G3** | Network features (operator density; manual matching; permission and moderation capacity) | §22.1 |
| **G4** | International expansion (demand, partners, compliance, support) | §22.1 |

**M-E — first validated deals** (founder, 2026-11-04; retained): two independent wholesalers each source, publish and share a deal through ORREI, and it reaches a documented next step. Closings are recorded **as reported**, never as verified by ORREI. This is Phase 1/2 evidence, not a reason to start Phase 3.

---

## J. Working agreements (unchanged)

1. One step per PR where practical; a PR names the roadmap item it delivers.
2. Every PR states Done when / Verify by / Evidence, copied from this file.
3. Verification happens on the deployed site (or staging for Phase 0) for anything user-facing.
4. Tests come with the rule they protect (permissions, visibility, suppression, limits).
5. No real data in the repository; fixtures are invented.
6. Secrets never appear in chat, logs or commits.
7. The founder is the acceptance gate for each phase.
8. Code that depends on an unresolved decision waits (PRD §20).
9. Update this file when a step's status changes — with the evidence. A stale roadmap is a bug.

---

## K. Changelog

| Date | Change |
|---|---|
| 2026-11-13 | **Reconciled to `docs/PRD.md` v1.1.** Phase/Stage naming unified (PRD §0.5). Both legacy decision registers (roadmap D1–D9, Doc 06 D10–D23, SPEC-D01–D14) merged into and closed by PRD §20 (D01–D18) — see §G. Requirement and test IDs re-cited to PRD §11/§18 (`AT-*`). Website work re-cited to PRD §19. Phase 0 exit reworded to the PRD's G0 evidence. Verified evidence carried over with dates; nothing is marked Verified that was not already recorded as such. New: PRD-compliance defect list (§D.2), source-document verification (§A). Supersedes previous `docs/ROADMAP.md` and `docs/ROADMAP-DRAFT.md`. |
