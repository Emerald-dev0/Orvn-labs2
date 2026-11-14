# Acceptance results — ORREI Phase 0

Record each `AT-*` result (pass/fail + evidence link) when a run happens. Staging runs happen with the founder watching (gate G0). Nothing here may claim a pass that was not demonstrated.

**Environment key:** `unit` = vitest contract/unit level (no network, no database). `staging` = live staging run with evidence. `pending` = not yet demonstrated.

| AT | Requirement | Result | Evidence / date |
|---|---|---|---|
| AT-06 | Conflict surfaced ($480,000 vs $465,000) with both sources; not auto-resolved | **unit: pass** — `test/extract.test.ts` (price disagreement flagged with both values; `$480,000` ≡ `480000` comparison). **staging: pending** | `8efd9f3`, 2026-11-13 |
| AT-07 | Malicious attachment text treated as data, not command | **unit: pass** — notes delimited in prompt; publish/verify instruction text yields no executable path and no candidates beyond the allowlist; every candidate must carry a verbatim snippet. **staging: pending** | `8efd9f3`, 2026-11-13 |
| AT-08 | AI outage → user continues manually | **unit: pass** (not_configured / provider-failure paths return "You can continue entering details manually." with nothing written). **staging: pending** | `8efd9f3`, 2026-11-13 |
| AT-01…AT-05, AT-09…AT-23 | per PRD §18 | **pending** | — |

Reminders that keep this honest:

- A unit pass means the rule holds in isolation; it is not an end-to-end demonstration on a deployed site.
- AI-01 as shipped is **paste-notes only**. Document (PDF/JPEG/PNG) ingestion is not built; do not demo it as if it exists.
- AT-06 conflict handling ships with default resolution "keep" — the record is never silently overwritten.
