-- Migration: Add ribbon_state column to user_settings table
-- This migration adds the ribbon_state JSONB column to store ribbon preferences per user

-- Ensure user_settings table exists (create if it doesn't)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  ribbon_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add ribbon_state column if it doesn't exist
ALTER TABLE IF EXISTS public.user_settings
  ADD COLUMN IF NOT EXISTS ribbon_state JSONB DEFAULT '{}'::jsonb;

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON public.user_settings(user_id);

-- Add RLS (Row Level Security) policies if not already present
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own settings
CREATE POLICY IF NOT EXISTS "Users can read own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own settings
CREATE POLICY IF NOT EXISTS "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own settings
CREATE POLICY IF NOT EXISTS "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own settings
CREATE POLICY IF NOT EXISTS "Users can delete own settings" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
