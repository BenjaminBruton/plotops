-- Location Scouting System
-- Schema: PUBLIC
-- Comprehensive location management for film production

-- Location Status Enum
DO $$ BEGIN
  CREATE TYPE location_status AS ENUM ('scouting', 'pending_approval', 'approved', 'rejected', 'secured', 'unavailable');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  location_type VARCHAR(100), -- studio, practical, exterior, interior, etc.
  description TEXT,
  status location_status DEFAULT 'scouting',
  
  -- Address Info
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  
  -- Coordinates for mapping
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact Information
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  
  -- Logistics
  cost_per_day DECIMAL(10, 2),
  availability_notes TEXT,
  parking_info TEXT,
  power_available BOOLEAN DEFAULT false,
  power_info TEXT,
  restroom_available BOOLEAN DEFAULT false,
  restroom_info TEXT,
  catering_space BOOLEAN DEFAULT false,
  catering_info TEXT,
  wifi_available BOOLEAN DEFAULT false,
  cell_service_quality VARCHAR(50), -- excellent, good, fair, poor, none
  
  -- Permits & Restrictions
  permits_required BOOLEAN DEFAULT false,
  permit_notes TEXT,
  noise_restrictions BOOLEAN DEFAULT false,
  time_restrictions TEXT,
  special_requirements TEXT,
  
  -- Photos & Media
  photos JSONB DEFAULT '[]', -- Array of {url, caption, uploaded_at, uploaded_by}
  hero_photo_url TEXT, -- Main display photo
  
  -- Scout Notes
  scout_notes TEXT,
  pros TEXT,
  cons TEXT,
  scout_rating INTEGER CHECK (scout_rating >= 1 AND scout_rating <= 5),
  scouted_by UUID REFERENCES auth.users(id),
  scouted_date DATE,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scene Locations (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.scene_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  
  -- Timing estimates
  setup_time INTEGER, -- minutes
  shoot_time INTEGER, -- minutes
  wrap_time INTEGER, -- minutes
  
  -- Scene-specific notes
  notes TEXT,
  specific_area TEXT, -- e.g., "rooftop", "parking lot", "lobby"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scene_id, location_id)
);

-- Create Indexes (only if table was created)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'locations') THEN
    CREATE INDEX IF NOT EXISTS idx_locations_project ON public.locations(project_id);
    CREATE INDEX IF NOT EXISTS idx_locations_status ON public.locations(status);
    
    -- Check if city column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'city') THEN
      CREATE INDEX IF NOT EXISTS idx_locations_city ON public.locations(city);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'location_type') THEN
      CREATE INDEX IF NOT EXISTS idx_locations_type ON public.locations(location_type);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scene_locations') THEN
    CREATE INDEX IF NOT EXISTS idx_scene_locations_scene ON public.scene_locations(scene_id);
    CREATE INDEX IF NOT EXISTS idx_scene_locations_location ON public.scene_locations(location_id);
  END IF;
END $$;

-- Geospatial index for lat/long (if using PostGIS in future)
-- CREATE INDEX idx_locations_coordinates ON public.locations USING GIST(point(longitude, latitude));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER locations_updated_at_trigger
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION update_locations_updated_at();

-- RLS Policies
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_locations ENABLE ROW LEVEL SECURITY;

-- Locations RLS
CREATE POLICY "Users can view locations for their projects"
  ON public.locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = locations.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create locations for their projects"
  ON public.locations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update locations for their projects"
  ON public.locations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = locations.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete locations for their projects"
  ON public.locations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = locations.project_id
      AND created_by = auth.uid()
    )
  );

-- Scene Locations RLS
CREATE POLICY "Users can view scene locations for their projects"
  ON public.scene_locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = scene_locations.scene_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage scene locations for their projects"
  ON public.scene_locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      WHERE s.id = scene_locations.scene_id
      AND p.created_by = auth.uid()
    )
  );

-- Comments (only add if columns exist)
DO $$
BEGIN
  COMMENT ON TABLE public.locations IS 'Film production locations for scouting and shooting';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scene_locations') THEN
    COMMENT ON TABLE public.scene_locations IS 'Many-to-many relationship between scenes and locations';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'photos') THEN
    COMMENT ON COLUMN public.locations.photos IS 'JSON array of photo objects: [{url, caption, uploaded_at, uploaded_by}]';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'scout_rating') THEN
    COMMENT ON COLUMN public.locations.scout_rating IS 'Scout rating from 1-5 stars';
  END IF;
END $$;
