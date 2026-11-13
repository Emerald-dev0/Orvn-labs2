# ORREI roadmap: connected chain (DRAFT)

Status: **draft for founder review. Not in force.** Prepared 2026-11-04 from the Drive documents: 02, 03, 04, 06, 07, 08, 10, plus the 2026-11-07 website corrections PDF and the 2026-10-21 developer brief. Document 04 is partly unreadable in Drive (its middle section is missing), so its items are taken from what could be read.

Older LAREI documents (21 Oct) are superseded by ORREI naming (Document 02 §1, Document 03 §1). Their ideas are used only where the newer documents repeat them.

---

## 1. How to read this

- The work is one chain. Each block lists **needs** (what must be Verified first), **produces** (what the next block can use), and **proof** (the test that shows it works on the live site).
- Nothing in a block starts until everything it **needs** is Verified. "Built" is not "Verified".
- Requirement IDs (AUTH-01, PROP-03, and so on) are from Document 03. Test IDs (T01–T18) are Document 03 §11.
- Decision IDs (SPEC-D01…D14) are Document 03 §15. D10–D21 are from Document 06 §9. Roadmap D1–D9 are in the current `docs/ROADMAP.md`.

---

## 2. Decisions that gate the chain

Answer each one before the block it blocks. Default = the spec's proposed default, used if you say nothing.

| Decision | Blocks | Default |
| --- | --- | --- |
| SPEC-D01 email link only, or passwords too | A2 | One secure primary path; email link |
| D11 workspace role model (editor, publisher, admin) | A3 | Editors edit; publishers approve and publish; admins manage membership |
| SPEC-D04 supported input formats | B4 | Pasted notes and direct file uploads only |
| SPEC-D02 deal sheet PDF is a release blocker | C4 | Yes, for primary wholesale use |
| SPEC-D05 who publishes under a company | B6, D1 | Explicit publisher role; never all members |
| SPEC-D06 public profiles indexable by default | D1 | No; only after explicit publish |
| SPEC-D09 withdrawn links and downloaded files | C5 | Withdraw the URL; downloads cannot be recalled; stamp versions |
| SPEC-D12 retention, deletion, AI processing | E2, before any real file | Finalise before beta |
| SPEC-D10 free vs paid | G2 | Undecided; test willingness to pay |
| SPEC-D14 brand and domain clearance for ORREI | E1, before broad spend | Clear before spending on marketing |
| D19 hosting, database and app subdomain | A1 | Current: Vercel and Neon; confirm before public launch |
| D20 error monitoring provider | E3 | Required before invitations (see §6) |
| **Not yet listed anywhere:** AI model provider and data-processing terms | B4 | Must be chosen before any AI step runs on real files |

---

## 3. The chain

### Stage A: foundations (nothing else starts without these)

