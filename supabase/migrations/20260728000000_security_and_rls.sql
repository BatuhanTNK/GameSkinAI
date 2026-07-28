-- GameSkinAI Supabase Schema & Security Migration
-- Created: 2026-07-28
-- Enables Row Level Security (RLS) and defines secure policies for conversions and storage.

-- 1. Create conversions table if not exists
CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_slug TEXT NOT NULL,
  theme_label TEXT NOT NULL,
  original_image_url TEXT,
  result_image_url TEXT,
  result_description TEXT,
  status TEXT DEFAULT 'done',
  is_public BOOLEAN DEFAULT false,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create themes table if not exists
CREATE TABLE IF NOT EXISTS public.themes (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  bgGradient TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for conversions
-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Users can read own conversions" ON public.conversions;
DROP POLICY IF EXISTS "Anyone can read public conversions" ON public.conversions;
DROP POLICY IF EXISTS "Users can insert own conversions" ON public.conversions;
DROP POLICY IF EXISTS "Users can update own conversions" ON public.conversions;
DROP POLICY IF EXISTS "Users can delete own conversions" ON public.conversions;

-- Select policy: User can read their own conversions OR any public conversion
CREATE POLICY "Users can read own conversions"
  ON public.conversions FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- Insert policy: Authenticated users can insert conversions with their own user_id
CREATE POLICY "Users can insert own conversions"
  ON public.conversions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update policy: Users can only update their own conversions
CREATE POLICY "Users can update own conversions"
  ON public.conversions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete policy: Users can only delete their own conversions
CREATE POLICY "Users can delete own conversions"
  ON public.conversions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for themes
DROP POLICY IF EXISTS "Anyone can read active themes" ON public.themes;
CREATE POLICY "Anyone can read active themes"
  ON public.themes FOR SELECT
  USING (active = true);

-- 6. Storage Bucket Policy Instructions
-- Ensure 'conversions' storage bucket exists and policies are applied:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('conversions', 'conversions', false) ON CONFLICT DO NOTHING;
