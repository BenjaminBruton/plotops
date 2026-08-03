/**
 * @plotops/types - Core TypeScript definitions for PlotOps film production ERP
 * 
 * This package contains all shared type definitions used across the PlotOps monorepo,
 * including user roles, entities, database schemas, and API types.
 */

// ============================================================================
// USER ROLES AND PERMISSIONS
// ============================================================================

/**
 * Available user roles in the PlotOps system
 */
export enum UserRole {
  PRODUCER = 'producer',
  ASSISTANT_DIRECTOR = 'assistant_director',
  CASTING_DIRECTOR = 'casting_director',
  LOCATION_SCOUT = 'location_scout',
  EDITOR = 'editor',
  PUBLICIST = 'publicist',
  SCRIPT_SUPERVISOR = 'script_supervisor',
  ADMIN = 'admin'
}

/**
 * Permission levels for different actions
 */
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

/**
 * Role-based permissions mapping
 */
export interface RolePermissions {
  role: UserRole;
  permissions: {
    projects: Permission[];
    scenes: Permission[];
    cast: Permission[];
    locations: Permission[];
    assets: Permission[];
    schedule: Permission[];
    budget: Permission[];
  };
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

/**
 * Multi-tenant project entity
 */
export interface Project extends BaseEntity {
  title: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency: string;
  tenant_id: string;
  script_file_url?: string;
  script_metadata?: ScriptMetadata;
  settings: ProjectSettings;
}

export enum ProjectStatus {
  DEVELOPMENT = 'development',
  PRE_PRODUCTION = 'pre_production',
  PRODUCTION = 'production',
  POST_PRODUCTION = 'post_production',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ProjectSettings {
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  auto_generate_call_sheets: boolean;
  enable_real_time_tracking: boolean;
}

/**
 * Script metadata from AI parsing
 */
export interface ScriptMetadata {
  total_pages: number;
  estimated_runtime: number; // in minutes
  scene_count: number;
  character_count: number;
  location_count: number;
  parsed_at: string;
  parser_version: string;
}

/**
 * Scene entity with breakdown information
 */
export interface Scene extends BaseEntity {
  project_id: string;
  scene_number: string;
  int_ext: 'INT' | 'EXT';
  day_night: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  location_name: string;
  location_id?: string;
  description: string;
  page_count: number;
  estimated_duration: number; // in minutes
  complexity_rating: 1 | 2 | 3 | 4 | 5;
  status: SceneStatus;
  scheduled_date?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  notes?: string;
  script_page_start: number;
  script_page_end: number;
}

export enum SceneStatus {
  NOT_SCHEDULED = 'not_scheduled',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NEEDS_RESHOOT = 'needs_reshoot',
  CANCELLED = 'cancelled'
}

/**
 * Character entity
 */
export interface Character extends BaseEntity {
  project_id: string;
  name: string;
  description?: string;
  character_type: CharacterType;
  speaking_lines_count: number;
  first_appearance_scene: string;
  last_appearance_scene: string;
  casting_status: CastingStatus;
  actor_id?: string;
  sides?: string; // Script snippets for auditions
}

export enum CharacterType {
  LEAD = 'lead',
  SUPPORTING = 'supporting',
  FEATURED = 'featured',
  UNDER_FIVE = 'under_five',
  BACKGROUND = 'background'
}

export enum CastingStatus {
  NOT_CAST = 'not_cast',
  CASTING_OPEN = 'casting_open',
  AUDITIONS_SCHEDULED = 'auditions_scheduled',
  CALLBACKS_SCHEDULED = 'callbacks_scheduled',
  CAST = 'cast',
  CONFIRMED = 'confirmed'
}

/**
 * Actor/Talent entity
 */
export interface Actor extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  agent_contact?: string;
  headshot_url?: string;
  demo_reel_url?: string;
  bio?: string;
  availability: ActorAvailability[];
  union_status?: UnionStatus;
  rate?: number;
  rate_type?: RateType;
}

export interface ActorAvailability {
  start_date: string;
  end_date: string;
  availability_type: 'available' | 'unavailable' | 'limited';
  notes?: string;
}

export enum UnionStatus {
  SAG_AFTRA = 'sag_aftra',
  NON_UNION = 'non_union',
  FICORE = 'ficore'
}

export enum RateType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  FLAT = 'flat'
}

/**
 * Location entity with mapping integration
 */
export interface Location extends BaseEntity {
  project_id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  location_type: LocationType;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  availability: LocationAvailability[];
  amenities: LocationAmenity[];
  photos: LocationPhoto[];
  notes?: string;
  permit_required: boolean;
  permit_status?: PermitStatus;
  cost_per_day?: number;
}

export enum LocationType {
  INTERIOR = 'interior',
  EXTERIOR = 'exterior',
  STUDIO = 'studio',
  PRACTICAL = 'practical'
}

export interface LocationAvailability {
  start_date: string;
  end_date: string;
  available: boolean;
  cost_per_day?: number;
  notes?: string;
}

export interface LocationAmenity {
  type: AmenityType;
  description?: string;
  available: boolean;
}

export enum AmenityType {
  PARKING = 'parking',
  POWER = 'power',
  RESTROOMS = 'restrooms',
  CATERING_AREA = 'catering_area',
  WIFI = 'wifi',
  CELL_SIGNAL = 'cell_signal',
  SECURITY = 'security',
  LOADING_DOCK = 'loading_dock'
}

export interface LocationPhoto {
  url: string;
  caption?: string;
  taken_at: string;
  taken_by: string;
}

export enum PermitStatus {
  NOT_REQUIRED = 'not_required',
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied'
}

