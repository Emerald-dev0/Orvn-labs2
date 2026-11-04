# ORVN Labs / LAREI: Website and Product Roadmap

Prepared 4 November 2026 for Daniel (ORVN Labs).
Sources: the three 21 October 2026 handoff documents in Drive, plus the current state of this repository.
Scope note: colour and visual-theme guidance from the brief has been excluded as instructed. Everything here concerns structure, copy, behaviour, sequencing and decisions.

---

## 1. The short version

The marketing site is roughly 70 percent built, and the 30 percent that is missing matters more than it looks: the copy does not match the approved brief, the brand hierarchy is inverted, and the primary call to action (early access) posts nowhere.

Meanwhile the actual product that the site promises does not exist yet in this repository. The site currently describes a property-record workspace. The brief describes a larger product: a branded professional website, a portfolio, AI-assisted records, published property pages, and inquiries. A visitor today would form a slightly different expectation than the product will deliver.

So the work splits into two tracks that must stay in step:

1. **Website track (2 weeks).** Install the approved copy, correct the brand hierarchy, restructure the homepage to the brief's section order, wire the forms to a real review queue, and settle the PAS question.
2. **Product track (10 weeks).** Build the V1 path the brief demands: invitation, professional site, property intake with review, publication, inquiries and analytics.

Both tracks meet at one gate: **no marketing claim may appear on the site before the corresponding product behaviour exists.** That rule is from the brief and it is the single most likely thing to be broken under deadline pressure.

---

## 2. What I read

| Document | Date | What it governs |
| --- | --- | --- |
| `ORVN_Labs_Website_Redesign_and_Copy_2026-10-21.docx` | 21 Oct 2026 | Brand architecture, IA and routes, complete page-by-page copy, FAQ, transactional microcopy, migration, SEO, launch checklist |
| `LAREI_Product_Developer_Specification_2026-10-21.docx` | 21 Oct 2026 | Product scope P0/P1/P2, ten behavioural feature specs (F01 to F10), data and permission rules, negative tests, delivery phases |
| `ORVN_LAREI_Developer_Execution_Brief_2026-10-21.docx` | 21 Oct 2026 | V1 boundaries, the one workflow that must be proven, phase order, website revamp decision |
| `ORVN Feature Stack Matrix and Revenue Roadmap` | Sep 2025 | Wider ORVN context (comms hub, CRM-lite, payments, white-label). Background only, not LAREI scope |

Full extracted text of the first two is saved at `docs/source/website-copy.txt` and `docs/source/product-spec.txt` so the copy can be installed without re-reading Word files.

One false positive worth recording: the Drive file named **"Landing page"** is a video-agency page for coaches and consultants. It has nothing to do with LAREI.

---

## 3. Lock these three decisions before any copy is installed

These are not design preferences. Each one changes what gets written.

### D1. Who owns the header: ORVN Labs or LAREI?
**Brief says:** ORVN Labs is the company and the site identity. LAREI is the product, and the brief calls the name provisional. Expected phrasing where clarification matters: "LAREI, by ORVN Labs".

**Current build:** the header, footer and page titles all read LAREI as if it were the company.

**Recommendation:** ORVN Labs wordmark in the header and footer, LAREI as the product name in the hero eyebrow and product pages. This preserves the masterbrand, lets a second product exist later, and matches every page of approved copy.

**Cost of getting it wrong:** every heading, meta title and OG card has to be rewritten twice.

### D2. What happens to PAS?
**Brief says:** decide whether PAS is discontinued, kept as a secondary product, or archived. Do not claim it never existed. Do not put PAS in the hero.

**Current build:** `/pas` is a full dark product page presented as a live second product, and the footer links to it.

**Recommendation:** keep `/pas` as a clearly labelled earlier product with an honest note, move it to the footer only, add a short archive rationale, and keep its URLs alive with redirects from any legacy PAS landing pages. Archive, do not delete.

### D3. Is the name LAREI final?
The brief calls it provisional in three separate documents. If it may change, do not put it in the domain, OG images, email templates, or the workspace URL pattern until the beta cohort is invited. It is cheap to rename now and expensive after invites go out.

