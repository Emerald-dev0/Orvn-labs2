# ORREI — Product Requirements Document (PRD)

**Company:** ORVN Labs  
**Product:** ORREI (working product name; brand/legal clearance pending)  
**Version:** 1.0 — consolidated from the ORVN Labs November 13, 2026 document set  
**Primary market:** United States (Florida pilot concentration)  
**Release model:** Controlled, invitation-only private beta  
**Product standard:** *Stupidly simple. Functional. Naturally satisfying.*

---

## Document status and authority

| Item | Status |
|---|---|
| Sections 0–12 | Founder-authored text, supplied 2026-11-13. **Authoritative. Do not contradict.** |
| Sections 13–23 | Completed from the Drive source set (Docs 02, 03, 04, 06, 07, 08, 10) so the cross-references in §0–12 resolve. Derived, not invented. |
| Decisions | **All 18 (D01–D18) are resolved in §20.** Nothing in this PRD is waiting on a founder choice. |
| Conflict rule | Where a Drive document and §0–12 disagree, **§0–12 wins**. |
| What this is not | Evidence that any capability is deployed. Every item remains a proposed specification until its acceptance test (§18) passes. |
| Change control | Any addition must be classified as V1 blocker / deferred / pilot / future (§22.4) and must keep §14 field IDs and §17 state names consistent. |

### Contents

- §0 How to read and use this PRD
- §1 Executive summary
- §2 Naming, brand and company context
- §3 Source precedence and resolved inconsistencies
- §4 Audiences, segments and value
- §5 Product principles → product rules
- §6 Cross-cutting system rules
- §7 Guest (anonymous) access — complete model
- §8 Roles and permissions
- §9 The complete user journey (screen-level narrative)
- §10 Phased roadmap
- §11 V1 functional requirements (complete specification)
- §12 Conditional V1 capabilities
- §13 Non-functional requirements and quality gates
- §14 Field dictionary and vocabulary (canonical field IDs)
- §15 Real-estate terminology and its design implications
- §16 Design system and UX standards
- §17 Technical architecture, entities and state machines
- §18 Acceptance test plan and go/no-go
- §19 Website requirements: copy, claims, early-access funnel, legal and SEO
- §20 Decision register — all decisions resolved
- §21 Risks and mitigations
- §22 Release gates, readiness checklists and change control
- §23 Document control, sources and changelog

---

## 0. How to read and use this PRD

### 0.1 Purpose

This is the single reference for what ORREI is, who it is for, exactly how it behaves, what is in each phase, how guest (anonymous) access works, what the website must say, and how every capability is accepted. It consolidates every requirement from the November 13 documents (02 Strategy & Roadmap, 03 Feature Specification, 04 Website Audit & Corrections, 06 Technical Architecture, 07 Data Dictionary & Vocabulary, 08 Real Estate Glossary, 10 Design System & UX Standards) into one build-ready spec.

### 0.2 Source documents consolidated

| Source | Contributes to this PRD |
|---|---|
| Doc 02 — Product Strategy & Roadmap | Thesis, audiences, principles, phase/stage gates, feature decisions, validation, risks, rollout, decision list |
| Doc 03 — Complete Feature Specification | All V1 feature IDs (AUTH, PRO, PROP, AI, PUB, PORT, INQ, AN, SYS), conditional/future modules, permission matrix, data objects, state transitions, 18 acceptance tests, NFRs, go/no-go, decision register |
| Doc 04 — Website Audit & Corrections | Page-by-page copy, claim policy, early-access funnel, confirmation email, legal-page requirements, SEO, QA |
| Doc 06 — Technical Architecture | Boundaries, entities, state machines, AI pipeline, authorization, jobs, global-ready schema, QA gates |
| Doc 07 — Data Dictionary & Vocabulary | Approved terms, canonical property fields, provenance, empty/error wording |
| Doc 08 — Real Estate Glossary | Industry terms and design implications, key distinctions |
| Doc 10 — Design System & UX Standards | Visual tokens, layouts, screen checklist, interaction rules, accessibility |

### 0.3 Documents referenced but not present in the Drive set

Documents 01, 05 (illustrative screen library), 09, and the two glossary/field-dictionary documents that Doc 03 calls "Document 11" and "Document 12" are referenced by the set. In the Drive, the glossary exists as **Document 08** and the field dictionary as **Document 07**. This PRD treats Doc 08 as "the real estate glossary" and Doc 07 as "the field dictionary and vocabulary." Wherever Doc 03/02 point to "Document 11/12," read Doc 08/07. The 32-screen mockup zip (`ORREI_Individual_Mockups_32_Screens.zip`) is compositional reference only, never a feature specification.

### 0.4 Requirement labels (used throughout)

| Label | Meaning | Engineering implication |
|---|---|---|
| **V1 — required** | Needed for a complete, individually useful publishing workflow | Implement and demonstrate end-to-end before any live use |
| **V1 — conditional** | Useful but depends on capability, rights or reliability | Declare supported input types; explicitly defer unsupported variants |
| **V1+ / Phase 2** | Commercial, team and retention upgrades | Design extension points; do not silently ship as core V1 |
| **Phase 3+ / pilot** | Discovery, messaging, JV networking hypothesis | No claim of present capability; no public solicitation without review |
| **Ecosystem / later** | Transactions, CRM, intelligence, global infrastructure | No V1 engineering commitment |
| **Open decision** | Founder choice or external research still needed | Do not implement an assumption as if approved |

### 0.5 Phase vs Stage naming

The source documents say "Stage 0–5." This PRD calls them **Phase 0–5** (same thing, same gates, same numbering).

### 0.6 Authority and honesty boundary (read this first)

- Everything in the November 13 documents is a **proposed specification, not evidence that any feature is deployed.** Screenshots on the website show illustrative concepts.
- A build agent must not treat a requirement as "done" because a mockup or marketing page shows it. Each capability needs its own end-to-end acceptance test.
- The **public website must never claim more than the tested release.**

---

## 1. Executive summary

### 1.1 One-line definition

ORREI helps a real-estate professional take property information that is scattered across notes, messages, documents and photos, turn it into **one approved property record**, produce **buyer-ready materials** (a property page and a printable deal sheet), **share them with controlled visibility**, and **receive and manage buyer inquiries** — with a lightweight professional profile giving every shared deal an accountable source.

### 1.2 The core loop (the product, in one chain)

**Invite → secure sign-in → profile setup → new property → notes and/or supported files → structured fields with source mapping → human review → editable copy + page/deal-sheet preview → explicit publish/share authorization → buyer views without signup (guest) → buyer inquiry → owner notification → owner revises or withdraws.**

A V1 test **fails** if this chain succeeds only in screenshots, uses simulated inquiries, leaks private attachments, requires developers to hand-edit data, or loses changes on an ordinary browser refresh.

### 1.3 Differentiation hypothesis

The differentiator is **not** "AI-written descriptions" or "a standalone property URL" — both are easily replicated. The differentiator is:

1. a trustworthy **canonical property record**,
2. **explicit human approval** of every buyer-facing fact,
3. **reusable outputs** generated from that one record,
4. **controlled publishing** (private / link-only / public),
5. **low-friction recipient viewing** (no account for buyers),
6. a **professional identity that persists across deals.**

The hypothesis only matters if users demonstrably prefer this workflow over their current tools and return to use it.

### 1.4 Long-term ambition (not V1)

In time, ORREI may connect professional identities, buyer criteria, collaboration requests (JV), transaction-support workflows and market intelligence. **None of that network-dependent value may be required for a single customer to benefit from V1.**

### 1.5 What ORREI is NOT

Not an appraisal or title service; not a general website builder; not an automatic broker; not a complete CRM; not a listing-portal replacement; not an instant global closing platform; not a verifier of title, zoning, boundaries, ARV or ownership. ORREI is software — **not a brokerage.**

---

## 2. Naming, brand and company context

- **Company:** ORVN Labs. **Product:** ORREI.
- ORREI is the name on the latest deployed-site screenshots (November 12). The earlier Nov 7 brief said the product name was undecided and rejected "LAREI"; the later ORREI usage supersedes that. **Do not use "LAREI" or "PAS" anywhere in product or marketing copy.** (Older material described PAS as an AI first-touch brokerage tool; that positioning is retired.)
- **Trademark/domain clearance for ORREI is not established.** Seek clearance before broad spend.
- Domains: marketing site `orvnlabs.com`; proposed authenticated app `app.orvnlabs.com`; public profile and property routes must have explicit routing/permission boundaries separate from marketing.
- Contact: `hello@orvnlabs.com` (reply-to; must be monitored).
- Footer rule: "ORREI is in development. Screens and properties are illustrative. Access is limited to approved beta users."

---

## 3. Source precedence and resolved inconsistencies

| Conflict in sources | Resolution used in this PRD |
|---|---|
| Nov 7 "name undecided / LAREI rejected" vs Nov 12–13 "ORREI" | ORREI is current; clearance pending |
| Property state naming differs across docs: Doc 03 "Draft → In review → Approved → Edited/Archived"; Doc 06 "DRAFT → NEEDS_REVIEW → APPROVED → ARCHIVED"; Doc 07 "publication_status Draft/review/live/withdrawn" | Use Doc 06 enum names for the **property record state** (`DRAFT`, `NEEDS_REVIEW`, `APPROVED`, `ARCHIVED`, with reopen transitions) and a **separate** publication state per output (`NOT_PUBLISHED`, `LINK_ONLY`/`PUBLIC`, `UNPUBLISHED/WITHDRAWN`; plus output states Draft/Ready/Published/Withdrawn). See §17. |
| Website claim "AI helps with wording only" vs intake claim "AI extracts and structures" | AI does three distinct things: **extract**, **draft**, and (never) **verify**. FAQ copy rewritten (§19) |
| FAQ "you can publish without it" vs "nothing publishes while a fact is unapproved or two sources disagree" | Optional unknown fields may be omitted; **required** fields and **unresolved critical conflicts block the affected output only.** |
| Sign-in page shows both email link and password links | Pick **one** secure primary auth path (decision D01); hide the other until it works |
| "No stale brochures in circulation" | Not allowed. Downloaded PDFs cannot be recalled. Use version/date stamping |
| "About twenty minutes" setup claim | Remove until measured in beta |
| Doc 03 "Document 11/12" references | Read as Doc 08 (glossary) and Doc 07 (field dictionary) |

---

## 4. Audiences, segments and value

### 4.1 Launch segment (sales and marketing focus)

**Active US wholesalers and small disposition teams**, concentrated in one or two Florida markets, with software usable anywhere in the US. Inactive wholesalers without inventory are easy to register but hard to retain — do not target them first.

### 4.2 Participant table

| Participant | Near-term job | Initial account / role | Later opportunity |
|---|---|---|---|
| Active wholesaler | Share off-market inventory without rebuilding a package each time | Workspace creator; public profile; property publisher | Find disposition partners and relevant buyers |
| Small disposition team | Standardize repeated deal packages across staff | Organization workspace (simple at first; permissions staged) | Submission workflow, buyer criteria, matching, collaboration |
| Individual agent / broker | Share authorized listings; reinforce professional identity | Property + profile publisher where lawful/authorized | Integrations, referral/discovery |
| Investor / developer | Present owned investments, projects or authorized opportunities | Property editor / publisher | Multi-unit and transaction coordination |
| Buyer / visitor (**guest**) | Review a deal and request information without friction | **Anonymous** recipient for public / link-only content | Saved searches, preferences, alerts, qualified buyer access |
| JV / acquisition partner | Find the right counterpart for a defined deal or market | Not in V1 | Authenticated matching and introductions |
| Title, financing, service providers | Receive adequate context for approved work | No special workspace at launch | Jurisdiction-specific transaction integrations |

Marketing may mention all sectors as **future** audiences, but sales focus stays on active wholesalers and small disposition operators.

### 4.3 Primary user job

Turn existing property information into a clear, editable, accurate-enough-for-review presentation that can be shared quickly.

### 4.4 Outcomes

- **First saleable outcome:** a real customer publishes or privately shares an approved property page or deal sheet for an actual opportunity.
- **Secondary outcome:** the same record is maintained as price, availability and terms change — no repetitive reassembly.
- **Company ambition:** connect records and identities to qualified people and compliant transaction services over time.

---

## 5. Product principles → product rules

| Principle | Visible behavior | Hidden implementation obligation |
|---|---|---|
| Simple | One primary action at each step of property creation | Progressive disclosure, remembered defaults, clear errors |
| Functional | Every illustrated CTA produces the promised result | End-to-end tests; no dead controls or simulated metrics |
| Naturally satisfying | Fast previews, polished mobile output, obvious success states | Responsive layouts, accessibility, loading performance |
| Human control | User confirms imported facts and publication | Field provenance, explicit approvals, audit entries |
| Private by default | Sensitive attachments never appear on share pages | Server-side access policies; separate media exposure rules |
| Single source | Update one record, republish dependent presentations | Structured data + versioned publish snapshots |
| Global foundation | Location, money and units modeled explicitly | Jurisdiction-aware schemas, conversion rules; no V1 global UX |

