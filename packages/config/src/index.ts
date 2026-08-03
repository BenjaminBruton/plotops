/**
 * @plotops/config - Configuration management for PlotOps film production ERP
 * 
 * This package provides centralized configuration management for all environments,
 * services, and features across the PlotOps monorepo.
 */

import { UserRole, Permission, SubscriptionPlan } from '@plotops/types';

// ============================================================================
// ENVIRONMENT UTILITIES
// ============================================================================

/**
 * Get environment variable with optional default value
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
};

/**
 * Get required environment variable (throws if not found)
 */
export const getRequiredEnvVar = (key: string): string => {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

/**
 * Get boolean environment variable
 */
export const getBooleanEnvVar = (key: string, defaultValue = false): boolean => {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Get number environment variable
 */
export const getNumberEnvVar = (key: string, defaultValue = 0): number => {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// ============================================================================
// CORE APPLICATION CONFIGURATION
// ============================================================================

const appConfig = {
  name: 'PlotOps',
  version: '1.0.0',
  description: 'Cradle-to-Grave Film Production ERP',
  environment: getEnvVar('NEXT_PUBLIC_APP_ENV', 'development') as 'development' | 'staging' | 'production',
  isDevelopment: getEnvVar('NEXT_PUBLIC_APP_ENV', 'development') === 'development',
  isStaging: getEnvVar('NEXT_PUBLIC_APP_ENV', 'development') === 'staging',
  isProduction: getEnvVar('NEXT_PUBLIC_APP_ENV', 'development') === 'production',
  baseUrl: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),
  wsUrl: getEnvVar('NEXT_PUBLIC_WS_URL', 'ws://localhost:3000'),
  timezone: getEnvVar('NEXT_PUBLIC_DEFAULT_TIMEZONE', 'America/Los_Angeles'),
  locale: getEnvVar('NEXT_PUBLIC_DEFAULT_LOCALE', 'en-US'),
  currency: getEnvVar('NEXT_PUBLIC_DEFAULT_CURRENCY', 'USD'),
} as const;

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const databaseConfig = {
  supabase: {
    url: getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    jwtSecret: getEnvVar('SUPABASE_JWT_SECRET'),
    maxConnections: getNumberEnvVar('SUPABASE_MAX_CONNECTIONS', 10),
    connectionTimeout: getNumberEnvVar('SUPABASE_CONNECTION_TIMEOUT', 30000),
    enableRealtime: getBooleanEnvVar('SUPABASE_ENABLE_REALTIME', true),
    realtimeChannels: {
      projects: 'projects',
      scenes: 'scenes',
      schedule: 'schedule',
      casting: 'casting',
      locations: 'locations',
      assets: 'assets',
    },
  },
  redis: {
    url: getEnvVar('REDIS_URL'),
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: getNumberEnvVar('REDIS_PORT', 6379),
    password: getEnvVar('REDIS_PASSWORD'),
    db: getNumberEnvVar('REDIS_DB', 0),
    keyPrefix: getEnvVar('REDIS_KEY_PREFIX', 'plotops:'),
    ttl: getNumberEnvVar('REDIS_DEFAULT_TTL', 3600), // 1 hour
  },
} as const;

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================

const authConfig = {
  sessionTimeout: getNumberEnvVar('AUTH_SESSION_TIMEOUT', 86400), // 24 hours
  refreshTokenTimeout: getNumberEnvVar('AUTH_REFRESH_TOKEN_TIMEOUT', 604800), // 7 days
  passwordMinLength: getNumberEnvVar('AUTH_PASSWORD_MIN_LENGTH', 8),
  passwordRequireSpecialChars: getBooleanEnvVar('AUTH_PASSWORD_REQUIRE_SPECIAL', true),
  maxLoginAttempts: getNumberEnvVar('AUTH_MAX_LOGIN_ATTEMPTS', 5),
  lockoutDuration: getNumberEnvVar('AUTH_LOCKOUT_DURATION', 900), // 15 minutes
  enableMfa: getBooleanEnvVar('AUTH_ENABLE_MFA', false),
  enableSso: getBooleanEnvVar('AUTH_ENABLE_SSO', false),
  ssoProviders: {
    google: {
      clientId: getEnvVar('GOOGLE_CLIENT_ID'),
      clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
      enabled: getBooleanEnvVar('GOOGLE_SSO_ENABLED', false),
    },
    microsoft: {
      clientId: getEnvVar('MICROSOFT_CLIENT_ID'),
      clientSecret: getEnvVar('MICROSOFT_CLIENT_SECRET'),
      enabled: getBooleanEnvVar('MICROSOFT_SSO_ENABLED', false),
    },
  },
} as const;

// ============================================================================
// ROLE-BASED ACCESS CONTROL CONFIGURATION
// ============================================================================

const rbacConfig = {
  roles: {
    [UserRole.ADMIN]: {
      permissions: [
        Permission.READ,
        Permission.WRITE,
        Permission.DELETE,
        Permission.ADMIN,
      ],
      description: 'Full system access',
    },
    [UserRole.PRODUCER]: {
      permissions: [Permission.READ, Permission.WRITE, Permission.DELETE],
      description: 'Project management and oversight',
    },
    [UserRole.ASSISTANT_DIRECTOR]: {
      permissions: [Permission.READ, Permission.WRITE],
      description: 'Schedule and logistics management',
    },
    [UserRole.CASTING_DIRECTOR]: {
      permissions: [Permission.READ, Permission.WRITE],
      description: 'Casting and talent management',
    },
    [UserRole.LOCATION_SCOUT]: {
      permissions: [Permission.READ, Permission.WRITE],
      description: 'Location scouting and management',
    },
    [UserRole.EDITOR]: {
      permissions: [Permission.READ, Permission.WRITE],
      description: 'Post-production and asset management',
    },
    [UserRole.PUBLICIST]: {
      permissions: [Permission.READ],
      description: 'Marketing and publicity access',
    },
    [UserRole.SCRIPT_SUPERVISOR]: {
      permissions: [Permission.READ, Permission.WRITE],
      description: 'On-set tracking and continuity',
    },
  },
  resourcePermissions: {
    projects: {
      [UserRole.PRODUCER]: [Permission.READ, Permission.WRITE, Permission.DELETE],
      [UserRole.ASSISTANT_DIRECTOR]: [Permission.READ, Permission.WRITE],
      [UserRole.CASTING_DIRECTOR]: [Permission.READ],
      [UserRole.LOCATION_SCOUT]: [Permission.READ],
      [UserRole.EDITOR]: [Permission.READ],
      [UserRole.PUBLICIST]: [Permission.READ],
      [UserRole.SCRIPT_SUPERVISOR]: [Permission.READ],
    },
    scenes: {
      [UserRole.PRODUCER]: [Permission.READ, Permission.WRITE, Permission.DELETE],
      [UserRole.ASSISTANT_DIRECTOR]: [Permission.READ, Permission.WRITE],
      [UserRole.SCRIPT_SUPERVISOR]: [Permission.READ, Permission.WRITE],
      [UserRole.CASTING_DIRECTOR]: [Permission.READ],
      [UserRole.LOCATION_SCOUT]: [Permission.READ],
      [UserRole.EDITOR]: [Permission.READ],
    },
    cast: {
      [UserRole.CASTING_DIRECTOR]: [Permission.READ, Permission.WRITE, Permission.DELETE],
      [UserRole.PRODUCER]: [Permission.READ, Permission.WRITE],
      [UserRole.ASSISTANT_DIRECTOR]: [Permission.READ],
      [UserRole.SCRIPT_SUPERVISOR]: [Permission.READ],
    },
    locations: {
      [UserRole.LOCATION_SCOUT]: [Permission.READ, Permission.WRITE, Permission.DELETE],
      [UserRole.PRODUCER]: [Permission.READ, Permission.WRITE],
      [UserRole.ASSISTANT_DIRECTOR]: [Permission.READ, Permission.WRITE],
    },
    assets: {
      [UserRole.PRODUCER]: [Permission.READ, Permission.WRITE, Permission.DELETE],
      [UserRole.ASSISTANT_DIRECTOR]: [Permission.READ, Permission.WRITE],
      [UserRole.EDITOR]: [Permission.READ, Permission.WRITE],
    },
    schedule: {
      [UserRole.ASSISTANT_DIRECTOR]: [Permission.READ, Permission.WRITE, Permission.DELETE],
      [UserRole.PRODUCER]: [Permission.READ, Permission.WRITE],
      [UserRole.SCRIPT_SUPERVISOR]: [Permission.READ, Permission.WRITE],
    },
    budget: {
      [UserRole.PRODUCER]: [Permission.READ, Permission.WRITE, Permission.DELETE],
      [UserRole.ASSISTANT_DIRECTOR]: [Permission.READ],
    },
  },
} as const;

// ============================================================================
// EXTERNAL SERVICES CONFIGURATION
// ============================================================================

const servicesConfig = {
  googleMaps: {
    apiKey: getRequiredEnvVar('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'),
    libraries: ['places', 'geometry', 'drawing'] as const,
    region: getEnvVar('GOOGLE_MAPS_REGION', 'US'),
    language: getEnvVar('GOOGLE_MAPS_LANGUAGE', 'en'),
    mapStyles: {
      default: 'roadmap',
      satellite: 'satellite',
      hybrid: 'hybrid',
      terrain: 'terrain',
    },
    defaultZoom: getNumberEnvVar('GOOGLE_MAPS_DEFAULT_ZOOM', 12),
    maxZoom: getNumberEnvVar('GOOGLE_MAPS_MAX_ZOOM', 20),
  },
  weather: {
    provider: getEnvVar('WEATHER_PROVIDER', 'openweathermap') as 'openweathermap' | 'weatherapi',
    apiKey: getRequiredEnvVar('WEATHER_API_KEY'),
    baseUrl: getEnvVar('WEATHER_API_URL', 'https://api.openweathermap.org/data/2.5'),
    units: getEnvVar('WEATHER_UNITS', 'imperial') as 'metric' | 'imperial',
    cacheTtl: getNumberEnvVar('WEATHER_CACHE_TTL', 1800), // 30 minutes
  },
  n8n: {
    baseUrl: getRequiredEnvVar('N8N_BASE_URL'),
    apiKey: getEnvVar('N8N_API_KEY'),
    webhookUrl: getEnvVar('N8N_WEBHOOK_URL'),
    workflows: {
      scriptParsing: getEnvVar('N8N_SCRIPT_PARSING_WORKFLOW'),
      callSheetGeneration: getEnvVar('N8N_CALL_SHEET_WORKFLOW'),
      scheduleOptimization: getEnvVar('N8N_SCHEDULE_OPTIMIZATION_WORKFLOW'),
      budgetTracking: getEnvVar('N8N_BUDGET_TRACKING_WORKFLOW'),
      notificationDispatch: getEnvVar('N8N_NOTIFICATION_WORKFLOW'),
    },
    timeout: getNumberEnvVar('N8N_TIMEOUT', 30000),
    retryAttempts: getNumberEnvVar('N8N_RETRY_ATTEMPTS', 3),
  },
  storage: {
    provider: getEnvVar('STORAGE_PROVIDER', 'supabase') as 'supabase' | 's3' | 'gcs',
    bucket: getEnvVar('NEXT_PUBLIC_STORAGE_BUCKET', 'plotops-assets'),
    region: getEnvVar('STORAGE_REGION', 'us-east-1'),
    maxFileSize: getNumberEnvVar('STORAGE_MAX_FILE_SIZE', 100 * 1024 * 1024), // 100MB
    allowedFileTypes: {
      scripts: ['.fdx', '.pdf', '.txt', '.fountain'],
      images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      audio: ['.mp3', '.wav', '.aac', '.flac'],
      documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    },
    folders: {
      scripts: 'scripts',
      headshots: 'headshots',
      demoReels: 'demo-reels',
      locationPhotos: 'location-photos',
      callSheets: 'call-sheets',
      digitalAssets: 'digital-assets',
      documents: 'documents',
    },
  },
  email: {
    provider: getEnvVar('EMAIL_PROVIDER', 'sendgrid') as 'sendgrid' | 'ses' | 'smtp',
    apiKey: getEnvVar('EMAIL_API_KEY'),
    fromEmail: getEnvVar('EMAIL_FROM_ADDRESS', 'noreply@plotops.com'),
    fromName: getEnvVar('EMAIL_FROM_NAME', 'PlotOps'),
    templates: {
      welcome: getEnvVar('EMAIL_TEMPLATE_WELCOME'),
      castingCall: getEnvVar('EMAIL_TEMPLATE_CASTING_CALL'),
      scheduleUpdate: getEnvVar('EMAIL_TEMPLATE_SCHEDULE_UPDATE'),
      callSheet: getEnvVar('EMAIL_TEMPLATE_CALL_SHEET'),
      sceneWrap: getEnvVar('EMAIL_TEMPLATE_SCENE_WRAP'),
    },
  },
  sms: {
    provider: getEnvVar('SMS_PROVIDER', 'twilio') as 'twilio' | 'aws-sns',
    accountSid: getEnvVar('TWILIO_ACCOUNT_SID'),
    authToken: getEnvVar('TWILIO_AUTH_TOKEN'),
    fromNumber: getEnvVar('TWILIO_FROM_NUMBER'),
    enabled: getBooleanEnvVar('SMS_ENABLED', false),
  },
  analytics: {
    provider: getEnvVar('ANALYTICS_PROVIDER', 'mixpanel') as 'mixpanel' | 'amplitude' | 'ga4',
    apiKey: getEnvVar('ANALYTICS_API_KEY'),
    projectId: getEnvVar('ANALYTICS_PROJECT_ID'),
    enabled: getBooleanEnvVar('ANALYTICS_ENABLED', true),
    trackingEvents: {
      projectCreated: 'project_created',
      sceneWrapped: 'scene_wrapped',
      actorCast: 'actor_cast',
      locationBooked: 'location_booked',
      callSheetGenerated: 'call_sheet_generated',
      scheduleOptimized: 'schedule_optimized',
    },
  },
} as const;

// ============================================================================
// FEATURE FLAGS CONFIGURATION
// ============================================================================

const featureFlags = {
  // Core features
  enableRealTimeUpdates: getBooleanEnvVar('FEATURE_REALTIME_UPDATES', true),
  enableOfflineMode: getBooleanEnvVar('FEATURE_OFFLINE_MODE', false),
  enablePushNotifications: getBooleanEnvVar('FEATURE_PUSH_NOTIFICATIONS', true),
  
  // AI and automation features
  enableAiScriptParsing: getBooleanEnvVar('FEATURE_AI_SCRIPT_PARSING', true),
  enableAiScheduleOptimization: getBooleanEnvVar('FEATURE_AI_SCHEDULE_OPTIMIZATION', false),
  enableAiBudgetPrediction: getBooleanEnvVar('FEATURE_AI_BUDGET_PREDICTION', false),
  enableAiCastingSuggestions: getBooleanEnvVar('FEATURE_AI_CASTING_SUGGESTIONS', false),
  
  // Advanced features
  enableAdvancedScheduling: getBooleanEnvVar('FEATURE_ADVANCED_SCHEDULING', false),
  enableBudgetTracking: getBooleanEnvVar('FEATURE_BUDGET_TRACKING', true),
  enableLocationMapping: getBooleanEnvVar('FEATURE_LOCATION_MAPPING', true),
  enableDigitalAssetManagement: getBooleanEnvVar('FEATURE_DIGITAL_ASSET_MANAGEMENT', true),
  enableWeatherIntegration: getBooleanEnvVar('FEATURE_WEATHER_INTEGRATION', true),
  
  // Beta features
  enableBetaFeatures: getBooleanEnvVar('FEATURE_BETA_FEATURES', appConfig.isDevelopment),
  enableExperimentalFeatures: getBooleanEnvVar('FEATURE_EXPERIMENTAL', appConfig.isDevelopment),
  
  // Mobile features
  enableMobileApp: getBooleanEnvVar('FEATURE_MOBILE_APP', true),
  enableMobileOfflineSync: getBooleanEnvVar('FEATURE_MOBILE_OFFLINE_SYNC', false),
  
  // Integration features
  enableN8nIntegration: getBooleanEnvVar('FEATURE_N8N_INTEGRATION', true),
  enableWebhooks: getBooleanEnvVar('FEATURE_WEBHOOKS', true),
  enableApiAccess: getBooleanEnvVar('FEATURE_API_ACCESS', true),
} as const;

// ============================================================================
// SUBSCRIPTION AND BILLING CONFIGURATION
// ============================================================================

const subscriptionConfig = {
  plans: {
    [SubscriptionPlan.FREE]: {
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: {
        maxProjects: 1,
        maxUsers: 3,
        storageLimit: 1, // GB
        maxScenes: 50,
        maxCast: 20,
        maxLocations: 10,
        enableRealtime: false,
        enableAiFeatures: false,
        enableAdvancedScheduling: false,
        supportLevel: 'community',
      },
    },
    [SubscriptionPlan.BASIC]: {
      name: 'Basic',
      price: 29,
      currency: 'USD',
      interval: 'month',
      features: {
        maxProjects: 3,
        maxUsers: 10,
        storageLimit: 10, // GB
        maxScenes: 200,
        maxCast: 100,
        maxLocations: 50,
        enableRealtime: true,
        enableAiFeatures: true,
        enableAdvancedScheduling: false,
        supportLevel: 'email',
      },
    },
    [SubscriptionPlan.PROFESSIONAL]: {
      name: 'Professional',
      price: 99,
      currency: 'USD',
      interval: 'month',
      features: {
        maxProjects: 10,
        maxUsers: 50,
        storageLimit: 100, // GB
        maxScenes: 1000,
        maxCast: 500,
        maxLocations: 200,
        enableRealtime: true,
        enableAiFeatures: true,
        enableAdvancedScheduling: true,
        supportLevel: 'priority',
      },
    },
    [SubscriptionPlan.ENTERPRISE]: {
      name: 'Enterprise',
      price: 299,
      currency: 'USD',
      interval: 'month',
      features: {
        maxProjects: -1, // unlimited
        maxUsers: -1, // unlimited
        storageLimit: -1, // unlimited
        maxScenes: -1, // unlimited
        maxCast: -1, // unlimited
        maxLocations: -1, // unlimited
        enableRealtime: true,
        enableAiFeatures: true,
        enableAdvancedScheduling: true,
        supportLevel: 'dedicated',
      },
    },
  },
  billing: {
    provider: getEnvVar('BILLING_PROVIDER', 'stripe') as 'stripe' | 'paddle',
    publicKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
    currency: getEnvVar('BILLING_CURRENCY', 'USD'),
    taxCalculation: getBooleanEnvVar('BILLING_TAX_CALCULATION', true),
  },
} as const;

// ============================================================================
// PERFORMANCE AND MONITORING CONFIGURATION
// ============================================================================

const monitoringConfig = {
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
    format: getEnvVar('LOG_FORMAT', 'json') as 'json' | 'text',
    destination: getEnvVar('LOG_DESTINATION', 'console') as 'console' | 'file' | 'remote',
    enableRequestLogging: getBooleanEnvVar('LOG_REQUESTS', true),
    enableErrorTracking: getBooleanEnvVar('LOG_ERRORS', true),
  },
  metrics: {
    provider: getEnvVar('METRICS_PROVIDER', 'prometheus') as 'prometheus' | 'datadog' | 'newrelic',
    endpoint: getEnvVar('METRICS_ENDPOINT'),
    apiKey: getEnvVar('METRICS_API_KEY'),
    enabled: getBooleanEnvVar('METRICS_ENABLED', true),
    collectInterval: getNumberEnvVar('METRICS_COLLECT_INTERVAL', 60000), // 1 minute
  },
  tracing: {
    provider: getEnvVar('TRACING_PROVIDER', 'jaeger') as 'jaeger' | 'zipkin' | 'datadog',
    endpoint: getEnvVar('TRACING_ENDPOINT'),
    serviceName: getEnvVar('TRACING_SERVICE_NAME', 'plotops'),
    enabled: getBooleanEnvVar('TRACING_ENABLED', false),
    sampleRate: getNumberEnvVar('TRACING_SAMPLE_RATE', 0.1),
  },
  errorTracking: {
    provider: getEnvVar('ERROR_TRACKING_PROVIDER', 'sentry') as 'sentry' | 'bugsnag' | 'rollbar',
    dsn: getEnvVar('SENTRY_DSN'),
    environment: appConfig.environment,
    enabled: getBooleanEnvVar('ERROR_TRACKING_ENABLED', true),
    sampleRate: getNumberEnvVar('ERROR_TRACKING_SAMPLE_RATE', 1.0),
  },
} as const;

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

const rateLimitConfig = {
  api: {
    windowMs: getNumberEnvVar('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    maxRequests: getNumberEnvVar('RATE_LIMIT_MAX_REQUESTS', 100),
    skipSuccessfulRequests: getBooleanEnvVar('RATE_LIMIT_SKIP_SUCCESSFUL', false),
    skipFailedRequests: getBooleanEnvVar('RATE_LIMIT_SKIP_FAILED', false),
  },
  auth: {
    windowMs: getNumberEnvVar('AUTH_RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    maxRequests: getNumberEnvVar('AUTH_RATE_LIMIT_MAX_REQUESTS', 5),
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  fileUpload: {
    windowMs: getNumberEnvVar('UPLOAD_RATE_LIMIT_WINDOW_MS', 3600000), // 1 hour
    maxRequests: getNumberEnvVar('UPLOAD_RATE_LIMIT_MAX_REQUESTS', 50),
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
  },
} as const;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const cacheConfig = {
  default: {
    ttl: getNumberEnvVar('CACHE_DEFAULT_TTL', 3600), // 1 hour
    maxSize: getNumberEnvVar('CACHE_MAX_SIZE', 1000),
    enabled: getBooleanEnvVar('CACHE_ENABLED', true),
  },
  queries: {
    ttl: getNumberEnvVar('CACHE_QUERIES_TTL', 300), // 5 minutes
    maxSize: getNumberEnvVar('CACHE_QUERIES_MAX_SIZE', 500),
  },
  static: {
    ttl: getNumberEnvVar('CACHE_STATIC_TTL', 86400), // 24 hours
    maxSize: getNumberEnvVar('CACHE_STATIC_MAX_SIZE', 100),
  },
  user: {
    ttl: getNumberEnvVar('CACHE_USER_TTL', 1800), // 30 minutes
    maxSize: getNumberEnvVar('CACHE_USER_MAX_SIZE', 1000),
  },
} as const;

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const securityConfig = {
  cors: {
    origin: getEnvVar('CORS_ORIGIN', '*'),
    credentials: getBooleanEnvVar('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
  csp: {
    enabled: getBooleanEnvVar('CSP_ENABLED', true),
    reportOnly: getBooleanEnvVar('CSP_REPORT_ONLY', false),
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      fontSrc: ["'self'", 'https:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  encryption: {
    algorithm: getEnvVar('ENCRYPTION_ALGORITHM', 'aes-256-gcm'),
    keyLength: getNumberEnvVar('ENCRYPTION_KEY_LENGTH', 32),
    ivLength: getNumberEnvVar('ENCRYPTION_IV_LENGTH', 16),
    tagLength: getNumberEnvVar('ENCRYPTION_TAG_LENGTH', 16),
  },
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export {
  appConfig,
  databaseConfig,
  authConfig,
  rbacConfig,
  servicesConfig,
  featureFlags,
  subscriptionConfig,
  monitoringConfig,
  rateLimitConfig,
  cacheConfig,
  securityConfig,
};

// Legacy exports for backward compatibility
export const apiConfig = {
  supabaseUrl: databaseConfig.supabase.url,
  supabaseAnonKey: databaseConfig.supabase.anonKey,
  baseUrl: appConfig.apiUrl,
};

export const serviceConfig = {
  googleMapsApiKey: servicesConfig.googleMaps.apiKey,
  weatherApiKey: servicesConfig.weather.apiKey,
  n8nWebhookUrl: servicesConfig.n8n.webhookUrl,
  storageBucket: servicesConfig.storage.bucket,
};

// Configuration validation
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required environment variables
  try {
    getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    getRequiredEnvVar('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
    getRequiredEnvVar('WEATHER_API_KEY');
    getRequiredEnvVar('N8N_BASE_URL');
  } catch (error) {
    errors.push((error as Error).message);
  }

  // Validate configuration consistency
  if (featureFlags.enableWeatherIntegration && !servicesConfig.weather.apiKey) {
    errors.push('Weather integration is enabled but no API key is provided');
  }

  if (featureFlags.enableN8nIntegration && !servicesConfig.n8n.baseUrl) {
    errors.push('n8n integration is enabled but no base URL is provided');
  }

  if (featureFlags.enableLocationMapping && !servicesConfig.googleMaps.apiKey) {
    errors.push('Location mapping is enabled but no Google Maps API key is provided');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};