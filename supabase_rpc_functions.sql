-- RPC Functions for Complex Queries
-- Run this in your Supabase SQL Editor

-- Get shoots with participant counts and first reference image
CREATE OR REPLACE FUNCTION get_user_shoots_with_counts(user_uuid TEXT)
RETURNS TABLE (
  id VARCHAR,
  team_id VARCHAR,
  user_id TEXT,
  title TEXT,
  status TEXT,
  date TIMESTAMP,
  duration_minutes INTEGER,
  location_id VARCHAR,
  location_notes TEXT,
  description TEXT,
  color TEXT,
  instagram_links TEXT[],
  calendar_event_id TEXT,
  calendar_event_url TEXT,
  docs_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  participant_count BIGINT,
  first_reference_url TEXT
) AS $$
  SELECT 
    s.*,
    COALESCE(COUNT(DISTINCT sp.id), 0) AS participant_count,
    (
      SELECT sr.url
      FROM shoot_references sr
      WHERE sr.shoot_id = s.id
      ORDER BY sr.created_at ASC
      LIMIT 1
    ) AS first_reference_url
  FROM shoots s
  LEFT JOIN shoot_participants sp ON s.id = sp.shoot_id
  WHERE s.user_id = user_uuid
  GROUP BY s.id
  ORDER BY s.created_at DESC;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get team shoots with participant counts and first reference image
CREATE OR REPLACE FUNCTION get_team_shoots_with_counts(p_team_id VARCHAR)
RETURNS TABLE (
  id VARCHAR,
  team_id VARCHAR,
  user_id TEXT,
  title TEXT,
  status TEXT,
  date TIMESTAMP,
  duration_minutes INTEGER,
  location_id VARCHAR,
  location_notes TEXT,
  description TEXT,
  color TEXT,
  instagram_links TEXT[],
  calendar_event_id TEXT,
  calendar_event_url TEXT,
  docs_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  participant_count BIGINT,
  first_reference_url TEXT
) AS $$
  SELECT 
    s.*,
    COALESCE(COUNT(DISTINCT sp.id), 0) AS participant_count,
    (
      SELECT sr.url
      FROM shoot_references sr
      WHERE sr.shoot_id = s.id
      ORDER BY sr.created_at ASC
      LIMIT 1
    ) AS first_reference_url
  FROM shoots s
  LEFT JOIN shoot_participants sp ON s.id = sp.shoot_id
  WHERE s.team_id = p_team_id
  GROUP BY s.id
  ORDER BY s.created_at DESC;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get shoot with all related data (participants, equipment, props, costumes, references)
CREATE OR REPLACE FUNCTION get_shoot_with_details(shoot_uuid VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'shoot', (SELECT row_to_json(s.*) FROM shoots s WHERE s.id = shoot_uuid),
    'participants', (
      SELECT COALESCE(json_agg(sp.*), '[]'::json)
      FROM shoot_participants sp
      WHERE sp.shoot_id = shoot_uuid
    ),
    'equipment', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', se.id,
        'shoot_id', se.shoot_id,
        'equipment_id', se.equipment_id,
        'quantity', se.quantity,
        'created_at', se.created_at,
        'equipment', e.*
      )), '[]'::json)
      FROM shoot_equipment se
      LEFT JOIN equipment e ON se.equipment_id = e.id
      WHERE se.shoot_id = shoot_uuid
    ),
    'props', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', spr.id,
        'shoot_id', spr.shoot_id,
        'prop_id', spr.prop_id,
        'created_at', spr.created_at,
        'prop', p.*
      )), '[]'::json)
      FROM shoot_props spr
      LEFT JOIN props p ON spr.prop_id = p.id
      WHERE spr.shoot_id = shoot_uuid
    ),
    'costumes', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', sc.id,
        'shoot_id', sc.shoot_id,
        'costume_id', sc.costume_id,
        'created_at', sc.created_at,
        'costume', c.*
      )), '[]'::json)
      FROM shoot_costumes sc
      LEFT JOIN costume_progress c ON sc.costume_id = c.id
      WHERE sc.shoot_id = shoot_uuid
    ),
    'references', (
      SELECT COALESCE(json_agg(sr.*), '[]'::json)
      FROM shoot_references sr
      WHERE sr.shoot_id = shoot_uuid
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update team for user (auto-onboarding)
CREATE OR REPLACE FUNCTION ensure_user_team(user_uuid TEXT, p_team_name TEXT DEFAULT NULL)
RETURNS TABLE (
  team_id VARCHAR,
  name TEXT,
  role TEXT
) AS $$
DECLARE
  existing_team_id VARCHAR;
  new_team_id VARCHAR;
  final_team_name TEXT;
BEGIN
  -- Check if user already has a team
  SELECT tm.team_id INTO existing_team_id
  FROM team_members tm
  WHERE tm.user_id = user_uuid
  LIMIT 1;
  
  IF existing_team_id IS NOT NULL THEN
    -- Return existing team
    RETURN QUERY
    SELECT t.id, t.name, tm.role
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = user_uuid
    LIMIT 1;
  ELSE
    -- Create new team
    final_team_name := COALESCE(p_team_name, 'My Team');
    
    INSERT INTO teams (name)
    VALUES (final_team_name)
    RETURNING id INTO new_team_id;
    
    -- Add user as owner
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (new_team_id, user_uuid, 'owner');
    
    -- Return new team
    RETURN QUERY
    SELECT new_team_id, final_team_name, 'owner'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
