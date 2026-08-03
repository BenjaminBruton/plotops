/**
 * Database-specific types for Supabase integration
 */

import type {
  Project,
  Scene,
  Character,
  Actor,
  Location,
  Asset,
  ScheduleItem,
  CallSheet,
  DigitalAsset,
  User,
  Tenant,
  UserRole,
  ProjectStatus,
  SceneStatus,
  CastingStatus,
  LocationType,
  AssetType,
  AssetStatus,
  DigitalAssetStatus
} from './index';

// ============================================================================
// DATABASE SCHEMA TYPES
// ============================================================================

/**
 * Database table definitions matching Supabase schema
 */
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: Tenant;
        Insert: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tenant, 'id' | 'created_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      scenes: {
        Row: Scene;
        Insert: Omit<Scene, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Scene, 'id' | 'created_at'>>;
      };
      characters: {
        Row: Character;
        Insert: Omit<Character, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Character, 'id' | 'created_at'>>;
      };
      actors: {
        Row: Actor;
        Insert: Omit<Actor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Actor, 'id' | 'created_at'>>;
      };
      locations: {
        Row: Location;
        Insert: Omit<Location, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Location, 'id' | 'created_at'>>;
      };
      assets: {
        Row: Asset;
        Insert: Omit<Asset, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Asset, 'id' | 'created_at'>>;
      };
      schedule_items: {
        Row: ScheduleItem;
        Insert: Omit<ScheduleItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ScheduleItem, 'id' | 'created_at'>>;
      };
      call_sheets: {
        Row: CallSheet;
        Insert: Omit<CallSheet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CallSheet, 'id' | 'created_at'>>;
      };
      digital_assets: {
        Row: DigitalAsset;
        Insert: Omit<DigitalAsset, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DigitalAsset, 'id' | 'created_at'>>;
      };
    };
    Views: {
      project_dashboard: {
        Row: ProjectDashboardView;
      };
      scene_schedule: {
        Row: SceneScheduleView;
      };
      casting_overview: {
        Row: CastingOverviewView;
      };
    };
    Functions: {
      get_user_permissions: {
        Args: { user_id: string; project_id?: string };
        Returns: UserPermissionsResult;
      };
      calculate_project_progress: {
        Args: { project_id: string };
        Returns: ProjectProgressResult;
      };
      optimize_schedule: {
        Args: { project_id: string; constraints?: ScheduleConstraints };
        Returns: OptimizedScheduleResult;
      };
    };
  };
}

// ============================================================================
// DATABASE VIEW TYPES
// ============================================================================

export interface ProjectDashboardView {
  project_id: string;
  project_title: string;
  project_status: ProjectStatus;
  total_scenes: number;
  completed_scenes: number;
  scheduled_scenes: number;
  total_cast: number;
  cast_confirmed: number;
  total_locations: number;
  locations_secured: number;
  budget_allocated: number;
  budget_spent: number;
  days_remaining: number;
  progress_percentage: number;
}

export interface SceneScheduleView {
  scene_id: string;
  scene_number: string;
  location_name: string;
  scheduled_date: string;
  call_time: string;
  estimated_wrap: string;
  cast_count: number;
  cast_names: string[];
  status: SceneStatus;
  complexity_rating: number;
  page_count: number;
}

export interface CastingOverviewView {
  character_id: string;
  character_name: string;
  character_type: string;
  casting_status: CastingStatus;
  actor_name?: string;
  actor_email?: string;
  scenes_count: number;
  first_shoot_date?: string;
  last_shoot_date?: string;
}

// ============================================================================
// DATABASE FUNCTION TYPES
// ============================================================================

export interface UserPermissionsResult {
  user_id: string;
  role: UserRole;
  tenant_id: string;
  project_permissions: {
    project_id: string;
    permissions: string[];
  }[];
  global_permissions: string[];
}

export interface ProjectProgressResult {
  project_id: string;
  overall_progress: number;
  scenes_progress: {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
  };
  casting_progress: {
    total: number;
    cast: number;
    in_casting: number;
    not_cast: number;
  };
  location_progress: {
    total: number;
    secured: number;
    in_negotiation: number;
    not_secured: number;
  };
  budget_progress: {
    allocated: number;
    spent: number;
    remaining: number;
    percentage_used: number;
  };
}

export interface ScheduleConstraints {
  actor_availability?: { actor_id: string; available_dates: string[] }[];
  location_availability?: { location_id: string; available_dates: string[] }[];
  weather_preferences?: { scene_id: string; preferred_weather: string[] }[];
  priority_scenes?: string[];
  max_scenes_per_day?: number;
  preferred_shoot_order?: 'script_order' | 'location_grouped' | 'actor_grouped';
}

export interface OptimizedScheduleResult {
  schedule_items: OptimizedScheduleItem[];
  optimization_score: number;
  conflicts: ScheduleConflict[];
  recommendations: string[];
}

export interface OptimizedScheduleItem {
  scene_id: string;
  suggested_date: string;
  suggested_call_time: string;
  suggested_wrap_time: string;
  location_id: string;
  cast_ids: string[];
  confidence_score: number;
  reasoning: string;
}

export interface ScheduleConflict {
  type: 'actor_conflict' | 'location_conflict' | 'weather_conflict' | 'budget_conflict';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affected_scenes: string[];
  suggested_resolution: string;
}

// ============================================================================
// ROW LEVEL SECURITY TYPES
// ============================================================================

export interface RLSContext {
  user_id: string;
  user_role: UserRole;
  tenant_id: string;
  project_id?: string;
}

export interface RLSPolicy {
  table_name: string;
  policy_name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  expression: string;
}

// ============================================================================
// QUERY BUILDER TYPES
// ============================================================================

export interface QueryOptions {
  select?: string[];
  where?: WhereClause[];
  order_by?: OrderByClause[];
  limit?: number;
  offset?: number;
  include_related?: string[];
}

export interface WhereClause {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'not_in' | 'is' | 'not';
  value: any;
}

export interface OrderByClause {
  column: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// MIGRATION TYPES
// ============================================================================

export interface Migration {
  version: string;
  name: string;
  up: string;
  down: string;
  applied_at?: string;
}

export interface MigrationResult {
  success: boolean;
  version: string;
  error?: string;
  duration_ms: number;
}

// ============================================================================
// BACKUP AND RESTORE TYPES
// ============================================================================

export interface BackupOptions {
  tables?: string[];
  include_data: boolean;
  compress: boolean;
  encryption_key?: string;
}

export interface BackupResult {
  backup_id: string;
  file_path: string;
  file_size: number;
  created_at: string;
  tables_included: string[];
  row_counts: Record<string, number>;
}

export interface RestoreOptions {
  backup_id: string;
  tables?: string[];
  overwrite_existing: boolean;
  validate_before_restore: boolean;
}

export interface RestoreResult {
  success: boolean;
  restored_tables: string[];
  row_counts: Record<string, number>;
  duration_ms: number;
  errors?: string[];
}