/**
 * Scenes API
 * Functions for interacting with scene breakdown data
 */

import { supabase } from '../supabase';

export interface Scene {
  id: string;
  project_id: string;
  scene_number: string;
  scene_name?: string;
  location_name?: string;
  scene_type: 'int' | 'ext' | 'int_ext';
  time_of_day: 'day' | 'night' | 'dawn' | 'dusk' | 'magic_hour';
  page_count?: number;
  description?: string;
  script_notes?: string;
  estimated_duration?: number;
  complexity_rating?: number;
  is_pickup?: boolean;
  is_insert?: boolean;
  script_page_start?: number;
  script_page_end?: number;
  shoot_date?: string;
  status?: 'not_scheduled' | 'scheduled' | 'in_progress' | 'completed' | 'needs_reshoot';
  created_at: string;
  updated_at: string;
}

export interface SceneWithDetails extends Scene {
  characters?: any[];
  props?: any[];
}

/**
 * Get all scenes for a project
 */
export async function getScenes(projectId: string) {
  console.log('🔍 Fetching scenes for project:', projectId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  console.log('👤 Current user:', user?.id || 'NOT AUTHENTICATED');
  
  const { data, error } = await supabase
    .from('scenes')
    .select(
      `
      *,
      scene_characters(
        id,
        character:characters(
          id, 
          name, 
          character_type, 
          description, 
          age_range, 
          gender, 
          ethnicity, 
          wardrobe_notes, 
          makeup_notes, 
          special_requirements,
          actor_name,
          actor_phone,
          actor_email,
          actor_agency
        )
      ),
      scene_props(
        id,
        quantity,
        prop:props(id, name, category)
      )
    `
    )
    .eq('project_id', projectId)
    .order('scene_number', { ascending: true});

  if (error) {
    console.error('❌ Error fetching scenes:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }

  console.log(`✅ Fetched ${data?.length || 0} scenes`);
  return data;
}

/**
 * Get a single scene by ID
 */
export async function getScene(sceneId: string) {
  const { data, error } = await supabase
    .from('scenes')
    .select(
      `
      *,
      scene_characters(
        id,
        lines_count,
        is_speaking,
        character:characters(*)
      ),
      scene_props(
        id,
        quantity,
        notes,
        prop:props(*)
      )
    `
    )
    .eq('id', sceneId)
    .single();

  if (error) {
    console.error('Error fetching scene:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new scene
 */
export async function createScene(scene: Partial<Scene>) {
  const { data, error } = await supabase
    .from('scenes')
    .insert([scene])
    .select()
    .single();

  if (error) {
    console.error('Error creating scene:', error);
    throw error;
  }

  return data;
}

/**
 * Update a scene
 */
export async function updateScene(sceneId: string, updates: Partial<Scene>) {
  const { data, error } = await supabase
    .from('scenes')
    .update(updates)
    .eq('id', sceneId)
    .select()
    .single();

  if (error) {
    console.error('Error updating scene:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a scene
 */
export async function deleteScene(sceneId: string) {
  const { error } = await supabase.from('scenes').delete().eq('id', sceneId);

  if (error) {
    console.error('Error deleting scene:', error);
    throw error;
  }
}

/**
 * Get scene statistics for a project
 */
export async function getSceneStats(projectId: string) {
  const { data: scenes, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching scene stats:', error);
    throw error;
  }

  const totalPages = scenes?.reduce((sum: number, scene: any) => sum + (scene.page_count || 0), 0) || 0;
  const totalDuration = scenes?.reduce(
    (sum: number, scene: any) => sum + (scene.estimated_duration || 0),
    0
  ) || 0;

  const intScenes = scenes?.filter((s: any) => s.scene_type === 'int').length || 0;
  const extScenes = scenes?.filter((s: any) => s.scene_type === 'ext').length || 0;
  const dayScenes = scenes?.filter((s: any) => s.time_of_day === 'day').length || 0;
  const nightScenes = scenes?.filter((s: any) => s.time_of_day === 'night').length || 0;

  const complexityDistribution = {
    1: scenes?.filter((s: any) => s.complexity_rating === 1).length || 0,
    2: scenes?.filter((s: any) => s.complexity_rating === 2).length || 0,
    3: scenes?.filter((s: any) => s.complexity_rating === 3).length || 0,
    4: scenes?.filter((s: any) => s.complexity_rating === 4).length || 0,
    5: scenes?.filter((s: any) => s.complexity_rating === 5).length || 0,
  };

  return {
    totalScenes: scenes?.length || 0,
    totalPages,
    totalDuration,
    intScenes,
    extScenes,
    dayScenes,
    nightScenes,
    complexityDistribution,
  };
}

/**
 * Add a character to a scene
 */
export async function addCharacterToScene(
  sceneId: string,
  characterId: string,
  details?: {
    lines_count?: number;
    is_speaking?: boolean;
    wardrobe_change?: boolean;
    makeup_change?: boolean;
    notes?: string;
  }
) {
  const { data, error } = await supabase
    .from('scene_characters')
    .insert([
      {
        scene_id: sceneId,
        character_id: characterId,
        ...details,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding character to scene:', error);
    throw error;
  }

  return data;
}

/**
 * Add a prop to a scene
 */
export async function addPropToScene(
  sceneId: string,
  propId: string,
  quantity: number = 1,
  notes?: string
) {
  const { data, error } = await supabase
    .from('scene_props')
    .insert([
      {
        scene_id: sceneId,
        prop_id: propId,
        quantity,
        notes,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding prop to scene:', error);
    throw error;
  }

  return data;
}

/**
 * Remove a character from a scene
 */
export async function removeCharacterFromScene(sceneCharacterId: string) {
  const { error } = await supabase
    .from('scene_characters')
    .delete()
    .eq('id', sceneCharacterId);

  if (error) {
    console.error('Error removing character from scene:', error);
    throw error;
  }
}

/**
 * Remove a prop from a scene
 */
export async function removePropFromScene(scenePropId: string) {
  const { error } = await supabase
    .from('scene_props')
    .delete()
    .eq('id', scenePropId);

  if (error) {
    console.error('Error removing prop from scene:', error);
    throw error;
  }
}

/**
 * Get all characters for a project
 */
export async function getCharacters(projectId: string) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }

  return data;
}

/**
 * Get all props for a project
 */
export async function getProps(projectId: string) {
  const { data, error } = await supabase
    .from('props')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching props:', error);
    throw error;
  }

  return data;
}