**A1. Secure file storage.** *Needs:* R2 configured (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`), D19. *Produces:* private object storage that only the server reads. *Proof:* `/api/health` reports `storage: true`; a file uploaded in one workspace cannot be opened from another (T06); an interrupted upload is reported, not marked processed (T13).

**A2. Sign-in to spec.** *Needs:* SPEC-D01. *Produces:* invitation-gated email sign-in with the AUTH-01 rules: non-enumerating messages; links single-use and time-limited; rate limits on sign-in and links; secure session cookies; session expiry; sign-out removes access; a refused or expired link leads to a plain notice, not raw JSON. *Proof:* T01 on the live site. A replayed link fails. An unknown address gets the same message as a known one.

**A3. Workspace isolation and roles.** *Needs:* A2, D11. *Produces:* every read and write checked on the server against the user's workspace and role (Document 06 §5). Guessed IDs return nothing. *Proof:* an automated test that owner A cannot fetch owner B's files or records (Document 06 §8); T12 with a forged request.

**A4. One property record.** *Needs:* A3. *Produces:* the canonical record with per-field source, state (unknown, source-suggested, user-approved, externally verified) and edit history (PROP-04). The states are never merged into one "Verified" label (Document 03 §3). *Proof:* a changed field keeps its history; an unknown value stays blank, never zero.

**A5. Error and state handling.** *Needs:* A1–A4. *Produces:* every failure shows a reason and a recovery action (SYS-01). Drafts survive refresh (Document 03 §2; Document 10 §4). *Proof:* a forced failure at each step shows the right message; refreshing mid-edit loses nothing.

### Stage B: the property record (Document 02 §5, steps 3–5)

**B1. Create a property with type-aware fields.** *Needs:* A4. *Produces:* vacant land and house forms, showing only the fields that apply (PROP-01, PROP-02). *Proof:* T02, a vacant lot with APN and acres but no bedrooms, saves with no mandatory bedroom field.

**B2. Autosave and recovery.** *Needs:* B1. *Produces:* autosave status shown on screen; recovery of an unsaved draft (Document 02 §6.3). *Proof:* close the tab mid-edit, reopen, the draft is there.

**B3. Media with access classes.** *Needs:* A1, B1. *Produces:* uploads typed as public-eligible or private, with signed private access (PROP-03). *Proof:* T06 (private PDF cannot be fetched by guessing its URL); a removed file does not break a published page.

**B4. Paste and extraction with source references.** *Needs:* B1, SPEC-D04, AI provider decision. *Produces:* candidate facts, each with the snippet it came from (AI-01). Hostile instructions inside a document are treated as text (T04). *Proof:* a pasted note produces candidates with sources; AI outage leaves manual entry working.

**B5. Conflicts and approval ledger.** *Needs:* B4. *Produces:* two conflicting values are shown side by side with their sources; the user picks one (AI-02). *Proof:* T03, $480,000 vs $465,000, is visible and not silently resolved.

**B6. Review screen.** *Needs:* B5, SPEC-D05. *Produces:* badges "Supplied by you", "Source conflict", "Needs review", "User approved". Never "Verified" without an independent check (Document 04 WORK-03; Document 07 §3). *Proof:* every fact on the review screen shows one of the four labels.

### Stage C: outputs and publication (Document 02 §5, steps 6–7 and 9)

**C1. Generated copy from approved facts only.** *Needs:* B6. *Produces:* an editable description built only from approved facts (AI-03). *Proof:* a tone change leaves every number unchanged; no invented renovations, yield or comparables.

**C2. Property page and snapshot.** *Needs:* B6. *Produces:* a preview and an immutable publication snapshot (PUB-01, PUB-04). *Proof:* the preview matches what is published; editing afterwards does not change the live page until republished.

**C3. Per-output states and visibility.** *Needs:* C2. *Produces:* page, deal sheet, summary and card each have their own state (draft, approved, live, withdrawn), and the property has private, link-only or public visibility (PUB-03, PUB-04, roadmap §15-10). *Proof:* T07, publishing without approval is blocked; T08, a link-only page is not in the public profile or search.

**C4. Deal sheet PDF.** *Needs:* C2, SPEC-D02. *Produces:* a printable PDF from the same snapshot (PUB-02). *Proof:* two PDFs from one property with different sections match the record; the export shows its version date.

**C5. Revisions, withdrawal and stale warnings.** *Needs:* C3. *Produces:* a changed price marks the live page as needing republish; withdrawal shows an unavailable page and blocks old media URLs (PUB-05). *Proof:* T10 (price change updates the page only after republish; old PDFs are marked historic); withdrawn URL returns no property data.

### Stage D: the professional and the recipient (Document 02 §5, steps 2 and 8)

**D1. Professional profile.** *Needs:* A3, SPEC-D05, SPEC-D06. *Produces:* a profile with name, role, markets and chosen contact routes; preview before publish; unpublish blocks public access (AUTH-02, PRO-01). *Proof:* the public profile opens with no sign-in; private drafts are not visible.

**D2. Portfolio cards.** *Needs:* C3, D1. *Produces:* the profile lists only published properties the publisher chose (PORT-01). *Proof:* an unpublished or link-only property does not appear.

**D3. Anonymous inquiry.** *Needs:* C3. *Produces:* a short form with consent, rate limits and spam checks (INQ-01). No account needed. *Proof:* T09 on a phone with no sign-in: the inquiry is stored once, the owner is notified, a duplicate click does not create a second record.

**D4. Owner inbox.** *Needs:* D3. *Produces:* inquiries listed by property with status: new, viewed, contacted, closed (INQ-02). *Proof:* another workspace cannot see the inquiry.

**D5. Activity counts, real events only.** *Needs:* C3, D3. *Produces:* page opens and inquiry counts, labelled with what they mean (AN-01). Sample figures are removed (Document 03 T11). *Proof:* a new account shows zero, not example numbers.

### Stage E: launch readiness for private beta (runs alongside A–D; must pass before any invitation)

**E1. Marketing site corrections.** *Needs:* SPEC-D14 (clearance before spend). *Produces:* the corrections in Document 04 P0-01 to P0-05 and the 7 Nov brief: every button goes somewhere that works; no unbuilt feature described as live; no sample figures without an "illustrative" label; "Request early access" creates no account; legacy PAS pages inventoried and redirected deliberately. *Proof:* a link and CTA list, each tested on desktop and a 320–390px phone.

**E2. Privacy, terms and AI notices.** *Needs:* SPEC-D12, counsel review. *Produces:* policies that match what the system does (Document 04 P0-02; Document 03 §13). *Proof:* each claim in the policy is checked against the code by the founder.

**E3. Monitoring and alerts.** *Needs:* D20. *Produces:* alerts for uptime, failed sign-ins, upload failures, failed publication, inquiry delivery failure and broken routes (Document 06 §8; SYS-01). *Proof:* a test alert reaches the founder. **Conflicts with the founder's deferral of S0.7; see §6.**

**E4. Backups and restore.** *Needs:* A1, A4. *Produces:* a tested restore of the database and file storage (Document 06 §8). *Proof:* a restore into a separate environment, with the record counts matched.

**E5. Accessibility and mobile.** *Needs:* B1–D5 screens exist. *Produces:* keyboard-only use, visible focus, labels, errors announced, contrast, 320–390px, 768px and 1366px checked (Document 10 §5). *Proof:* a keyboard-only run of T17 with a screen reader.

### Gates

**G0. Stage 0 exit (controlled prototype).** Requires A–D complete. *Test:* three realistic deals run end to end on the live site, with missing data, an import conflict, an update, private files and a withdrawn link, and no critical auth or privacy issue (Document 02 §9). The founder watches. *This is the reopened Stage 0.*

**G1. Private beta invitations.** Requires G0 and E1–E5. *Scope:* 10–15 invited active US operators, Florida-concentrated (Document 02 §9, Stage 1). Success measures are in Document 02 §11.

### Later stages (not built until the earlier gate passes)

- **Stage 1: private beta.** Run it for the period needed to meet the Document 02 §9 criteria. Track time to first presentation, sharing, inquiries, repeat use.
- **G2: charging.** Document 02 §17: repeated sharing, value stated in users' own words, costs measured, payment and cancellation terms ready, and some beta users accept a paid offer. Needs SPEC-D10 and D21.
- **Stage 2: paid workflow.** Multi-property management, templates, team workflow for small disposition teams (Document 02 §9).
- **Stage 3: discovery and manual JV pilot.** Profiles and deal discovery for opted-in content; manual JV requests (JV-01, JV-02, NET-01 to NET-04). Needs moderation, consent and legal review (SPEC-D09, D11).
- **Stage 4: automation.** Matching, notifications, document coordination through licensed providers (JV-03, TRX-01, TRX-02). Only after manual proof.
- **Stage 5: expansion.** Other US states, then a selected international pilot (GLOBAL-01). Document 02 §9.
- **Separate product:** network intelligence and underwriting data (INTEL-01). Not part of this chain.

---

## 4. Where we are against the chain

Only what the roadmap or evidence records supports. Items marked "verify" were not checked.

| Block | Status | What is left |
| --- | --- | --- |
| A1 storage | Not configured | R2 variables; then the A1 proof |
| A2 sign-in | Email link and invitation gate working; password path exists in the sign-in screen | Decide SPEC-D01; check AUTH-01 rules; refusal redirect built, not yet live-tested |
| A3 isolation and roles | Partly; D11 open | Roles decision; isolation tests |
| A4 record | Property list, detail and new pages exist | Fact states and history to the spec (verify) |
| A5 errors and drafts | Verify | Check draft recovery after refresh |
| B1 create property | Built (verify type-aware fields) | T02 proof |
| B2 autosave | Verify | Autosave status and recovery |
| B3 media | Code exists; blocked by A1 | A1, then T06 and T13 |
| B4–B6 extraction, conflicts, review | Not started | AI provider decision; SPEC-D04 |
| C1 copy | Not started | Needs B6 |
| C2–C3 publication | Snapshots built; per-output states not | Per-output states (roadmap §15-10) |
| C4 deal sheet PDF | Not built | SPEC-D02 |
| C5 revisions and withdrawal | Verify | T08, T10 |
| D1 profile | `/website` shows sample data | Rebuild to spec; remove sample data |
| D2 portfolio | Not started | Needs C3 and D1 |
| D3 inquiry | Inquiries page exists; early-access and contact verified; property inquiry on live site not verified | T09 on a phone |
| D4 owner inbox | `/inquiries` exists | Status states; T04 isolation |
| D5 activity | `/analytics` shows sample data | Remove sample data |
| E1 site corrections | Verify. The 7 Nov brief said "hold merge" until P0 items were fixed | Check each P0 item on the live site |
| E2 privacy and AI notices | Verify; no counsel review on record | Counsel review; SPEC-D12 |
| E3 monitoring | Deferred by the founder | Conflicts with spec; see §6 |
| E4 backups | Verify | Restore test |
| E5 accessibility | Verify | Full QA run |
| G0 | Not met | Requires A–D |

---

## 5. Out of scope for this chain (Document 02 §12)

Not built in any stage of this chain: a full CRM, automated valuation or ARV prediction, parcel boundary or title checks, escrow or contract automation, in-platform payments between parties, a general website builder, automated email, SMS or social campaigns, buyer scraping, predictive buyer scoring, and autonomous AI negotiation.

---

## 6. Conflicts to resolve before G1

1. **Monitoring (E3).** The founder deferred monitoring (S0.7). Document 06 §8 and SYS-01 require alerts on uptime, sign-in failures, upload failures, failed publication and broken routes before live use. *Decision needed: which alerts are in scope for G1, and when they must be live.*
2. **AI provider.** No document names the model provider, its data retention or whether it trains on our data. Document 03 §13 requires this to be stated truthfully. *Decision needed.*
3. **Stage 0 wording.** The roadmap's current "Stage 0" (launch hardening, S0.1–S0.9) is a subset of block A plus E. Document 02's Stage 0 is G0. *Decision needed: rename the current Stage 0 to "Launch hardening" so the two are not confused.*
4. **Missing documents.** Documents 01, 05, 09, 11 and 12 are not in Drive. The mockup zip has not been reviewed. If any of these contain requirements not covered here, the draft needs updating.

---

## 7. Questions only you can answer

1. Do you accept the chain order (A → B → C → D, with E alongside and G0 before invitations)?
2. Which defaults in §2 do you accept, and which do you change?
3. Monitoring: is E3 required before G1, or only before paid use?
4. Which AI provider do you want, and who signs off its data terms?
5. Do you want the three-deal test (G0) to be run by you or with me?
