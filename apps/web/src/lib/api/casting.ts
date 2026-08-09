/**
 * Casting API Functions
 * Handles actors, auditions, casting calls, and character assignments
 */

import { supabase } from '../supabase'

// ============================================================================
// ACTORS
// ============================================================================

export interface Actor {
  id: string
  first_name: string
  last_name: string
  stage_name?: string
  email?: string
  phone?: string
  agent_name?: string
  agent_contact?: string
  headshot_url?: string
  reel_url?: string
  resume_url?: string
  height?: string
  weight?: string
  hair_color?: string
  eye_color?: string
  age_range?: string
  union_status?: string
  special_skills?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface ActorInput {
  first_name: string
  last_name: string
  stage_name?: string
  email?: string
  phone?: string
  agent_name?: string
  agent_contact?: string
  headshot_url?: string
  reel_url?: string
  resume_url?: string
  height?: string
  weight?: string
  hair_color?: string
  eye_color?: string
  age_range?: string
  union_status?: string
  special_skills?: string[]
  notes?: string
}

/**
 * Get all actors
 */
export async function getActors(): Promise<Actor[]> {
  const { data, error } = await supabase
    .from('actors')
    .select('*')
    .order('last_name', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get actor by ID
 */
export async function getActor(id: string): Promise<Actor | null> {
  const { data, error } = await supabase
    .from('actors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new actor
 */
export async function createActor(actor: ActorInput): Promise<Actor> {
  const { data, error } = await supabase
    .from('actors')
    .insert(actor)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an actor
 */
export async function updateActor(id: string, updates: Partial<ActorInput>): Promise<Actor> {
  const { data, error } = await supabase
    .from('actors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete an actor
 */
export async function deleteActor(id: string): Promise<void> {
  const { error } = await supabase
    .from('actors')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================================================
// CASTING CALLS
// ============================================================================

export interface CastingCall {
  id: string
  project_id: string
  character_id?: string
  title: string
  description?: string
  requirements?: string
  audition_sides?: string
  status: 'open' | 'callback' | 'cast' | 'closed'
  submission_deadline?: string
  audition_start_date?: string
  audition_end_date?: string
  callback_date?: string
  is_public: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CastingCallInput {
  project_id: string
  character_id?: string
  title: string
  description?: string
  requirements?: string
  audition_sides?: string
  status?: 'open' | 'callback' | 'cast' | 'closed'
  submission_deadline?: string
  audition_start_date?: string
  audition_end_date?: string
  callback_date?: string
  is_public?: boolean
}

/**
 * Get casting calls for a project
 */
export async function getCastingCalls(projectId: string): Promise<CastingCall[]> {
  const { data, error } = await supabase
    .from('casting_calls')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create a casting call
 */
export async function createCastingCall(call: CastingCallInput): Promise<CastingCall> {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('casting_calls')
    .insert({
      ...call,
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a casting call
 */
export async function updateCastingCall(id: string, updates: Partial<CastingCallInput>): Promise<CastingCall> {
  const { data, error } = await supabase
    .from('casting_calls')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// AUDITIONS
// ============================================================================

export interface Audition {
  id: string
  casting_call_id: string
  actor_id: string
  audition_date?: string
  audition_type?: string
  audition_video_url?: string
  notes?: string
  rating?: number
  is_callback: boolean
  is_cast: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface AuditionInput {
  casting_call_id: string
  actor_id: string
  audition_date?: string
  audition_type?: string
  audition_video_url?: string
  notes?: string
  rating?: number
  is_callback?: boolean
  is_cast?: boolean
}

/**
 * Get auditions for a casting call
 */
export async function getAuditions(castingCallId: string): Promise<Audition[]> {
  const { data, error } = await supabase
    .from('auditions')
    .select('*, actor:actors(*)')
    .eq('casting_call_id', castingCallId)
    .order('audition_date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create an audition
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
 * Update an audition
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

// ============================================================================
// CHARACTER CASTING (Role Assignments)
// ============================================================================

export interface CharacterCasting {
  id: string
  character_id: string
  actor_id: string
  rate_per_day?: number
  start_date?: string
  end_date?: string
  contract_signed: boolean
  wardrobe_fitting_date?: string
  special_requirements?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CharacterCastingInput {
  character_id: string
  actor_id: string
  rate_per_day?: number
  start_date?: string
  end_date?: string
  contract_signed?: boolean
  wardrobe_fitting_date?: string
  special_requirements?: string
}

/**
 * Get character casting assignments for a project
 */
export async function getCharacterCasting(projectId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('character_casting')
    .select(`
      *,
      character:characters(*),
      actor:actors(*)
    `)
    .eq('characters.project_id', projectId)

  if (error) throw error
  return data || []
}

/**
 * Get casting assignment for a specific character
 */
export async function getCharacterCastingByCharacterId(characterId: string): Promise<CharacterCasting | null> {
  const { data, error } = await supabase
    .from('character_casting')
    .select('*, actor:actors(*)')
    .eq('character_id', characterId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Assign an actor to a character
 */
export async function assignActorToCharacter(assignment: CharacterCastingInput): Promise<CharacterCasting> {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('character_casting')
    .insert({
      ...assignment,
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a character casting assignment
 */
export async function updateCharacterCasting(id: string, updates: Partial<CharacterCastingInput>): Promise<CharacterCasting> {
  const { data, error } = await supabase
    .from('character_casting')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove an actor from a character
 */
export async function removeActorFromCharacter(characterId: string): Promise<void> {
  const { error} = await supabase
    .from('character_casting')
    .delete()
    .eq('character_id', characterId)

  if (error) throw error
}
