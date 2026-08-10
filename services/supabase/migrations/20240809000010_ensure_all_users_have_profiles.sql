-- Ensure ALL existing users have profiles and organizations
-- Run this to fix any users who signed up before the auto-create trigger

BEGIN;

-- Create default organization if needed
INSERT INTO public.organizations (name, slug, description)
VALUES ('Default Organization', 'default-org', 'Auto-created default organization')
ON CONFLICT (slug) DO NOTHING;

-- Create profiles for ANY users missing them
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

COMMIT;
