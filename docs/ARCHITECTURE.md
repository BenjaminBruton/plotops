# PlotOps Architecture Documentation

This document provides comprehensive visual documentation of the PlotOps film production ERP system architecture, including system diagrams, data flows, and component relationships.

## 🏗️ System Architecture Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Applications"
        WEB[Web App<br/>Next.js]
        MOBILE[Mobile App<br/>React Native/Expo]
    end
    
    subgraph "Shared Packages"
        TYPES[Types]
        UI[UI Components]
        AUTH[Auth & RBAC]
        API[API Client]
        BL[Business Logic]
        SHARED[Shared Utils]
        CONFIG[Configuration]
    end
    
    subgraph "Backend Services"
        SUPABASE[Supabase<br/>Database + Auth + Storage]
        N8N[n8n<br/>Automation Workflows]
        REDIS[Redis<br/>Caching]
    end
    
    subgraph "External APIs"
        GMAPS[Google Maps API]
        WEATHER[Weather API]
        EMAIL[SendGrid]
        SMS[Twilio]
    end
    
    WEB --> TYPES
    WEB --> UI
    WEB --> AUTH
    WEB --> API
    WEB --> BL
    
    MOBILE --> TYPES
    MOBILE --> UI
    MOBILE --> AUTH
    MOBILE --> API
    MOBILE --> BL
    
    API --> SUPABASE
    BL --> N8N
    N8N --> EMAIL
    N8N --> SMS
    API --> REDIS
    
    WEB --> GMAPS
    MOBILE --> GMAPS
    N8N --> WEATHER
    
    TYPES --> SHARED
    UI --> SHARED
    AUTH --> CONFIG
    API --> CONFIG
```

### Monorepo Structure

```mermaid
graph TD
    ROOT[PlotOps Root]
    
    ROOT --> APPS[apps/]
    ROOT --> PACKAGES[packages/]
    ROOT --> SERVICES[services/]
    ROOT --> TOOLS[tools/]
    
    APPS --> WEB_APP[web/<br/>Next.js App]
    APPS --> MOBILE_APP[mobile/<br/>Expo App]
    
    PACKAGES --> PKG_TYPES[types/<br/>TypeScript Definitions]
    PACKAGES --> PKG_UI[ui/<br/>Component Library]
    PACKAGES --> PKG_AUTH[auth/<br/>Authentication & RBAC]
    PACKAGES --> PKG_API[api-client/<br/>Supabase Integration]
    PACKAGES --> PKG_BL[business-logic/<br/>Core Business Rules]
    PACKAGES --> PKG_SHARED[shared/<br/>Utilities]
    PACKAGES --> PKG_CONFIG[config/<br/>Configuration]
    
    SERVICES --> SVC_SUPABASE[supabase/<br/>Database Schema]
    SERVICES --> SVC_N8N[n8n-workflows/<br/>Automation]
    
    TOOLS --> TOOLS_DEV[dev/<br/>Development Scripts]
```

## 🎭 Role-Based Access Control (RBAC)

### User Roles and Permissions Matrix

```mermaid
graph LR
    subgraph "User Roles"
        PRODUCER[Producer]
        AD[Assistant Director]
        CASTING[Casting Director]
        SCOUT[Location Scout]
        EDITOR[Editor]
        PUBLICIST[Publicist]
    end
    
    subgraph "Resources"
        PROJECTS[Projects]
        SCENES[Scenes]
        CAST[Casting]
        LOCATIONS[Locations]
        ASSETS[Assets]
        SCHEDULE[Schedule]
    end
    
    PRODUCER --> PROJECTS
    PRODUCER --> SCENES
    PRODUCER --> CAST
    PRODUCER --> LOCATIONS
    PRODUCER --> ASSETS
    PRODUCER --> SCHEDULE
    
    AD --> SCENES
    AD --> SCHEDULE
    AD --> LOCATIONS
    
    CASTING --> CAST
    CASTING --> SCENES
    
    SCOUT --> LOCATIONS
    SCOUT --> SCENES
    
    EDITOR --> ASSETS
    EDITOR --> SCENES
    
    PUBLICIST --> ASSETS
    PUBLICIST --> PROJECTS
