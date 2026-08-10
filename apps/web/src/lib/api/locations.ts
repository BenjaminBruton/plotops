/**
 * Locations API
 * Functions for managing filming locations and location scouting
 */

import { supabase } from '../supabase'

export type LocationStatus = 'scouting' | 'pending_approval' | 'approved' | 'rejected' | 'secured' | 'unavailable'

export interface Location {
  id: string
  project_id: string
  
  // Basic Info
  name: string
  location_type?: string
  description?: string
  status: LocationStatus
  
  // Address
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  
  // Coordinates
  latitude?: number
  longitude?: number
  
  // Contact
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  
  // Logistics
  cost_per_day?: number
  availability_notes?: string
  parking_info?: string
  power_available?: boolean
  power_info?: string
  restroom_available?: boolean
  restroom_info?: string
  catering_space?: boolean
  catering_info?: string
  wifi_available?: boolean
  cell_service_quality?: string
  
  // Permits
  permits_required?: boolean
  permit_notes?: string
  noise_restrictions?: boolean
  time_restrictions?: string
  special_requirements?: string
  
  // Photos & Media
  photos?: any[] // JSON array
  hero_photo_url?: string
  
  // Scout Notes
  scout_notes?: string
  pros?: string
  cons?: string
  scout_rating?: number
  scouted_by?: string
  scouted_date?: string
  
  // Audit
  created_by?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// LOCATIONS
// ============================================================================

/**
 * Get all locations for a project
 */
export async function getLocations(projectId: string): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching locations:', error)
    throw error
  }

  return data || []
}

/**
 * Get a single location by ID
 */
export async function getLocation(locationId: string): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', locationId)
    .single()

  if (error) {
    console.error('Error fetching location:', error)
    throw error
  }

  return data
}

/**
 * Create a new location
 */
export async function createLocation(location: Partial<Location>): Promise<Location> {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('locations')
    .insert({
      ...location,
      created_by: user?.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating location:', error)
    throw error
  }

  return data
}

/**
 * Update a location
 */
export async function updateLocation(locationId: string, updates: Partial<Location>): Promise<Location> {
  const { data, error} = await supabase
    .from('locations')
    .update(updates)
    .eq('id', locationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating location:', error)
    throw error
  }

  return data
}

/**
 * Delete a location
 */
export async function deleteLocation(locationId: string): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId)

  if (error) {
    console.error('Error deleting location:', error)
    throw error
  }
}

/**
 * Add a photo to a location
 */
export async function addLocationPhoto(locationId: string, photoUrl: string, caption?: string): Promise<Location> {
  const { data: location } = await supabase
    .from('locations')
    .select('photos')
    .eq('id', locationId)
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  
  const photos = location?.photos || []
  photos.push({
    url: photoUrl,
    caption: caption || '',
    uploaded_at: new Date().toISOString(),
    uploaded_by: user?.id
  })

  const { data, error } = await supabase
    .from('locations')
    .update({ photos })
    .eq('id', locationId)
    .select()
    .single()

  if (error) {
    console.error('Error adding photo:', error)
    throw error
  }

  return data
}

/**
 * Upload a photo file to Supabase Storage
 */
export async function uploadLocationPhoto(file: File, locationId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${locationId}/${Date.now()}.${fileExt}`
  const filePath = `locations/${fileName}`

  const { data, error } = await supabase.storage
    .from('locations')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading photo:', error)
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('locations')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Get location statistics for a project
 */
export async function getLocationStats(projectId: string) {
  const { data: locations, error } = await supabase
    .from('locations')
    .select('*')
    .eq('project_id', projectId)

  if (error) {
    console.error('Error fetching location stats:', error)
    throw error
  }

  const byStatus = {
    scouting: locations?.filter((l: any) => l.status === 'scouting').length || 0,
    pending: locations?.filter((l: any) => l.status === 'pending_approval').length || 0,
    approved: locations?.filter((l: any) => l.status === 'approved').length || 0,
    secured: locations?.filter((l: any) => l.status === 'secured').length || 0,
  }

  const averageRating = locations && locations.length > 0
    ? locations.reduce((sum: number, l: any) => sum + (l.scout_rating || 0), 0) / locations.filter((l: any) => l.scout_rating).length
    : 0

  return {
    totalLocations: locations?.length || 0,
    byStatus,
    averageRating: averageRating.toFixed(1),
  }
}

// ============================================================================
// SCENE LOCATIONS
// ============================================================================

/**
 * Link a location to a scene
 */
export async function linkLocationToScene(sceneId: string, locationId: string, details?: {
  setup_time?: number
  shoot_time?: number
  wrap_time?: number
  notes?: string
  specific_area?: string
}): Promise<any> {
  const { data, error } = await supabase
    .from('scene_locations')
    .insert({
      scene_id: sceneId,
      location_id: locationId,
      ...details
    })
    .select()
    .single()

  if (error) {
    console.error('Error linking location to scene:', error)
    throw error
  }

  return data
}

/**
 * Remove a location from a scene
 */
export async function unlinkLocationFromScene(sceneLocationId: string): Promise<void> {
  const { error } = await supabase
    .from('scene_locations')
    .delete()
    .eq('id', sceneLocationId)

  if (error) {
    console.error('Error unlinking location from scene:', error)
    throw error
  }
}

/**
 * Get scenes for a location
 */
export async function getScenesForLocation(locationId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('scene_locations')
    .select(`
      *,
      scene:scenes(*)
    `)
    .eq('location_id', locationId)

  if (error) {
    console.error('Error fetching scenes for location:', error)
    throw error
  }

  return data || []
}