---

## 4. Gap register: brief versus what exists today

Priority: **P0** blocks launch, **P1** needed for a credible beta, **P2** later.

| # | Requirement in the brief | Current state | Action | Priority |
| --- | --- | --- | --- | --- |
| 1 | ORVN Labs as site identity; LAREI as product | LAREI used as the site brand everywhere | Apply D1 across header, footer, titles, OG | P0 |
| 2 | Hero H1: "Your real estate business deserves a better place to be seen." | "Every property deserves a better page." | Replace, and install the approved subheading and microcopy | P0 |
| 3 | Hero must show product composition: editor with brand profile and property cards, mobile public-site preview, property detail with map and "Ask about this property" | Full-bleed photograph with a listing card | Rebuild the hero visual as a product composition, labelled "Product preview / in development" | P0 |
| 4 | Five feature sections: professional site, connected portfolio, responsible AI, brand voice, engagement | Four sections about record, checking, publishing, insight | Restructure to the brief's five blocks with their headings and body copy | P0 |
| 5 | Five-step workflow (01 establish presence to 05 follow the interest) | Three steps | Replace with five, same copy | P0 |
| 6 | Role section: wholesalers, agents, investors, operators and teams | Agents, developers, small agencies | Rewrite to the four approved roles | P0 |
| 7 | Trust block: "Your brand. Your review. Your publishing decision." | A "what LAREI will not do" panel | Add the trust block; keep the limits panel as a secondary honesty section | P1 |
| 8 | FAQ: 21 approved questions | 20 invented ones, some describing features that do not exist (for example "which photograph held attention") | Replace with the approved set, verbatim | P0 |
| 9 | Closing CTA: "Make every property presentation reflect the business behind it." | "Start with one property." | Replace, add the "Already invited? Sign in" secondary | P0 |
| 10 | Footer: Product, How it works, Who it's for, FAQ, Early access, Contact, Privacy, Terms. Tagline "Software for clearer real-estate presentation." | Newsletter, Product/Company/Legal columns, LAREI wordmark | Rebuild footer to the approved list, keep the newsletter only if it is actually wired | P0 |
| 11 | Privacy and Terms at top level (`/privacy`, `/terms`), with AI disclosure, retention, acceptable use, fair housing | Only `/legal/privacy`, `/legal/terms`, `/legal/...` | Add top-level routes and redirects; keep the legal index | P1 |
| 12 | Nav has no Journal | Journal is in the primary nav | Move Journal to the footer, or keep it and record the deviation | P1 |
| 13 | Early access form: name, work email, company, role (Wholesaler / Agent / Investor / Acquisitions / Other), markets, monthly volume, current method, frustration, website, consent | Same shape, different role list, no endpoint | Align fields and role list; post to a real review queue | P0 |
| 14 | Duplicate-request and failure states with exact copy | Not implemented | Add states and copy | P1 |
| 15 | Sign-in: invalid credentials, invitation required, forgot password, reset, invitation acceptance, three onboarding steps | A static sign-in card | Build real auth screens and copy (product phase 1) | P1 |
| 16 | 404: "We couldn't find that page." | "This page does not exist." | Replace copy | P1 |
| 17 | Unpublished property page and generic error copy | Not built | Build with the property templates | P1 |
| 18 | Professional public page template (dynamic copy, section by section) | Not built | Product phase 1 | P1 |
| 19 | Property public page template (status, terms, facts, location, documents, inquiry, disclaimer) | Not built | Product phase 3 | P1 |
| 20 | PAS treatment decided and documented | PAS marketed as live second product | Apply D2 | P0 |
| 21 | Product visuals labelled prototype or live | Unlabelled HTML mocks; gallery titled "Published with LAREI" implies real customers | Label every mock; relabel gallery as an illustrative sample page | P0 |
| 22 | No fabricated proof, no pricing, no adoption claims | Complies, except "Free while we build" implies commercial terms | Confirm beta terms wording (D8) | P1 |
| 23 | Unique titles, descriptions, canonical, OG image, sitemap, robots | Titles exist; OG image is `logo.png`; sitemap last modified 11 Sep 2026 | Add a 1200x630 OG image; regenerate sitemap on release; audit per-page meta | P1 |
| 24 | Early-access data lands in a review queue | Form is front-end only, shows success, posts nothing | **Blocking.** Wire to an endpoint plus notification | P0 |
| 25 | Analytics events for CTA, product view, form start, submission | None | Add event layer with consent | P1 |
| 26 | WCAG 2.2 AA audit | Not performed; contrast and focus exist but unverified | Audit and fix | P1 |
| 27 | Legal pages reviewed by counsel against actual implementation | Draft policies exist | Send to counsel once D7 and D5 are settled | P0 |
| 28 | No dead signup flow behind any CTA | Sign-in is static and Request access posts nowhere | Do not advertise sign-in until auth exists | P0 |

