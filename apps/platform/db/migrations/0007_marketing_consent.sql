-- 0007_marketing_consent: early-access consent split + unsubscribe suppression list (PRD §19.4)
--
-- Single ALTER per column, IF EXISTS guards deliberately absent so a partial application fails
-- loudly in development rather than silently diverging. Additive only — no rewrites.
-- Apply with: npm run db:migrate (staging first, then production).

ALTER TABLE "beta_applications"
  ADD COLUMN "marketing_consent" boolean DEFAULT false NOT NULL;
ALTER TABLE "beta_applications"
  ADD COLUMN "marketing_consent_at" timestamptz;
ALTER TABLE "beta_applications"
  ADD COLUMN "consent_version" text;

-- Existing rows pre-date the split: mark the wording version honestly instead of backdating consent.
UPDATE "beta_applications" SET "consent_version" = 'pre-2026-11-13' WHERE "consent_version" IS NULL;

CREATE TABLE IF NOT EXISTS "marketing_suppressions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "reason" text DEFAULT 'unsubscribe' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "marketing_suppressions_email_key" ON "marketing_suppressions" ("email");