```

### Permission Levels

```mermaid
graph TD
    subgraph "Permission Types"
        READ[Read]
        WRITE[Write]
        DELETE[Delete]
        ADMIN[Admin]
    end
    
    subgraph "Resource Access"
        OWN[Own Organization]
        PROJECT[Own Projects]
        ASSIGNED[Assigned Projects]
        PUBLIC[Public Data]
    end
    
    READ --> OWN
    READ --> PROJECT
    READ --> ASSIGNED
    READ --> PUBLIC
    
    WRITE --> PROJECT
    WRITE --> ASSIGNED
    
    DELETE --> PROJECT
    
    ADMIN --> OWN
```

## 🗄️ Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    ORGANIZATIONS {
        uuid id PK
        string name
        string slug UK
        text description
        string logo_url
        jsonb settings
        timestamp created_at
        timestamp updated_at
    }
    
    USER_PROFILES {
        uuid id PK, FK
        uuid organization_id FK
        enum role
        string first_name
        string last_name
        string display_name
        text bio
        string avatar_url
        jsonb preferences
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    PROJECTS {
        uuid id PK
        uuid organization_id FK
        string title
        string slug
        text logline
        text synopsis
        string genre
        enum status
        string budget_range
        date start_date
        date end_date
        string script_url
        jsonb metadata
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    SCENES {
        uuid id PK
        uuid project_id FK
        string scene_number
        string scene_name
        string location_name
        enum scene_type
        enum time_of_day
        decimal page_count
        text description
        integer estimated_duration
        integer complexity_rating
        boolean is_pickup
        timestamp created_at
        timestamp updated_at
    }
    
    CHARACTERS {
        uuid id PK
        uuid project_id FK
        string name
        text description
        string age_range
        string gender
        string character_type
        text wardrobe_notes
        text makeup_notes
        timestamp created_at
        timestamp updated_at
    }
    
    LOCATIONS {
        uuid id PK
        uuid project_id FK
        string name
        text address
        point coordinates
        string location_type
        enum status
        string contact_name
        decimal cost_per_day
        text availability_notes
        boolean permits_required
        text[] photos
        timestamp created_at
        timestamp updated_at
    }
    
    CASTING_CALLS {
        uuid id PK
        uuid project_id FK
        uuid character_id FK
        string title
        text description
        text requirements
        enum status
        timestamp submission_deadline
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }
    
    ACTORS {
        uuid id PK
        string first_name
        string last_name
        string stage_name
        string email
        string phone
        string headshot_url
        string reel_url
        string union_status
        text[] special_skills
        timestamp created_at
        timestamp updated_at
    }
    
    ORGANIZATIONS ||--o{ USER_PROFILES : "has members"
    ORGANIZATIONS ||--o{ PROJECTS : "owns"
    PROJECTS ||--o{ SCENES : "contains"
    PROJECTS ||--o{ CHARACTERS : "has"
    PROJECTS ||--o{ LOCATIONS : "uses"
    PROJECTS ||--o{ CASTING_CALLS : "posts"
    CHARACTERS ||--o{ CASTING_CALLS : "for role"
    CASTING_CALLS ||--o{ ACTORS : "receives submissions"
    USER_PROFILES ||--o{ PROJECTS : "created by"
```

### Data Flow Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        WEB_CLIENT[Web Client]
        MOBILE_CLIENT[Mobile Client]
    end
    
    subgraph "API Layer"
        NEXT_API[Next.js API Routes]
        SUPABASE_API[Supabase REST API]
        SUPABASE_REALTIME[Supabase Realtime]
    end
    
    subgraph "Business Logic Layer"
        AUTH_SERVICE[Authentication Service]
        RBAC_SERVICE[RBAC Service]
        SCRIPT_SERVICE[Script Processing]
        SCHEDULING_SERVICE[Scheduling Service]
        NOTIFICATION_SERVICE[Notification Service]
    end
    
    subgraph "Data Layer"
        POSTGRES[PostgreSQL Database]
        STORAGE[Supabase Storage]
        REDIS_CACHE[Redis Cache]
    end
    
    subgraph "External Services"
        N8N_WORKFLOWS[n8n Workflows]
        GOOGLE_MAPS[Google Maps API]
        WEATHER_API[Weather API]
        EMAIL_SERVICE[Email Service]
        SMS_SERVICE[SMS Service]
    end
    
    WEB_CLIENT --> NEXT_API
    MOBILE_CLIENT --> SUPABASE_API
    
    NEXT_API --> AUTH_SERVICE
    NEXT_API --> RBAC_SERVICE
    NEXT_API --> SCRIPT_SERVICE
    NEXT_API --> SCHEDULING_SERVICE
    
    SUPABASE_API --> POSTGRES
    SUPABASE_API --> STORAGE
    SUPABASE_REALTIME --> POSTGRES
    
    AUTH_SERVICE --> POSTGRES
    RBAC_SERVICE --> POSTGRES
    SCRIPT_SERVICE --> N8N_WORKFLOWS
    SCHEDULING_SERVICE --> REDIS_CACHE
    NOTIFICATION_SERVICE --> EMAIL_SERVICE
    NOTIFICATION_SERVICE --> SMS_SERVICE
    
    N8N_WORKFLOWS --> GOOGLE_MAPS
    N8N_WORKFLOWS --> WEATHER_API
    N8N_WORKFLOWS --> EMAIL_SERVICE
    
    WEB_CLIENT -.-> SUPABASE_REALTIME
    MOBILE_CLIENT -.-> SUPABASE_REALTIME
