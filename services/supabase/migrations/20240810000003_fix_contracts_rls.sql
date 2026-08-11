-- Fix Contracts RLS to Filter by Organization
-- Users should only see contracts from projects in their organization

BEGIN;

-- Drop existing contract policies
DROP POLICY IF EXISTS "Users can view contracts for their projects" ON public.contracts;
DROP POLICY IF EXISTS "Users can create contracts for their projects" ON public.contracts;
DROP POLICY IF EXISTS "Users can update contracts for their projects" ON public.contracts;
DROP POLICY IF EXISTS "Users can delete contracts for their projects" ON public.contracts;

-- Create new policies that properly filter by organization through projects
CREATE POLICY "Users can view contracts in their organization"
  ON public.contracts FOR SELECT
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can create contracts in their organization"
  ON public.contracts FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can update contracts in their organization"
  ON public.contracts FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contracts in their organization"
  ON public.contracts FOR DELETE
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

COMMIT;
