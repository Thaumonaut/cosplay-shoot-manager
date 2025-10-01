-- Add duration_minutes column to shoots table
ALTER TABLE shoots ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
