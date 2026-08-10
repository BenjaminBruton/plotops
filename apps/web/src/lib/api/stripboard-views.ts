import { supabase } from '../supabase'

export interface StripboardView {
  id: string
  project_id: string
  user_id: string
  name: string
  description?: string
  scene_order: string[] // Array of scene IDs
  is_default: boolean
  created_at: string
  updated_at: string
}

export async function getStripboardViews(projectId: string): Promise<StripboardView[]> {
  const { data, error } = await supabase
    .from('stripboard_views')
    .select('*')
    .eq('project_id', projectId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getStripboardView(viewId: string): Promise<StripboardView | null> {
  const { data, error } = await supabase
    .from('stripboard_views')
    .select('*')
    .eq('id', viewId)
    .single()
  
  if (error) throw error
  return data
}

export async function createStripboardView(view: {
  project_id: string
  name: string
  description?: string
  scene_order: string[]
  is_default?: boolean
}): Promise<StripboardView> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // If this is set as default, unset other defaults for this project
  if (view.is_default) {
    await supabase
      .from('stripboard_views')
      .update({ is_default: false })
      .eq('project_id', view.project_id)
      .eq('user_id', user.id)
  }
  
  const { data, error } = await supabase
    .from('stripboard_views')
    .insert({
      ...view,
      user_id: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateStripboardView(
  viewId: string,
  updates: {
    name?: string
    description?: string
    scene_order?: string[]
    is_default?: boolean
  }
): Promise<StripboardView> {
  // If setting as default, unset other defaults
  if (updates.is_default) {
    const view = await getStripboardView(viewId)
    if (view) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('stripboard_views')
          .update({ is_default: false })
          .eq('project_id', view.project_id)
          .eq('user_id', user.id)
          .neq('id', viewId)
      }
    }
  }
  
  const { data, error } = await supabase
    .from('stripboard_views')
    .update(updates)
    .eq('id', viewId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteStripboardView(viewId: string): Promise<void> {
  const { error } = await supabase
    .from('stripboard_views')
    .delete()
    .eq('id', viewId)
  
  if (error) throw error
}
