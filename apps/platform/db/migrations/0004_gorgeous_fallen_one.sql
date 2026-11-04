CREATE TABLE "beta_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"role" text,
	"markets" text,
	"volume" text,
	"current_tools" text,
	"frustration" text,
	"website" text,
	"consent" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"source" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "beta_applications_email_key" ON "beta_applications" USING btree ("email");