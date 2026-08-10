-- Add missing columns to locations table
-- This handles the case where the table existed but didn't have all columns

-- Add address columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'address_line1') THEN
    ALTER TABLE public.locations ADD COLUMN address_line1 VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'address_line2') THEN
    ALTER TABLE public.locations ADD COLUMN address_line2 VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'city') THEN
    ALTER TABLE public.locations ADD COLUMN city VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'state') THEN
    ALTER TABLE public.locations ADD COLUMN state VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'zip_code') THEN
    ALTER TABLE public.locations ADD COLUMN zip_code VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'country') THEN
    ALTER TABLE public.locations ADD COLUMN country VARCHAR(100) DEFAULT 'USA';
  END IF;

  -- GPS coordinates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'latitude') THEN
    ALTER TABLE public.locations ADD COLUMN latitude DECIMAL(10, 8);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'longitude') THEN
    ALTER TABLE public.locations ADD COLUMN longitude DECIMAL(11, 8);
  END IF;

  -- Contact info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'contact_name') THEN
    ALTER TABLE public.locations ADD COLUMN contact_name VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'contact_phone') THEN
    ALTER TABLE public.locations ADD COLUMN contact_phone VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'contact_email') THEN
    ALTER TABLE public.locations ADD COLUMN contact_email VARCHAR(255);
  END IF;

  -- Logistics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'cost_per_day') THEN
    ALTER TABLE public.locations ADD COLUMN cost_per_day DECIMAL(10, 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'availability_notes') THEN
    ALTER TABLE public.locations ADD COLUMN availability_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'parking_info') THEN
    ALTER TABLE public.locations ADD COLUMN parking_info TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'power_available') THEN
    ALTER TABLE public.locations ADD COLUMN power_available BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'power_info') THEN
    ALTER TABLE public.locations ADD COLUMN power_info TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'restroom_available') THEN
    ALTER TABLE public.locations ADD COLUMN restroom_available BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'restroom_info') THEN
    ALTER TABLE public.locations ADD COLUMN restroom_info TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'catering_space') THEN
    ALTER TABLE public.locations ADD COLUMN catering_space BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'catering_info') THEN
    ALTER TABLE public.locations ADD COLUMN catering_info TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'wifi_available') THEN
    ALTER TABLE public.locations ADD COLUMN wifi_available BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'cell_service_quality') THEN
    ALTER TABLE public.locations ADD COLUMN cell_service_quality VARCHAR(50);
  END IF;

  -- Permits
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'permits_required') THEN
    ALTER TABLE public.locations ADD COLUMN permits_required BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'permit_notes') THEN
    ALTER TABLE public.locations ADD COLUMN permit_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'noise_restrictions') THEN
    ALTER TABLE public.locations ADD COLUMN noise_restrictions BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'time_restrictions') THEN
    ALTER TABLE public.locations ADD COLUMN time_restrictions TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'special_requirements') THEN
    ALTER TABLE public.locations ADD COLUMN special_requirements TEXT;
  END IF;

  -- Photos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'photos') THEN
    ALTER TABLE public.locations ADD COLUMN photos JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'hero_photo_url') THEN
    ALTER TABLE public.locations ADD COLUMN hero_photo_url TEXT;
  END IF;

  -- Scout notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'scout_notes') THEN
    ALTER TABLE public.locations ADD COLUMN scout_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'pros') THEN
    ALTER TABLE public.locations ADD COLUMN pros TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'cons') THEN
    ALTER TABLE public.locations ADD COLUMN cons TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'scout_rating') THEN
    ALTER TABLE public.locations ADD COLUMN scout_rating INTEGER CHECK (scout_rating >= 1 AND scout_rating <= 5);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'scouted_by') THEN
    ALTER TABLE public.locations ADD COLUMN scouted_by UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'scouted_date') THEN
    ALTER TABLE public.locations ADD COLUMN scouted_date DATE;
  END IF;

  -- Location type and description if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'location_type') THEN
    ALTER TABLE public.locations ADD COLUMN location_type VARCHAR(100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'description') THEN
    ALTER TABLE public.locations ADD COLUMN description TEXT;
  END IF;

  -- Audit columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'created_by') THEN
    ALTER TABLE public.locations ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'created_at') THEN
    ALTER TABLE public.locations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'updated_at') THEN
    ALTER TABLE public.locations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

END $$;