/**
 * Asset entity for production items
 */
export interface Asset extends BaseEntity {
  project_id: string;
  name: string;
  asset_type: AssetType;
  description?: string;
  scenes: string[]; // Scene IDs where this asset is needed
  status: AssetStatus;
  source: AssetSource;
  cost?: number;
  vendor_contact?: string;
  notes?: string;
  attachments: AssetAttachment[];
}

export enum AssetType {
  PROP = 'prop',
  COSTUME = 'costume',
  MAKEUP = 'makeup',
  VEHICLE = 'vehicle',
  EQUIPMENT = 'equipment',
  SET_PIECE = 'set_piece',
  SPECIAL_EFFECT = 'special_effect'
}

export enum AssetStatus {
  NEEDED = 'needed',
  SOURCING = 'sourcing',
  ORDERED = 'ordered',
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  RETURNED = 'returned'
}

export enum AssetSource {
  PURCHASE = 'purchase',
  RENTAL = 'rental',
  BORROWED = 'borrowed',
  OWNED = 'owned',
  FABRICATED = 'fabricated'
}

export interface AssetAttachment {
  url: string;
  filename: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

/**
 * Schedule/Stripboard entity
 */
export interface ScheduleItem extends BaseEntity {
  project_id: string;
  scene_id: string;
  shoot_date: string;
  call_time: string;
  estimated_wrap_time: string;
  actual_wrap_time?: string;
  location_id: string;
  cast_ids: string[];
  crew_call_time?: string;
  weather_backup_plan?: string;
  notes?: string;
  order_index: number;
}

/**
 * Call sheet entity
 */
export interface CallSheet extends BaseEntity {
  project_id: string;
  shoot_date: string;
  schedule_items: string[]; // ScheduleItem IDs
  weather_forecast?: WeatherInfo;
  emergency_contacts: EmergencyContact[];
  general_notes?: string;
  generated_pdf_url?: string;
  status: CallSheetStatus;
}

export interface WeatherInfo {
  temperature_high: number;
  temperature_low: number;
  conditions: string;
  precipitation_chance: number;
  wind_speed: number;
  sunrise: string;
  sunset: string;
}

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  email?: string;
}

export enum CallSheetStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  DISTRIBUTED = 'distributed'
}

/**
 * Digital Asset Management entity
 */
export interface DigitalAsset extends BaseEntity {
  project_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  scene_id?: string;
  take_number?: number;
  camera_angle?: string;
  tags: DigitalAssetTag[];
  metadata: DigitalAssetMetadata;
  status: DigitalAssetStatus;
  notes?: string;
}

export interface DigitalAssetTag {
  tag: string;
  added_by: string;
  added_at: string;
}

export interface DigitalAssetMetadata {
  duration?: number; // for video files
  resolution?: string;
  frame_rate?: number;
  codec?: string;
  color_space?: string;
  audio_channels?: number;
  timecode_in?: string;
  timecode_out?: string;
}

export enum DigitalAssetStatus {
  RAW = 'raw',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  NEEDS_VFX = 'needs_vfx',
  NEEDS_COLOR = 'needs_color',
  NEEDS_AUDIO = 'needs_audio',
  FINAL = 'final'
}

// ============================================================================
// USER AND AUTHENTICATION
// ============================================================================

/**
 * User entity
 */
export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  tenant_id: string;
  is_active: boolean;
  last_login?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  timezone: string;
  date_format: string;
  time_format: string;
  notifications: NotificationPreferences;
  dashboard_layout?: DashboardLayout;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  scene_wrap_alerts: boolean;
  schedule_changes: boolean;
  casting_updates: boolean;
  budget_alerts: boolean;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  layout: 'grid' | 'list';
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
}

export enum WidgetType {
  PROJECT_OVERVIEW = 'project_overview',
  SCHEDULE_TIMELINE = 'schedule_timeline',
  BUDGET_SUMMARY = 'budget_summary',
  CASTING_STATUS = 'casting_status',
  LOCATION_MAP = 'location_map',
  RECENT_ACTIVITY = 'recent_activity',
  WEATHER_FORECAST = 'weather_forecast'
}

/**
 * Tenant entity for multi-tenancy
 */
export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  logo_url?: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  billing_email: string;
  settings: TenantSettings;
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export interface TenantSettings {
  max_projects: number;
  max_users: number;
  storage_limit_gb: number;
  features: TenantFeature[];
}

export interface TenantFeature {
  feature: string;
  enabled: boolean;
  limit?: number;
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  has_more?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Filter parameters for list queries
 */
export interface FilterParams {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  [key: string]: any;
}

/**
 * File upload types
 */
export interface FileUploadRequest {
  file: File | Buffer;
  filename: string;
  content_type: string;
  folder?: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  content_type: string;
}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

/**
 * Real-time event types
 */
export enum RealtimeEventType {
  SCENE_WRAP = 'scene_wrap',
  SCHEDULE_UPDATE = 'schedule_update',
  CASTING_UPDATE = 'casting_update',
  LOCATION_UPDATE = 'location_update',
  BUDGET_UPDATE = 'budget_update',
  USER_ACTIVITY = 'user_activity'
}

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, any>;
  user_id: string;
  project_id: string;
  timestamp: string;
}

// ============================================================================
// FORM AND VALIDATION TYPES
// ============================================================================

/**
 * Form field types for dynamic forms
 */
export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NUMBER = 'number',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TEXTAREA = 'textarea',
  FILE = 'file',
  IMAGE = 'image'
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: ValidationRule[];
  default_value?: any;
}

export interface FormFieldOption {
  label: string;
  value: any;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './database';
export * from './api';
export * from './components';