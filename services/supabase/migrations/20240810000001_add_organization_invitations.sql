-- Add organization invitations system

-- First, add 'crew' to user_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'crew' 
    AND enumtypid = 'public.user_role'::regtype
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'crew';
  END IF;
END $$;

-- COMMIT the enum change before using it
COMMIT;

-- Start new transaction for table creation
BEGIN;

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'producer',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Add index for lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON public.organization_invitations(organization_id);

-- RLS Policies for invitations
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations for their organization
CREATE POLICY "Users can view their org invitations"
  ON public.organization_invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Users can create invitations for their organization
CREATE POLICY "Users can create invitations for their org"
  ON public.organization_invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Users can update invitations for their organization
CREATE POLICY "Users can update their org invitations"
  ON public.organization_invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Users can delete invitations for their organization
CREATE POLICY "Users can delete their org invitations"
  ON public.organization_invitations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Add owner_id to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);

COMMENT ON TABLE public.organization_invitations IS 'Stores pending invitations for users to join organizations';
COMMENT ON COLUMN public.organization_invitations.token IS 'Unique token used in invitation link';
COMMENT ON COLUMN public.organization_invitations.expires_at IS 'Invitation expiry date (default 7 days)';
