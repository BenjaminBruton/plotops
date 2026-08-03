/**
 * Projects API
 * Functions for interacting with project data
 */

import { supabase } from '../supabase';
import type {
  ProjectWithProgress,
  ProjectBudget,
  ProjectDocument,
  ProjectMilestone,
  BudgetSummary,
} from '@/../../packages/types/src/database';

/**
 * Get all projects for the current user's organization
 */
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      organization:organizations(id, name, slug),
      project_members(count)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  return data;
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      organization:organizations(*),
      project_members(
        id,
        role,
        title,
        user:user_profiles(id, first_name, last_name, avatar_url)
      ),
      scenes(count),
      characters(count),
      locations(count)
    `
    )
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new project
 */
export async function createProject(project: {
  organization_id: string;
  title: string;
  slug: string;
  logline?: string;
  synopsis?: string;
  genre?: string;
  status?: string;
  budget_range?: string;
  start_date?: string;
  end_date?: string;
}) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return data;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<ProjectWithProgress>
) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Get project budget summary
 */
export async function getProjectBudgetSummary(
  projectId: string
): Promise<BudgetSummary> {
  const { data, error } = await supabase.rpc('get_project_budget_summary', {
    p_project_id: projectId,
  });

  if (error) {
    console.error('Error fetching budget summary:', error);
    throw error;
  }

  return data[0] as BudgetSummary;
}

/**
 * Get project budgets
 */
export async function getProjectBudgets(projectId: string) {
  const { data, error } = await supabase
    .from('project_budgets')
    .select('*')
    .eq('project_id', projectId)
    .order('department');

  if (error) {
    console.error('Error fetching project budgets:', error);
    throw error;
  }

  return data as ProjectBudget[];
}

/**
 * Get project documents
 */
export async function getProjectDocuments(
  projectId: string,
  documentType?: string
) {
  let query = supabase
    .from('project_documents')
    .select('*')
    .eq('project_id', projectId);

  if (documentType) {
    query = query.eq('document_type', documentType);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching project documents:', error);
    throw error;
  }

  return data as ProjectDocument[];
}

/**
 * Get project milestones
 */
export async function getProjectMilestones(projectId: string) {
  const { data, error } = await supabase
    .from('project_milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('target_date');

  if (error) {
    console.error('Error fetching project milestones:', error);
    throw error;
  }

  return data as ProjectMilestone[];
}

/**
 * Calculate project progress
 */
export async function calculateProjectProgress(projectId: string) {
  const { data, error } = await supabase.rpc('calculate_project_progress', {
    p_project_id: projectId,
  });

  if (error) {
    console.error('Error calculating project progress:', error);
    throw error;
  }

  return data as number;
}

/**
 * Get project statistics
 */
export async function getProjectStats(projectId: string) {
  // Get scenes count
  const { count: scenesCount } = await supabase
    .from('scenes')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  // Get completed scenes count
  const { count: completedScenesCount } = await supabase
    .from('schedule_scenes')
    .select('scene_id', { count: 'exact', head: true })
    .eq('status', 'completed')
    .in(
      'schedule_id',
      supabase
        .from('shooting_schedule')
        .select('id')
        .eq('project_id', projectId)
    );

  // Get cast count
  const { count: castCount } = await supabase
    .from('character_casting')
    .select('*', { count: 'exact', head: true })
    .in(
      'character_id',
      supabase
        .from('characters')
        .select('id')
        .eq('project_id', projectId)
    );

  // Get locations count
  const { count: locationsCount } = await supabase
    .from('locations')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  return {
    scenesTotal: scenesCount || 0,
    scenesCompleted: completedScenesCount || 0,
    castCount: castCount || 0,
    locationsCount: locationsCount || 0,
  };
}
