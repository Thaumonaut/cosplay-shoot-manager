ALTER TABLE "locations" ADD COLUMN "place_id" text;--> statement-breakpoint
ALTER TABLE "shoots" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "shoots" ADD COLUMN "time" text;--> statement-breakpoint
ALTER TABLE "shoots" ADD COLUMN "reminder_time" timestamp;--> statement-breakpoint
ALTER TABLE "shoots" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "shoots" ADD COLUMN "docs_id" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "active_team_id" varchar;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_active_team_id_teams_id_fk" FOREIGN KEY ("active_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;