/**
 * Public Casting Calls API
 * Functions for publishing and managing public casting calls
 */

import { supabase } from '../supabase'

export interface CrewPosition {
  role: string
  count: number
}

export interface PublicCastingCall {
  id: string
  project_id: string
  title: string
  is_anonymous: boolean
  description?: string
  logline?: string
  shooting_start_date?: string
  shooting_end_date?: string
  shooting_locations?: string[]
  logo_url?: string
  image_urls?: string[]
  crew_positions?: CrewPosition[]
  character_ids?: string[]
  is_published: boolean
  published_at: string
  expires_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PublicCastingCallInput {
  project_id: string
  title: string
  is_anonymous?: boolean
  description?: string
  logline?: string
  shooting_start_date?: string
  shooting_end_date?: string
  shooting_locations?: string[]
  logo_url?: string
  image_urls?: string[]
  crew_positions?: CrewPosition[]
  character_ids?: string[]
  expires_at?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
}

/**
 * Get all published casting calls (for public job board)
 */
export async function getPublicCastingCalls(): Promise<PublicCastingCall[]> {
  const { data, error } = await supabase
    .from('public_casting_calls')
    .select(`
      *,
      project:projects(id, title, poster_url)
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) throw error
  
  // Fetch characters for each casting call
  if (data) {
    const callsWithCharacters = await Promise.all(
      data.map(async (call: any) => {
        if (call.character_ids && call.character_ids.length > 0) {
          const { data: characters, error: charError } = await supabase
            .from('characters')
            .select('*')
            .in('id', call.character_ids)
          
          if (!charError) {
            return { ...call, characters }
          }
        }
        return call
      })
    )
    return callsWithCharacters
  }
  
  return data || []
}

/**
 * Get a single public casting call with full details
 */
export async function getPublicCastingCall(id: string): Promise<any> {
  const { data, error } = await supabase
    .from('public_casting_calls')
    .select(`
      *,
      project:projects(
        id,
        title,
        logline,
        synopsis,
        genre,
        poster_url
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) throw error

  // If we have character_ids, fetch those characters
  if (data && data.character_ids && data.character_ids.length > 0) {
    const { data: characters, error: charError } = await supabase
      .from('characters')
      .select('*')
      .in('id', data.character_ids)

    if (!charError) {
      data.characters = characters
    }
  }

  return data
}

/**
 * Get casting call for a specific project (for producers to see their published call)
 */
export async function getProjectCastingCall(projectId: string): Promise<PublicCastingCall | null> {
  const { data, error } = await supabase
    .from('public_casting_calls')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Publish a new casting call
 */
export async function publishCastingCall(call: PublicCastingCallInput): Promise<PublicCastingCall> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('public_casting_calls')
    .insert({
      ...call,
      created_by: user?.id,
      is_published: true,
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a published casting call
 */
export async function updateCastingCall(id: string, updates: Partial<PublicCastingCallInput>): Promise<PublicCastingCall> {
  const { data, error } = await supabase
    .from('public_casting_calls')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Unpublish a casting call
 */
export async function unpublishCastingCall(id: string): Promise<void> {
  const { error } = await supabase
    .from('public_casting_calls')
    .update({ is_published: false })
    .eq('id', id)

  if (error) throw error
}

/**
 * Delete a casting call
 */
export async function deleteCastingCall(id: string): Promise<void> {
  const { error } = await supabase
    .from('public_casting_calls')
    .delete()
    .eq('id', id)

  if (error) throw error
}
