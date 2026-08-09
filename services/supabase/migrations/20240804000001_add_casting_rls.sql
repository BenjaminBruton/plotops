-- Add RLS Policies for Casting Tables
-- Enables secure access to casting_calls, actors, auditions, and character_casting tables
-- Using PUBLIC schema

BEGIN;

-- ============================================================================
-- ENABLE RLS ON CASTING TABLES
-- ============================================================================

ALTER TABLE public.casting_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_casting ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CASTING CALLS POLICIES
-- ============================================================================

-- SELECT: Users can view casting calls for projects in their organization
CREATE POLICY "Users can view casting calls in their organization"
ON public.casting_calls FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE p.id = casting_calls.project_id
    AND up.id = auth.uid()
  )
);

-- INSERT: Producers, Casting Directors, and Admins can create casting calls
CREATE POLICY "Authorized users can create casting calls"
ON public.casting_calls FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE p.id = casting_calls.project_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- UPDATE: Producers, Casting Directors, and Admins can update casting calls
CREATE POLICY "Authorized users can update casting calls"
ON public.casting_calls FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE p.id = casting_calls.project_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- DELETE: Producers and Admins can delete casting calls
CREATE POLICY "Authorized users can delete casting calls"
ON public.casting_calls FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE p.id = casting_calls.project_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'admin')
  )
);

-- ============================================================================
-- ACTORS POLICIES
-- ============================================================================

-- SELECT: Anyone can view actors (for public casting calls)
CREATE POLICY "Anyone can view actors"
ON public.actors FOR SELECT
USING (true);

-- INSERT: Any authenticated user can create actor profiles
CREATE POLICY "Authenticated users can create actor profiles"
ON public.actors FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Casting directors, producers, and admins can update actor profiles
CREATE POLICY "Users can update actor profiles"
ON public.actors FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('casting_director', 'producer', 'admin')
  )
);

-- DELETE: Only admins can delete actor profiles
CREATE POLICY "Admins can delete actor profiles"
ON public.actors FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role = 'admin'
  )
);

-- ============================================================================
-- AUDITIONS POLICIES
-- ============================================================================

-- SELECT: Users can view auditions for projects in their organization
CREATE POLICY "Users can view auditions in their organization"
ON public.auditions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.casting_calls cc
    INNER JOIN public.projects p ON p.id = cc.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE cc.id = auditions.casting_call_id
    AND up.id = auth.uid()
  )
);

-- INSERT: Casting Directors, Producers, and Admins can create auditions
CREATE POLICY "Authorized users can create auditions"
ON public.auditions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.casting_calls cc
    INNER JOIN public.projects p ON p.id = cc.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE cc.id = auditions.casting_call_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- UPDATE: Casting Directors, Producers, and Admins can update auditions
CREATE POLICY "Authorized users can update auditions"
ON public.auditions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.casting_calls cc
    INNER JOIN public.projects p ON p.id = cc.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE cc.id = auditions.casting_call_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- DELETE: Producers and Admins can delete auditions
CREATE POLICY "Authorized users can delete auditions"
ON public.auditions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.casting_calls cc
    INNER JOIN public.projects p ON p.id = cc.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE cc.id = auditions.casting_call_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'admin')
  )
);

-- ============================================================================
-- CHARACTER CASTING POLICIES
-- ============================================================================

-- SELECT: Users can view character casting for projects in their organization
CREATE POLICY "Users can view character casting in their organization"
ON public.character_casting FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.characters c
    INNER JOIN public.projects p ON p.id = c.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE c.id = character_casting.character_id
    AND up.id = auth.uid()
  )
);

-- INSERT: Casting Directors, Producers, and Admins can create character assignments
CREATE POLICY "Authorized users can create character casting"
ON public.character_casting FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.characters c
    INNER JOIN public.projects p ON p.id = c.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE c.id = character_casting.character_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- UPDATE: Casting Directors, Producers, and Admins can update character assignments
CREATE POLICY "Authorized users can update character casting"
ON public.character_casting FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.characters c
    INNER JOIN public.projects p ON p.id = c.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE c.id = character_casting.character_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'casting_director', 'admin')
  )
);

-- DELETE: Producers and Admins can delete character assignments
CREATE POLICY "Authorized users can delete character casting"
ON public.character_casting FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.characters c
    INNER JOIN public.projects p ON p.id = c.project_id
    INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
    WHERE c.id = character_casting.character_id
    AND up.id = auth.uid()
    AND up.role IN ('producer', 'admin')
  )
);

COMMIT;