---

## 6. Cross-cutting system rules (non-negotiable)

| Area | Rule |
|---|---|
| Tenant isolation | Every non-public object is checked **server-side** for user, workspace and assigned permission. Guessed IDs must never expose another workspace |
| Property claims | A fact is exactly one of: **unknown, source-suggested, user-approved, or separately externally verified.** Never collapse these into one "Verified" state |
| Source of truth | One canonical property record; every output references a reviewed **publication snapshot** and its source version |
| Approval | No autonomous AI publication, financial conclusion, legal assertion, or silent overwrite of user-confirmed information |
| Public access | Public and link-only pages need **no signup to view**; private materials never become public by default |
| Publication state | Data-preparation state and access visibility are **independent** (Draft/Ready/Published/Withdrawn ≠ Private/Link-only/Public) |
| Localization | US-first inputs/display; store country, state/region, currency, units and timezone independently |
| Accessibility | Keyboard navigation, visible focus, field labels, accessible errors, text alternatives, usable mobile layouts |
| Retention | Document deletion, account deletion, audit retention and inquiry processing must be specified **before live launch** |
| Integration rights | No portal scraping/import that bypasses agreements, authentication or technical restrictions |
| No invented activity | Never show sample analytics as real traffic; never claim buyers are verified or referrals completed |
| Permissions | A person may eventually belong to multiple organizations; **no implicit cross-organization access** |

### 6.1 Claims and terminology policy (applies to website, app UI, emails, copy generation)

| On-page phrase | Do not imply | Allowed substitute before proof |
|---|---|---|
| Verified | External title/price/ownership verification | "User approved" or "Based on uploaded source" |
| Live | A shipped customer-facing feature | "Illustrative product preview" |
| Automatically import any portal | Provider-agnostic ingestion rights | "Supported source import, where available" |
| No stale brochures | Recall of downloaded files | "Revise and regenerate updated materials" |
| 1,284 views / 37 inquiries | Real traction | "Illustrative figures — not customer results" |
| Buyer engaged | Qualified buyer identity | "Page opened" or "Inquiry submitted" |
| Your AI remembers | Specific retention or model-training arrangement | "Save approved style preferences when available" |
| 20 minutes | Validated median creation time | "Designed to reduce manual assembly" |
| Cross-border transactions | Shipped legal/closing infrastructure | "Long-term vision" |

Compliance must also review the words **"verified," "licensed," "guaranteed," "ROI," "profit," "closed,"** and any transaction-compensation language.

---

## 7. Guest (anonymous) access — complete model

This section defines exactly how a person who is **not signed in** interacts with ORREI. It is the most important rule set for buyers and recipients.

### 7.1 Principles

1. **Buyers and recipients never need an account** to view a public or link-only property, view a public profile, or submit a one-time inquiry.
2. Accounts are for **owners/workspace members** (create/edit/publish) and, in later phases, for persistent social features (save, connect, message, JV).
3. A guest sees **only** the approved published snapshot — never drafts, private notes, source documents, seller-sensitive data or private files.

### 7.2 What a guest can do

| Action | Guest (anonymous) |
|---|---|
| Open a **public** property page or profile | Yes |
| Open a **link-only** property page | Yes, **with a valid link** (possession of the URL) |
| Open a **private** property | No — "Only your workspace can view this property." No public URL exists |
| Submit a one-time **inquiry** | Yes, with anti-spam safeguards, consent and rate limits |
| View published property cards on a public profile | Yes (only public properties appear) |
| Save a profile/deal | **No** — prompt to sign in; resume the action after sign-in (future feature) |
| Request a connection / send persistent message / request JV | **No** — account required (future features) |
| View private source documents | No |
| Create or edit records | No |
| Publish or withdraw | No |

### 7.3 Guest viewing rules

- No signup wall. No forced cookie-wall beyond what law requires.
- Mobile-first, readable on low bandwidth.
- **Link-only is unlisted, not secret.** Anyone with the link can forward it. ORREI must never imply password protection or recipient restriction unless those controls are actually built.
- Link-only and private pages are **excluded** from discovery, sitemaps and search indexing (`noindex` + real authorization). `robots.txt` is **not** an access-control mechanism.
- Public pages are indexable **only** after the owner explicitly publishes as public.
- **Withdrawn pages** return: "This property page is no longer available." and must block access to old media URLs and leak no source material.
- Unknown, unpublished and withdrawn URLs must expose no data and must not be indexable.

### 7.4 Guest inquiry (INQ-01) summary

Visitor fills a short form (name, valid contact, message, consent) → submission validated, rate-limited, spam-checked → persisted once → confirmation shown ("Your inquiry has been sent.") → owner notified by email and sees it in the inbox. An inquiry is **not** proof of a qualified buyer, financing or intent. Full spec in §11.

### 7.5 Future guest-to-account bridge (not V1)

When Save/Connect/Message/Request-JV controls ship, a signed-out guest who clicks them must see: "Sign in to save this profile." The system must **preserve the return URL/action**, then **complete the intended action after sign-in**, without bypassing visibility (a saved restricted record must not bypass access rules). Anonymous viewing remains available.

### 7.6 Guest data handling

- Inquiry data (name, contact, message, consent flags, timestamps, anti-spam metadata) is stored with a defined retention policy; senders can request deletion.
- Analytics for guests: **privacy-safe events only** (page opens, inquiry count). No visitor identification, unique-buyer counts, heatmaps, dwell time or conversion attribution unless implemented, tested and consented.
- A dedicated information-use notice appears near the public inquiry form.
- Do not expose the owner's email unnecessarily in the public page or API.

---

## 8. Roles and permissions

### 8.1 Roles

| Actor | Allowed | Not allowed |
|---|---|---|
| Anonymous (guest) | Open approved public / link-only page; send basic inquiry | Read drafts/source files; save profile persistently |
| Authenticated individual | Manage own drafts and workspace | See any other workspace's private information |
| Workspace editor | Edit assigned property records and media | Approve publication unless role allows |
| Workspace publisher | Review and publish approved outputs | Bypass required review gates |
| Workspace admin | Manage organization membership and access | Impersonate users silently |
| ORVN support | Explicitly logged, narrowly scoped troubleshooting | Routine unrestricted source-file browsing |

### 8.2 Permission matrix

| Action | Anonymous | Signed-in member | Workspace editor | Publisher / admin |
|---|---|---|---|---|
| View public profile and page | Yes | Yes | Yes | Yes |
| View unlisted page with link | Yes (link possession) | Yes (link possession) | Yes | Yes |
| Submit basic inquiry | Yes, safeguarded | Yes | Yes | Yes |
| Access private source document | No | Own permitted only | Assigned only | Assigned only |
| Create/edit record | No | Own workspace if authorized | Yes | Yes |
| Approve fact / publish | No | If granted publisher rights | Not automatically | Yes |
| Change visibility / withdraw | No | If publisher | Not automatically | Yes |
| Save profile / request connection | Account required (future) | Later release | Later release | Later release |
| Send persistent in-app message | Account required (future) | Later release | Later release | Later release |
| Request JV | Account required (future) | Eligible member (later) | Eligible member (later) | Authorized if policy permits |

### 8.3 Rules

- "Who can publish under a company account" = **explicit admin/publisher role, never default-all-members** (D05).
- Server-side **record-level authorization on every read and write**. Secure session cookies, CSRF protection where relevant, **MFA for privileged accounts**, rate-controls on magic-link/password, non-enumerating errors.
- A JV request is a **collaboration object**, not a visibility type.

---

## 9. The complete user journey (screen-level narrative)

1. **Discover** → marketing site (`/`, `/how-it-works`, `/who-its-for`, `/about`, `/faq`).
2. **Request early access** → short form → neutral confirmation → founder-note email → human review.
3. **Invitation** → invited user receives secure sign-in link (single-use, time-limited).
4. **Sign in** → session created; non-enumerating messaging.
5. **Onboarding** → choose individual role, primary US market, display name/contact, optional profile basics; skip optional items; go straight to **Create Property.**
6. **Create property** → select category (vacant land, single family, multifamily/other supported), enter best-known location, save draft (resumable).
7. **Add information** → type-aware fields; paste notes and/or upload supported files; upload media; classify public vs private.
8. **AI structure** → candidate fields with source references; missing values and conflicts shown; user accepts/edits/rejects.
9. **Review & approve** → resolve conflicts; approve facts that will appear publicly.
10. **Generate** → editable description + buyer-facing page (+ printable deal sheet).
11. **Preview** → desktop/mobile preview identical to what will publish.
12. **Publish** → choose visibility (private / link-only / public), confirm what is exposed, explicit confirm per output; working URL created.
13. **Share** → send the link; guest opens without signup.
14. **Inquiry** → guest submits form; owner notified; owner sees inquiry in inbox.
15. **Maintain** → edit price/status/media; review changed fields; republish intentionally; log new snapshot; withdraw/archive when sold.
16. **Measure** → page opens and inquiry counts (clearly defined, real events only).

---

## 10. Phased roadmap (capability gates, not calendar bundles)

Phases advance on **evidence**, not dates. No phase may be declared complete because a screen exists.

### Phase 0 — Product readiness / controlled prototype

**Purpose:** Stop demonstrating unimplemented functionality as if shipped.  
**Scope:** Instrumented end-to-end flow; invite/auth; approved property record; secure uploads; link and inquiry tests; mobile and accessibility QA; honest website claims (§19).  
**Exit evidence:** Developer demonstrates **3 realistic deals end-to-end**, including missing data, import conflict, update, private files and link withdrawal. No critical auth/privacy issues.  
**Excluded:** public marketplace, partner matching, broad API, transaction automation.  
**Go/no-go:** based on observed function — not a visually complete landing page.

### Phase 1 — Private beta: repeatable property publishing

**Customer:** 10–15 invited active US operators, concentrated in Florida (cohort size is a proposed research target).  
**Core experience:** produce an approved deal page and practical deal sheet; publish and share; capture inquiry; maintain versions and statuses. Basic professional profile included for accountable context.  
**Metrics:** time to first usable published presentation; % creating first record; % actually sharing; share link functioning; inquiry delivery; repeat creation/updates; user-reported time replaced. Track failures/incidents. Interview both active **and** inactive invitees.  
**Advance only if:** independent operators use it repeatedly **without developer intervention**, and some show willingness to pay.  
**Excluded:** network feeds, connections, matching, real transaction tracking, complex organizational access.

### Phase 2 — Paid workflow and team fit

**Purpose:** establish commercial utility and retention.  
**Scope:** paid entitlements only after pricing tests; multi-property management; enhanced templates; recurring brand settings; stronger organization workflows; collaboration for small disposition teams. Build only what customers repeatedly need.  
**Dependencies:** onboarding/support processes, billing/tax arrangements, usage/cost telemetry, workspace permissions, multi-tenant isolation, subscription lifecycle.  
**Advance after:** paying users repeatedly create/update/share and support costs are manageable.  
**Excluded:** full CRM; automated transaction closing.

### Phase 3 — Discovery, professional relationships, concierge JV pilot

**Purpose:** test two-sided network value.  
**Scope:** public searchable profiles and discoverable deals for **opted-in, authorized content**; Save, Connect and persistent messaging (authenticated accounts); recruit disposition operators market-by-market; capture buyer criteria **without forcing upload of private buyer lists**; **manually match** early JV requests.  
**Dependencies:** real operator density, moderation, abuse controls, proof/representation categories, consent to contact, marketing rights, legal review.  
**Rule:** move to automated matching only with demonstrated response and successful introductions; do not optimize for raw registrations.

### Phase 4 — Structured network and transaction-support integrations

**Purpose:** automate matching/coordination **only after manual validation.**  
**Scope:** qualified matching criteria, notification preferences, requests and mutual introductions; may expand to secure document exchange and task tracking; integrate with authorized licensed/title/e-sign providers rather than inventing settlement rails.  
**Gate:** jurisdiction-specific legal approval before transaction compensation, referrals or document templates. No universal closing claims.

### Phase 5 — Cross-state depth and international expansion

**Purpose:** more US states first, then selected foreign jurisdictions only when local partners and compliance exist. Expand currencies/units, languages, local property taxonomies, consent, identity and data residency. Driven by operator demand, partner availability and legal feasibility. Cross-border deal execution is a **long-term thesis, not a V1 promise.**

### 10.1 Feature decisions: now, conditional, later, reject

