/**
 * Characters API
 * Functions for interacting with character data
 */

import { supabase } from '../supabase';

export interface Character {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  age_range?: string;
  gender?: string;
  ethnicity?: string;
  character_type?: 'lead' | 'supporting' | 'bit_part' | 'cameo' | 'background_extra';
  wardrobe_notes?: string;
  makeup_notes?: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all characters for a project
 */
export async function getCharacters(projectId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single character by ID
 */
export async function getCharacter(characterId: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (error) {
    console.error('Error fetching character:', error);
    throw error;
  }

  return data;
}

/**
 * Update a character
 */
export async function updateCharacter(characterId: string, updates: Partial<Character>) {
  console.log('Updating character:', characterId, 'with updates:', updates);
  
  const { data, error } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', characterId)
    .select();

  console.log('Update result - data:', data, 'error:', error);

  if (error) {
    console.error('Error updating character:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error('Character not found or update failed. This may be due to RLS policies. Check that you have permission to update this character.');
  }

  return data[0];
}

/**
 * Delete a character
 */
export async function deleteCharacter(characterId: string) {
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId);

  if (error) {
    console.error('Error deleting character:', error);
    throw error;
  }
}
