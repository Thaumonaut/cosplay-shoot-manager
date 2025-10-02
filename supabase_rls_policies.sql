-- Row Level Security (RLS) Policies for Team-Scoped Access
-- Run this in your Supabase SQL Editor after creating the tables

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE props ENABLE ROW LEVEL SECURITY;
ALTER TABLE costume_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_costumes ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's team ID
CREATE OR REPLACE FUNCTION get_user_team_id(user_uuid TEXT)
RETURNS VARCHAR AS $$
  SELECT team_id FROM team_members WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Teams policies
CREATE POLICY "Users can view their own team"
  ON teams FOR SELECT
  USING (id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners can update their team"
  ON teams FOR UPDATE
  USING (id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()::TEXT AND role = 'owner'
  ));

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid()::TEXT);

-- Team members policies
CREATE POLICY "Users can view team members in their team"
  ON team_members FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can add members"
  ON team_members FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()::TEXT AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Team owners and admins can update members"
  ON team_members FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()::TEXT AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Team owners can delete members"
  ON team_members FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()::TEXT AND role = 'owner'
  ));

-- Team invites policies
CREATE POLICY "Users can view invites for their team"
  ON team_invites FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can create invites"
  ON team_invites FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid()::TEXT AND role IN ('owner', 'admin')
  ));

-- Personnel policies (team-scoped)
CREATE POLICY "Users can view personnel in their team"
  ON personnel FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can manage personnel"
  ON personnel FOR ALL
  USING (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = personnel.team_id 
    AND role IN ('owner', 'admin')
  ));

-- Equipment policies (team-scoped)
CREATE POLICY "Users can view equipment in their team"
  ON equipment FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can manage equipment"
  ON equipment FOR ALL
  USING (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = equipment.team_id 
    AND role IN ('owner', 'admin')
  ));

-- Locations policies (team-scoped)
CREATE POLICY "Users can view locations in their team"
  ON locations FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can manage locations"
  ON locations FOR ALL
  USING (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = locations.team_id 
    AND role IN ('owner', 'admin')
  ));

-- Props policies (team-scoped)
CREATE POLICY "Users can view props in their team"
  ON props FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can manage props"
  ON props FOR ALL
  USING (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = props.team_id 
    AND role IN ('owner', 'admin')
  ));

-- Costume progress policies (team-scoped)
CREATE POLICY "Users can view costumes in their team"
  ON costume_progress FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can manage costumes"
  ON costume_progress FOR ALL
  USING (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = costume_progress.team_id 
    AND role IN ('owner', 'admin')
  ));

-- Shoots policies (team-scoped)
CREATE POLICY "Users can view shoots in their team"
  ON shoots FOR SELECT
  USING (team_id = get_user_team_id(auth.uid()::TEXT));

CREATE POLICY "Team owners and admins can create shoots"
  ON shoots FOR INSERT
  WITH CHECK (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = shoots.team_id 
    AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Team owners and admins can update shoots"
  ON shoots FOR UPDATE
  USING (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = shoots.team_id 
    AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Team owners and admins can delete shoots"
  ON shoots FOR DELETE
  USING (team_id = get_user_team_id(auth.uid()::TEXT) AND EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = auth.uid()::TEXT 
    AND team_id = shoots.team_id 
    AND role IN ('owner', 'admin')
  ));

-- Shoot references policies (cascading from shoots)
CREATE POLICY "Users can view shoot references in their team"
  ON shoot_references FOR SELECT
  USING (shoot_id IN (
    SELECT id FROM shoots WHERE team_id = get_user_team_id(auth.uid()::TEXT)
  ));

CREATE POLICY "Team owners and admins can manage shoot references"
  ON shoot_references FOR ALL
  USING (shoot_id IN (
    SELECT s.id FROM shoots s
    JOIN team_members tm ON s.team_id = tm.team_id
    WHERE tm.user_id = auth.uid()::TEXT AND tm.role IN ('owner', 'admin')
  ));

-- Shoot participants policies
CREATE POLICY "Users can view shoot participants in their team"
  ON shoot_participants FOR SELECT
  USING (shoot_id IN (
    SELECT id FROM shoots WHERE team_id = get_user_team_id(auth.uid()::TEXT)
  ));

CREATE POLICY "Team owners and admins can manage shoot participants"
  ON shoot_participants FOR ALL
  USING (shoot_id IN (
    SELECT s.id FROM shoots s
    JOIN team_members tm ON s.team_id = tm.team_id
    WHERE tm.user_id = auth.uid()::TEXT AND tm.role IN ('owner', 'admin')
  ));

-- Shoot equipment policies
CREATE POLICY "Users can view shoot equipment in their team"
  ON shoot_equipment FOR SELECT
  USING (shoot_id IN (
    SELECT id FROM shoots WHERE team_id = get_user_team_id(auth.uid()::TEXT)
  ));

CREATE POLICY "Team owners and admins can manage shoot equipment"
  ON shoot_equipment FOR ALL
  USING (shoot_id IN (
    SELECT s.id FROM shoots s
    JOIN team_members tm ON s.team_id = tm.team_id
    WHERE tm.user_id = auth.uid()::TEXT AND tm.role IN ('owner', 'admin')
  ));

-- Shoot props policies
CREATE POLICY "Users can view shoot props in their team"
  ON shoot_props FOR SELECT
  USING (shoot_id IN (
    SELECT id FROM shoots WHERE team_id = get_user_team_id(auth.uid()::TEXT)
  ));

CREATE POLICY "Team owners and admins can manage shoot props"
  ON shoot_props FOR ALL
  USING (shoot_id IN (
    SELECT s.id FROM shoots s
    JOIN team_members tm ON s.team_id = tm.team_id
    WHERE tm.user_id = auth.uid()::TEXT AND tm.role IN ('owner', 'admin')
  ));

-- Shoot costumes policies
CREATE POLICY "Users can view shoot costumes in their team"
  ON shoot_costumes FOR SELECT
  USING (shoot_id IN (
    SELECT id FROM shoots WHERE team_id = get_user_team_id(auth.uid()::TEXT)
  ));

CREATE POLICY "Team owners and admins can manage shoot costumes"
  ON shoot_costumes FOR ALL
  USING (shoot_id IN (
    SELECT s.id FROM shoots s
    JOIN team_members tm ON s.team_id = tm.team_id
    WHERE tm.user_id = auth.uid()::TEXT AND tm.role IN ('owner', 'admin')
  ));