```

## 🎬 Film Production Workflows

### Script Ingestion and Breakdown Workflow

```mermaid
graph TD
    START[Upload Script File] --> VALIDATE[Validate File Format]
    VALIDATE --> PARSE[Parse Script Content]
    PARSE --> EXTRACT[Extract Scenes, Characters, Props]
    EXTRACT --> AI_ANALYSIS[AI Analysis & Suggestions]
    AI_ANALYSIS --> BREAKDOWN_TABLE[Generate Breakdown Table]
    BREAKDOWN_TABLE --> HUMAN_REVIEW[Human Review & Edit]
    HUMAN_REVIEW --> APPROVE[Approve Breakdown]
    APPROVE --> BUDGET_ESTIMATE[Generate Budget Estimates]
    BUDGET_ESTIMATE --> COMPLETE[Breakdown Complete]
    
    VALIDATE -->|Invalid Format| ERROR[Show Error Message]
    PARSE -->|Parse Failed| ERROR
    HUMAN_REVIEW -->|Needs Changes| BREAKDOWN_TABLE
```

### Casting Management Workflow

```mermaid
graph TD
    CREATE_CALL[Create Casting Call] --> PUBLISH[Publish to Public Board]
    PUBLISH --> SUBMISSIONS[Receive Actor Submissions]
    SUBMISSIONS --> REVIEW[Review Submissions]
    REVIEW --> SHORTLIST[Create Shortlist]
    SHORTLIST --> SCHEDULE_AUDITIONS[Schedule Auditions]
    SCHEDULE_AUDITIONS --> CONDUCT_AUDITIONS[Conduct Auditions]
    CONDUCT_AUDITIONS --> RATE_ACTORS[Rate & Review Actors]
    RATE_ACTORS --> CALLBACKS[Select for Callbacks]
    CALLBACKS --> FINAL_AUDITIONS[Final Auditions]
    FINAL_AUDITIONS --> CASTING_DECISION[Make Casting Decision]
    CASTING_DECISION --> NOTIFY_ACTORS[Notify Selected/Rejected Actors]
    NOTIFY_ACTORS --> CONTRACT[Send Contracts]
    CONTRACT --> CAST_COMPLETE[Casting Complete]
    
    REVIEW -->|Not Suitable| REJECT[Reject Submission]
    CALLBACKS -->|No Callbacks Needed| CASTING_DECISION
```

### Production Scheduling Workflow

```mermaid
graph TD
    SCENES_READY[Scenes & Breakdown Ready] --> CLUSTER_ANALYSIS[Analyze Scene Clustering]
    CLUSTER_ANALYSIS --> LOCATION_GROUPING[Group by Location]
    LOCATION_GROUPING --> CAST_AVAILABILITY[Check Cast Availability]
    CAST_AVAILABILITY --> WEATHER_CONSIDERATION[Consider Weather Requirements]
    WEATHER_CONSIDERATION --> GENERATE_STRIPBOARD[Generate Stripboard]
    GENERATE_STRIPBOARD --> MANUAL_ADJUSTMENTS[Manual Schedule Adjustments]
    MANUAL_ADJUSTMENTS --> VALIDATE_SCHEDULE[Validate Schedule]
    VALIDATE_SCHEDULE --> GENERATE_CALL_SHEETS[Generate Call Sheets]
    GENERATE_CALL_SHEETS --> DISTRIBUTE[Distribute to Cast & Crew]
    DISTRIBUTE --> PRODUCTION_READY[Ready for Production]
    
    VALIDATE_SCHEDULE -->|Conflicts Found| MANUAL_ADJUSTMENTS
    MANUAL_ADJUSTMENTS -->|Major Changes| CLUSTER_ANALYSIS