| Feature / initiative | Treatment | Reason |
|---|---|---|
| Property intake, review, page, sharing, inquiries | **Required in V1** | Complete standalone value loop |
| Basic professional profile and portfolio | Required in V1 (limited) | Credibility, persistent identity; no network mechanics |
| Downloadable deal sheet | **Required in V1 (D02)** | Existing workflow; wholesaler disposition is document-centric |
| Source comparison / factual conflicts | V1 where supported by actual sources | Critical to trust; do not overclaim verification |
| Portal imports | Conditional, limited integrations | Only with lawful permission and validated format |
| Brand voice import / AI style memory | Optional after core stability | Useful but a distraction from core |
| Basic analytics | V1 limited, accurately labeled | Page opens and inquiries only |
| Subscription tiers / free limits | Commercial validation phase | No finalized willingness to pay |
| Save profiles, connects, messaging | Phase 3 candidate | Network value, moderation, identity dependencies |
| JV matching | Manual pilot before automation | Needs liquidity, rights, trust |
| Auto-email blasts / SMS campaigns | **Defer** | Deliverability, consent, regulation, support load |
| Buyer scraping / skip tracing / market underwriting | **Not V1** | Separate data business; accuracy exposure |
| Contract drafting / e-sign / title / closing | Future integration with specialist partners | Legal and jurisdictional requirements |
| General-purpose website builder | **Do not build** | Distracts from property-first differentiation |

### 10.2 Readiness checklists

**Ready to invite beta users:** one real property can be entered and reviewed without manual DB intervention; private docs and non-public drafts cannot be opened by unrelated users; a real mobile buyer opens a link and sends an inquiry successfully; missing/contradictory values are safe and visible; withdrawal and editing behavior tested.  

**Ready to charge:** independent users repeatedly share useful materials; users explain the value in their own words; support and model/hosting costs measured; payment lifecycle, cancellation, refunds and customer terms ready; some beta users accept a real offer to pay.  

**Ready to add network:** enough genuine active participants in chosen markets; requests manually matched without spamming; intro/marketing permission and identity claims controlled; lawful operating and compensation model reviewed; bad-actor reporting and moderation capacity exist.  

**Ready to expand internationally:** demonstrated demand per market; local conventions/disclosures modeled correctly; country-specific legal and service partners identified; privacy, payments and data-transfer requirements reviewed; workable local support and trust.

---

## 11. V1 functional requirements (complete specification)

Each requirement below has: **Release/Owner, Purpose, Entry, Workflow, Inputs/Outputs, Rules/Permissions/Security, Edge cases, Acceptance tests, Measurement, Dependencies.** Every engineering ticket derived from these must carry: requirement ID; release label; user role; screen ID; expected primary action; field IDs (§14); permissions; success and failure states; tracking event; automated/manual test ID; link to a representative mockup.

### AUTH-01 — Invitation, authentication and sessions

- **Release/Owner:** V1 required | prospective operator; signed-in member
- **Purpose:** let approved users return securely to their own records and profiles.
- **Entry:** user has an invitation or authorized registration path; unauthenticated user opens sign-in.
- **Workflow:** approved email sign-in path → validate invitation → create session → access workspace → sign out; expire/revoke sessions. If password mode is supported, support reset and secure creation.
- **Inputs/Outputs:** email, invitation status, auth credential/session → authenticated user ID, audit events.
- **Rules/Security:** non-enumerating error text; rate-limit login and email links; **email links are time-limited and single-use**; secure cookies; no shared credentials; post-sign-in redirect only to safe internal destinations.
- **Edge cases:** expired/replayed links; nonexistent address; mail failure; simultaneous sessions; blocked user; unauthorized invite.
- **Acceptance:** new invited user signs in; unknown user cannot infer enrollment; expired token fails; sign-out removes access; a session cannot access another account.
- **Measurement:** invite activation; auth success/fail by category; support incidents.
- **Dependencies:** identity provider, email service, role policy.
- **Sign-in page copy:** Heading "Sign in to your ORREI workspace." Note: "Only invited beta members can currently access ORREI. Enter your email to receive a secure sign-in link. Your private workspace is not publicly visible." **D01: magic link only.** No password field, "create password" or "forgot password" link exists in V1. Do not state device-only session behavior without proof. Links are single-use with 15-minute expiry. Set `noindex`.

### AUTH-02 — Onboarding and basic account setup

- **Release/Owner:** V1 required | invited operator
- **Purpose:** get a first shareable property prepared without a long questionnaire.
- **Entry:** first authenticated session.
- **Workflow:** choose individual role, primary US market, display name/contact and profile basics; lead directly to Create Property; allow skipping optional settings.
- **Inputs/Outputs:** name, role, state/market, publishable contact fields, optional logo/photo.
- **Rules:** profile contact shown publicly only on explicit preview/publish; not all identity data is public; organization claims are not auto-verified.
- **Edge cases:** skipped onboarding; duplicate slugs; incomplete profile; invalid contact info.
- **Acceptance:** user can create a property in the first session; optional fields editable later; unpublished profile not indexed.
- **Measurement:** onboarding completion; time to first property.
- **Dependencies:** AUTH-01; profile ownership.

### PRO-01 — Individual public professional profile

- **Release/Owner:** V1 required (lean) | professional and anonymous viewer
- **Purpose:** give a credible person/business context behind property pages.
- **Workflow:** edit bio/role, specializations, markets and chosen contact methods → preview → publish → view published property cards.
- **Inputs/Outputs:** public display name, slug, headline, city/markets, avatar/logo, links, approved portfolio records.
- **Rules:** preview before publish; **no self-claimed "verified" badge**; allow hiding contact fields and unpublishing; search indexing only when explicitly public. UI label is **"Professional profile"**, not "My Website."
- **Edge cases:** invalid slug; no public properties; oversized images; broken external links; unpublished company membership.
- **Acceptance:** public profile opens without account; private drafts invisible; edits persist; unpublish blocks public access/indexing as feasible.
- **Measurement:** profile published; profile views; referral to property; inquiries.
- **Dependencies:** identity; publications; privacy controls.

### PRO-02 — Organization identity and basic association

- **Release/Owner:** V1 conditional / limited | founder/operator; company representative
- **Purpose:** represent team/company identity without pretending sophisticated corporate authorization exists.
- **Workflow:** collect business display name/logo/market and selected public contact; associate allowed members minimally.
- **Inputs/Outputs:** organization ID, display name, logo, admin, domain/website, visible contacts, role assertion.
- **Rules:** organization is **not verified** by declaration alone; no cross-team access absent explicit authorization; model reserves multi-organization membership.
- **Edge cases:** duplicate companies; employee departure; disputed affiliation; no domain.
- **Acceptance:** only admin can publish/edit company identity; an unrelated user cannot associate themselves unilaterally.
- **Measurement:** company setup; property ownership by workspace.
- **Dependencies:** AUTH-01; workspace model.

### PROP-01 — Create and classify a property

- **Release/Owner:** V1 required | owner/editor
- **Purpose:** give every opportunity one persistent structured record.
- **Workflow:** select category (**vacant land or single family only at launch — D03**) → enter best-known location → create draft and resume later. `duplex`, `multifamily` and `other` are hidden from the picker until each passes QA.
- **Inputs/Outputs:** property ID; type/subtype; country, state, county, ZIP, address components; parcel/APN when applicable; owner-role claim; internal notes.
- **Rules:** do **not** equate property owner, seller, contract holder and marketing publisher; unknown location/price is never invented; a property cannot leave its assigned workspace.
- **Edge cases:** duplicate address/APN; partial address; rural no street address; imported foreign-format fields.
- **Acceptance:** draft survives refresh; duplicate suggestion is not a forced merge; changing type preserves existing applicable fields.
- **Measurement:** drafts created; abandonment at fields; duplicate candidates.
- **Dependencies:** AUTH-01; property model.

### PROP-02 — Type-aware real-estate fact fields

- **Release/Owner:** V1 required | creator/editor
- **Purpose:** avoid generic unusable forms; preserve real-estate distinctions.
- **Workflow:** show shared fields plus land/residential sections; distinguish **asking price, contract price, ARV estimate and investment assumptions**; save draft.
- **Inputs/Outputs:** *Shared:* pricing currency, status, listing rights, location, description. *Land:* APN, acres/sqft, frontage, utilities, zoning claims, access. *House:* beds/baths, built area, year, condition, occupancy. Others only when supported.
- **Rules:** conditional visibility is not deletion; units and currency explicit; user estimates labeled as user estimates; negative/impossible numeric ranges rejected; **no title, zoning or boundary verification implied.**
- **Edge cases:** zero prices; unknown utilities; conflicting lot-size sources; condo/tenure jurisdiction variance.
- **Acceptance:** users can leave genuinely unknown optional facts blank; the land experience never demands bedroom count; values retain original unit.
- **Measurement:** field corrections; unknown value distribution; creation completion.
- **Dependencies:** PROP-01; field dictionary (§14).

### PROP-03 — Media and document intake

- **Release/Owner:** V1 required | owner/editor
- **Purpose:** keep photos, brochures and evidence with the same deal without leaking sources.
- **Workflow:** upload supported types (e.g., JPEG/PNG/PDF) within declared limits → preview → reorder approved photos → flag which assets may be published → protect source-only contracts.
- **Inputs/Outputs:** file ID, original name, MIME, size, type, storage object, uploader, upload status, **access class**, thumbnail.
- **Rules:** file validation and malware scanning proportionate to risk; **signed access for private files**; image metadata (EXIF) stripping policy; don't assume rights to reuse images; a public page must **not** inherit every file attached to the private record.
- **Edge cases:** interrupted uploads; huge files; malicious file; wrong extension/MIME; corrupted preview; removed file referenced by a published page.
- **Acceptance:** cross-workspace URL access blocked; a private PDF never appears in public HTML/media URL; retry works; delete/reorder persist.
- **Measurement:** upload success/failure; processing delays; excluded assets.
- **Dependencies:** secure object storage; upload scanning; file permissions.

### PROP-04 — Canonical property record and edit history

- **Release/Owner:** V1 required | owner/editor
- **Purpose:** prevent drift between deal pages, PDFs and a changed asking price.
- **Workflow:** save validated change → show who changed what and when → mark published snapshot as potentially stale until refreshed → offer review/republish.
- **Inputs/Outputs:** field, prior/current value, source, editor, timestamp, record version.
- **Rules:** publishing does not auto-expose new private data; audit entries immutable to ordinary editors; collisions handled explicitly; **a new edit cannot silently alter an already approved published snapshot.**
- **Edge cases:** simultaneous editing; abandoned draft; undo; accidental deletion; race against PDF generation.
- **Acceptance:** change persists; older published version recoverable/history available; no silent overwrite of simultaneous edits.
- **Measurement:** updates per active property; revision errors.
- **Dependencies:** property data store; audit trail; output snapshots.

### AI-01 — Paste, extraction and source attribution

- **Release/Owner:** V1 required in supported input formats | editor
- **Purpose:** reduce manual copying while staying accountable for each fact.
- **Workflow:** user pastes freeform notes or uploads a supported readable document → system extracts candidate structured facts → displays exact source reference/snippet when available → compares against existing fields → user accepts/edits/rejects one or all.
- **Inputs/Outputs:** original text/source file ID → extraction result, candidate field/value/unit (confidence only when meaningful), accept/reject decision.
- **Rules:** **AI is not a verifier.** Extracted values never overwrite approved values without review; detect ambiguous units; never invent an APN/address/price; supported source types shown plainly; **prompt-injection safeguards** (uploaded text is source content, never operational instruction); cost/rate/size limits; log errors without exposing private content; user-visible confidence scores generally omitted until validated.
- **Edge cases:** handwriting; scanned PDF; empty document; hostile instructions in an attachment; multi-property document; conflicting price; AI outage.
- **Acceptance:** conflict is visible; user can recover source; no AI auto-publish; unknowns remain unknown; malicious document text not treated as a command; on AI failure the user continues manually (message: "You can continue entering details manually.").
- **Measurement:** extraction success; % suggestions accepted; correction rate; cost.
- **Dependencies:** LLM/extraction service; ingestion processing; risk controls.

### AI-02 — Conflict detection and approval ledger

