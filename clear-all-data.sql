-- ========================================
-- CLEAR ALL PRODUCTION DATA
-- This script deletes ALL data while preserving schema
-- Run in Supabase SQL Editor to start fresh
-- ========================================

-- Core tables (these should always exist)
DELETE FROM public.scene_characters;
DELETE FROM public.scenes;
DELETE FROM public.characters;
DELETE FROM public.projects;
DELETE FROM public.locations;

-- Optional tables (may not exist yet)
DO $$ 
BEGIN
  -- Casting
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'casting_calls') THEN
    DELETE FROM public.casting_calls;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auditions') THEN
    DELETE FROM public.auditions;
  END IF;
  
  -- Contracts
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contracts') THEN
    DELETE FROM public.contracts;
  END IF;
  
  -- Stripboard (from migration 20240808000001)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stripboard_views') THEN
    DELETE FROM public.stripboard_views;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stripboard_scenes') THEN
    DELETE FROM public.stripboard_scenes;
  END IF;
END $$;

-- Clean up ALL organizations
DELETE FROM public.organizations;

-- Recreate organizations and profiles for all existing users
DO $$ 
DECLARE
  user_record RECORD;
  org_id UUID;
  org_name TEXT;
  org_slug TEXT;
BEGIN
  FOR user_record IN SELECT id, email, raw_user_meta_data FROM auth.users
  LOOP
    -- Create unique org for each user
    org_slug := LOWER(SPLIT_PART(user_record.email, '@', 1)) || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-ORG';
    org_name := COALESCE(
      user_record.raw_user_meta_data->>'organization',
      SPLIT_PART(user_record.email, '@', 1) || ' Organization'
    );
    
    -- Insert organization
    INSERT INTO public.organizations (name, slug, description)
    VALUES (org_name, org_slug, 'Auto-created organization')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO org_id;
    
    -- Update or create user profile
    INSERT INTO public.user_profiles (
      id,
      organization_id,
      role,
      first_name,
      last_name,
      display_name
    )
    VALUES (
      user_record.id,
      org_id,
      'producer'::public.user_role,
      COALESCE(user_record.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(user_record.raw_user_meta_data->>'last_name', 'Name'),
      COALESCE(user_record.raw_user_meta_data->>'display_name', user_record.email, 'User')
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      display_name = EXCLUDED.display_name,
      updated_at = NOW();
  END LOOP;
END $$;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check counts for core tables (should all be 0)
SELECT 
  'projects' as table_name, COUNT(*) as count FROM public.projects
UNION ALL
SELECT 'scenes', COUNT(*) FROM public.scenes
UNION ALL
SELECT 'characters', COUNT(*) FROM public.characters
UNION ALL
SELECT 'scene_characters', COUNT(*) FROM public.scene_characters
UNION ALL
SELECT 'locations', COUNT(*) FROM public.locations
UNION ALL
SELECT 'organizations', COUNT(*) FROM public.organizations
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM public.user_profiles
ORDER BY table_name;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
SELECT '✅ Database cleared successfully! All production data deleted.' as status;
SELECT '🔐 Your auth account is intact - just refresh and you can start fresh!' as next_step;
