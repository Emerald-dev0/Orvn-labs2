# ORVN Labs — ORREI

The company is **ORVN Labs**; the product is **ORREI**, a controlled-access product for US real-estate
operators: one approved property record → buyer-ready materials (property page and printable deal
sheet) → controlled sharing → buyer inquiries, for a FL-concentrated beta.

**Source of truth for what is being built:** [`docs/PRD.md`](docs/PRD.md) (v1.1, 2026-11-13).
Where anything in this repository and the PRD disagree, **the PRD wins**. The requirement IDs
(`AUTH-01`…`SYS-01`), acceptance tests (`AT-01`…`AT-23`) and decisions (`D01`…`D18`) referenced
across the codebase all come from that document.

**Source of truth for the order of work:** [`docs/ROADMAP.md`](docs/ROADMAP.md) (reconciled to the
PRD 2026-11-13). Phases advance on evidence, not dates.

## Repository layout

| Path | What it is |
|---|---|
| `apps/platform/` | The product. Next.js (App Router) application: marketing site, invite-only operator workspace, public property/profile pages, admin console. TypeScript for product code. |
| `docs/PRD.md` | The product requirements document (founder-authored §0–12; §13–23 derived from the Drive source set). |
| `docs/ROADMAP.md` | The working plan. Requirement/test/decision IDs cite the PRD. |
| `docs/SECURITY.md` | The security model: tenancy, RLS, sessions, uploads. Read before touching auth or data paths. |
| `docs/env-setup.md`, `docs/neon-setup.md`, `docs/infrastructure.md`, `docs/r2-setup.md`, `docs/mail-cutover.md` | Operations guides. Vendor choices permitted by PRD §20.3 / D16 only. |
| `docs/legacy-routes.md` | Route retirements/redirects from the previous site (implements PRD §19.6). |
| `archive/` | The retired Vite app (PAS-era). Keep for reference; **do not extend**. |
| `docs/source/` | Retired LAREI-era source documents (Oct 2026). Provenance only; not in force. |

Operational entry points: `AGENTS.md` (rules for any AI agent working here), `docs/PRD.md` §22
(release gates), and the CI workflow (`.github/workflows/ci.yml`).

## Working here

1. Read `AGENTS.md` first.
2. Build order and gate logic: `docs/ROADMAP.md`. A step is done when its `AT-*` evidence is recorded
   against a deployment — not when code exists.
3. Checks before a PR (from `apps/platform/`): `npm ci && npm run typecheck && npm test && npm run build`.
4. Nothing in this repository is evidence of a deployed capability. Every claim on the public site must
   match a passing acceptance test (PRD §0.6, §6.1, §19).

Status: in development; Phase 0 (PRD §10) is the active phase. ORREI is in development; screens and
properties are illustrative; access is limited to approved beta users.
