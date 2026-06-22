-- Run this in your Supabase SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  framer_url TEXT NOT NULL DEFAULT '',
  custom_domain TEXT,
  foldaa_subdomain TEXT NOT NULL UNIQUE,
  theme_color TEXT NOT NULL DEFAULT '#6366f1',
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  display_mode TEXT NOT NULL DEFAULT 'standalone'
    CHECK (display_mode IN ('standalone','fullscreen','minimal-ui','browser')),
  start_url TEXT NOT NULL DEFAULT '/',
  offline_support BOOLEAN NOT NULL DEFAULT true,
  install_prompt BOOLEAN NOT NULL DEFAULT true,
  splash_screen BOOLEAN NOT NULL DEFAULT false,
  auto_deploy BOOLEAN NOT NULL DEFAULT true,
  icon_url TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','building')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Deploy logs table (optional, for history)
CREATE TABLE IF NOT EXISTS public.deploy_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success','failed','building')),
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deploy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deploy logs"
  ON public.deploy_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );
