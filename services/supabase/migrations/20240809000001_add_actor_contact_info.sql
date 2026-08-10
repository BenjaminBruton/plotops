-- Add actor contact information to characters table
-- Schema: PUBLIC (not plotops)
-- This allows tracking which actor is playing each character and their contact details

ALTER TABLE public.characters
ADD COLUMN actor_name VARCHAR(255),
ADD COLUMN actor_phone VARCHAR(50),
ADD COLUMN actor_email VARCHAR(255),
ADD COLUMN actor_agency VARCHAR(255),
ADD COLUMN actor_notes TEXT;

-- Add comments
COMMENT ON COLUMN public.characters.actor_name IS 'Name of the actor cast to play this character';
COMMENT ON COLUMN public.characters.actor_phone IS 'Actor contact phone number';
COMMENT ON COLUMN public.characters.actor_email IS 'Actor contact email';
COMMENT ON COLUMN public.characters.actor_agency IS 'Actor agency or management company';
COMMENT ON COLUMN public.characters.actor_notes IS 'Additional notes about the actor (availability, special requirements, etc.)';