- **Release/Owner:** V1 required for available comparisons | owner/editor/publisher
- **Purpose:** surface disagreements and require explicit choice on buyer-facing facts.
- **Workflow:** show current approved value alongside proposed import, source and timestamp → user chooses keep / change / unknown → record reviewer decision.
- **Inputs/Outputs:** claim source, candidate value, comparison key, approval decision, reviewer, time.
- **Rules:** **"user approved" ≠ "externally verified"**; no claim of independently checking title, boundaries, zoning or price; publication blockers clear and proportionate (blocks the **affected** output only when material).
- **Edge cases:** two sources both wrong; numeric unit conversion; stale source; duplicate conflict; conflict on a non-critical optional field.
- **Acceptance:** a price disagreement (e.g., $480,000 vs $465,000) is surfaced with source attribution and **not** silently resolved; user sees actual compared sources; unknowns do not get invented defaults.
- **Measurement:** conflict incidence; resolution time; rejected suggestions.
- **Dependencies:** AI-01; PROP-04; approval permissions.
- **UI wording:** "Two sources disagree. Choose which to use." Badges: **"Supplied by you," "Source conflict," "Needs review," "User approved"** — never "Verified" absent independent substantiation.

### AI-03 — Generate editable copy and deal sheet text

- **Release/Owner:** V1 required | editor/publisher
- **Purpose:** turn reviewed facts into useful, understandable buyer materials.
- **Entry:** minimum approved record sufficient for the chosen template.
- **Workflow:** choose output type → generate structured draft → unsupported facts omitted → user edits text → preview against approved record → approve.
- **Inputs/Outputs:** approved fields, media refs, optional company tone → description, highlights, deal summary.
- **Rules:** AI must **not** add guarantee language or fabricate renovations, yield, comps or property verification; disclaimers cannot replace source controls; preserve facts during style/tone changes; sensitive notes never included; show an **"AI-generated draft — confirm details before publishing"** indicator in-product.
- **Edge cases:** AI outage; overly long source; contradictory descriptions; risky legal representations; missing price.
- **Acceptance:** copy editable; facts unchanged by a tone edit; sensitive notes absent; reproducible output snapshot.
- **Measurement:** generation/rewrite acceptance; manual edit rate; time saved.
- **Dependencies:** AI-02; templates; content safety.

### PUB-01 — Professional property page and public preview

- **Release/Owner:** V1 required | publisher and anonymous recipient
- **Purpose:** provide a polished, mobile-ready opportunity page that stands alone.
- **Workflow:** select template → preview desktop/mobile → show approved facts/images/terms/contact → publish → share final URL.
- **Inputs/Outputs:** slug/title, published snapshot, approved media, publisher identity, optional general location, inquiry endpoint.
- **Rules:** no private source docs; **no forced signup to view**; disclose approximate map/unknowns; no unsupported "Verified" badges; public page layout puts photo, title, location context, asking price, essential type-specific facts and owner contact route **before** optional technical details.
- **Edge cases:** missing image; no address disclosure; withdrawn property; broken asset; low bandwidth/mobile.
- **Acceptance:** responsive page loads without an account; public data matches the snapshot; private notes not exposed in page source or API.
- **Measurement:** page load; shares; visits; inquiries (privacy-safe counts).
- **Dependencies:** profiles; approved snapshot; responsive frontend.

### PUB-02 — Printable deal sheet / PDF output

- **Release/Owner:** V1 required (D02) | publisher and buyer
- **Purpose:** support existing real-estate workflows in printable/downloadable form.
- **Workflow:** choose template → preview → generate export → provide download → preserve output version reference.
- **Inputs/Outputs:** approved fact snapshot, photo selection, company identity, price/date, disclaimer → generated file.
- **Rules:** exclude seller-sensitive info by default; **downloaded files cannot be remotely updated**; **date/version-stamp every export.**
- **Edge cases:** missing photo/very long text; print clipping; export timeout; price updated after export.
- **Acceptance:** multi-page PDF prints cleanly; old export marked stale in app; user can regenerate with the new version.
- **Measurement:** exports attempted/completed; template usage.
- **Dependencies:** PUB-01; rendering engine; private file storage.
- **Note (D02):** Decided — the deal sheet is a V1 release blocker. If rendering proves unreliable during Phase 0, the promise must be narrowed in writing *before* invites go out, not after.

### PUB-03 — Public, link-only and private visibility

- **Release/Owner:** V1 required | authorized publisher
- **Purpose:** let customers control who can find and view an opportunity.
- **Workflow:** select **private** (workspace), **link-only** (unlisted share URL) or **public** (searchable subject to indexing) → confirm → allow change and withdrawal.
- **Inputs/Outputs:** visibility enum, publication state, share URL/token, update/withdraw timestamp, audit entry.
- **Rules:** link-only may be forwarded; **withdrawn links must not return protected content**; visibility may be set per output where available.
- **Edge cases:** public→private switch; cached previews; stale social thumbnails; guessed URLs.
- **Acceptance:** unauthorized users cannot change state; after withdrawal the public endpoint denies content; crawler rules match the visibility choice; links never reveal seller documents.
- **Measurement:** visibility selection; withdrawal rates; permission incidents.
- **Dependencies:** authorization; publication snapshot; caching/CDN rules.

### PUB-04 — Publishing approval and output states

- **Release/Owner:** V1 required | publisher/authorized approver
- **Purpose:** avoid automatic accidental disclosure.
- **Workflow:** check missing mandatory items, approval conflicts and media permissions → preview → explicit confirm **per output** → per-output draft/published/withdrawn states.
- **Inputs/Outputs:** output ID/type; state; record version; approver; time; URL/file artifact.
- **Rules:** property page, PDF, buyer summary and portfolio card are **different outputs**; a private property may still have an internally generated PDF; output state is independent of collaboration status.
- **Edge cases:** one output fails while others succeed; publish in progress; conflicting last-minute edit.
- **Acceptance:** no auto-publish via AI; the user sees which outputs are live; a failed export does not falsely show "Published."
- **Measurement:** publishing attempts/failures; time to publish.
- **Dependencies:** PUB-01/02/03; state machine.

### PUB-05 — Revisions, refresh and withdrawal

- **Release/Owner:** V1 required | editor/publisher
- **Purpose:** stop stale page information while preserving history.
- **Workflow:** edit canonical record → show changed fields → preview updated output → republish → log new snapshot → withdraw/retire when sold.
- **Inputs/Outputs:** version, timestamp, editor, published/unpublished state, updated price/status.
- **Rules:** live pages update **only on approval**; already-downloaded PDFs cannot be pulled back; invalidating URLs does not recall forwarded screenshots.
- **Edge cases:** price change while a buyer is viewing; old link; CDN cache; inquiry on a withdrawn property.
- **Acceptance:** republished page reflects new values after cache refresh; old snapshot retained for account history; withdrawal shows "This property page is no longer available."
- **Measurement:** republish frequency; stale-output warnings; withdrawal reliability.
- **Dependencies:** PROP-04; snapshots; caching.

### PORT-01 — Property portfolio / profile connection

- **Release/Owner:** V1 required (lean) | professional and visitor
- **Purpose:** give shared opportunities a recognizable, reusable professional home.
- **Workflow:** select which approved **public** properties appear as cards → order → hide without deleting → click through.
- **Inputs/Outputs:** profile ID, published property ID, card order/status, cover image, price and summary.
- **Rules:** private or link-only deals **never** appear in the public portfolio by default; no fabricated track record or customer reviews.
- **Edge cases:** no public deals; delisted card; mismatched media; deleted profile.
- **Acceptance:** unpublished/link-only deals don't appear in the public portfolio; card link resolves.
- **Measurement:** portfolio click-through; inquiry.
- **Dependencies:** PRO-01; PUB-03.

### INQ-01 — Anonymous deal inquiry

- **Release/Owner:** V1 required | guest buyer and property publisher
- **Purpose:** let buyers ask questions without creating an account.
- **Entry:** published, accessible property page.
- **Workflow:** visitor fills a limited form (name, valid contact, message, consent) → send → confirmation → owner notified and can review the record.
- **Inputs/Outputs:** inquiry ID, property/publication ID, message, contact details, consent notices, timestamps, status.
- **Rules:** rate-limit and spam check; consent notices and retention; **no identity-verification claim**; avoid exposing recipient email unnecessarily; prevent duplicate submits; sanitize input.
- **Edge cases:** bad email; bot traffic; email send fails; duplicate clicks; withdrawn property; attachment abuse.
- **Acceptance:** a legitimate inquiry persists **once** and sends a notification; errors are clear; input sanitized; no anonymous access to owner inbox.
- **Measurement:** inquiry submitted; delivered; owner viewed; spam rate.
- **Dependencies:** notifications; privacy/data retention.
- **UI wording:** success "Your inquiry has been sent."

### INQ-02 — Owner inbox and basic status

- **Release/Owner:** V1 required | property owner/editor
- **Purpose:** make inquiries actionable instead of buried in email.
- **Workflow:** list messages by property → view details → mark unread / contacted / closed (/spam) → reply via a chosen permitted channel if available.
- **Inputs/Outputs:** inquiry status, author, submitted time, message, linked property.
- **Rules:** an inquiry is **not** a verified cash buyer; reply/email actions logged honestly; other tenants cannot see the inquiry.
- **Edge cases:** sender requests deletion; invalid contact; agent changes ownership; repeat inquiries.
- **Acceptance:** owner receives and locates the correct record; unauthorized users cannot view; states persist; deletion/export subject to privacy policy.
- **Measurement:** time to first owner view; follow-up action.
- **Dependencies:** INQ-01; permissions.

### AN-01 — Basic activity analytics

- **Release/Owner:** V1 conditional, modest | publisher
- **Purpose:** understand whether a share link was opened and inquiries received.
- **Workflow:** show page opens, inquiry count and dates with explicit definitions; avoid identifying visitors; optional export later.
- **Inputs/Outputs:** event timestamp, page/publication ID, event type, coarse referrer where lawful.
- **Rules:** "views" are **not** unique buyers; no photo dwell-time or buyer-identity tracking unless built and consented; **mock analytics never appear in a real account**; explain cookie/analytics handling.
- **Edge cases:** bot views; refreshes; ad blockers; duplicate events; timezones.
- **Acceptance:** counts come from real events; mocked numbers never appear in production accounts; privacy preferences respected; a newly created account shows zero (not fake) activity.
- **Measurement:** reliability of event capture; usage of insights.
- **Dependencies:** event instrumentation; privacy policy.
- **Allowed copy:** "See what happened after you shared. Where available, track page openings and submitted inquiries. Views are not verified buyers, and interest is not proof of purchase."

### SYS-01 — Error handling, support and operational admin

- **Release/Owner:** V1 required | all users and internal operator
- **Purpose:** keep beta reliable and supportable.
- **Workflow:** clear retry/validation messages and trace reference; internal team sees failure logs and support tickets; notify on data leakage/security incidents.
- **Inputs/Outputs:** error code/category; sanitized log; request ID; affected resource; remediation.
- **Rules:** no secrets in browser errors; admin access least-privilege and logged; **support cannot impersonate a user without consent and audit.**
- **Edge cases:** queue failure; storage outage; AI timeout; mail delivery issue; accidental delete.
- **Acceptance:** critical errors surfaced with a recoverable action; health alerts exist; restoration documented; no secrets in logs.
- **Measurement:** error rates; time to resolution; support burden.
- **Dependencies:** monitoring; backups; secure admin.

---

## 12. Conditional V1 capabilities

### INT-01 — Permitted portal/brochure imports (**deferred — not in V1**, per D04)

- **Purpose:** avoid manually copying listings while respecting provider rights.
- **Workflow:** import only supported documents or licensed API sources → display imported fields and source dates → user resolves mismatches.
- **Rules:** **do not promise arbitrary portal import**; no bypass of bot controls; provider ownership/terms reviewed; no concealed scraping.
- **Acceptance:** unsupported imports give a transparent error; the record stays manually editable. Website copy: "Enter property details, add photos and attach supported documents… Additional imports will depend on supported sources."
- **Edge cases:** login-only listing; expired API token; inconsistent field mapping; unsupported geography.
- **Dependencies:** legal/provider permission; AI-01.

### AI-04 — Business voice and approved reusable context (V1+; not a launch blocker)

- **Purpose:** keep tone consistent without changing facts.
- **Workflow:** set tone, preferred vocabulary, audience, disallowed terms → preview draft → approve retention and revoke context.
- **Rules:** never silently train models on user content; disclose actual third-party processing and retention accurately; **factual data unchanged across tone variants.**
- **Acceptance:** removing context stops future use; a test shows identical property facts across tone variants.
- **Website rule:** if not shipped, mark "planned." Copy: "Your facts. Your voice. Set your preferred tone and language for property descriptions. ORREI is designed to draft from the details you approve, without making up missing information."
- **Dependencies:** AI-03; privacy and data-processor contracts.

---

## 13. Non-functional requirements and quality gates

*Derived from Doc 03 NFR section and Doc 06 §8. These are release gates, not aspirations.*

### 13.1 Performance and reliability

