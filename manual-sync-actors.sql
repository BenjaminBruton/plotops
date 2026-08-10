-- Manual sync script to update characters with actor information
-- Run this to sync all existing actor assignments from character_casting to characters table
-- Schema: PUBLIC

-- First, verify the trigger exists
SELECT 
    trigger_name, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'sync_actor_info_trigger';

-- Sync all existing character_casting records to characters table
UPDATE public.characters c
SET 
  actor_name = (
    SELECT COALESCE(a.stage_name, a.first_name || ' ' || a.last_name)
    FROM public.character_casting cc
    JOIN public.actors a ON cc.actor_id = a.id
    WHERE cc.character_id = c.id
    LIMIT 1
  ),
  actor_phone = (
    SELECT a.phone
    FROM public.character_casting cc
    JOIN public.actors a ON cc.actor_id = a.id
    WHERE cc.character_id = c.id
    LIMIT 1
  ),
  actor_email = (
    SELECT a.email
    FROM public.character_casting cc
    JOIN public.actors a ON cc.actor_id = a.id
    WHERE cc.character_id = c.id
    LIMIT 1
  ),
  actor_agency = (
    SELECT a.agent_name
    FROM public.character_casting cc
    JOIN public.actors a ON cc.actor_id = a.id
    WHERE cc.character_id = c.id
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1
  FROM public.character_casting cc
  WHERE cc.character_id = c.id
);

-- Verify the sync worked - show characters with actor information
SELECT 
    c.name as character_name,
    c.actor_name,
    c.actor_phone,
    c.actor_email,
    c.actor_agency
FROM public.characters c
WHERE c.actor_name IS NOT NULL
ORDER BY c.name;
