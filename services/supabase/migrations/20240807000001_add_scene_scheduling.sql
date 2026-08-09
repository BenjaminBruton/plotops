-- Add scheduling fields to scenes table
-- This migration adds shoot_date and status columns to support stripboard scheduling

BEGIN;

-- Add status enum for scenes (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE public.scene_status AS ENUM (
        'not_scheduled',
        'scheduled',
        'in_progress',
        'completed',
        'needs_reshoot'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add columns to scenes table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'scenes' 
                   AND column_name = 'shoot_date') THEN
        ALTER TABLE public.scenes ADD COLUMN shoot_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'scenes' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.scenes ADD COLUMN status public.scene_status DEFAULT 'not_scheduled';
    END IF;
END $$;

-- Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_scenes_shoot_date ON public.scenes(shoot_date) WHERE shoot_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scenes_status ON public.scenes(status);

COMMIT;
