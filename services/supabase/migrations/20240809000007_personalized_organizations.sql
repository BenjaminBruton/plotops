-- Personalized Organizations for New Users
-- Creates unique organization for each user: "username-signupdate-ORG"

BEGIN;

-- ============================================================================
-- UPDATE FUNCTION: Create personalized organization for each new user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_org_id UUID;
  user_name TEXT;
  org_slug TEXT;
  signup_date TEXT;
BEGIN
  -- Extract username from email (part before @)
  user_name := split_part(NEW.email, '@', 1);
  
  -- Get signup date in YYYYMMDD format
  signup_date := to_char(NOW(), 'YYYYMMDD');
  
  -- Create unique organization slug
  org_slug := lower(user_name || '-' || signup_date || '-org');
  
  -- Create a personalized organization for this user
  INSERT INTO public.organizations (name, slug, description)
  VALUES (
    user_name || ' - ' || signup_date || ' - ORG',
    org_slug,
    'Auto-created organization for ' || NEW.email
  )
  RETURNING id INTO user_org_id;
  
  -- Create the user_profiles record linked to their personal organization
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
    user_org_id,
    'producer', -- Default role for new users
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists from previous migration, so we don't need to recreate it
-- It will automatically use the updated function

COMMIT;

-- ============================================================================
-- NOTES
-- ============================================================================
-- This migration updates the handle_new_user() function to create a unique
-- organization for each new user instead of using a shared default org.
-- 
-- Format: "username-YYYYMMDD-ORG"
-- Example: If user@example.com signs up on 2024-08-09
--          Organization name: "user - 20240809 - ORG"
--          Organization slug: "user-20240809-org"
