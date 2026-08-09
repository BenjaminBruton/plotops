-- Create Public Casting Calls System
-- Allows projects to publish casting calls to the public job board

BEGIN;

-- ============================================================================
-- PUBLIC CASTING CALLS TABLE
-- ============================================================================

CREATE TABLE public.public_casting_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  description TEXT,
  logline TEXT,
  
  -- Production Details
  shooting_start_date DATE,
  shooting_end_date DATE,
  shooting_locations TEXT[], -- Array of location names
  
  -- Media
  logo_url TEXT,
  image_urls TEXT[], -- Array of image URLs
  
  -- Crew Positions Needed (as JSONB for flexibility)
  crew_positions JSONB DEFAULT '[]',  -- [{role: "PA", count: 2}, {role: "Grip", count: 3}]
  
  -- Characters Available for Casting
  character_ids UUID[], -- Array of character IDs from the characters table
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_public_casting_calls_project_id ON public.public_casting_calls(project_id);
CREATE INDEX idx_public_casting_calls_published ON public.public_casting_calls(is_published) WHERE is_published = true;
CREATE INDEX idx_public_casting_calls_published_at ON public.public_casting_calls(published_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.public_casting_calls ENABLE ROW LEVEL SECURITY;

-- Anyone can view published casting calls
CREATE POLICY "Anyone can view published casting calls"
ON public.public_casting_calls FOR SELECT
USING (is_published = true OR auth.uid() IS NOT NULL);

-- Only project team members can create casting calls
CREATE POLICY "Project team can create casting calls"
ON public.public_casting_calls FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE p.id = public_casting_calls.project_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- Only project team members can update their casting calls
CREATE POLICY "Project team can update casting calls"
ON public.public_casting_calls FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE p.id = public_casting_calls.project_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- Only project team members can delete their casting calls
CREATE POLICY "Project team can delete casting calls"
ON public.public_casting_calls FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE p.id = public_casting_calls.project_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'admin')
  )
);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_public_casting_calls_updated_at
  BEFORE UPDATE ON public.public_casting_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
