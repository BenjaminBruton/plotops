/**
 * Auditions API
 * Functions for managing audition tracking in the casting pipeline
 */

import { supabase } from '../supabase'

export type AuditionStage = 'submitted' | 'reviewing' | 'callback' | 'cast' | 'rejected'

export interface Audition {
  id: string
  project_id: string
  character_id: string
  actor_id: string
  stage: AuditionStage
  notes?: string
  audition_date?: string
  callback_date?: string
  submitted_at: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface AuditionWithDetails extends Audition {
  actor?: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
    age_range?: string
  }
  character?: {
    id: string
    name: string
    description?: string
  }
}

export interface AuditionInput {
  project_id: string
  character_id: string
  actor_id: string
  stage: AuditionStage
  notes?: string
  audition_date?: string
  callback_date?: string
}

/**
 * Get all auditions for a project
 */
export async function getProjectAuditions(projectId: string): Promise<AuditionWithDetails[]> {
  const { data, error } = await supabase
    .from('auditions')
    .select(`
      *,
      actor:actors(id, first_name, last_name, email, phone, age_range),
      character:characters(id, name, description)
    `)
    .eq('project_id', projectId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get auditions for a specific character
 */
export async function getCharacterAuditions(characterId: string): Promise<AuditionWithDetails[]> {
  const { data, error } = await supabase
    .from('auditions')
    .select(`
      *,
      actor:actors(id, first_name, last_name, email, phone, age_range),
      character:characters(id, name, description)
    `)
    .eq('character_id', characterId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create a new audition entry
 */
export async function createAudition(audition: AuditionInput): Promise<Audition> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('auditions')
    .insert({
      ...audition,
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an audition (mainly for changing stage or adding notes)
 */
export async function updateAudition(id: string, updates: Partial<AuditionInput>): Promise<Audition> {
  const { data, error } = await supabase
    .from('auditions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Move an audition to a different stage
 */
export async function moveAuditionStage(id: string, stage: AuditionStage): Promise<Audition> {
  return updateAudition(id, { stage })
}

/**
 * Delete an audition
 */
export async function deleteAudition(id: string): Promise<void> {
  const { error } = await supabase
    .from('auditions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get auditions grouped by stage for a project
 */
export async function getAuditionsByStage(projectId: string): Promise<Record<AuditionStage, AuditionWithDetails[]>> {
  const auditions = await getProjectAuditions(projectId)
  
  const grouped: Record<AuditionStage, AuditionWithDetails[]> = {
    submitted: [],
    reviewing: [],
    callback: [],
    cast: [],
    rejected: []
  }

  auditions.forEach(audition => {
    grouped[audition.stage].push(audition)
  })

  return grouped
}
