-- Backfill team_id for existing shoots without a team
UPDATE "shoots" 
SET "team_id" = (
  SELECT "team_id" 
  FROM "team_members" 
  WHERE "team_members"."user_id" = "shoots"."user_id" 
  LIMIT 1
)
WHERE "team_id" IS NULL;

-- Now make team_id NOT NULL
ALTER TABLE "shoots" ALTER COLUMN "team_id" SET NOT NULL;