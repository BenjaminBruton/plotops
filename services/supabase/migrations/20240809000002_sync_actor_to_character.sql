-- Sync actor information to characters table when assigned
-- Schema: PUBLIC
-- This ensures stripboard and call sheets have access to actor contact info

-- Function to sync actor data to character when casting is assigned
CREATE OR REPLACE FUNCTION public.sync_actor_to_character()
RETURNS TRIGGER AS $$
BEGIN
  -- When an actor is assigned to a character, copy their info to the character record
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.characters
    SET 
      actor_name = (
        SELECT COALESCE(stage_name, first_name || ' ' || last_name)
        FROM public.actors
        WHERE id = NEW.actor_id
      ),
      actor_phone = (
        SELECT phone
        FROM public.actors
        WHERE id = NEW.actor_id
      ),
      actor_email = (
        SELECT email
        FROM public.actors
        WHERE id = NEW.actor_id
      ),
      actor_agency = (
        SELECT agent_name
        FROM public.actors
        WHERE id = NEW.actor_id
      )
    WHERE id = NEW.character_id;
  END IF;
  
  -- When a casting is removed, clear the actor info from character
  IF TG_OP = 'DELETE' THEN
    UPDATE public.characters
    SET 
      actor_name = NULL,
      actor_phone = NULL,
      actor_email = NULL,
      actor_agency = NULL,
      actor_notes = NULL
    WHERE id = OLD.character_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on character_casting table
DROP TRIGGER IF EXISTS sync_actor_info_trigger ON public.character_casting;
CREATE TRIGGER sync_actor_info_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.character_casting
FOR EACH ROW
EXECUTE FUNCTION public.sync_actor_to_character();

-- Sync existing character_casting records
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
