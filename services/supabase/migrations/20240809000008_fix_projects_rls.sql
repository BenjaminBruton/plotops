-- Fix Projects RLS to Filter by Organization
-- Users should only see projects from their own organization

BEGIN;

-- Drop existing project policies
DROP POLICY IF EXISTS "Users can view their organization's projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects in their organization" ON public.projects;
DROP POLICY IF EXISTS "Users can update their organization's projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their organization's projects" ON public.projects;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create new policies that properly filter by organization
CREATE POLICY "Users can view projects in their organization"
  ON public.projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their organization"
  ON public.projects FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects in their organization"
  ON public.projects FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projects in their organization"
  ON public.projects FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

COMMIT;