```

### On-Set Production Monitoring

```mermaid
graph TD
    CALL_TIME[Call Time] --> SETUP[Scene Setup]
    SETUP --> REHEARSAL[Rehearsal]
    REHEARSAL --> SHOOTING[Shooting]
    SHOOTING --> SCENE_COMPLETE{Scene Complete?}
    SCENE_COMPLETE -->|Yes| WRAP_SCENE[Wrap Scene]
    SCENE_COMPLETE -->|No| ADDITIONAL_TAKES[Additional Takes]
    ADDITIONAL_TAKES --> SHOOTING
    
    WRAP_SCENE --> UPDATE_PROGRESS[Update Progress in App]
    UPDATE_PROGRESS --> NEXT_SCENE{More Scenes Today?}
    NEXT_SCENE -->|Yes| SETUP
    NEXT_SCENE -->|No| DAILY_WRAP[Daily Wrap]
    
    DAILY_WRAP --> PROGRESS_REPORT[Generate Progress Report]
    PROGRESS_REPORT --> NOTIFY_STAKEHOLDERS[Notify Stakeholders]
    NOTIFY_STAKEHOLDERS --> DAY_COMPLETE[Day Complete]
    
    subgraph "Real-time Updates"
        UPDATE_PROGRESS --> REALTIME_SYNC[Real-time Sync]
        REALTIME_SYNC --> DASHBOARD_UPDATE[Update Dashboards]
        DASHBOARD_UPDATE --> ALERT_DELAYS[Alert if Behind Schedule]
    end
