# Archive: retired Vite app

These folders belong to the first version of the ORVN site, a Vite and React app. It has been retired.
The live product is `apps/platform` (Next.js).

- `archive/src/` — the Vite app's React source.
- `archive/api/` — its serverless functions (blog, newsletter, waitlist and calculator endpoints).
- `archive/supabase/` — its Supabase migration.

Nothing in `apps/platform` imports from this folder. Checked with a script that resolves every relative import.

These files are kept for reference only. Do not extend them. Anything worth keeping should be rebuilt in
`apps/platform` under the roadmap. Git history keeps the original paths.