| Area | Requirement | Verification |
|---|---|---|
| Public page load | Mobile-ready public property page renders usable content on a low-bandwidth connection; no layout shift from late media | Throttled 3G test on a mid-range phone; measured first meaningful paint |
| Preview latency | Preview reflects the record within a few seconds of approval; long jobs show honest pending state | Timed tests on the seeded sample deals |
| Draft durability | No change is lost on ordinary browser refresh; autosave status visible | Refresh and device-switch test per PROP-01/PROP-04 |
| Availability | Failures degrade to a retryable, explained state — never a silent dead control | Fault injection: AI timeout, storage outage, mail failure |
| Third-party outage | AI/parsing/render outages must not block manual entry | Manual-completion path tested with the AI service disabled |

### 13.2 Security and privacy

- Server-side record-level authorization on **every** read and write; guessed IDs never resolve across workspaces.
- Secure session cookies; CSRF protection where state changes; **MFA for privileged accounts**.
- Rate limits on magic links, inquiry submission and any email-triggering action.
- Signed URLs for private media; no private file reachable from a public page, sitemap, API response or error message.
- EXIF and location metadata stripped or policy-controlled per PROP-03.
- No secrets in client errors or logs; admin/support access logged and least-privilege.
- Prompt-injection resistance: uploaded document text is data, never instruction (AI-01).

### 13.3 Accessibility

- Keyboard-only operation of the entire creation → publish → inquiry path.
- Visible focus states; labels programmatically associated with fields; errors announced and described in text.
- Status never conveyed by color alone (text + icon + accessible color).
- Minimum touch target sizing; no essential action reachable only on hover.
- Tested at 320–390px mobile, 768px tablet, 1366px laptop and wide desktop, including 200% zoom.

### 13.4 SEO and discoverability boundaries

- Marketing routes render unique titles, descriptions and canonicals server-side.
- Public property/profile pages carry correct indexability rules matching visibility state.
- Link-only, private, unknown and withdrawn URLs return `noindex` **and** real authorization; `robots.txt` is not treated as access control.
- Withdrawn pages return a clear unavailable state without leaking media or source material.

### 13.5 Observability and operations

- Uptime monitoring; alerts on failed sign-ins, upload failures, AI latency/cost spikes, failed publications, inquiry delivery failures, broken routes.
- Staging and production environments; managed secrets; backups with a tested restore; documented rollback.
- Staging seed data clearly marked fictional; no placeholder metrics in production.

### 13.6 Retention and data lifecycle (must be finalized before live launch)

- Document deletion, account deletion and audit-retention windows defined and disclosed.
- Inquiry processing, sender deletion requests and anti-spam metadata retention defined.
- Third-party AI processing, retention and deletion disclosed to match actual practice.

---

## 14. Field dictionary and vocabulary (canonical field IDs)

*From Doc 07. Every engineering ticket references field IDs from this table. Store money as integer minor units plus ISO currency; store measurements with original unit and a normalized comparison unit; store timestamps in UTC.*

### 14.1 Canonical property fields

| Field | Type / example | Source / display rule |
|---|---|---|
| `property_id` | UUID; immutable | Internal, not editable |
| `property_type` | Enum: `residential_land`, `SFR`, `duplex`, `multifamily`, `other` | Only `residential_land` and `SFR` are selectable at launch (D03); the rest are stored in schema, hidden in UI. Type changes revalidate fields |
| `country_code` | ISO 3166-1 alpha-2: `US` | Required for schema |
| `state_region` | US: `FL` | Required for most US records |
| `county` | `Duval` | May be unknown |
| `postal_code` | `32210` | String; leading zeros supported |
| `street_address` | Text | May be omitted for unnamed land |
| `parcel_identifier` | String/APN | Jurisdiction-specific, optional |
| `latitude` / `longitude` | Decimal | Approximate unless source allows precision |
| `lot_area` | Decimal + unit | Never guess from address |
| `living_area` | Decimal + unit | Not applicable to vacant land |
| `beds` / `baths` | Decimal, nullable | Only appropriate property types |
| `asking_price` | Integer minor units + currency | User-supplied; historical versions kept |
| `ARV_estimate` | Nullable money + source and date | **Not** verified valuation |
| `repair_estimate` | Nullable range + source | **Not** appraised cost |
| `occupancy` | Enum or `unknown` | Avoid unqualified legal claims |
| `transaction_type` | Controlled string, e.g. `assignment` | Must reflect user authority |
| `zoning` | Text + local authority/source | No assumed entitlements |
| `utilities` | Per-utility availability enums | `unknown` is not `available` |
| `flood_information` | Source citation + date + uncertainty | Do not substitute mailing ZIP |
| `description` | Rich text with revision | Approved buyer-facing language |
| `public_visibility` | `private` / `link_only` / `public` | Enforced on server |
| `publication_status` | `draft` / `review` / `live` / `withdrawn` | Not identical to opportunity stage |

### 14.2 Provenance record (attaches to any material fact)

Each material fact optionally records:

| Attribute | Values |
|---|---|
| Origin class | user manual, file extraction, imported licensed feed, official public record |
| Source name / locator | Free text or file reference |
| Retrieval time | UTC timestamp |
| Review actor | User ID |
| Review status | `unreviewed`, `confirmed_by_user`, `disputed`, `superseded` |

Do not show a generic green "Verified" badge unless the verification type and responsible party are explicit.

### 14.3 Identity, organization and network fields

- **Profile:** display name, role(s), market coverage, optional bio, approved contact methods, social links, profile visibility, publication date.
- **Company:** legal/display name, website, team members, description, public markets; legal identity claims require separate verification.
- **Connections (later):** requester, recipient, state (`requested`/`accepted`/`declined`/`blocked`), privacy controls, abuse detection.
- **Saved items (later):** actor, target type/id, created timestamp; save not visible to target unless defined otherwise.
- **Messaging (later):** sender, recipients, permission, delivery state, moderation flags, retention policy.
- **Buyer inquiries:** property/profile reference, submitter name and contact, message, consent flags, timestamp, status, anti-spam metadata.

### 14.4 Approved vocabulary (product terms)

| Product term | User-visible definition | Do not confuse with |
|---|---|---|
| Property | One canonical record representing an asset or opportunity | A live public listing |
| Draft | Editable material not approved for a public output | An unpublished PDF already sent |
| Deal sheet | An approved shareable/printable presentation | A purchase contract |
| Public | Discoverable page where indexing is allowed | Link-only |
| Link-only | Available to anyone with valid URL, not intended for discovery | Authenticated/private |
| Private | Accessible only by authorized workspace users | Unlisted/public |
| Saved | Personal bookmark requiring account | Connected professional |
| Connect | Request a persistent professional relationship | A one-time inquiry |
| Message | Account-based continuing conversation | Public contact form |
| Inquire | One-off contact request about a property or professional | Offer or binding contract |
| Verified identity | Identity verification under defined provider process, if implemented | Verified deal or property |
| Source reviewed | User confirmed a value against a source | Legally certified accurate |
| Request JV | Potential collaboration inquiry, later release | Marketing consent or binding JV agreement |

### 14.5 Approved empty, error and state wording

| Situation | Approved wording | Behavior |
|---|---|---|
| Missing numerical value | "Not provided" | Do not display zero |
| Conflicting sources | "Two sources disagree. Choose which to use." | Block affected publish if material |
| AI unavailable | "You can continue entering details manually." | Preserve draft |
| Private property | "Only your workspace can view this property." | No public URL |
| Link withdrawn | "This property page is no longer available." | Prevent access to old media URLs |
| No active deals | "You haven't published a property yet." | Offer Create property |
| Auth-required save | "Sign in to save this profile." | Resume original save action |
| Inquiry sent | "Your inquiry has been sent." | Prevent duplicate submits |

### 14.6 Vocabulary governance

Founder approves wording and claims. Engineering owns schema migration and validators. Design owns labels and error-message consistency. Compliance reviews "verified," "licensed," "guaranteed," "ROI," "profit," "closed" and transaction-compensation language. Maintain a dated changelog (§23.3).

---

## 15. Real-estate terminology and its design implications

*From Doc 08. Educational industry reference; not jurisdiction-specific legal or valuation advice.*

### 15.1 Roles, assets and workflows

| Term | Meaning | ORREI design implication |
|---|---|---|
| Wholesaler | Participant seeking to assign/sell contractual interests or otherwise market opportunities where permitted | Never infer authority to advertise; record role and agreement status |
| Acquisition | Finding, evaluating and securing an asset or contractual interest | Different workflow from finding an end buyer |
| Disposition | Marketing or placing a property/contract with an end buyer | Deal-sheet and inquiry workflows |
| Cash buyer | Buyer able/intending to fund without a mortgage | Not verified solely by user label |
| Builder | Operator constructing homes or commercial property | Different land utility and dimensional criteria |
| Investor | Buyer/owner pursuing income, resale or appreciation | Broad role, not evidence of qualification |
| Agent / broker | Licensed professional with jurisdiction-defined authority | License status should not be self-certified as verified |
| Title company / closing attorney | Professional handling title/closing functions as permitted | Not replaced by ORREI |
| Vacant infill lot | Undeveloped parcel within or near existing developed area | Buildability, access and utilities require research |
| APN / parcel ID | Identifier assigned by property appraiser/assessor or cadastre | Not uniform across jurisdictions |
| Legal description | Formal description in recorded instruments | Not the same as postal address |
| Lot of record | Legal parcel recognized under local land rules | Not guaranteed by a map pin |
| ARV | Estimated property value after stated repairs/renovation | Not asking price or verified appraisal |
| MAO | Maximum allowable offer under an investor underwriting model | Depends on model and assumptions |
| Comps | Comparable sales used to support valuation reasoning | Must be truly comparable and closed |
| Repair estimate | Projected cost range of improvements | Not a contractor bid |
| Assignment contract | Agreement transferring an assignable contractual position | Depends on contract and state law |
| EMD / earnest money | Deposit submitted under purchase contract | Not an ORREI service in V1 |
| Due diligence | Review of title, physical, zoning, taxes, utilities and economics | A checklist is not legal clearance |
| Closing | Transaction completion and transfer/payment steps | Handled by authorized service providers |
| Escrow | Third-party control of funds/documents under agreed terms | Future integrations only |
| JV / joint venture | Agreement to cooperate and share defined responsibilities/economics | Intro request is not a signed JV |
| Dispo partner | Operator marketing/placing opportunities to suitable buyers | Requires authorization and compensation clarity |
| Buyer criteria / buy box | Markets, property types, budgets and other acquisition filters | Not proof a buyer will fund |
| Proof of funds | Evidence of available financing/cash | Must be evaluated; privacy-sensitive |
| Zoning | Local land-use classifications and permissible uses | Cannot be inferred from lot dimensions |
| Setback | Required distance between structure and boundary | Varies by jurisdiction |
| Frontage | Parcel line bordering road or other access | Frontage alone does not prove legal access |
| Easement | Limited right to use another parcel | Review recorded/legal details |
| Flood zone | Mapped flood-hazard category | Risk and insurance implications need official sources |
| Utilities | Water, sewer, electricity, gas and telecom services | Availability vs actual connection differs |
| Entitlement | Government approvals for proposed land use/development | A listing cannot promise without evidence |
| Title defect | Potential ownership, lien or conveyance issue | Require title professional |
| Lien | Claim or encumbrance on property | Cannot assume absent from simple lookup |
| Off-market | Not broadly marketed through conventional listing channels | Does not imply legitimate right to sell |
| MLS | Multiple listing service | Access/import governed by licensing/data rights |
| CMA | Comparative market analysis | Different from appraisal |
| Cap rate | Net operating income divided by price/value | Income property only; assumptions matter |
| NOI | Net operating income before financing/taxes as typically defined | Not gross rent or cash flow |
| LTV | Loan-to-value ratio | Not a property characteristic |
| DSCR | Debt service coverage ratio | Finance metric; lender-specific |

### 15.2 Distinctions critical for product design

- Asking price ≠ estimated current market value ≠ ARV ≠ contract price ≠ sale price. Maintain separate fields.
- Under contract ≠ closed. Deal status is not universal proof of title or rights.
- A property owner, an authorized listing agent and an assignment contract holder can have distinct roles and marketing rights.
- A purchase agreement is different from a buyer-facing deal sheet.
- A buyer inquiry is not a qualified buyer, executed offer or conversion.
- "Verified" must describe the specific operation performed; ORREI must not imply it conducted legal due diligence unless it actually did.

### 15.3 Worked examples (design acceptance)

**Vacant land.** APN known, road access unclear, city water unknown, zoning claimed residential. ORREI keeps unknowns blank and flags that "residential zoning" alone does not confirm buildability. The user may prepare a factual overview with a disclaimer rather than an assured buildability claim.

