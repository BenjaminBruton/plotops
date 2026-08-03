/**
 * API-specific types for PlotOps REST and GraphQL endpoints
 */

export * from './database';

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
  UserRole,
  PaginationParams,
  FilterParams,
  FileUploadRequest,
  FileUploadResponse
} from './index';

// ============================================================================
// API REQUEST TYPES
// ============================================================================

/**
 * Authentication requests
 */
export interface LoginRequest {
  email: string;
  password: string;
  tenant_slug?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  tenant_name?: string;
  tenant_slug?: string;
  role?: UserRole;
}

export interface ResetPasswordRequest {
  email: string;
  tenant_slug?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

/**
 * Project management requests
 */
export interface CreateProjectRequest {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  script_file?: FileUploadRequest;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency?: string;
  status?: string;
}

export interface ScriptUploadRequest {
  project_id: string;
  file: FileUploadRequest;
  auto_parse?: boolean;
  parser_options?: ScriptParserOptions;
}

export interface ScriptParserOptions {
  format: 'fdx' | 'pdf' | 'txt';
  extract_characters: boolean;
  extract_locations: boolean;
  extract_props: boolean;
  complexity_analysis: boolean;
}

/**
 * Scene management requests
 */
export interface CreateSceneRequest {
  project_id: string;
  scene_number: string;
  int_ext: 'INT' | 'EXT';
  day_night: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  location_name: string;
  description: string;
  page_count: number;
  estimated_duration: number;
  complexity_rating: 1 | 2 | 3 | 4 | 5;
  script_page_start: number;
  script_page_end: number;
}

export interface UpdateSceneRequest {
  scene_number?: string;
  int_ext?: 'INT' | 'EXT';
  day_night?: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  location_name?: string;
  location_id?: string;
  description?: string;
  page_count?: number;
  estimated_duration?: number;
  complexity_rating?: 1 | 2 | 3 | 4 | 5;
  status?: string;
  scheduled_date?: string;
  notes?: string;
}

export interface SceneWrapRequest {
  scene_id: string;
  actual_end_time: string;
  notes?: string;
  issues?: SceneIssue[];
  reshoot_required?: boolean;
}

export interface SceneIssue {
  type: 'technical' | 'performance' | 'continuity' | 'weather' | 'equipment';
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}

/**
 * Casting management requests
 */
export interface CreateCastingCallRequest {
  project_id: string;
  character_id: string;
  title: string;
  description: string;
  requirements: string[];
  audition_dates: AuditionDate[];
  submission_deadline: string;
  is_public: boolean;
  sides?: string;
}

export interface AuditionDate {
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  slots_available: number;
}

export interface SubmitAuditionRequest {
  casting_call_id: string;
  actor_name: string;
  actor_email: string;
  actor_phone?: string;
  headshot: FileUploadRequest;
  demo_reel?: FileUploadRequest;
  cover_letter?: string;
  availability: string[];
}

export interface CastActorRequest {
  character_id: string;
  actor_id: string;
  rate?: number;
  rate_type?: string;
  contract_details?: ContractDetails;
}

export interface ContractDetails {
  start_date: string;
  end_date: string;
  daily_rate?: number;
  total_compensation?: number;
  overtime_rate?: number;
  travel_allowance?: number;
  accommodation_provided: boolean;
  meal_allowance?: number;
}

/**
 * Location management requests
 */
export interface CreateLocationRequest {
  project_id: string;
  name: string;
  address: string;
  location_type: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  permit_required: boolean;
  cost_per_day?: number;
  amenities?: string[];
}

export interface LocationScoutRequest {
  location_id: string;
  scout_date: string;
  scout_notes: string;
  photos: FileUploadRequest[];
  amenities_verified: string[];
  issues_identified: LocationIssue[];
  recommendation: 'approved' | 'approved_with_conditions' | 'rejected';
}

export interface LocationIssue {
  type: 'access' | 'parking' | 'power' | 'noise' | 'permits' | 'safety';
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolution_required: boolean;
}

/**
 * Schedule management requests
 */
export interface CreateScheduleRequest {
  project_id: string;
  items: CreateScheduleItemRequest[];
  optimization_preferences?: ScheduleOptimizationPreferences;
}

export interface CreateScheduleItemRequest {
  scene_id: string;
  shoot_date: string;
  call_time: string;
  estimated_wrap_time: string;
  location_id: string;
  cast_ids: string[];
  crew_call_time?: string;
  notes?: string;
}

export interface ScheduleOptimizationPreferences {
  prioritize_actor_availability: boolean;
  prioritize_location_grouping: boolean;
  prioritize_script_order: boolean;
  max_scenes_per_day: number;
  preferred_call_time: string;
  avoid_weather_sensitive_scenes_on: string[];
}

export interface GenerateCallSheetRequest {
  project_id: string;
  shoot_date: string;
  include_weather: boolean;
  include_maps: boolean;
  custom_notes?: string;
  emergency_contacts?: string[];
}

/**
 * Asset management requests
 */
export interface CreateAssetRequest {
  project_id: string;
  name: string;
  asset_type: string;
  description?: string;
  scenes: string[];
  source: string;
  cost?: number;
  vendor_contact?: string;
  notes?: string;
}

export interface AssetCheckoutRequest {
  asset_id: string;
  checked_out_to: string;
  checkout_date: string;
  expected_return_date: string;
  notes?: string;
}

export interface AssetReturnRequest {
  asset_id: string;
  return_date: string;
  condition: 'excellent' | 'good' | 'fair' | 'damaged' | 'lost';
  notes?: string;
  damage_photos?: FileUploadRequest[];
}

/**
 * Digital asset management requests
 */
export interface UploadDigitalAssetRequest {
  project_id: string;
  scene_id?: string;
  files: FileUploadRequest[];
  metadata?: DigitalAssetMetadataRequest;
  tags?: string[];
}

export interface DigitalAssetMetadataRequest {
  take_number?: number;
  camera_angle?: string;
  timecode_in?: string;
  timecode_out?: string;
  notes?: string;
}

export interface TagDigitalAssetRequest {
  asset_id: string;
  tags: string[];
  remove_existing?: boolean;
}

export interface ReviewDigitalAssetRequest {
  asset_id: string;
  status: 'approved' | 'needs_revision' | 'rejected';
  notes?: string;
  revision_requests?: RevisionRequest[];
}

export interface RevisionRequest {
  type: 'color_correction' | 'audio_sync' | 'vfx' | 'editing' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Authentication responses
 */
export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

/**
 * Project responses
 */
export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface ProjectDetailResponse {
  project: Project;
  scenes: Scene[];
  cast: Character[];
  locations: Location[];
  schedule_summary: ScheduleSummary;
  budget_summary: BudgetSummary;
}

export interface ScheduleSummary {
  total_shoot_days: number;
  scheduled_days: number;
  completed_days: number;
  next_shoot_date?: string;
  scenes_behind_schedule: number;
}

export interface BudgetSummary {
  total_budget: number;
  allocated_budget: number;
  spent_budget: number;
  remaining_budget: number;
  budget_categories: BudgetCategory[];
}

export interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  percentage_used: number;
}

/**
 * Script parsing responses
 */
export interface ScriptParseResponse {
  success: boolean;
  scenes: ParsedScene[];
  characters: ParsedCharacter[];
  locations: ParsedLocation[];
  props: ParsedProp[];
  metadata: {
    total_pages: number;
    estimated_runtime: number;
    parser_version: string;
    confidence_score: number;
  };
  warnings: string[];
}

export interface ParsedScene {
  scene_number: string;
  int_ext: 'INT' | 'EXT';
  day_night: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  location_name: string;
  description: string;
  page_count: number;
  estimated_duration: number;
  characters_present: string[];
  props_mentioned: string[];
  script_page_start: number;
  script_page_end: number;
  confidence_score: number;
}

export interface ParsedCharacter {
  name: string;
  character_type: string;
  speaking_lines_count: number;
  first_appearance_page: number;
  last_appearance_page: number;
  scenes_present: string[];
  description?: string;
  confidence_score: number;
}

export interface ParsedLocation {
  name: string;
  location_type: 'INT' | 'EXT';
  scenes: string[];
  description?: string;
  estimated_setup_time: number;
  confidence_score: number;
}

export interface ParsedProp {
  name: string;
  description?: string;
  scenes: string[];
  importance: 'background' | 'featured' | 'hero';
  estimated_cost: number;
  confidence_score: number;
}

/**
 * Casting responses
 */
export interface CastingCallListResponse {
  casting_calls: CastingCall[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface CastingCall {
  id: string;
  project_id: string;
  character_id: string;
  title: string;
  description: string;
  requirements: string[];
  audition_dates: AuditionDate[];
  submission_deadline: string;
  is_public: boolean;
  submissions_count: number;
  status: 'open' | 'closed' | 'cast';
  created_at: string;
}

export interface AuditionSubmissionResponse {
  submission_id: string;
  status: 'received' | 'under_review' | 'callback' | 'cast' | 'rejected';
  submitted_at: string;
}

/**
 * Analytics and reporting responses
 */
export interface ProjectAnalyticsResponse {
  project_id: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  production_metrics: ProductionMetrics;
  budget_metrics: BudgetMetrics;
  schedule_metrics: ScheduleMetrics;
  team_metrics: TeamMetrics;
}

export interface ProductionMetrics {
  scenes_completed: number;
  scenes_total: number;
  completion_percentage: number;
  average_scene_duration: number;
  scenes_per_day_average: number;
  reshoot_percentage: number;
}

export interface BudgetMetrics {
  budget_utilization: number;
  cost_per_scene: number;
  cost_per_day: number;
  budget_variance: number;
  top_expense_categories: ExpenseCategory[];
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage_of_total: number;
}

export interface ScheduleMetrics {
  on_time_percentage: number;
  average_delay_minutes: number;
  schedule_efficiency: number;
  weather_delays: number;
  equipment_delays: number;
}

export interface TeamMetrics {
  crew_utilization: number;
  cast_availability: number;
  location_efficiency: number;
  asset_utilization: number;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, any>;
  timestamp: string;
  project_id: string;
  user_id: string;
}

export enum WebhookEventType {
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  SCENE_WRAPPED = 'scene.wrapped',
  SCHEDULE_UPDATED = 'schedule.updated',
  CASTING_CALL_CREATED = 'casting_call.created',
  ACTOR_CAST = 'actor.cast',
  LOCATION_BOOKED = 'location.booked',
  ASSET_CHECKED_OUT = 'asset.checked_out',
  CALL_SHEET_GENERATED = 'call_sheet.generated',
  BUDGET_EXCEEDED = 'budget.exceeded'
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  active: boolean;
  created_at: string;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

/**
 * n8n automation integration
 */
export interface N8nWorkflowTrigger {
  workflow_id: string;
  trigger_data: Record<string, any>;
  execution_mode: 'sync' | 'async';
}

export interface N8nWorkflowResult {
  execution_id: string;
  status: 'running' | 'success' | 'error';
  result?: Record<string, any>;
  error?: string;
  duration_ms?: number;
}

/**
 * Google Maps integration
 */
export interface GoogleMapsLocationRequest {
  address: string;
  location_type?: string;
  radius?: number;
}

export interface GoogleMapsLocationResponse {
  place_id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  place_types: string[];
  photos?: GoogleMapsPhoto[];
  reviews?: GoogleMapsReview[];
}

export interface GoogleMapsPhoto {
  photo_reference: string;
  width: number;
  height: number;
  html_attributions: string[];
}

export interface GoogleMapsReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
}

/**
 * Weather API integration
 */
export interface WeatherForecastRequest {
  latitude: number;
  longitude: number;
  date: string;
}

export interface WeatherForecastResponse {
  date: string;
  temperature_high: number;
  temperature_low: number;
  conditions: string;
  precipitation_chance: number;
  wind_speed: number;
  humidity: number;
  sunrise: string;
  sunset: string;
  hourly_forecast: HourlyWeather[];
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  conditions: string;
  precipitation_chance: number;
  wind_speed: number;
}