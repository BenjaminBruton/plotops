import { supabase } from '../supabase'

export interface DashboardStats {
  activeProjects: number
  totalScenes: number
  completedScenes: number
  totalCharacters: number
  leadCharacters: number
  supportingCharacters: number
  totalLocations: number
  securedLocations: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get active projects count
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('status', 'active')
  
  if (projectsError) throw projectsError
  
  // Get scenes stats
  const { data: allScenes, error: scenesError } = await supabase
    .from('scenes')
    .select('id, shoot_status')
  
  if (scenesError) throw scenesError
  
  const completedScenes = allScenes?.filter((s: any) => s.shoot_status === 'shot').length || 0
  
  // Get characters stats
  const { data: characters, error: charactersError } = await supabase
    .from('characters')
    .select('id, character_type')
  
  if (charactersError) throw charactersError
  
  const leadCharacters = characters?.filter((c: any) => c.character_type === 'lead' || c.character_type === 'supporting_lead').length || 0
  const supportingCharacters = characters?.filter((c: any) => c.character_type === 'supporting' || c.character_type === 'day_player' || c.character_type === 'extra').length || 0
  
  // Get locations stats
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, status')
  
  if (locationsError) throw locationsError
  
  const securedLocations = locations?.filter((l: any) => l.status === 'secured').length || 0
  
  return {
    activeProjects: projects?.length || 0,
    totalScenes: allScenes?.length || 0,
    completedScenes,
    totalCharacters: characters?.length || 0,
    leadCharacters,
    supportingCharacters,
    totalLocations: locations?.length || 0,
    securedLocations,
  }
}

export interface RecentActivity {
  id: string
  type: 'scene' | 'casting' | 'location' | 'schedule'
  message: string
  timestamp: string
  projectName?: string
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  // For now, return empty array - can be enhanced later with actual activity tracking
  return []
}