**House.** 3 beds, 2 baths, asking $185,000, user claims ARV $275,000 based on comps. Represent asking price and user-supplied ARV as distinct fields, show the estimate as a user estimate if included, preserve source and date. Neither is presented as an ORREI-certified valuation.

---

## 16. Design system and UX standards

*From Doc 10. A visual contract separate from the illustrative screen library.*

### 16.1 Visual direction and tokens

Follow the current orvnlabs.com brand as baseline: deep near-black green, warm cream, restrained lime accents, strong sans-serif type, generous whitespace, property-first visual story. The mockup boards are compositional inspiration, not verified feature specifications. Do not reproduce false "Verified," income, return, company claims or non-existent network capabilities.

| Token | Starting suggestion | Rule |
|---|---|---|
| Canvas | Warm cream / off-white | Large calm surfaces, not saturated gradients |
| Navigation | Near-black forest green | Legible at all viewport sizes |
| Primary action | Lime / acid green | One primary CTA per task panel |
| Typography | Humanist geometric sans; system fallback | Large purposeful headings |
| Borders | Subtle warm gray | Use dividers over excessive boxed cards |
| Radius | Medium for inputs, large for main cards | Consistent system |
| Imagery | Actual permissioned property photos | Placeholders labelled illustrative |
| Status | Text + icon + accessible color | Never color alone |

### 16.2 Core layout patterns

- **Desktop:** persistent navigation only when workspace complexity requires it; global search and notifications do not dominate property tasks.
- **Mobile:** clear bottom or collapsed navigation, generous tap targets, no horizontal scrolling of essential form controls.
- **Public profile:** identity, approved bio, location/markets, contact CTA, published inventory; social/network features subordinate.
- **Public deal:** photo, title, location context, asking price, essential type-specific facts and owner contact route **before** optional technical details.
- **Property editing:** progressive disclosure by property type, autosave status, simple next action, reversible changes.
- **Fact review:** show each conflicting source and require deliberate selection, not a generic "Verified" chip.
- **Publication:** per-output draft/approved/live/unpublished status, preview and visibility settings.
- **Inquiries:** anonymous one-off contact without an ORREI account.

### 16.3 Screen checklist

| Screen | Primary action | Must-have state |
|---|---|---|
| Public marketing | Request early access | Form validation and confirmation |
| Sign-in | Request valid magic link / credential | Pending, expired, unknown handling |
| Onboarding | Save role and profile basics | Skip optional information |
| Workspace | Create property | Empty, loading, populated |
| Property intake | Save and continue | Autosave, field errors |
| Fact review | Approve or resolve | Conflict, unknown, source unavailable |
| Publish | Preview and publish | Private/link-only/public |
| Public profile | Contact | No published inventory |
| Public property | Submit inquiry | Withdrawn/expired page |
| Inquiry inbox | Read/respond | Spam, delivery failure |
| Settings | Edit preferences | Security/recovery states |

### 16.4 Interaction rules

- Clicking Save or Connect while signed out explains the account requirement and resumes intent after sign-in, once the feature exists.
- A one-time inquiry remains available without an account; account-based messaging is a different feature.
- Loading states show real progress or neutral pending indicators; never show completed results before confirmation.
- Approval and publication actions need meaningful confirmations and visible audit/history.
- Persist draft state across refresh and device where supported; warn on unsaved changes.
- Nothing that looks interactive may be ornamental. Noninteractive demos are visibly explanatory.

### 16.5 Design acceptance protocol

For each screen the implementer provides: design screenshot, implemented route, interaction description, responsive screenshots, disabled/empty/loading/error states and a brief divergence register. Founder approval of visual direction does not substitute for feature acceptance tests. Editable design source is retained by ORVN Labs.

---

## 17. Technical architecture, entities and state machines

*From Doc 06.*

### 17.1 System boundaries

- ORREI is a multi-tenant real-estate application, not merely the marketing website.
- Marketing (`orvnlabs.com`), authenticated application (proposed `app.orvnlabs.com`), public profile routes and public property pages must have explicit routing and permission boundaries.
- **The existing Vercel deployment does not establish application feature readiness.**
- Use a modular monolith initially: web UI, API/business rules, background jobs, relational data store and protected object storage.
- Reserve separate modules/interfaces for payment entitlements, discovery, messaging, JV matching and country-specific transaction services; do not build them as active V1 services.
- Store timestamps in UTC; money as integer minor units plus ISO currency; measurements with original and normalized units; addresses using country-aware fields.
- Require staging and production environments, managed secrets, backups, logging, rollback plans and documented admin access.

### 17.2 Principal entities

| Entity | Minimum relationships / purpose | Critical control |
|---|---|---|
| `User` | Auth identity, sessions, membership | Private by default; account lifecycle |
| `Organization` | Brand, approved public details, member roles | Admin-approved ownership and membership |
| `ProfessionalProfile` | Owner, bio, markets, contacts, public visibility | Profile cannot expose internal workspace |
| `Property` | Owner/workspace, type, location, status, canonical facts | Field-level source and privacy |
| `Fact` / `FactSource` | Field key, candidate value, origin, review state | No silent AI verification |
| `MediaAsset` | File key, mime, dimensions, private/public variants | Scoped signed URLs; EXIF stripping as appropriate |
| `Output` | Property page, deal sheet, summary, portfolio card | Per-output approval and version |
| `Publication` | Visibility, state, slug/token, approved snapshot | Server-validated access |
| `Inquiry` | Public form, property, contact details, consent | Rate limiting; anti-spam; limited visibility |
| `AuditEvent` | Actor, timestamp, action, version reference | Append-only for critical changes |

### 17.3 State machines

**Property record state:**

```
DRAFT → NEEDS_REVIEW → APPROVED → ARCHIVED
              ↑              │
              └──────────────┘   (reopen transitions, documented and audited)
```

**Publication state (per output, independent of record state):**

```
NOT_PUBLISHED → LINK_ONLY  ─┐
              → PUBLIC     ─┴→ UNPUBLISHED / WITHDRAWN
```

**Output states:** Draft → Ready → Published → Withdrawn.

Rules:

- A property may remain private while one approved output is shared by link. Portfolio exposure is independently controlled.
- A JV request is not a visibility level.
- Unknown values remain blank; required fields vary by property type and output.
- **A new edit cannot silently alter an already approved published snapshot.** Offer review and explicit republish.
- Previously downloaded PDFs cannot be remotely revoked or rewritten; show revision/date prominently.
- Withdrawn public pages serve a clear unavailable state without leaking source materials.

### 17.4 AI-assisted input and review pipeline

```
User uploads permitted notes/files
  → malware/format validation
  → extraction job
  → structured field candidates with source references
  → field-level review and conflict resolution
  → owner decisions
  → approved canonical facts
  → optional output generation
```

- User-visible confidence scores are not proof of correctness and are generally omitted until validated.
- Never claim independent verification of title, zoning, ARV, boundaries, ownership or comps without specific authoritative evidence and a scoped workflow.
- Keep source snippets and attribution; avoid storing unnecessarily sensitive source text beyond a defined retention period.
- Separate source evidence from business tone memory: approved business context can influence phrasing, never numerical or legal facts.
- Protect against prompt injection in uploaded material; impose cost, rate and size limits; log errors without exposing private source content.

### 17.5 API and asynchronous jobs

- Endpoints map to user intent: create/update property, review facts, upload media, preview output, approve output, publish/unpublish, submit inquiry, update profile.
- Idempotency keys for publishing, email sending and payment operations.
- Background jobs for file processing, text extraction, rendering, notification delivery and analytics aggregates. Expose honest pending/failure states.
- Do not block the entire workspace on third-party parsing or AI outages; permit manual entry and retry.

### 17.6 Global-ready schema boundaries

- First UI uses US state/county/ZIP, APN where applicable, USD and conventional US units.
- The address model must permit country, administrative divisions, multiple postal formats and jurisdiction-specific parcel identifiers.
- Support locale and timezone settings without assuming every property has a street address or a US-style title instrument.
- Transaction execution, identity verification, escrow, KYC, payments and legal documentation are separate country-specific integrations and later releases.

---

## 18. Acceptance test plan and go/no-go

### 18.1 End-to-end V1 acceptance tests

A release is accepted only when every test below is demonstrated on staging with realistic (fictional but complete) data.

| # | Test | Pass condition |
|---|---|---|
| AT-01 | Invited user signs in | Invitation validated, session created, non-enumerating errors; unknown address reveals nothing |
| AT-02 | Expired/replayed link | Access denied with clear message; no partial session |
| AT-03 | Draft durability | Property draft survives refresh and device change; autosave status truthful |
| AT-04 | Land record type-awareness | Vacant land never demands bedrooms; units and currency preserved exactly as entered |
| AT-05 | Unknown values | Genuinely unknown optional facts stay blank and display "Not provided," never zero or a guess |
| AT-06 | Conflict surfaced | $480,000 vs $465,000 price disagreement shown with both sources; not auto-resolved |
| AT-07 | Malicious attachment | Text in an uploaded document instructs the system to publish; treated as data, not command |
| AT-08 | AI outage | With the AI service disabled, the user continues manually and the draft is preserved |
| AT-09 | Private file isolation | A private PDF is unreachable from the public page, its HTML source, media URLs and API payloads |
| AT-10 | Cross-workspace isolation | User A cannot fetch User B's private property or files by guessed ID |
| AT-11 | Preview fidelity | Previewed page matches the published page; desktop and mobile both true |
| AT-12 | Per-output approval | Page and PDF have independent states; no AI-generated content publishes without explicit confirmation |
| AT-13 | Link-only unlisted | Unlisted page opens with the link and returns `noindex`; excluded from sitemap |
| AT-14 | Withdrawal | Withdrawn link shows "This property page is no longer available."; old media URLs blocked |
| AT-15 | Guest viewing | A buyer on a phone opens a shared link and reads the page with no account and no signup wall |
| AT-16 | Inquiry integrity | One real inquiry persists exactly once, notifies the owner, is visible in the inbox, and is not visible to other tenants |
| AT-17 | Revision and republish | Editing the price marks the published snapshot stale, republishes on approval, retains prior version |
| AT-18 | Honest analytics | A new account shows zero activity; no illustrative figures appear in a real account; counts come from real events |
| AT-19 | Export versioning | A generated deal sheet carries a date/version; an older export is marked stale in-app after a price change |
| AT-20 | Claims audit | Every public claim maps to a passing test; unbuilt capabilities are labelled illustrative or "designed to" |
| AT-21 | Auth surface (D01) | The sign-in page exposes no password, "create password" or "forgot password" control; an expired or reused magic link fails cleanly |
| AT-22 | Declared limits (D03, D18) | An unsupported property type, file type or size is refused with a stated reason before upload; the numbers shown in the UI equal the numbers enforced server-side |
| AT-23 | Location disclosure (D07) | A property published on the default setting exposes area only — not street address — in the page, the API payload and the map |

### 18.2 Manual QA pass (per release)

- Laptop, tablet and narrow mobile widths with keyboard-only navigation, labels, contrast and screen-reader spot checks.
- Unknown, unpublished and withdrawn property URLs checked for zero data exposure and no indexation.
- Preview and real send tests of confirmation email including personalization fallback, unsubscribe, bounce, duplication and mobile email clients.
- One beta form submitted with consent and one without optional marketing consent; database and communications behavior align.
- All illustrative metrics, photos, profile names and claims clearly non-customer-labelled.
- SEO: inspect HTML source, canonical, titles, sitemap, robots and `noindex`; verify Search Console after deployment.

### 18.3 Go/no-go criteria

Phase 0 → Phase 1 requires **all** of the following:

1. AT-01 through AT-20 pass on staging.
2. Developer demonstrates **3 realistic deals end-to-end**, including missing data, an import conflict, an update, private files and a link withdrawal.
3. No critical auth or privacy defect open.
4. Website claims reconciled with tested capability (§19).
5. Privacy notice, terms and information-use copy match actual practice (§20.2). **Counsel sign-off is required before live launch; it does not block staging build.**
6. Founder sign-off on product promises, legal review status, copy and launch gate.

**Do not declare go because the landing page looks complete.**

---

## 19. Website requirements: copy, claims, early-access funnel, legal and SEO

*From Doc 04. The website is a customer-facing surface of the product and is bound by §6.1.*

### 19.1 Claim policy

Every claim on the site must be tied to build status. Capabilities that are not shipped are labelled "illustrative," "product concept" or "designed to." Mockups must never look like live customer data. Sample analytics carry a persistent label inside the card: **"Illustrative example — not real customer results."**

### 19.2 Page-by-page required copy

#### HOME-01 — Hero (P1)

