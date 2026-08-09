-- Auto-Create User Profiles on Signup
-- This ensures every new user automatically gets a user_profiles record

BEGIN;

-- ============================================================================
-- FUNCTION: Automatically create user_profiles when user signs up
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Get or create a default organization
  SELECT id INTO default_org_id 
  FROM public.organizations 
  WHERE slug = 'default-org' 
  LIMIT 1;
  
  -- If no default organization exists, create one
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug, description)
    VALUES ('Default Organization', 'default-org', 'Auto-created default organization')
    RETURNING id INTO default_org_id;
  END IF;
  
  -- Create the user_profiles record
  INSERT INTO public.user_profiles (
    id,
    organization_id,
    role,
    first_name,
    last_name,
    display_name
  )
  VALUES (
    NEW.id,
    default_org_id,
    'producer', -- Default role for new users
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Fire on new user creation
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIX EXISTING USERS: Create missing user_profiles
-- ============================================================================

-- Create default organization if it doesn't exist
INSERT INTO public.organizations (name, slug, description)
VALUES ('Default Organization', 'default-org', 'Auto-created default organization')
ON CONFLICT (slug) DO NOTHING;

-- Create user_profiles for any existing auth.users that don't have one
INSERT INTO public.user_profiles (
  id,
  organization_id,
  role,
  first_name,
  last_name,
  display_name
)
SELECT 
  u.id,
  (SELECT id FROM public.organizations WHERE slug = 'default-org' LIMIT 1),
  'producer'::public.user_role,
  COALESCE(u.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'last_name', 'Name'),
  COALESCE(u.raw_user_meta_data->>'display_name', u.email, 'User')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = u.id
);

-- Update all projects to use the default organization if they don't have one
UPDATE public.projects
SET organization_id = (SELECT id FROM public.organizations WHERE slug = 'default-org' LIMIT 1)
WHERE organization_id IS NULL;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that all users now have profiles
-- SELECT 
--   u.email,
--   CASE WHEN up.id IS NOT NULL THEN '✅ Has Profile' ELSE '❌ Missing Profile' END as status,
--   up.role,
--   o.name as organization
-- FROM auth.users u
-- LEFT JOIN public.user_profiles up ON up.id = u.id
-- LEFT JOIN public.organizations o ON o.id = up.organization_id;