```

## 🔄 Automation Workflows (n8n)

### Call Sheet Generation Workflow

```mermaid
graph TD
    TRIGGER[Schedule Trigger<br/>Day Before Shoot] --> FETCH_SCENES[Fetch Tomorrow's Scenes]
    FETCH_SCENES --> FETCH_CAST[Fetch Cast for Scenes]
    FETCH_CAST --> FETCH_LOCATIONS[Fetch Location Details]
    FETCH_LOCATIONS --> WEATHER_API[Get Weather Forecast]
    WEATHER_API --> HOSPITAL_INFO[Get Nearest Hospital Info]
    HOSPITAL_INFO --> GENERATE_PDF[Generate Call Sheet PDF]
    GENERATE_PDF --> EMAIL_CAST[Email to Cast]
    EMAIL_CAST --> EMAIL_CREW[Email to Crew]
    EMAIL_CREW --> SMS_REMINDERS[Send SMS Reminders]
    SMS_REMINDERS --> COMPLETE[Call Sheet Distributed]
    
    GENERATE_PDF -->|PDF Generation Failed| ERROR_NOTIFICATION[Send Error Notification]
    EMAIL_CAST -->|Email Failed| RETRY_EMAIL[Retry Email Delivery]
    RETRY_EMAIL -->|Still Failed| MANUAL_NOTIFICATION[Manual Notification Required]
```

### Script Parsing Workflow

```mermaid
graph TD
    UPLOAD[Script File Uploaded] --> FILE_VALIDATION[Validate File Type & Size]
    FILE_VALIDATION --> EXTRACT_TEXT[Extract Text Content]
    EXTRACT_TEXT --> LLM_PROCESSING[LLM Script Analysis]
    LLM_PROCESSING --> SCENE_EXTRACTION[Extract Scene Information]
    SCENE_EXTRACTION --> CHARACTER_EXTRACTION[Extract Character List]
    CHARACTER_EXTRACTION --> PROP_EXTRACTION[Extract Props & Set Pieces]
    PROP_EXTRACTION --> LOCATION_EXTRACTION[Extract Locations]
    LOCATION_EXTRACTION --> COMPLEXITY_ANALYSIS[Analyze Scene Complexity]
    COMPLEXITY_ANALYSIS --> GENERATE_BREAKDOWN[Generate Breakdown JSON]
    GENERATE_BREAKDOWN --> SAVE_TO_DB[Save to Database]
    SAVE_TO_DB --> NOTIFY_USER[Notify User of Completion]
    NOTIFY_USER --> COMPLETE[Processing Complete]
    
    FILE_VALIDATION -->|Invalid File| ERROR_INVALID[Return Error]
    LLM_PROCESSING -->|Processing Failed| ERROR_PROCESSING[Return Processing Error]
    SAVE_TO_DB -->|Database Error| ERROR_DB[Return Database Error]
```

### Notification System Workflow

```mermaid
graph TD
    EVENT_TRIGGER[System Event Triggered] --> EVENT_TYPE{Event Type}
    
    EVENT_TYPE -->|Schedule Change| SCHEDULE_NOTIFICATION[Schedule Change Notification]
    EVENT_TYPE -->|Casting Update| CASTING_NOTIFICATION[Casting Update Notification]
    EVENT_TYPE -->|Production Alert| PRODUCTION_ALERT[Production Alert]
    EVENT_TYPE -->|System Alert| SYSTEM_ALERT[System Alert]
    
    SCHEDULE_NOTIFICATION --> GET_AFFECTED_USERS[Get Affected Users]
    CASTING_NOTIFICATION --> GET_CASTING_USERS[Get Casting Team]
    PRODUCTION_ALERT --> GET_PRODUCTION_TEAM[Get Production Team]
    SYSTEM_ALERT --> GET_ADMIN_USERS[Get Admin Users]
    
    GET_AFFECTED_USERS --> SEND_EMAIL[Send Email Notifications]
    GET_CASTING_USERS --> SEND_EMAIL
    GET_PRODUCTION_TEAM --> SEND_EMAIL
    GET_ADMIN_USERS --> SEND_EMAIL
    
    SEND_EMAIL --> SEND_SMS[Send SMS if Urgent]
    SEND_SMS --> PUSH_NOTIFICATION[Send Push Notifications]
    PUSH_NOTIFICATION --> LOG_NOTIFICATION[Log Notification]
    LOG_NOTIFICATION --> COMPLETE_NOTIFICATION[Notification Complete]
```

## 🔒 Security Architecture

### Authentication Flow

```mermaid
graph TD
    USER[User] --> LOGIN[Login Request]
    LOGIN --> SUPABASE_AUTH[Supabase Auth]
    SUPABASE_AUTH --> VALIDATE[Validate Credentials]
    VALIDATE -->|Valid| JWT_TOKEN[Generate JWT Token]
    VALIDATE -->|Invalid| AUTH_ERROR[Authentication Error]
    
    JWT_TOKEN --> SET_SESSION[Set User Session]
    SET_SESSION --> FETCH_PROFILE[Fetch User Profile]
    FETCH_PROFILE --> FETCH_PERMISSIONS[Fetch Role Permissions]
    FETCH_PERMISSIONS --> ORGANIZATION_CHECK[Check Organization Access]
    ORGANIZATION_CHECK --> COMPLETE_LOGIN[Complete Login]
    
    COMPLETE_LOGIN --> DASHBOARD[Redirect to Dashboard]
    AUTH_ERROR --> LOGIN_FORM[Return to Login Form]
```

### Row Level Security (RLS) Flow

```mermaid
graph TD
    API_REQUEST[API Request] --> JWT_VALIDATION[Validate JWT Token]
    JWT_VALIDATION --> EXTRACT_USER[Extract User ID]
    EXTRACT_USER --> RLS_CHECK[Row Level Security Check]
    
    RLS_CHECK --> ORG_CHECK[Check Organization Access]
    ORG_CHECK --> ROLE_CHECK[Check Role Permissions]
    ROLE_CHECK --> RESOURCE_CHECK[Check Resource Access]
    
    RESOURCE_CHECK -->|Authorized| EXECUTE_QUERY[Execute Database Query]
    RESOURCE_CHECK -->|Unauthorized| ACCESS_DENIED[Access Denied]
    
    EXECUTE_QUERY --> FILTER_RESULTS[Filter Results by RLS]
    FILTER_RESULTS --> RETURN_DATA[Return Filtered Data]
    
    ACCESS_DENIED --> ERROR_RESPONSE[Return 403 Error]
```

## 📱 Mobile Architecture

### React Native/Expo Architecture

```mermaid
graph TD
    subgraph "Mobile App Structure"
        APP_ENTRY[App.tsx Entry Point]
        NAVIGATION[React Navigation]
        SCREENS[Screen Components]
        COMPONENTS[Shared Components]
        HOOKS[Custom Hooks]
        SERVICES[Services Layer]
        STORE[State Management]
    end
    
    subgraph "Expo Services"
        EXPO_AUTH[Expo Auth Session]
        EXPO_NOTIFICATIONS[Expo Notifications]
        EXPO_LOCATION[Expo Location]
        EXPO_CAMERA[Expo Camera]
        EXPO_UPDATES[Expo Updates OTA]
    end
    
    subgraph "Shared Packages"
        SHARED_TYPES[Types Package]
        SHARED_API[API Client Package]
        SHARED_AUTH[Auth Package]
        SHARED_LOGIC[Business Logic Package]
    end
    
    APP_ENTRY --> NAVIGATION
    NAVIGATION --> SCREENS
    SCREENS --> COMPONENTS
    SCREENS --> HOOKS
    HOOKS --> SERVICES
    SERVICES --> STORE
    
    SERVICES --> EXPO_AUTH
    SERVICES --> EXPO_NOTIFICATIONS
    SERVICES --> EXPO_LOCATION
    SERVICES --> EXPO_CAMERA
    
    SERVICES --> SHARED_API
    HOOKS --> SHARED_AUTH
    COMPONENTS --> SHARED_TYPES
    SERVICES --> SHARED_LOGIC
    
    EXPO_UPDATES --> APP_ENTRY
```

### Mobile-Specific Features

```mermaid
graph TD
    subgraph "On-Set Features"
        WRAP_TRACKER[Scene Wrap Tracker]
        LOCATION_CHECKIN[Location Check-in]
        PHOTO_UPLOAD[Photo Upload]
        OFFLINE_MODE[Offline Mode]
    end
    
    subgraph "Real-time Features"
        PUSH_NOTIFICATIONS[Push Notifications]
        REALTIME_UPDATES[Real-time Updates]
        SYNC_STATUS[Sync Status]
    end
    
    subgraph "Device Features"
        GPS_LOCATION[GPS Location]
        CAMERA_ACCESS[Camera Access]
        FILE_SYSTEM[File System Access]
        BIOMETRIC_AUTH[Biometric Authentication]
    end
    
    WRAP_TRACKER --> REALTIME_UPDATES
    LOCATION_CHECKIN --> GPS_LOCATION
    PHOTO_UPLOAD --> CAMERA_ACCESS
    PHOTO_UPLOAD --> FILE_SYSTEM
    OFFLINE_MODE --> SYNC_STATUS
    
    PUSH_NOTIFICATIONS --> REALTIME_UPDATES
    BIOMETRIC_AUTH --> WRAP_TRACKER
```

## 🚀 Deployment Architecture

### Production Deployment Flow

```mermaid
graph TD
    subgraph "Development"
        DEV_CODE[Code Changes]
        DEV_TEST[Local Testing]
        DEV_COMMIT[Git Commit]
    end
    
    subgraph "CI/CD Pipeline"
        GITHUB_ACTIONS[GitHub Actions]
        RUN_TESTS[Run Tests]
        BUILD_APPS[Build Applications]
        SECURITY_SCAN[Security Scan]
    end
    
    subgraph "Staging Environment"
        STAGING_WEB[Staging Web App]
        STAGING_MOBILE[Staging Mobile App]
        STAGING_DB[Staging Database]
        STAGING_TEST[Integration Testing]
    end
    
    subgraph "Production Environment"
        PROD_WEB[Production Web App<br/>Vercel]
        PROD_MOBILE[Production Mobile App<br/>App Stores]
        PROD_DB[Production Database<br/>Supabase]
        PROD_N8N[Production n8n<br/>Workflows]
    end
    
    DEV_CODE --> DEV_TEST
    DEV_TEST --> DEV_COMMIT
    DEV_COMMIT --> GITHUB_ACTIONS
    
    GITHUB_ACTIONS --> RUN_TESTS
    RUN_TESTS --> BUILD_APPS
    BUILD_APPS --> SECURITY_SCAN
    SECURITY_SCAN --> STAGING_WEB
    SECURITY_SCAN --> STAGING_MOBILE
    
    STAGING_WEB --> STAGING_TEST
    STAGING_MOBILE --> STAGING_TEST
    STAGING_TEST -->|Tests Pass| PROD_WEB
    STAGING_TEST -->|Tests Pass| PROD_MOBILE
    
    PROD_WEB --> PROD_DB
    PROD_MOBILE --> PROD_DB
    PROD_DB --> PROD_N8N
```

### Infrastructure Components

```mermaid
graph TD
    subgraph "Frontend Infrastructure"
        VERCEL[Vercel<br/>Web Hosting]
        EXPO_EAS[Expo EAS<br/>Mobile Distribution]
        CDN[CDN<br/>Static Assets]
    end
    
    subgraph "Backend Infrastructure"
        SUPABASE_CLOUD[Supabase Cloud<br/>Database + Auth + Storage]
        N8N_CLOUD[n8n Cloud<br/>Workflow Automation]
        REDIS_CLOUD[Redis Cloud<br/>Caching]
    end
    
    subgraph "External Services"
        GOOGLE_CLOUD[Google Cloud<br/>Maps API]
        SENDGRID[SendGrid<br/>Email Service]
        TWILIO[Twilio<br/>SMS Service]
        SENTRY[Sentry<br/>Error Tracking]
    end
    
    subgraph "Monitoring & Analytics"
        VERCEL_ANALYTICS[Vercel Analytics]
        SUPABASE_METRICS[Supabase Metrics]
        CUSTOM_METRICS[Custom Metrics Dashboard]
    end
    
    VERCEL --> CDN
    EXPO_EAS --> CDN
    
    VERCEL --> SUPABASE_CLOUD
    EXPO_EAS --> SUPABASE_CLOUD
    
    N8N_CLOUD --> GOOGLE_CLOUD
    N8N_CLOUD --> SENDGRID
    N8N_CLOUD --> TWILIO
    
    VERCEL --> SENTRY
    EXPO_EAS --> SENTRY
    
    VERCEL --> VERCEL_ANALYTICS
    SUPABASE_CLOUD --> SUPABASE_METRICS
    CUSTOM_METRICS --> SUPABASE_CLOUD
```

## 📊 Performance Architecture

### Caching Strategy

```mermaid
graph TD
    subgraph "Client-Side Caching"
        BROWSER_CACHE[Browser Cache]
        REACT_QUERY[TanStack Query Cache]
        MOBILE_CACHE[Mobile App Cache]
        OFFLINE_STORAGE[Offline Storage]
    end
    
    subgraph "Server-Side Caching"
        REDIS_CACHE[Redis Cache]
        SUPABASE_CACHE[Supabase Edge Cache]
        CDN_CACHE[CDN Cache]
    end
    
    subgraph "Database Optimization"
        DB_INDEXES[Database Indexes]
        QUERY_OPTIMIZATION[Query Optimization]
        CONNECTION_POOLING[Connection Pooling]
    end
    
    BROWSER_CACHE --> REACT_QUERY
    MOBILE_CACHE --> OFFLINE_STORAGE
    
    REACT_QUERY --> REDIS_CACHE
    OFFLINE_STORAGE --> REDIS_CACHE
    
    REDIS_CACHE --> SUPABASE_CACHE
    SUPABASE_CACHE --> CDN_CACHE
    
    SUPABASE_CACHE --> DB_INDEXES
    DB_INDEXES --> QUERY_OPTIMIZATION
    QUERY_OPTIMIZATION --> CONNECTION_POOLING
```

### Scalability Considerations

```mermaid
graph TD
    subgraph "Horizontal Scaling"
        LOAD_BALANCER[Load Balancer]
        MULTIPLE_INSTANCES[Multiple App Instances]
        DATABASE_REPLICAS[Database Read Replicas]
    end
    
    subgraph "Vertical Scaling"
        RESOURCE_SCALING[Resource Scaling]
        PERFORMANCE_MONITORING[Performance Monitoring]
        AUTO_SCALING[Auto Scaling]
    end
    
    subgraph "Data Scaling"
        PARTITIONING[Database Partitioning]
        ARCHIVING[Data Archiving]
        COMPRESSION[Data Compression]
    end
    
    LOAD_BALANCER --> MULTIPLE_INSTANCES
    MULTIPLE_INSTANCES --> DATABASE_REPLICAS
    
    PERFORMANCE_MONITORING --> AUTO_SCALING
    AUTO_SCALING --> RESOURCE_SCALING
    
    DATABASE_REPLICAS --> PARTITIONING
    PARTITIONING --> ARCHIVING
    ARCHIVING --> COMPRESSION
```

This architecture documentation provides a comprehensive visual overview of the PlotOps system, from high-level architecture to detailed workflow diagrams. The Mermaid diagrams help visualize complex relationships and data flows throughout the film production ERP system.