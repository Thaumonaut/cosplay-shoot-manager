-- Cosplay Photo Shoot Tracker - Supabase Migration
-- Run this in your Supabase SQL Editor: Project Settings > SQL Editor > New Query

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE teams (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Team invites table
CREATE TABLE team_invites (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Personnel table
CREATE TABLE personnel (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Equipment table
CREATE TABLE equipment (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Locations table
CREATE TABLE locations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Props table
CREATE TABLE props (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Costume progress table
CREATE TABLE costume_progress (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  series_name TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  completion_percentage INTEGER DEFAULT 0,
  todos TEXT[],
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shoots table
CREATE TABLE shoots (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  team_id VARCHAR NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idea',
  date TIMESTAMP,
  duration_minutes INTEGER,
  location_id VARCHAR REFERENCES locations(id),
  location_notes TEXT,
  description TEXT,
  color TEXT,
  instagram_links TEXT[],
  calendar_event_id TEXT,
  calendar_event_url TEXT,
  docs_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shoot references table
CREATE TABLE shoot_references (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  shoot_id VARCHAR NOT NULL REFERENCES shoots(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shoot participants table
CREATE TABLE shoot_participants (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  shoot_id VARCHAR NOT NULL REFERENCES shoots(id) ON DELETE CASCADE,
  personnel_id VARCHAR REFERENCES personnel(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shoot equipment table
CREATE TABLE shoot_equipment (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  shoot_id VARCHAR NOT NULL REFERENCES shoots(id) ON DELETE CASCADE,
  equipment_id VARCHAR NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shoot props table
CREATE TABLE shoot_props (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  shoot_id VARCHAR NOT NULL REFERENCES shoots(id) ON DELETE CASCADE,
  prop_id VARCHAR NOT NULL REFERENCES props(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shoot costumes table
CREATE TABLE shoot_costumes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  shoot_id VARCHAR NOT NULL REFERENCES shoots(id) ON DELETE CASCADE,
  costume_id VARCHAR NOT NULL REFERENCES costume_progress(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_personnel_team_id ON personnel(team_id);
CREATE INDEX idx_equipment_team_id ON equipment(team_id);
CREATE INDEX idx_locations_team_id ON locations(team_id);
CREATE INDEX idx_props_team_id ON props(team_id);
CREATE INDEX idx_costume_progress_team_id ON costume_progress(team_id);
CREATE INDEX idx_shoots_team_id ON shoots(team_id);
CREATE INDEX idx_shoots_user_id ON shoots(user_id);
CREATE INDEX idx_shoot_references_shoot_id ON shoot_references(shoot_id);
CREATE INDEX idx_shoot_participants_shoot_id ON shoot_participants(shoot_id);
CREATE INDEX idx_shoot_equipment_shoot_id ON shoot_equipment(shoot_id);
CREATE INDEX idx_shoot_props_shoot_id ON shoot_props(shoot_id);
CREATE INDEX idx_shoot_costumes_shoot_id ON shoot_costumes(shoot_id);