---

## 5. The content contract, page by page

This is the "every single thing" list. Each block below must be present before its page is considered done. Exact wording lives in `docs/source/website-copy.txt`; the anchors are repeated here so nothing is missed in implementation.

### 5.1 Home (`/`)

Reading order from the brief's wireframe section:

1. **Header.** ORVN Labs mark, nav (Product, How it works, Who it's for, FAQ), Sign in (text), Request early access (primary).
2. **Hero.** Eyebrow "LAREI · Real estate publishing and professional presence". H1 as in D1/Q2 above. Approved subheading (four sentences). Primary CTA Request early access, secondary Explore the product, microcopy "Private beta · Applications reviewed individually".
3. **Hero composition.** Left: editor with "Professional website, Draft", brand profile and three property cards. Right: mobile-width public site preview. Foreground: property detail with map preview, key facts and "Ask about this property". Every sample value marked illustrative, no fake client names.
4. **Credibility bridge.** "Built around the work, not another collection of disconnected tools." plus its paragraph.
5. **Feature 1, professional presence.** Eyebrow "Your professional presence". Heading "One address for your business. A clear view of your work." Body plus the five UI labels shown in the preview.
6. **Feature 2, property and portfolio.** Eyebrow "Property and portfolio". Heading "Every property has its place." Body plus four mini-features.
7. **Feature 3, responsible AI.** Eyebrow "AI that works with your facts". Heading "Spend less time assembling. Keep control of what gets said." Body plus the note that AI does not verify title, valuation, zoning, parcel boundaries or buyer economics.
8. **Feature 4, brand voice.** Eyebrow "Your voice, not a generic template". Heading "Make your materials sound like your business."
9. **Feature 5, engagement.** Eyebrow "Observable activity". Heading "Know what was viewed and what prompted a response." Plus the caption about views not being verified buyers.
10. **How the system works.** Heading "From a working file to a professional place to share it." Five steps, 01 to 05.
11. **Roles.** Heading "Designed for the professionals moving the property." Wholesalers, agents, investors, operators and teams. Link to Who it's for.
12. **Trust block.** "Your brand. Your review. Your publishing decision." Plus the paragraph on private workspace versus approved public pages and the map caveat.
13. **FAQ preview.** Three questions: CRM, who can access, automatic fact verification. Link to all questions.
14. **Closing CTA.** Heading and body as approved, primary Request early access, secondary Already invited? Sign in.
15. **Footer.** Tagline, seven links, contact address, dynamic year, "subject to legal review" note removed before launch.

### 5.2 Product (`/product`)

Meta title and description as specified. H1 "One workspace for your professional presence and property presentations." Intro paragraph. Seven sections in this order: business presented clearly, portfolio connected to real records, one record multiple outputs, content in your voice, simple maps accurately described, interest you can act on, publishing stays deliberate. CTA block "Prepare deals with more consistency. Present your business with more clarity." Button: Request early access.

### 5.3 How it works (`/how-it-works`)

H1 "From fragmented information to a place people can actually review." Lead line. Six steps: introduce your business, review your website draft, bring in a property, verify and prepare, publish the right pages, learn from engagement. Trust note about generated descriptions not being an appraisal, title opinion, licence verification or legal disclosure. CTA.

### 5.4 Who it's for (`/who-its-for`)

H1 "Different real-estate roles. One need for a better presentation." Intro. Four blocks, each with headline, body and a "what matters" line: wholesalers, real-estate agents, investors, acquisitions and disposition operators. CTA "Request access for your role".

### 5.5 Early access (`/early-access`)

H1 "Help shape a better way to present real-estate deals." Body. Nine fields with the approved helper text and role options. Consent note with Privacy Policy link. Button "Request early access". Sending state "Sending request…". Success heading and body. Duplicate handling message, only if safe. Failure message. **No automatic account creation.**

### 5.6 FAQ (`/faq`)

All 21 approved questions, verbatim. The set covers: what ORVN Labs is, what LAREI is, who it is for, whether users get a website, whether each deal gets a page, custom domains, whether AI builds the whole site, importing AI context, whether the AI learns your voice, ARV and valuation, parcel boundaries, hiding address or documents, marketing other people's properties, buyer-finding and campaigns, visitor identity, CRM scope, non-wholesaler use, availability, pricing, and contact.

### 5.7 Contact (`/contact`)

H1 "Talk to ORVN Labs." Body. Form: name, work email, topic (Beta access / Product question / Support / Other), message. Success and failure copy as specified.

### 5.8 Authentication and onboarding

Sign-in H1 "Welcome back to LAREI", subhead, labels, show password, forgot password, invitation-required message, invalid-credentials message. Password reset screen with its three states. Invitation acceptance with expired state. Onboarding steps 1 to 3 with the exact titles, helpers and buttons ("Generate my page", "Edit details", "Preview site", "Save as draft", "Publish site", "Add your first property", "Go to dashboard").

### 5.9 Public templates

Professional page template: nav, hero eyebrow and H1 patterns, about, operating areas, portfolio header, empty state, property card, contact block, footer with disclosure.
Property page template: breadcrumb, status label, H1, location by visibility level, terms including "Price on request", gallery, facts, description, location section, documents marked public, due diligence, inquiry form, success line, independent-verification disclaimer, footer.

### 5.10 Error and transactional copy

404, unpublished property page, generic error, early-access confirmation email, beta invitation email, inquiry owner notification. All written already; only implementation is missing.

### 5.11 Legal

`/privacy`, `/terms`, plus AI disclosure, data retention, acceptable use, fair housing. Every statement must reflect what the product actually does (analytics events, retention, subprocessors). Counsel sign-off is a launch gate, not a nice-to-have.

---

## 6. Workstreams

| Workstream | Owner | Output |
| --- | --- | --- |
| A. Website copy and IA | Daniel plus build | Approved copy installed, brand hierarchy corrected, PAS decision applied |
| B. Marketing plumbing | Build | Form endpoint, review queue, transactional email, analytics, SEO files |
| C. Product V1 | Build | Auth, profile site, intake, publication, inquiries |
| D. Trust and legal | Daniel | Counsel-reviewed policies, AI disclosure, sample-data labelling, beta terms |
| E. Design system | Build | Components and templates reviewed against the brief's designer deliverables list |

---

## 7. The twelve weeks

Assumes a start on Monday 10 November 2026 and roughly one full-time builder. Dates are targets, not commitments.

### Week 1 (10 to 14 Nov): decisions and copy
- Lock D1, D2, D3, and confirm the support mailbox.
- Install approved copy on the homepage, product, how it works, who it's for, FAQ, contact, early access.
- Rebuild nav, footer and brand hierarchy.
- Send privacy, terms and AI disclosure to counsel with a written description of implemented behaviour.
- **Gate:** a first-time visitor can name the audience and the product within ten seconds.

### Week 2 (17 to 21 Nov): plumbing and honesty
- Early-access form posts to a review queue with notification; duplicate and error states live.
- Analytics events instrumented with consent.
- OG image, per-page metadata, sitemap and robots refresh; redirect map for PAS and old routes.
- Every product visual labelled "Product preview / in development"; gallery relabelled as an illustrative sample.
- Accessibility pass to WCAG 2.2 AA on marketing pages.
- **Gate:** no CTA leads to a dead flow, and no claim exceeds what the product does.

### Weeks 3 to 4 (24 Nov to 5 Dec): product phase 1, beta core
- Invitation and approval, sign in, password reset, session handling.
- Workspace creation and isolation.
- Professional profile inputs and the curated public page template, with preview, publish, unpublish and copy link.
- **Gate:** a new invite becomes a live public profile that works on a phone, and one workspace cannot read another.

### Weeks 5 to 6 (8 to 19 Dec): product phase 2, property core
- Intake by paste, form and files; supported types and size limits stated honestly.
- Extraction with per-field source, timestamp and approval state; conflict queue; unknowns preserved.
- Property workspace tabs, statuses, media privacy, duplicate-as-draft.
- Basic map pin with an approximate label and a working fallback.
- **Gate:** text plus attachments produces an accurate record, corrected facts survive a reload, and no contradiction resolves silently.

### Weeks 7 to 8 (22 Dec to 9 Jan): product phase 3, publication
- Property page template, gallery, facts, public documents, inquiry route.
- Deal sheet, buyer summary and captions generated from the approved record, with regenerate and restore.
- Publish, unpublish, archive, share panel, draft-link prohibition.
- **Gate:** a published page opens anonymously on mobile, an unpublished one leaks nothing, and private files stay private.

### Week 9 (12 to 16 Jan): product phase 4, feedback
- Inquiry capture with consent and rate limiting; owner notification; read and archive only.
- Analytics dashboard: site views, property views, card clicks, document clicks, inquiries, view-to-inquiry.
- **Gate:** an inquiry lands in the right workspace once, and two properties never mix events.

### Week 10 (19 to 23 Jan): phase 5, release gate
- Run the 25 negative scenarios from the specification, plus tenant isolation, permission and publication-state tests.
- Security review of file access and signed URLs.
- Copy audit: every published statement re-checked against the build.
- Rehearse the demo end to end with a real property.
- **Gate:** the owner signs off on a live walkthrough, not on screenshots.

### Weeks 11 to 12 (26 Jan to 6 Feb): cohort one
- Invite five to eight beta users across the four roles.
- Onboarding calls, instrumented events, weekly fix cycle.
- Decide the public launch question with real usage data, not enthusiasm.

**Cutline if time slips:** ship one impeccable path (invite, site draft, property intake, review, publish, share, inquiry, analytics) and postpone voice/context, team roles and section ordering. Never trade privacy or publication accuracy for secondary features.

---

## 8. Decisions log

| ID | Decision | Owner | Needed by | Recommendation |
| --- | --- | --- | --- | --- |
| D1 | Masterbrand versus product brand in the header | Daniel | Week 1 | ORVN Labs masterbrand, LAREI product |
| D2 | PAS disposition | Daniel | Week 1 | Secondary page plus archive note, redirects kept |
| D3 | Final product name | Daniel | Week 1 | Keep LAREI for beta, avoid domain and print investment until confirmed |
| D4 | Public URL architecture | Daniel plus build | Week 3 | Path-based `larei.orvnlabs.com/{slug}` and `/{slug}/deals/{property}` |
| D5 | AI vendor and data processing | Daniel | Week 3 | Choose after privacy, retention and prompt-isolation review; no direct ChatGPT account connection |
| D6 | Map provider and label policy | Build | Week 5 | Geocode plus "Approximate location"; no polygons |
| D7 | Support mailbox, entity and jurisdiction | Daniel | Week 1 | Required before counsel review and before accepting accounts |
| D8 | Beta terms wording | Daniel | Week 2 | "No card required during beta, pricing not announced" |
| D9 | Public page indexability in beta | Daniel | Week 8 | Default noindex, opt-in per property later |
| D10 | Currency and field dictionary | Daniel | Week 5 | Decide naira versus multi-currency; decide APN versus plot number; the spec currently mixes US and Nigerian conventions |
| D11 | File types and size limits | Build | Week 5 | Publish the list in the UI and honour it |
| D12 | PDF method | Build | Week 7 | Browser print-to-PDF is acceptable only if the layout is production quality |

---

## 9. Measurement

Track only what can be acted on, and say plainly what a number does not mean.

| Event | Where | Why |
| --- | --- | --- |
| `cta_click` with placement | Hero, header, mid-page, footer | Distinguish which argument persuades |
| `product_view` | `/product` | Interest after the pitch |
| `workflow_depth` | `/how-it-works` scroll markers | Whether the process explains itself |
| `application_start` / `application_submit` | `/early-access` | Form friction |
| `invitation_sent` / `accepted` | Product | Whether approved demand activates |
| `site_published` | Product | First real outcome |
| `property_published` | Product | Second real outcome |
| `inquiry_submitted` | Public property page | Only signal that matters to the operator |

Beta success is judged on applications that match the four target roles and on whether an accepted user publishes a site and a property within a week. Page views are not evidence of demand, and the site should never imply otherwise.

---

## 10. Launch checklist

Grouped from the brief's final section, with the current status called out.

**Brand and structure**
- [ ] D1 applied everywhere (header, footer, titles, OG, email).
- [ ] PAS decision applied and documented.
- [ ] Nav and footer match the approved list.
- [ ] Top-level `/privacy` and `/terms` exist, with `/legal/*` still reachable.

**Copy**
- [ ] Every page uses approved copy, with deviations recorded in this file.
- [ ] FAQ contains the 21 approved answers, none of them describing unshipped behaviour.
- [ ] Error, empty and transactional copy implemented.
- [ ] No em-dash-heavy, invented or promotional phrasing substituted for the approved text.

**Honesty**
- [ ] Every product visual labelled prototype or live.
- [ ] Sample properties labelled illustrative, with no invented client names.
- [ ] No pricing, adoption, testimonial or performance claim anywhere.
- [ ] AI limitations stated on the pages where AI is described.

**Function**
- [ ] Early-access submissions reach a review queue and a notification.
- [ ] Sign-in, reset and invitation flows work, or sign-in is not advertised at all.
- [ ] Published pages open without an account; unpublished pages leak nothing.
- [ ] Private files are protected by authorisation, not by hidden links.

**Quality**
- [ ] WCAG 2.2 AA audit complete, keyboard paths tested.
- [ ] Mobile, tablet and desktop QA on the five critical screens.
- [ ] Meta, canonical, OG image, sitemap, robots and redirects verified.
- [ ] Analytics events verified with consent, and the dashboard numbers match the raw events.
- [ ] Product owner signs off on a live demonstration.

---

## 11. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Site promises features the product lacks | High | High | Copy-to-build claim review at each phase gate; the "in development" label is mandatory |
| Early access collects nothing | Certain today | High | Week 2 plumbing is a blocker, not a task |
| Sign-in looks real but is not | Certain today | Medium | Hide or label it until auth exists |
| PAS backlinks and rankings lost | Medium | Medium | Explicit redirect map, archive page rather than deletion |
| Legal policies do not match behaviour | Medium | High | Write from the implemented event list, counsel sign-off before accounts |
| Tenant data leak | Low | Severe | Isolation tests, signed file access, publication-state tests |
| AI introduces a false claim into buyer copy | Medium | High | Facts traceable to approved fields; generated text cannot alter facts; independent-verification disclaimer |
| Renaming LAREI after launch | Medium | Medium | D3 decision early |
| Timeline pressure cuts QA | High | High | Protect the 25-scenario gate; cut scope, not testing |

---

## 12. What happens this week

1. **Daniel:** decide D1, D2, D3, D7. Four answers, one paragraph each.
2. **Build:** install approved copy on the homepage first, then the four other marketing pages. No design changes during this pass.
3. **Build:** wire the early-access form to a queue and an email notification, since that is the site's only conversion.
4. **Daniel:** send the legal drafts and a plain description of what the product stores to counsel.
5. **Both:** agree the claim review rule in writing: nothing goes on the site unless the corresponding behaviour exists or is labelled as in development.

Once those five are done, the site can honestly carry the beta.
