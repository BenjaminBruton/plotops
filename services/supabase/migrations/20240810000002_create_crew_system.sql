-- Create comprehensive crew management system

-- Create crew departments enum
CREATE TYPE public.crew_department AS ENUM (
  'camera',
  'sound',
  'grip',
  'electric',
  'art',
  'wardrobe',
  'makeup',
  'props',
  'production',
  'post_production',
  'other'
);

-- Create crew members table (distinct from cast/characters)
CREATE TABLE IF NOT EXISTS public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_profile_id UUID REFERENCES public.user_profiles(id),
  
  -- Personal info (can be external crew not in org)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Crew details
  department public.crew_department NOT NULL,
  position TEXT NOT NULL, -- e.g., "Director of Photography", "1st AC", "Gaffer"
  rate_type TEXT CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'flat')),
  rate_amount DECIMAL(10, 2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'declined')),
  start_date DATE,
  end_date DATE,
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create crew_scene assignments (which crew needed for which scenes)
CREATE TABLE IF NOT EXISTS public.crew_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(crew_member_id, scene_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crew_members_project ON public.crew_members(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_department ON public.crew_members(department);
CREATE INDEX IF NOT EXISTS idx_crew_members_user ON public.crew_members(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_crew_scenes_crew ON public.crew_scenes(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_scenes_scene ON public.crew_scenes(scene_id);

-- RLS Policies
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_scenes ENABLE ROW LEVEL SECURITY;

-- Crew members: Users can view/manage crew for their org's projects
CREATE POLICY "Users can view crew for their org projects"
  ON public.crew_members FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can create crew for their org projects"
  ON public.crew_members FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can update crew for their org projects"
  ON public.crew_members FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete crew for their org projects"
  ON public.crew_members FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

-- Crew scenes: Similar RLS
CREATE POLICY "Users can view crew scenes for their org"
  ON public.crew_scenes FOR SELECT
  USING (
    scene_id IN (
      SELECT s.id FROM public.scenes s
      INNER JOIN public.projects p ON s.project_id = p.id
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage crew scenes for their org"
  ON public.crew_scenes FOR ALL
  USING (
    scene_id IN (
      SELECT s.id FROM public.scenes s
      INNER JOIN public.projects p ON s.project_id = p.id
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

COMMENT ON TABLE public.crew_members IS 'Production crew members assigned to projects';
COMMENT ON TABLE public.crew_scenes IS 'Links crew members to specific scenes they are needed for';
COMMENT ON COLUMN public.crew_members.user_profile_id IS 'Optional link to org member, null for external crew';
COMMENT ON COLUMN public.crew_members.department IS 'Production department (camera, sound, grip, etc.)';
COMMENT ON COLUMN public.crew_members.position IS 'Specific job title (DP, 1st AC, Gaffer, etc.)';
