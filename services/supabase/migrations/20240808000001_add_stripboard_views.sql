-- Create stripboard_views table to store custom scene orderings
CREATE TABLE IF NOT EXISTS public.stripboard_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scene_order JSONB NOT NULL, -- Array of scene IDs in custom order
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_stripboard_views_project ON public.stripboard_views(project_id);
CREATE INDEX idx_stripboard_views_user ON public.stripboard_views(user_id);
CREATE INDEX idx_stripboard_views_default ON public.stripboard_views(project_id, is_default) WHERE is_default = TRUE;

-- Add RLS policies
ALTER TABLE public.stripboard_views ENABLE ROW LEVEL SECURITY;

-- Users can view stripboard views for projects they have access to
CREATE POLICY stripboard_views_select ON public.stripboard_views
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can create their own stripboard views for projects they have access to
CREATE POLICY stripboard_views_insert ON public.stripboard_views
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND project_id IN (
      SELECT id FROM public.projects
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT project_id FROM public.project_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update their own stripboard views
CREATE POLICY stripboard_views_update ON public.stripboard_views
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own stripboard views
CREATE POLICY stripboard_views_delete ON public.stripboard_views
  FOR DELETE
  USING (user_id = auth.uid());

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_stripboard_views_updated_at
  BEFORE UPDATE ON public.stripboard_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
