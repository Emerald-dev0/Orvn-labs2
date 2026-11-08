# Neon, from an empty account to a working database

Neon is hosted Postgres. Nothing to install, no server to keep alive. You need two strings out of it
and three commands in. Twenty minutes, once.

If you would rather skip the reading: do §1–§4, then run `npm run db:status` and fix whatever it marks
`MISS`. That script exists so you never have to guess which step you are on.

---

## 1. Create the project

1. Go to **https://console.neon.tech** and sign up (GitHub or Google is fine, no card).
2. **Create project**:
   - **Name**: `orrei`
   - **Postgres version**: leave the default (17 or newer)
   - **Region**: **AWS eu-west-2 (London)**. You are in Abuja and London has the best routes to West
     Africa, so this is the lowest-latency choice for you. If you later move the Vercel functions to
     another region, put the database in the same one — matching regions matters more than the
     specific region.
3. Wait for the project to finish provisioning. You land on the project dashboard.

## 2. Copy the two connection strings

Click **Connect** (top of the dashboard). You get a modal with a connection string and a few toggles.

Copy **two** strings:

| In Neon | Goes into | Why |
| --- | --- | --- |
| **Pooled connection** (the host contains `-pooler`) | `DATABASE_URL` | the app is serverless; the pooler stops a burst of requests from exhausting Postgres connections |
| **Direct connection** (toggled off — no `-pooler`) | `DATABASE_URL_ADMIN` | migrations and role creation are happiest on a plain connection |

Use the **same role** for both — Neon's default `neondb_owner`. Do not create a second role.

> **The thing that confuses everyone, including the old copy of `.env.example`:** the two URLs are not
> "an app user and an owner user". The application roles (`orrei_app`, `orrei_public`) are created as
> `nologin` on purpose — you cannot connect as them, and you are not supposed to. The app connects as
> the owner and then **demotes itself** inside every transaction with `SET LOCAL ROLE orrei_app`
> (`lib/db/tenant.ts`). That is what makes row level security apply even though the connection is
> privileged. So: same user, same password, two hostnames.

The strings look like this, and you can see them in Neon under **Connect → Connection string**:

```
postgresql://neondb_owner:npg_XXXXXXXXXXXXXXXX@ep-cool-name-123456-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
postgresql://neondb_owner:npg_XXXXXXXXXXXXXXXX@ep-cool-name-123456.eu-west-2.aws.neon.tech/neondb?sslmode=require
                                                        ^^^^^^ pooled                          ^ no -pooler: direct
```

If the password shows as `[YOUR-PASSWORD]`, click the reveal/copy button — the copy button always
includes the real password.

## 3. Put them in the environment

Local:

```bash
cd apps/platform
cp .env.example .env.local
```

Open `.env.local` and set:

```bash
DATABASE_URL=postgresql://neondb_owner:...-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_ADMIN=postgresql://neondb_owner:...eu-west-2.aws.neon.tech/neondb?sslmode=require
```

`.env.local` is git-ignored. Never paste these into a file that gets committed, and never into a
message or a screenshot — the password is full access to the database.

Deployed: **Vercel → project → Settings → Environment Variables**, add both for *Production* and
*Preview*. A Vercel env var added after a deployment only applies to the next one — redeploy.

## 4. Create the tables, the roles, the policies

In `apps/platform`, in this order. Each one takes seconds.

```bash
npm run db:migrate    # creates the schema (tables, enums, indexes)
npm run db:policies   # creates orrei_app + orrei_public, grants, enables RLS
npm run db:status     # proves all of it
```

What each does:

- **`db:migrate`** — drizzle-kit applies `db/migrations` and records what it applied in
  `drizzle.__drizzle_migrations`. It connects with `DATABASE_URL`. The tables end up owned by
  `neondb_owner`.
- **`db:policies`** — runs `db/sql/policies.sql` with `DATABASE_URL_ADMIN`. It creates the two
  `nologin` roles, **grants them to whoever is connected** (`current_user`), grants table privileges,
  and installs the row level security policies. It is idempotent — re-run it after adding a table.
- **`db:status`** — read-only. Prints the verdict table in §5.

Both scripts are safe to re-run. If you run `db:policies` before `db:migrate`, it grants privileges on
tables that do not exist yet; run it again after migrating and the grants land.

## 5. Read the verdict

```
ok    connected          neondb_owner on neondb · Postgres 17.2
ok    role orrei_app     nologin, assumable by neondb_owner
ok    role orrei_public  nologin, assumable by neondb_owner
ok    migrations         3 applied
ok    tables             14 in public, 14 with row level security
ok    policies           22 defined
ok    early access       0 applications stored
```

Anything marked `MISS` prints the command that fixes it:

| Verdict | Means | Fix |
| --- | --- | --- |
| `role … missing` | policies never ran | `npm run db:policies` |
| `… cannot assume it` | policies ran as a *different* role than the one you connect with | use one Neon user for both URLs, re-run `npm run db:policies` |
| `no drizzle journal` | migrations never ran | `npm run db:migrate` |
| `none in public` | migrations ran, on another branch or database | check the string points at the same project and branch |
| `authentication failed` | truncated password, or a role without login | re-copy from Neon → Connect |
| `hostname does not resolve` | the string got cut when pasting | re-copy the whole line |
| `direct client connection to the pooler` | a migration ran against the pooled host | put the direct string in `DATABASE_URL_ADMIN` |

## 6. What "demo mode" means

With no `DATABASE_URL`, the app still builds and serves: real pages, sample rows, and writes that
answer honestly that they are not connected. In production the same condition is treated as a
misconfiguration — `missingProductionConfig()` lists what is absent and the app fails closed instead
of pretending. So a deployment with a forgotten env var shows a clear error, not a silent empty site.

## 7. Branches, and why not to use them yet

Neon can branch a database like git — useful for testing a migration against real data. It is also a
good way to migrate the wrong database. For now: one project, one branch (`main`), and use
`db:status` to confirm which one you are pointed at. Neon's dashboard shows the branch name next to
the connection string; if it does not say `main`, stop.

## 8. Costs and limits

The free tier is a real database, not a trial: a fraction of a vCPU, a storage cap, and it suspends
after a few minutes of inactivity — the first query after a quiet period is slow, then normal. That
cold start is why the pooler matters, and why the very first page load after a deploy may take a
second. Upgrade only when a real user complains about it, not before.

## 9. Checklist

```
[ ] Neon project created, region chosen, Postgres version noted
[ ] Pooled string → DATABASE_URL
[ ] Direct string → DATABASE_URL_ADMIN   (same user, same password)
[ ] .env.local written locally; both vars added in Vercel, then redeployed
[ ] npm run db:migrate
[ ] npm run db:policies
[ ] npm run db:status — no MISS lines
```
