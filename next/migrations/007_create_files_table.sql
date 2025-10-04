-- Migration: Create files table for file upload system
-- This table stores metadata about uploaded files in Supabase Storage

CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    public_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_files_team_id ON files(team_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

-- Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see files from their own team
CREATE POLICY "Users can view team files" ON files
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM user_teams 
            WHERE user_id = auth.uid()
        )
    );

-- Users can upload files to their team
CREATE POLICY "Users can upload team files" ON files
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() 
        AND team_id IN (
            SELECT team_id FROM user_teams 
            WHERE user_id = auth.uid()
        )
    );

-- Users can delete files they uploaded
CREATE POLICY "Users can delete own files" ON files
    FOR DELETE USING (
        uploaded_by = auth.uid() 
        AND team_id IN (
            SELECT team_id FROM user_teams 
            WHERE user_id = auth.uid()
        )
    );

-- Create storage bucket for uploads if it doesn't exist
-- Note: This should be run in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage RLS policies
-- CREATE POLICY "Users can upload to team folder" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'uploads' 
--         AND auth.uid()::text = (storage.foldername(name))[2]
--     );

-- CREATE POLICY "Users can view team files" ON storage.objects
--     FOR SELECT USING (
--         bucket_id = 'uploads' 
--         AND (storage.foldername(name))[1] IN (
--             SELECT team_id::text FROM user_teams 
--             WHERE user_id = auth.uid()
--         )
--     );

-- CREATE POLICY "Users can delete own files" ON storage.objects
--     FOR DELETE USING (
--         bucket_id = 'uploads' 
--         AND auth.uid()::text = (storage.foldername(name))[2]
--     );