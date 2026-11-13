# Archive: retired Vite app

These paths belong to the first version of the ORVN site, a Vite and React app. It has been retired.
The live product is `apps/platform` (Next.js).

- `archive/src/` — the Vite app's React source.
- `archive/api/` — its serverless functions (blog, newsletter, waitlist and calculator endpoints).
- `archive/supabase/` — its Supabase migration.
- `archive/index.html`, `archive/package.json`, `archive/vite.config.js`, `archive/tailwind.config.js`,
  `archive/postcss.config.js`, `archive/eslint.config.js`, `archive/package-lock.json` — its build.
- `archive/public/` — its static assets (images, manifest, sitemap, `pas/` diagrams).
- `archive/scripts/` — one-off Supabase/Mongo export and keep-alive scripts.
- `archive/.env.example` — the Supabase/Resend environment template for the retired app.

Nothing in `apps/platform` imports from this folder. Checked with a script that resolves every relative import.

These files are kept for reference only. Do not extend them. Anything worth keeping should be rebuilt in
`apps/platform` under the roadmap. Git history keeps the original paths.
