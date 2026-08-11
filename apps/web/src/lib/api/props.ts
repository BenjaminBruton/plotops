/**
 * Props API
 * Functions for managing props, costumes, makeup, and set dressing
 */

import { supabase } from '../supabase'

export type PropCategory = 'prop' | 'costume' | 'makeup' | 'set_dressing' | 'vehicle' | 'weapon' | 'special_fx' | 'animal' | 'food' | 'other'
export type PropStatus = 'needed' | 'researching' | 'sourced' | 'ordered' | 'purchased' | 'rented' | 'on_set' | 'returned' | 'completed'

export interface Prop {
  id: string
  project_id: string
  
  // Basic Info
  name: string
  category: PropCategory
  description?: string
  status: PropStatus
  
  // Associations
  character_id?: string
  location_id?: string
  
  // Source & Procurement
  source_type?: string
  source_name?: string
  source_contact?: string
  source_url?: string
  
  // Financial
  estimated_cost?: number
  actual_cost?: number
  rental_rate?: number
  rental_duration?: number
  deposit_amount?: number
  
  // Logistics
  quantity_needed: number
  quantity_acquired: number
  size_info?: string
  color_info?: string
  materials?: string
  
  // Rental/Return tracking
  rental_start_date?: string
  rental_end_date?: string
  return_date?: string
  return_condition?: string
  
  // Notes & Media
  notes?: string
  special_requirements?: string
  photos?: any[]
  reference_images?: any[]
  
  // Priority
  priority?: number
  deadline?: string
  
  // Audit
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface SceneProp {
  id: string
  scene_id: string
  prop_id: string
  quantity_for_scene: number
  critical: boolean
  scene_notes?: string
  created_at?: string
}

export interface PropChecklistItem {
  id: string
  prop_id: string
  item_name: string
  completed: boolean
  notes?: string
  created_at?: string
}

export interface PropStats {
  totalProps: number
  byCategory: Record<PropCategory, number>
  byStatus: Record<PropStatus, number>
  totalCost: number
  totalEstimatedCost: number
  criticalPropsNeeded: number
  upcomingDeadlines: number
}

/**
 * Get all props for a project
 */
export async function getProps(projectId: string): Promise<Prop[]> {
  const { data, error } = await supabase
    .from('props')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

/**
 * Get a single prop by ID
 */
export async function getProp(propId: string): Promise<Prop | null> {
  const { data, error } = await supabase
    .from('props')
    .select('*')
    .eq('id', propId)
    .single()
  
  if (error) throw error
  return data
}

/**
 * Create a new prop
 */
export async function createProp(prop: Omit<Prop, 'id' | 'created_at' | 'updated_at'>): Promise<Prop> {
  const { data, error } = await supabase
    .from('props')
    .insert([prop])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update an existing prop
 */
export async function updateProp(propId: string, updates: Partial<Prop>): Promise<Prop> {
  const { data, error } = await supabase
    .from('props')
    .update(updates)
    .eq('id', propId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a prop
 */
export async function deleteProp(propId: string): Promise<void> {
  const { error } = await supabase
    .from('props')
    .delete()
    .eq('id', propId)
  
  if (error) throw error
}

/**
 * Get props for a specific scene
 */
export async function getPropsForScene(sceneId: string): Promise<Array<Prop & { scene_prop: SceneProp }>> {
  const { data, error } = await supabase
    .from('scene_props')
    .select(`
      *,
      props (*)
    `)
    .eq('scene_id', sceneId)
  
  if (error) throw error
  
  return data?.map((sp: any) => ({
    ...sp.props,
    scene_prop: {
      id: sp.id,
      scene_id: sp.scene_id,
      prop_id: sp.prop_id,
      quantity_for_scene: sp.quantity_for_scene,
      critical: sp.critical,
      scene_notes: sp.scene_notes,
      created_at: sp.created_at
    }
  })) || []
}

/**
 * Add a prop to a scene
 */
export async function addPropToScene(sceneProp: Omit<SceneProp, 'id' | 'created_at'>): Promise<SceneProp> {
  const { data, error } = await supabase
    .from('scene_props')
    .insert([sceneProp])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Remove a prop from a scene
 */
export async function removePropFromScene(sceneId: string, propId: string): Promise<void> {
  const { error } = await supabase
    .from('scene_props')
    .delete()
    .eq('scene_id', sceneId)
    .eq('prop_id', propId)
  
  if (error) throw error
}

/**
 * Get checklist items for a prop
 */
export async function getPropChecklistItems(propId: string): Promise<PropChecklistItem[]> {
  const { data, error } = await supabase
    .from('prop_checklist_items')
    .select('*')
    .eq('prop_id', propId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

/**
 * Add a checklist item to a prop
 */
export async function addPropChecklistItem(item: Omit<PropChecklistItem, 'id' | 'created_at'>): Promise<PropChecklistItem> {
  const { data, error } = await supabase
    .from('prop_checklist_items')
    .insert([item])
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update a checklist item
 */
export async function updatePropChecklistItem(itemId: string, updates: Partial<PropChecklistItem>): Promise<PropChecklistItem> {
  const { data, error } = await supabase
    .from('prop_checklist_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a checklist item
 */
export async function deletePropChecklistItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('prop_checklist_items')
    .delete()
    .eq('id', itemId)
  
  if (error) throw error
}

/**
 * Get props statistics for a project
 */
export async function getPropsStats(projectId: string): Promise<PropStats> {
  const props = await getProps(projectId)
  
  const stats: PropStats = {
    totalProps: props.length,
    byCategory: {
      prop: 0,
      costume: 0,
      makeup: 0,
      set_dressing: 0,
      vehicle: 0,
      weapon: 0,
      special_fx: 0,
      animal: 0,
      food: 0,
      other: 0
    },
    byStatus: {
      needed: 0,
      researching: 0,
      sourced: 0,
      ordered: 0,
      purchased: 0,
      rented: 0,
      on_set: 0,
      returned: 0,
      completed: 0
    },
    totalCost: 0,
    totalEstimatedCost: 0,
    criticalPropsNeeded: 0,
    upcomingDeadlines: 0
  }
  
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  props.forEach(prop => {
    // Count by category
    stats.byCategory[prop.category]++
    
    // Count by status
    stats.byStatus[prop.status]++
    
    // Sum costs
    if (prop.actual_cost) {
      stats.totalCost += prop.actual_cost
    }
    if (prop.estimated_cost) {
      stats.totalEstimatedCost += prop.estimated_cost
    }
    
    // Count critical props that are still needed
    if (prop.priority && prop.priority >= 4 && prop.status === 'needed') {
      stats.criticalPropsNeeded++
    }
    
    // Count upcoming deadlines
    if (prop.deadline) {
      const deadline = new Date(prop.deadline)
      if (deadline >= today && deadline <= nextWeek) {
        stats.upcomingDeadlines++
      }
    }
  })
  
  return stats
}

/**
 * Get props by location
 */
export async function getPropsByLocation(locationId: string): Promise<Prop[]> {
  const { data, error } = await supabase
    .from('props')
    .select('*')
    .eq('location_id', locationId)
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

/**
 * Get props by character
 */
export async function getPropsByCharacter(characterId: string): Promise<Prop[]> {
  const { data, error } = await supabase
    .from('props')
    .select('*')
    .eq('character_id', characterId)
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}
