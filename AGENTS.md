# AGENTS.md

Rules for any AI agent working in this repository. Read this before making changes.

## 1. What the product is, and where the code lives

- The product is **ORREI** (company: ORVN Labs). The live app is `apps/platform` (Next.js App Router).
- The plan is `docs/ROADMAP.md`. Phases and Stage 0 are defined there. It is the only roadmap to follow.
  The root `ROADMAP.md` is an older product-spec record with different phase numbers. Do not use it for status.
- `archive/` holds the retired Vite app (`src/`, `api/`, `supabase/`). Do not extend it. Nothing in `apps/platform` depends on it.
  See `docs/legacy-routes.md`.
- Operational docs: `docs/env-setup.md`, `docs/neon-setup.md`, `docs/mail-cutover.md`, `docs/SECURITY.md`.

## 2. Every phase has a frontend and a backend

A phase is not done until **both** halves are built and verified:

- **Frontend:** the screens a person uses, with the empty, loading and error states.
- **Backend:** the data model and migrations, auth and permission checks, server actions or API routes, and
  the emails or jobs behind them.

Rules that follow from this:

- A roadmap entry for a phase lists both halves. Mark a step done only when its verify steps have passed.
- A phase delivered as only a screen, or only an API, is **incomplete**. Say so in the PR and in the roadmap.
- Do not mark a phase done from a unit test alone. Check the path on the live site or on a test deployment.

## 3. Claims must match the product

- No marketing claim may appear on the site before the product behaviour exists.
- Anything not yet built carries the "in development" label.

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

## 9. Roadmap upkeep

- When a step's status changes, update `docs/ROADMAP.md` in the same PR, with the evidence (the command output,
  message id or screenshot reference). A stale roadmap is a bug.
- Mark a phase closed only when the founder says so, and list any step still open as a named exception.
