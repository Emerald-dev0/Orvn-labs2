# AGENTS.md

Rules for any AI agent working in this repository. Read this before making changes.

## 1. What the product is, and where the code lives

- The product is **ORREI** (company: ORVN Labs). The live app is `apps/platform` (Next.js App Router).
- The source of truth for **what** is built is `docs/PRD.md` (v1.1, 2026-11-13). Requirement IDs
  (`AUTH-01`…`SYS-01`), acceptance tests (`AT-01`…`AT-23`) and decisions (`D01`…`D18`) come from it.
  The Drive originals are Documents 02, 03, 04, 06, 07, 08 and 10 (see PRD §0.2). Where anything in
  this repository and the PRD disagree, **the PRD wins** (PRD conflict rule); raise it in the PR
  rather than silently reconciling.
- The plan is `docs/ROADMAP.md` (reconciled to the PRD 2026-11-13). Phases Phase 0–5 and gates G0–G4
  are defined there. It is the only roadmap to follow. The former root `ROADMAP.md` was deleted on
  2026-11-13. Do not recreate it.
- `archive/` holds the retired Vite app (`src/`, `api/`, `supabase/`) and `docs/source/` holds the
  retired LAREI-era handoff documents. Do not extend or copy from either. Nothing in `apps/platform`
  depends on them. See `docs/legacy-routes.md`.
- Operational docs: `docs/env-setup.md`, `docs/neon-setup.md`, `docs/mail-cutover.md`,
  `docs/infrastructure.md`, `docs/r2-setup.md`, `docs/SECURITY.md`. Vendor choices are permitted
  only under PRD §20.3 / D16 (managed relational DB with point-in-time recovery, S3-compatible
  storage with signed expiring URLs, transactional email with bounce/complaint webhooks, error
  monitoring with request-ID correlation, separate staging and production, managed secrets, tested
  restore).
- Build failures, broken flows, missing states and quality issues are defects to fix, not notes to
  record. Triage order: security/data-loss, then broken user paths, then claims that outrun the
  product, then polish (PRD §0.6).

## 2. Every phase has a frontend and a backend

A phase is not done until **both** halves are built and verified:

- **Frontend:** the screens a person uses, with the empty, loading and error states.
- **Backend:** the data model and migrations, auth and permission checks, server actions or API routes, and
  the emails or jobs behind them.

Rules that follow from this:

- A roadmap entry for a phase lists both halves. Mark a step done only when its PRD acceptance test
  (`AT-*`) passes on a deployment and the evidence is recorded.
- A phase delivered as only a screen, or only an API, is **incomplete**. Say so in the PR and in the roadmap.
- Do not mark a phase done from a unit test alone. Check the path on the live site or on a test deployment.
- Every ticket derived from the PRD carries: requirement ID; release label; user role; screen ID;
  expected primary action; field IDs (PRD §14); permissions; success and failure states; tracking
  event; test ID; link to a representative reference (PRD §22.3). Feature interpretation by
  screenshot alone is prohibited.

## 3. Claims must match the product

- No marketing claim may appear on the site before the product behaviour exists.
- Anything not yet built carries the "in development" label, or the PRD §19 wording for that exact
  claim ("designed to", "illustrative", "product concept"). When in doubt, use PRD §19 copy verbatim.
- The forbidden phrases and their substitutes are listed in PRD §6.1; the page-by-page required copy is
  in PRD §19.2. "Verified" without independent substantiation is never allowed (PRD §6, §14.5).

## 4. Security and secrets

- Never commit secrets. `.env.local` and `.env*.local` are git-ignored. Keys live in Vercel or `.env.local`.
- Never paste keys, tokens, or magic links into chat, logs, commits or PR bodies.
- Tenant data is protected by row-level security. Do not add a query path that bypasses `withUserDb` or the
  tenant role without a note in the PR explaining why.

## 5. Branches

- Use only the branch the session assigns (`arena/<id>-orvn-labs2`). Do not create, rename or push other branches.
- Push only to the current branch: `git push origin <branch>`.

## 6. Commits

- Subject: `<area>: <imperative summary>`, lowercase area, under 72 characters, no full stop.
  Areas used so far: `auth`, `email`, `db`, `platform`, `admin`, `roadmap`, `docs`, `ci`, `mail:test`.
  Example: `email: bare MAIL_FROM, Lagos times in email`.
- Body (when the change needs one): what changed and **why**, in plain sentences. Name the decision if one was made.
- One logical change per commit. Do not mix a roadmap update into a code fix unless they are the same change.

## 7. Pull requests

- Title: same form as a commit subject.
- Open with `gh pr create --base main --head <branch> --title "..." --body-file <file>`.
- The body has four sections: **What this changes**, **Checks** (what you ran and what you did not), **Test plan**
  (steps a person can follow on the live site), and **Open decisions** (anything not settled).
- Do not merge a PR unless the user asks. When asked, merge with `gh pr merge <number> --merge` using the explicit number.

## 8. Checks before opening a PR

Run from `apps/platform`:

```
npm ci
npm run typecheck
npm test
npm run build
```

CI (`.github/workflows/ci.yml`) runs the same. If you change a script or a migration, also run `npm run db:status`
against the database you intend to change, and confirm which database it reports.

## 9. Roadmap and document upkeep

- When a step's status changes, update `docs/ROADMAP.md` in the same PR, with the evidence (the command
  output, message id or screenshot reference). A stale roadmap is a bug.
- Mark a phase closed only when the founder says so, and list any step still open as a named exception.
- If a change adds, removes or renames a field ID, state enum or approved term, it needs a migration note
  in the PRD changelog (PRD §22.4, §23.3) and consistency updates across PRD §11, §14 and §17 — and the
  same IDs updated everywhere in the codebase in the same change.
- The PRD is the source of truth. You may not edit `docs/PRD.md` without the founder's instruction; you
  may always *cite* it. If you find what looks like an error in the PRD, stop and flag it in the PR
  instead of editing around it.
