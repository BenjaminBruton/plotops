-- Props Management System
-- Schema: PUBLIC
-- Track props, costumes, makeup items, and set dressing with scene associations

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.prop_checklist_items CASCADE;
DROP TABLE IF EXISTS public.scene_props CASCADE;
DROP TABLE IF EXISTS public.props CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS prop_status CASCADE;
DROP TYPE IF EXISTS prop_category CASCADE;

-- Prop Category Enum
CREATE TYPE prop_category AS ENUM (
  'prop',
  'costume',
  'makeup',
  'set_dressing',
  'vehicle',
  'weapon',
  'special_fx',
  'animal',
  'food',
  'other'
);

-- Prop Status Enum
CREATE TYPE prop_status AS ENUM (
  'needed',
  'researching',
  'sourced',
  'ordered',
  'purchased',
  'rented',
  'on_set',
  'returned',
  'completed'
);

-- Props Table
CREATE TABLE public.props (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  category prop_category NOT NULL DEFAULT 'prop',
  description TEXT,
  status prop_status DEFAULT 'needed',
  
  -- Associations
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  
  -- Source & Procurement
  source_type VARCHAR(50), -- 'purchase', 'rental', 'borrowed', 'made', 'owned'
  source_name VARCHAR(255), -- Company/person name
  source_contact TEXT,
  source_url TEXT,
  
  -- Financial
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  rental_rate DECIMAL(10, 2),
  rental_duration INTEGER, -- days
  deposit_amount DECIMAL(10, 2),
  
  -- Logistics
  quantity_needed INTEGER DEFAULT 1,
  quantity_acquired INTEGER DEFAULT 0,
  size_info VARCHAR(100), -- For costumes
  color_info VARCHAR(100),
  materials TEXT,
  
  -- Rental/Return tracking
  rental_start_date DATE,
  rental_end_date DATE,
  return_date DATE,
  return_condition TEXT,
  
  -- Notes & Media
  notes TEXT,
  special_requirements TEXT,
  photos JSONB DEFAULT '[]', -- Array of photo URLs
  reference_images JSONB DEFAULT '[]', -- Array of reference image URLs
  
  -- Priority
  priority INTEGER CHECK (priority >= 1 AND priority <= 5) DEFAULT 3,
  deadline DATE,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scene Props Junction Table (many-to-many)
CREATE TABLE public.scene_props (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
  prop_id UUID NOT NULL REFERENCES public.props(id) ON DELETE CASCADE,
  
  -- Scene-specific info
  quantity_for_scene INTEGER DEFAULT 1,
  critical BOOLEAN DEFAULT false, -- Must have for this scene
  scene_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scene_id, prop_id)
);

-- Prop Checklist Items (for complex props with multiple parts)
CREATE TABLE public.prop_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prop_id UUID NOT NULL REFERENCES public.props(id) ON DELETE CASCADE,
  
  item_name VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_props_project ON public.props(project_id);
CREATE INDEX IF NOT EXISTS idx_props_category ON public.props(category);
CREATE INDEX IF NOT EXISTS idx_props_status ON public.props(status);
CREATE INDEX IF NOT EXISTS idx_props_character ON public.props(character_id);
CREATE INDEX IF NOT EXISTS idx_props_location ON public.props(location_id);
CREATE INDEX IF NOT EXISTS idx_props_deadline ON public.props(deadline);
CREATE INDEX IF NOT EXISTS idx_scene_props_scene ON public.scene_props(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_props_prop ON public.scene_props(prop_id);
CREATE INDEX IF NOT EXISTS idx_prop_checklist_prop ON public.prop_checklist_items(prop_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_props_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER props_updated_at_trigger
BEFORE UPDATE ON public.props
FOR EACH ROW
EXECUTE FUNCTION update_props_updated_at();

-- RLS Policies
ALTER TABLE public.props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prop_checklist_items ENABLE ROW LEVEL SECURITY;

-- Props RLS (organization-based)
CREATE POLICY "Users can view props in their organization"
  ON public.props FOR SELECT
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can create props in their organization"
  ON public.props FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can update props in their organization"
  ON public.props FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete props in their organization"
  ON public.props FOR DELETE
  USING (
    project_id IN (
      SELECT p.id 
      FROM public.projects p
      INNER JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE up.id = auth.uid()
    )
  );

-- Scene Props RLS
CREATE POLICY "Users can view scene props for their projects"
  ON public.scene_props FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE s.id = scene_props.scene_id
      AND up.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage scene props for their projects"
  ON public.scene_props FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.scenes s
      JOIN public.projects p ON s.project_id = p.id
      JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE s.id = scene_props.scene_id
      AND up.id = auth.uid()
    )
  );

-- Prop Checklist RLS
CREATE POLICY "Users can view prop checklists for their projects"
  ON public.prop_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.props pr
      JOIN public.projects p ON pr.project_id = p.id
      JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE pr.id = prop_checklist_items.prop_id
      AND up.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage prop checklists for their projects"
  ON public.prop_checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.props pr
      JOIN public.projects p ON pr.project_id = p.id
      JOIN public.user_profiles up ON up.organization_id = p.organization_id
      WHERE pr.id = prop_checklist_items.prop_id
      AND up.id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE public.props IS 'Master props inventory including costumes, makeup, and set dressing';
COMMENT ON TABLE public.scene_props IS 'Many-to-many relationship between scenes and props';
COMMENT ON TABLE public.prop_checklist_items IS 'Checklist items for complex props with multiple components';
COMMENT ON COLUMN public.props.category IS 'Type of prop: prop, costume, makeup, set_dressing, etc.';
COMMENT ON COLUMN public.props.status IS 'Procurement status: needed, sourced, purchased, rented, on_set, returned';
COMMENT ON COLUMN public.scene_props.critical IS 'Whether this prop is absolutely required for the scene';
