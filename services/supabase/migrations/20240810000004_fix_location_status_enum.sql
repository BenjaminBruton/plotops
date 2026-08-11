-- Fix location_status enum to include 'approved'
-- The enum may be missing values

BEGIN;

-- Check if the enum exists and add missing value
DO $$ 
BEGIN
    -- Try to add 'approved' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'location_status' 
        AND e.enumlabel = 'approved'
    ) THEN
        ALTER TYPE location_status ADD VALUE IF NOT EXISTS 'approved';
    END IF;
END $$;

COMMIT;
