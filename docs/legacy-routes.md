> **Operations doc — current.** Route retirement implements PRD §19.6 (canonical host, `noindex` on private routes, no blanket redirects). PAS and LAREI artefacts are retired names (PRD §2/§3); redirects must never point old PAS URLs at a route that implies PAS still exists.

# Legacy routes

Every URL the previous site published is listed here, with where it goes now and why. The
redirects live in `apps/platform/next.config.mjs` and answer `308` (permanent), so search results
and old links carry over instead of landing on the 404.

Source of truth for the old URL set: the route table of the retired Vite app (`src/App.jsx` at the
repository root). That app is no longer deployed; the Next app in `apps/platform` serves the domain.

## Company and archived product material

| Old URL | Now | Why |
| --- | --- | --- |
| `/pas` | `/about` | The PAS product page was retired. `/about` explains the company and what exists. |
| `/pas/*` | `/about` | Same, for any sub-page that was linked. |
| `/test-pas` | `/about` | Internal test route that leaked into the sitemap. |
| `/thesis` | `/about` | Essay page retired; the company page carries the current position. |
| `/why-orvn` | `/about` | Merged into `/about`. |
| `/test` | `/` | Test route. |

## Policies

Several policies were split across five URLs and have been merged into two, with the same
commitments in fewer places.

| Old URL | Now |
| --- | --- |
| `/privacy` | `/legal/privacy` |
| `/legal/ai-disclosure` | `/legal/privacy` |
| `/legal/data-retention` | `/legal/privacy` |
| `/ai-call-disclosure` | `/legal/privacy` |
| `/terms` | `/legal/terms` |
| `/legal/acceptable-use` | `/legal/terms` |
| `/legal/fair-housing` | `/legal/terms` |
| `/fair-housing` | `/legal/terms` |

## Journals, calculators and lead magnets

None of these has a successor page. Rather than delete the URLs and lose whatever links exist,
each one points at the closest live page. Nothing claims to be the old page.

| Old URL | Now | Why |
| --- | --- | --- |
| `/blog` | `/about` | No journal is published. |
| `/blog/:slug` | `/about` | Same. |
| `/newsletter` | `/about` | No newsletter list is open. |
| `/resources` | `/about` | Resource library retired. |
| `/calculators` | `/product` | Calculators retired; `/product` explains what the platform does instead. |
| `/calculators/revenue` | `/product` | Same. |
| `/calculators/leakage` | `/product` | Same. |
| `/calculate` | `/product` | Same. |
| `/scorecard` | `/product` | Lead magnet retired. |
| `/lead-leakage-scorecard` | `/product` | Same. |
| `/pricing` | `/faq` | Pricing is not published, deliberately. The questions page explains why. |

## Auth and the frozen admin app

| Old URL | Now | Why |
| --- | --- | --- |
| `/login` | `/sign-in` | Renamed. |
| `/admin` | `/sign-in` | The Vite admin app is frozen and undeployed. |
| `/admin/*` | `/sign-in` | Same, including `/admin/blog/*`. |

## Checked

With the production build running locally, each row above was requested and returned `308` to the
destination listed. The destinations were then requested and returned `200`.

## Not redirected, on purpose

- `/dashboard`, `/properties`, `/website`, `/inquiries`, `/analytics`, `/settings` are
  authenticated surfaces and are `noindex` with `Cache-Control: private, no-store`.
- `/w/:username` and `/w/:username/p/:slug` are customer pages. They are not redirected anywhere and
  they never existed under the old site.
- Anything else falls through to the drawn 404.