- Eyebrow: "Built first for wholesalers and disposition teams."
- Headline: "A property deserves better than a forwarded PDF."
- Subhead: "Turn scattered property notes, photos and documents into one organized record, a buyer-ready deal sheet and a professional page you can share. Review the facts before anything goes live."
- Primary CTA "Request early access"; secondary "See how it works."
- If the deal sheet output is unbuilt, write "Designed to turn…" and display a roadmap label.

#### HOME-02 — Fragmented tools (P1)

- Heading: "One property record. Fewer things to rebuild."
- Body: "Your notes, images, asking price and buyer-facing materials should not live in five different versions. ORREI is being designed to keep the approved details together, so preparing and updating a deal takes less repetition."
- Show a compact data → review → outputs schematic. Do not promise universal app integrations.

#### HOME-03 — Interactive showcase (P0)

- Intro label: "Product concept — example screens, not live customer data."
- Record tab: "Organize the details you already have."
- Checking tab: "Review conflicting information before sharing."
- Publishing tab: "Approve each output separately."
- Activity tab: "Understand page activity and inquiries — when measurement is available."
- Tabs keyboard selectable with a visible selected state; sample metrics labelled inside the card; name "User confirmed," never "Verified."

#### HOME-04 — Professional profile (P1)

- Headline: "Every deal has someone behind it."
- Body: "Give buyers a clear view of who is sharing the opportunity, the markets you serve and the properties you choose to publish. Your profile is a reusable professional home — not another website to rebuild."
- Interface label is **"Professional profile."** Never "My Website" or "Publish site."

#### HOME-05 — Portfolio (P1)

- Heading: "One place for the deals you choose to show."
- Body: "Present each approved opportunity clearly, with property facts, media, relevant deal information and a direct way to inquire."
- Concept assets must include at least one realistic US vacant infill lot or modest single-family opportunity; identify sample currency/locale.

#### HOME-06 — AI and business context (P0)

- Heading: "Your facts. Your voice."
- Body: "Set your preferred tone and language for property descriptions. ORREI is designed to draft from the details you approve, without making up missing information."
- If business-context features are not shipped, mark them planned.

#### HOME-07 — Analytics (P0)

- Heading: "See what happened after you shared."
- Body: "Where available, track page openings and submitted inquiries. Views are not verified buyers, and interest is not proof of purchase."
- "Illustrative example — not real customer results" sits directly above any figures.

#### HOME-08 — Roles and company (P1)

- Roles heading: "Start with the teams preparing and sharing deals."
- Lead card: "Wholesalers & disposition teams — Turn deal details into consistent, buyer-ready presentations."
- Secondary cards: "Investors," "Agents & brokers," "Property teams" with explicit availability notes.
- Company heading: "Building practical tools for the work behind real estate deals." CTA to `/about`.

#### WORK-01 — How it works hero (P0)

- Heading: "From property notes to something you can share."
- Body: "Add the information you already have. Review what ORREI organizes. Approve the presentation and share it when it is ready."
- **Remove "about twenty minutes"** until time-to-value is measured in beta.

#### WORK-02 — Step one: intake (P0)

- Heading: "Start with what you have."
- Body: "Enter property details, add photos and attach supported documents. ORREI organizes your information into a record you can edit. Additional imports will depend on supported sources."
- List supported file types and limits only after verified. Never offer unlicensed scraping.

#### WORK-03 — Step two: checking (P0)

- Heading: "Review the facts before they travel."
- Body: "See what came from your materials, which details are missing and where supported sources disagree. You decide what to approve for publication. ORREI does not verify title, valuation, boundaries or legal status."
- Badges: "Supplied by you," "Source conflict," "Needs review," "User approved." Never "Verified" unless independently substantiated.

#### WORK-04 — Steps three and four: publishing and updating (P0)

- Step three: "Choose what to share." Body: "Preview a property page and any available output. Publish only the material you approve."
- Step four: "Update your source, then republish." Body: "When details change, revise the record and publish an updated page. Previously downloaded files remain separate copies and may need to be reissued."
- Output state per artifact; live pages update only after approval; visible version/updated timestamps; **never promise recall of sent PDFs.** Remove "no stale brochures in circulation."

#### WHO-01 — Who it's for (P1)

- Heading: "For the people preparing real estate opportunities."
- Lead section: "Wholesalers & disposition operators: Stop rebuilding the same deal information for every buyer." Body: "Start with one organized record, review the details, then share a clear presentation."
- Reorder audience sections so wholesalers come first; include genuine US land/SFR examples; mark developer/large-scheme features as exploration, not current availability.

#### ABOUT-01 — About (P1)

- Headline: "We are building the infrastructure behind clearer real estate work."
- Body: "ORVN Labs is developing ORREI to make property information easier to organize, present and share. We are beginning with US real estate operators, testing with a small early-access group, and designing for wider markets over time."
- State the broader vision here, never as a functioning borderless transaction service. Add named founder/team details only if permission and accuracy are confirmed.

#### FAQ-01 — What the AI actually does (P0)

- Q: "What does the AI actually do?"
- A: "ORREI is being designed to help organize information you provide and draft buyer-facing material. You review the structured facts and wording before anything is published. It does not independently verify title, pricing, zoning, boundaries or legal compliance."
- Distinguish extraction, drafting and verification; clarify supported formats at launch.

#### FAQ-02 — Missing details and publishing (P0)

- Q: "Can I publish if some details are missing?"
- A: "Yes, if those details are optional and the presentation makes no unsupported claim. ORREI will show missing information in your workspace and may prevent publication when a required field or unresolved critical conflict remains."
- Define required fields per property type and output; no universal block on all unknown fields.

#### SIGN-01 — Sign-in (P0)

- Heading: "Sign in to your ORREI workspace."
- Note: "Only invited beta members can currently access ORREI. Enter your email to receive a secure sign-in link. Your private workspace is not publicly visible."
- Do not state device-only session behavior without proof. Hide password links until working, or label the alternative path clearly. Verify no account enumeration and token expiry. `noindex`.

#### ACCESS-01 — Early access (P0)

- Heading: "Help shape a better way to share real estate deals."
- Body: "Tell us how you prepare and distribute opportunities today. We invite small groups of US operators to test ORREI and give direct feedback. Requesting access does not guarantee an invitation."
- CTA: "Request early access."
- Require only name, email, role, market and one workflow question; keep the rest optional. Separate operational replies from product marketing preferences; preserve consent time/source/version; never reveal whether an email already exists.

#### FOOT-01 — Footer and legal (P0)

- Footer copy: "ORREI is in development. Screens and properties are illustrative. Access is limited to approved beta users."
- Links: "Privacy notice," "Terms of service," "Contact," "Early access," optional "Cookie choices" where applicable.
- `/privacy` and `/terms` must return complete current documents with effective date and operator contact; maintain consent/change logs.

### 19.3 Cross-page visual and UX corrections

| Area | Observed problem / recommendation | Pass condition |
|---|---|---|
| Sticky header | On dark/cream transitions the translucent pill overlays headings and footer text | Opaque or adequately blurred theme-aware background, sufficient contrast, no blocked content, correct anchor offset |
| Spacing | Some sections show excessive whitespace; others crowded sticky overlays | Predictable section padding; audited at 360/390/768/1024/1440px and 200% zoom |
| Screenshots | App-looking frames show fake `app.orvnlabs.com` URLs, active toggles and realistic metrics | Persistent "Illustrative design / pre-release" label; no navigation to nonexistent routes |
| Property imagery | Nearly all images are high-end houses; target US wholesalers handle vacant land and ordinary SFRs | At least one accurate US land layout and one average SFR deal; clearly fictional sample property |
| Typography | Strong headlines; some supporting text low contrast; sticky overlay on white | WCAG-oriented contrast and type sizing; no tiny legal links |
| Cards and buttons | Decorative toggles suggest real interactivity | Noninteractive demos visibly explanatory; functional demos keyboard and touch accessible |
| Nav IA | ORREI / How it works / Who it's for / Company / FAQ plus sign-in and access is reasonable | Nav active states and CTA consistent; mobile menu clear; footer links 200 and correct |
| Conversion | Repeated "Request early access" buttons with little founder context or observed results | One concise promise, optional workflow sample, exact beta process before the form |
| Accessibility | Screenshot-only review cannot test keyboard, semantics, alt text or screen readers | Complete accessibility checklist and automated/manual testing |
| Mobile | No native smartphone screenshots provided | Capture real mobile viewport evidence at 390px and below |

### 19.4 Early-access funnel

**Form fields:** name, email, role, market and one workflow question required; business name, monthly property count, share method, frustration and profile optional.

**Confirmation UI:** Heading "We received your request." Body: "Thank you for telling us about your work. We review applications for a small early-access group. If there's a suitable opening, we'll email you at the address provided. You can ask us to remove your details or stop optional updates whenever you choose."

Do not expose an applicant's answers in a public or guessable URL. Display minimal submitted details only in-session or by email to the applicant. Record a request ID server-side without revealing whether an email was previously registered.

**Confirmation email (founder note):** operational receipt + founder note, plain language, states that the small group is being tested and that being on the list does not guarantee immediate access; signed by "The founder, ORVN Labs"; includes `{{unsubscribe_url}}` for optional updates and invites a reply. Grounded personalization only — never invent the customer's problem; escape/sanitize inserted text or omit it when ambiguous.

Personalization example: if the user writes "posting the same properties repeatedly," the optional sentence may read: "You mentioned repeatedly posting the same properties. Reducing that kind of repetitive presentation work is one of the problems we want to test with ORREI."

**Email compliance:** distinguish operational receipt from subsequent promotional/development updates; review CAN-SPAM primary-purpose classification with counsel; include a compliant postal address and functional opt-out for commercial messages. An operational acknowledgement is not blanket consent to recurring marketing. Footer includes a link to privacy terms.

**Functional tests:** form submits once and records all consent metadata; duplicate clicks idempotent; email delivery logs show accepted, rejected, bounced and complaint states with no fake "sent"; marketing unsubscribe works without login and suppresses later optional updates while essential account/security notices remain separable; no existing-user or waitlist enumeration; applicant can request access/deletion; support staff access controlled; reply-to mailbox monitored and assigned; accessible validation, length limits, anti-abuse, bot protection and phone-size testing pass.

### 19.5 Privacy notice required sections

These are a drafting framework, not a finished enforceable policy. Counsel and the operator must approve final text; do not publish boilerplate claiming protections that are not implemented.

1. Operator identity, registered legal entity, support/privacy contact, effective date and any state-specific privacy contact.
2. Categories collected: waitlist identity, role, market, free-form answers, account data, profile fields, property details, property media, optional seller-sensitive documents, inquiries, usage and technical logs.
3. Purpose and legal basis/appropriate notice for account operation, security, communications, analytics, AI-assisted organization and support.
4. Public versus private disclosures: published property and profile content is public; drafts, source documents and seller-sensitive files are not.
5. Third-party processors (hosting, email, AI/extraction, analytics) and their data handling; no claim of model training on user content unless contractually true.
6. Retention windows for documents, inquiries, logs and audit records; deletion and export request paths.
7. Cookies and analytics choices; consent controls where required.
8. State-specific rights where applicable (e.g., access, deletion, correction, opt-out of sale/sharing language only where true).
9. Security statement that is accurate, not absolute.
10. Change log and effective-date versioning.

### 19.6 SEO requirements

- Unique, server-rendered title/description/canonical for every marketing route.
- Public property and profile pages indexable **only** after explicit publish-as-public.
- Link-only, private, unknown and withdrawn URLs: `noindex` plus real authorization; never rely on `robots.txt`.
- sitemap.xml limited to marketing and genuinely public routes; updated automatically on publication state change.
- Structured data only where it accurately describes the page; no fake review, rating or offer markup.
- Verify Search Console after deployment; check retired and redirected routes return the correct status.

---

## 20. Decision register — all decisions resolved

*From Doc 03 §15 and Doc 06 §9. Every prior "open decision" is closed below with a binding default so engineering is unblocked. A decision may be reopened only by the founder, in writing, with the affected acceptance tests restated.*

### 20.1 Resolved decisions

