-- PRD compliance (2026-11-13): D03 property types, D07 location disclosure, D18 file sizes.
-- Hand-managed: the property_type enum is remapped value by value (Text round trip) so no row
-- is dropped or truncated. 'vacant_land' → 'residential_land', 'residential' → 'SFR',
-- 'package'/'project' → 'other' (D03: those categories are not offered in V1).

-- 1. property_type: remap enum values
ALTER TABLE "properties" ALTER COLUMN "property_type" TYPE text USING "property_type"::text;
--> statement-breakpoint
UPDATE "properties" SET "property_type" = CASE
  WHEN "property_type" = 'vacant_land' THEN 'residential_land'
  WHEN "property_type" = 'residential' THEN 'SFR'
  ELSE 'other'
END;
--> statement-breakpoint
DROP TYPE "public"."property_type";
--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('residential_land', 'SFR', 'duplex', 'multifamily', 'other');
--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "property_type" TYPE "public"."property_type" USING "property_type"::"public"."property_type";
--> statement-breakpoint

-- 2. D07 location disclosure: three levels per property, default area-only; plus ZIP for area-level output
CREATE TYPE "public"."location_disclosure" AS ENUM('exact', 'street', 'area');
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "location_disclosure" "public"."location_disclosure" DEFAULT 'area' NOT NULL;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "postal_code" text;
--> statement-breakpoint
ALTER TABLE "properties" DROP COLUMN "address_visible";
--> statement-breakpoint

-- 3. D18: track stored bytes per file for the 500 MB per-property cap
ALTER TABLE "property_media" ADD COLUMN "bytes" integer;
