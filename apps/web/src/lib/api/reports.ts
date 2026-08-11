import { supabase } from '../supabase'

export interface ProjectReportData {
  project_id: string
  project_title: string
  total_cast: number
  cast_with_contracts: number
  cast_signed_contracts: number
  total_crew: number
  crew_confirmed: number
  crew_pending: number
  total_scenes: number
  completed_scenes: number
  scene_completion_percentage: number
  total_locations: number
  locations_confirmed: number
  total_contracts: number
  contracts_sent: number
  contracts_signed: number
}

export async function getProjectReport(projectId: string): Promise<ProjectReportData | null> {
  try {
    // Get project title
    const { data: project } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single()

    if (!project) return null

    // Get cast statistics
    const { data: characters, error: charError } = await supabase
      .from('characters')
      .select(`
        id,
        character_casting (
          actor_id,
          contract_signed
        )
      `)
      .eq('project_id', projectId)

    if (charError) {
      console.error('Error fetching characters:', charError)
    }

    // Total cast = characters with actors assigned
    const totalCast = characters?.filter((c: any) => c.character_casting && c.character_casting.length > 0).length || 0
    const castWithContracts = totalCast // Same as total cast since they have assignments
    const castSignedContracts = characters?.filter((c: any) => 
      c.character_casting && c.character_casting.length > 0 && c.character_casting[0].contract_signed
    ).length || 0

    // Get crew statistics
    const { data: crew, error: crewError } = await supabase
      .from('crew_members')
      .select('status')
      .eq('project_id', projectId)

    if (crewError) {
      console.error('Error fetching crew:', crewError)
    }

    const totalCrew = crew?.length || 0
    const crewConfirmed = crew?.filter((c: any) => c.status === 'confirmed').length || 0
    const crewPending = crew?.filter((c: any) => c.status === 'pending').length || 0

    // Get scene statistics
    const { data: scenes, error: scenesError } = await supabase
      .from('scenes')
      .select('scene_number, wrapped')
      .eq('project_id', projectId)

    if (scenesError) {
      console.error('Error fetching scenes:', scenesError)
    }

    console.log(`Report for project ${projectId}:`, {
      totalScenes: scenes?.length,
      totalCast,
      totalCrew,
      scenes,
      characters
    })

    const totalScenes = scenes?.length || 0
    const completedScenes = scenes?.filter((s: any) => s.wrapped).length || 0
    const sceneCompletionPercentage = totalScenes > 0 ? Math.round((completedScenes / totalScenes) * 100) : 0

    // Get location statistics
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('status')
      .eq('project_id', projectId)

    if (locError) {
      console.error('Error fetching locations:', locError)
    }

    const totalLocations = locations?.length || 0
    const locationsConfirmed = locations?.filter((l: any) => l.status === 'confirmed' || l.status === 'approved' || l.status === 'secured').length || 0

    // Get contract statistics
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('sent_date, signed_date, signature_date')
      .eq('project_id', projectId)

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError)
    }

    const totalContracts = contracts?.length || 0
    const contractsSent = contracts?.filter((c: any) => c.sent_date).length || 0
    const contractsSigned = contracts?.filter((c: any) => c.signed_date || c.signature_date).length || 0

    return {
      project_id: projectId,
      project_title: project.title,
      total_cast: totalCast,
      cast_with_contracts: castWithContracts,
      cast_signed_contracts: castSignedContracts,
      total_crew: totalCrew,
      crew_confirmed: crewConfirmed,
      crew_pending: crewPending,
      total_scenes: totalScenes,
      completed_scenes: completedScenes,
      scene_completion_percentage: sceneCompletionPercentage,
      total_locations: totalLocations,
      locations_confirmed: locationsConfirmed,
      total_contracts: totalContracts,
      contracts_sent: contractsSent,
      contracts_signed: contractsSigned
    }
  } catch (error) {
    console.error('Error fetching project report:', error)
    return null
  }
}

export async function getAllProjectsReports(): Promise<ProjectReportData[]> {
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .order('created_at', { ascending: false })

    if (!projects) return []

    const reports = await Promise.all(
      projects.map((project: any) => getProjectReport(project.id))
    )

    return reports.filter((r: any) => r !== null) as ProjectReportData[]
  } catch (error) {
    console.error('Error fetching all project reports:', error)
    return []
  }
}