| ID | Question | **Decision** | Rationale | Reopen trigger |
|---|---|---|---|---|
| D01 | Auth: email link or password? | **Magic link only.** No password field, no "create password," no "forgot password." Links single-use, 15-minute expiry. | One path = one failure surface. Two paths create enumeration and support load before the product has proved itself. | Beta users report sustained link friction across email clients, measured over at least 20 users |
| D02 | Are deal sheet PDFs a V1 blocker? | **Yes — in V1.** PUB-02 is required, not conditional. | Wholesale disposition is document-centric. A page alone does not replace the artefact buyers already expect. | Rendering proves unreliable in Phase 0; only then narrow the promise in writing *before* invites |
| D03 | Launch property categories and countries | **`residential_land` and `SFR` only. US only.** `duplex`, `multifamily`, `other` hidden from the picker until each passes QA. | Doc 02/03 both scope US-first land + houses. Shipping a category that fails PROP-02's type-awareness test is worse than not offering it. | A category passes its own AT pass; founder adds it to the picker |
| D04 | Supported source import formats | **Pasted plain text; uploaded PDF, JPEG, PNG.** Nothing else. **No portal import.** | These are the formats the extraction pipeline can be held accountable for. Everything else returns a transparent unsupported-format error. | A provider grants written API/ingestion rights and the format is validated (INT-01) |
| D05 | Who can publish under a company account | Explicit `publisher` or `admin` role only — never default-all-members | Prevents accidental disclosure by a mere member | — (binding) |
| D06 | Are public profiles indexable by default | No. Indexable only after explicit publish-as-public | §7.3, §19.6 | — (binding) |
| D07 | How much location is exposed | **Three levels, user-selected per property: Exact address / Street-level only / Area only (city + ZIP). Default for public output = Area only.** | Protects seller position on off-market deals; owner can always disclose more | Owner asks for parcel-precision default |
| D08 | Which public analytics are implemented | Page opens and inquiry counts only | AN-01; anything more is unbuilt and unclaimable | Events are instrumented, tested and consented |
| D09 | Withdrawn links and downloaded files | Withdraw the URL; **cannot recall** offline exports; every export date/version stamped | Files in the wild cannot be recalled | — (binding) |
| D10 | What is free vs paid | **No billing system in V1.** Beta is free; pricing is a Phase 2 experiment | Charging before retention is proven adds support, tax and refund surface for zero learning | G2 gate |
| D11 | When do messaging/connect/JV arrive | Phase 3, not before G3 | Network value requires operator density that does not exist yet | G3 gate |
| D12 | Retention, deletion and AI processing | See §20.2 — binding defaults set | Live launch cannot be gated on an unspecified policy | Counsel replaces numbers in §20.2 with reviewed equivalents |
| D13 | Waitlist confirmation email and consent | Use §19.4 copy verbatim. **Single unchecked-by-default checkbox** for optional updates; operational receipt is separate from marketing | CAN-SPAM separation; no bundled consent | — (binding) |
| D14 | ORREI brand clearance | **ORREI stays as the working name.** No paid marketing, PR, printed collateral or investor-facing brand assets until a clearance search returns clean | Clearance is unverified; spend before it is a rebrand liability | A clearance search finds a conflict |
| D15 | Payment provider, legal entity, fees | Deferred to Phase 2 by D10. Requirement recorded: must support US sales-tax handling and self-serve cancellation | No billing in V1 | G2 gate |
| D16 | Hosting, database, monitoring vendors | **Vendor choice is engineering's, constrained by §20.3.** Not a PRD decision | Pinning a vendor in a product doc dates it; the constraints are what matter | Constraint cannot be met |
| D17 | Beta cohort size and criteria | **10–15 active US operators, Florida-concentrated** | Doc 02 proposed research target | Phase 1 evidence |
| D18 | Media and file limits | **Photos: 25 per property, 10 MB each, JPEG/PNG/WebP. Documents: 10 per property, 25 MB each, PDF only. 500 MB per property. No video.** | Must be declared before invites so the UI can state them truthfully | Storage cost or user feedback forces a change |

### 20.2 Retention and deletion policy (D12) — binding defaults

*Operational defaults for build. Counsel must review and substitute reviewed equivalents before live launch; until then these are what the product must implement and what the privacy notice must describe.*

| Data class | Retention | Deletion path |
|---|---|---|
| Uploaded source documents (contracts, brochures) | Until the user removes them or the property is deleted | Hard delete within 30 days of request |
| Source snippets kept for fact attribution | Life of the fact record | Deleted with the property |
| AI extraction processing | Sent to processor for extraction only; **never used for model training**; processor retention ≤ 30 days | Automatic at processor |
| Drafts and private records | Until deleted by user | Hard delete within 30 days |
| Published snapshots | Retained for account history while the property exists | Deleted with the property |
| Buyer inquiries | 24 months from last contact | Sender may request deletion at any time; honoured within 30 days |
| Account and profile data | Life of the account | Deleted within 30 days of account deletion |
| Audit events | 24 months | Not deletable by ordinary users; append-only |
| Application and access logs | 90 days | Automatic |
| Backups | 35-day rolling window | Automatic expiry |

### 20.3 Platform constraints (D16)

The stack must satisfy: managed relational database with point-in-time recovery; S3-compatible object storage issuing **signed, expiring URLs**; transactional email with bounce and complaint webhooks; error monitoring with request-ID correlation; separate staging and production; managed secrets; tested restore. Vendor selection is recorded in the engineering README, not here.

### 20.4 What is still genuinely outside this document

Two items cannot be closed by anyone in this workspace:

1. **Legal review of §20.2 and §19.5** — requires counsel. This blocks *live* launch, not Phase 0 build.
2. **Trademark clearance for ORREI (D14)** — requires a search. This blocks paid spend, not the build.

Neither blocks starting Phase 0 today.

---

## 21. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Marketing claims outrun shipped capability | High | Trust, legal exposure | §6.1 claim policy; claims audit AT-20 at every release |
| "Verified" misuse causes inaccurate buyer expectations | High | Legal, reputational | Four-state claim model (§6); badge vocabulary fixed in §14.5 |
| Private source documents leak via public pages or CDN | Medium | Severe privacy harm | Signed URLs, separate media exposure rules, AT-09/AT-10 |
| AI extraction fabricates values | Medium | Wrong price/APN published | Human approval gate; unknowns stay blank; AT-05/AT-06 |
| Prompt injection from uploaded files | Medium | Unauthorized actions | Data-not-instruction rule; AT-07 |
| Stale distributed PDFs cause price confusion | High | Commercial disputes | Version/date stamps; "may need reissuing" language; AT-19 |
| Link-only treated as secure | High | Unintended disclosure | Explicit copy that link-only is unlisted, not secret |
| Beta users do not return after first deal | Medium | Phase 1 advance fails | Instrument retention; interview inactive invitees |
| Deal sheet PDF infeasible at launch | Medium | Weaker fit with wholesaler workflow | D02 decided (PDF required). De-risk with a Phase 0 rendering spike using the three demo deals before any UI work beyond preview |
| Authorization gap in multi-org model | Medium | Cross-tenant exposure | Server-side record-level checks; staged permissions; AT-10 |
| Trademark conflict for ORREI | Low–medium | Rebrand cost | Clearance before broad spend (D14) |
| Legal/regulatory exposure in wholesaling claims | Medium | Enforcement risk | No verification claims; counsel review of terms and marketing |
| Support burden from document/AI failures | Medium | Cost, churn | Honest failure states; manual fallback path (AT-08) |

---

## 22. Release gates, readiness checklists and change control

### 22.1 Release gates

| Gate | Criteria |
|---|---|
| **G0 — Prototype demonstration** | 3 realistic deals end-to-end on staging, including missing data, conflict, update, private files and link withdrawal |
| **G1 — Private beta invite** | AT-01…AT-20 pass; no critical auth/privacy defects; website claims reconciled; legal copy approved; founder sign-off |
| **G2 — Paid pilot** | Independent users repeatedly share useful materials; support and model costs measured; payment lifecycle, cancellation, refunds and terms ready; some beta users accept a real offer to pay |
| **G3 — Network features** | Operator density in chosen markets; manual matching without spam; intro/marketing permissions and identity claims controlled; lawful compensation model reviewed; moderation capacity exists |
| **G4 — International expansion** | Demand evidence per market; local conventions and disclosures modeled; country legal and service partners identified; privacy, payments and data-transfer reviewed; local support workable |

### 22.2 Readiness checklists

**Ready to invite beta users**

- [ ] One real property can be entered and reviewed without manual database intervention
- [ ] Private docs and non-public drafts cannot be opened by unrelated users
- [ ] A real mobile buyer opens a link and sends an inquiry successfully
- [ ] Missing and contradictory values are safe and visible
- [ ] Withdrawal and editing behavior tested
- [ ] Privacy notice, terms and inquiry information-use copy match actual practice
- [ ] Sign-in, early access, confirmation email and unsubscribe tested end-to-end

**Ready to charge**

- [ ] Independent users repeatedly share useful materials
- [ ] Users explain the product value in their own words
- [ ] Support and model/hosting costs measured
- [ ] Payment lifecycle, cancellation, refunds and customer terms ready
- [ ] At least some beta users accept a real offer to pay

**Ready to add network**

- [ ] Enough genuine, active participants in chosen markets
- [ ] Requests can be manually matched without spamming
- [ ] Intro/marketing permission and identity claims controlled
- [ ] Lawful operating and compensation model reviewed
- [ ] Bad-actor reporting and moderation capacity exist

**Ready to expand internationally**

- [ ] Evidence of customer demand in each market
- [ ] Local property conventions and disclosures modeled correctly
- [ ] Country-specific legal and service partners identified
- [ ] Privacy, payments and data transfer requirements reviewed
- [ ] Customer support and trust models workable locally

### 22.3 Ticket handoff rule

Every engineering ticket must include: **requirement ID; release label; user role; screen ID; expected primary action; field IDs from §14; permissions; success and failure states; tracking event; automated/manual test ID; and a link to a representative mockup.** Feature interpretation by screenshot alone is prohibited.

### 22.4 Change control

Any feature expansion proposed during development must be classified as **V1 blocker, deferred, pilot or future**, with evidence and the impact on current acceptance tests stated. Website claims may never exceed the tested release. Changes to field names, state enums or vocabulary require a documented migration note in §23.3 and consistency updates across §11, §14 and §17.

---

## 23. Document control, sources and changelog

### 23.1 Source inventory (Google Drive, ORVN Labs)

| ID | File | Role in this PRD |
|---|---|---|
| Doc 02 | `ORVN_Labs_Document_02_ORREI_Product_Strategy_and_Roadmap.docx` | Thesis, audiences, phases, permissions model, exit checklists |
| Doc 03 | `ORVN_Labs_Document_03_ORREI_Complete_Feature_Specification.docx` | Feature IDs, acceptance tests, decision register |
| Doc 04 | `ORVN_Labs_Document_04_Website_Audit_and_Correction_Specification.docx` | Page copy, claims policy, funnel, legal and SEO |
| Doc 06 | `ORVN_Labs_Document_06_Technical_Architecture_and_Engineering.docx` | Entities, state machines, AI pipeline, authorization, QA |
| Doc 07 | `ORVN_Labs_Document_07_Data_Dictionary_and_Product_Vocabulary.docx` | Field dictionary, vocabulary, empty/error wording |
| Doc 08 | `ORVN_Labs_Document_08_Real_Estate_Terminology_Glossary.docx` | Industry terms, design implications, distinctions |
| Doc 10 | `ORVN_Labs_Document_10_Design_System_and_UX_Standards.docx` | Tokens, layouts, screen checklist, interaction, accessibility |
| Reference | `ORREI_Individual_Mockups_32_Screens.zip` | Compositional reference only — never a feature specification |

Documents 01, 05 and 09 are referenced by the set but were not available; nothing in this PRD depends on their content.

### 23.2 External standards referenced (guidance, not proof of compliance)

- Google Search Central — JavaScript SEO basics: `https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics`
- Google Search Central — Search Essentials: `https://developers.google.com/search/docs/essentials`
- FTC — CAN-SPAM Act: A Compliance Guide for Business: `https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business`

These are general implementation guidance. State-specific privacy, marketing and real-estate regulatory conclusions require legal review.

### 23.3 Changelog and decision log

| Date | Change | Author | Notes |
|---|---|---|---|
| 2026-11-13 | v1.0 consolidated from Nov 13 document set | Founder (ORVN Labs) | §0–12 founder-authored; §13–23 completed from Drive sources |
| 2026-11-13 | v1.1 — **all decisions D01–D18 resolved in §20** | ORVN Labs | Magic-link auth, PDF in V1, land+SFR only, four formats, retention defaults, file limits. No open choices remain |
| 2026-11-13 | Repo documentation reconciled to this PRD | ORVN Labs | `docs/ROADMAP.md` rewritten and re-based on §§10/11/18/19/20/22; AGENTS.md and README.md updated; legacy docs (`docs/ROADMAP-DRAFT.md`, `docs/PLATFORM-BUILD-PLAN.md`, `docs/source/*`, `docs/review-2026-11-07-response.md`) bannered as superseded |
| | | | |

**Decision log:** record every D-number closed here with date, choice and rationale.

---

*End of PRD. ORREI is in development. Screens and properties are illustrative. Access is limited to approved beta users.*
