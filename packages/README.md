# PlotOps Shared Packages

This directory contains the shared packages that provide the foundation for both web and mobile applications in the PlotOps film production ERP system.

## Package Overview

### [`@plotops/types`](./types/) - Core TypeScript Definitions
**Purpose**: Centralized type definitions for the entire PlotOps ecosystem.

**Key Features**:
- User roles and permissions (Producer, AD, Casting Director, Scout, Editor, Publicist)
- Core entities (Project, Scene, Character, Location, Asset, etc.)
- Database schema types aligned with Supabase
- API request/response types
- UI component prop types

**Usage**:
```typescript
import type { User, Project, Scene, UserRole, Permission } from '@plotops/types';

const user: User = {
  id: '123',
  email: 'producer@example.com',
  role: 'producer',
  // ... other properties
};
```

### [`@plotops/config`](./config/) - Configuration Management
**Purpose**: Environment configuration and feature flags for all environments.

**Key Features**:
- Environment configuration (development, staging, production)
- Supabase and external service configuration
- Role-based permissions configuration
- Feature flags and subscription plans
- Security and monitoring settings

**Usage**:
```typescript
import { appConfig, databaseConfig, featureFlags } from '@plotops/config';

console.log(`App running in ${appConfig.environment} mode`);
console.log(`Supabase URL: ${databaseConfig.supabase.url}`);

if (featureFlags.enableRealTimeUpdates) {
  // Enable real-time features
}
```

### [`@plotops/auth`](./auth/) - Authentication and RBAC
**Purpose**: Authentication and role-based access control utilities.

**Key Features**:
- Supabase Auth integration foundation
- Role-based access control utilities
- Permission checking functions
- Multi-tenant data isolation helpers
- User session management

**Usage**:
```typescript
import { authManager, rbacManager, validatePermissions } from '@plotops/auth';

// Check permissions
const canEdit = rbacManager.hasPermission('write', 'scenes');

// Validate user permissions
const canAccess = validatePermissions.can(user, 'read', 'projects');

// Filter data by permissions
const filteredScenes = rbacManager.filterDataByPermissions(scenes, 'read');
```

### [`@plotops/api-client`](./api-client/) - Supabase Integration
**Purpose**: Database operations and API client for Supabase integration.

**Key Features**:
- Database client setup with mock implementation
- CRUD operations for all entities
- Real-time subscription foundations
- File upload/download utilities
- Query builders for complex operations

**Usage**:
```typescript
import { apiClient, PlotOpsAPI } from '@plotops/api-client';

// Get projects
const projects = await apiClient.getProjects({ limit: 10 });

// Create a scene
const newScene = await apiClient.createScene({
  project_id: 'proj-123',
  scene_number: '1',
  int_ext: 'INT',
  day_night: 'DAY',
  location_name: 'Living Room',
  // ... other properties
});

// Subscribe to real-time updates
const unsubscribe = apiClient.subscribeToProject('proj-123', (data) => {
  console.log('Project updated:', data);
});
```

### [`@plotops/shared`](./shared/) - Common Utilities
**Purpose**: Shared utility functions and helpers used across the application.

**Key Features**:
- Date/time formatting utilities
- File processing helpers
- Validation functions
- String and array utilities
- Business logic helpers
- Error handling utilities

**Usage**:
```typescript
import { 
  formatDate, 
  formatCurrency, 
  validateEmail, 
  calculateSceneProgress,
  slugify,
  groupBy 
} from '@plotops/shared';

// Format dates
const formattedDate = formatDate(new Date(), 'short'); // "Jan 15, 2024"

// Validate email
const isValid = validateEmail('user@example.com'); // true

// Calculate progress
const progress = calculateSceneProgress(scenes);
console.log(`${progress.percentage}% complete`);

// Group scenes by location
const scenesByLocation = groupBy(scenes, 'location_name');
```

### [`@plotops/business-logic`](./business-logic/) - Core Business Rules
**Purpose**: Core business logic and calculations for film production workflows.

**Key Features**:
- Script parsing and breakdown logic
- Scene clustering algorithms
- Budget calculation utilities
- Schedule optimization helpers
- Production progress tracking
- Validation schemas

**Usage**:
```typescript
import { 
  parseScript, 
  clusterScenes, 
  optimizeSchedule,
  calculateProjectBudget,
  validateProject 
} from '@plotops/business-logic';

// Parse a script
const parseResult = parseScript(scriptContent, 'txt');
console.log(`Found ${parseResult.scenes.length} scenes`);

// Cluster scenes for efficient shooting
const clusters = clusterScenes(scenes, {
  prioritizeLocation: true,
  maxScenesPerDay: 6,
  preferredShootOrder: 'location_grouped'
});

// Calculate project budget
const budget = calculateProjectBudget(project, scenes, cast, locations, assets);
console.log(`Total budget: ${formatCurrency(budget.finalBudget)}`);
```

### [`@plotops/ui`](./ui/) - UI Foundation
**Purpose**: Base component structure and design system foundation.

**Key Features**:
- Tailwind CSS configuration
- Theme configuration and design tokens
- Component class utilities
- Animation and responsive utilities
- Accessibility helpers
- Component placeholders for future implementation

**Usage**:
```typescript
import { 
  plotOpsTheme, 
  componentClasses, 
  statusColors,
  cn,
  getTailwindConfig 
} from '@plotops/ui';

// Use theme colors
const primaryColor = plotOpsTheme.colors.primary[600];

// Combine classes
const buttonClass = cn(
  componentClasses.button,
  'bg-primary-600 text-white'
);

// Get status colors
const statusClass = statusColors.success; // 'text-green-800 bg-green-100'
```

## Architecture Principles

### 1. **Role-Based Access Control (RBAC)**
All packages support role-based dashboards and permissions:
- Users are assigned roles (Producer, AD, Casting Director, etc.)
- Each role has specific permissions for different resources
- Multi-tenant architecture ensures data isolation

### 2. **AI-Assisted, Human-Validated**
The system suggests and automates but humans retain control:
- AI parses scripts and suggests breakdowns
- Algorithms optimize schedules and cluster scenes
- All AI outputs are editable and deletable by users

### 3. **Real-Time State Management**
Built for real-time collaboration:
- Supabase real-time subscriptions
- Instant updates for "The Wrap" and daily progress
- Live notifications for schedule changes

### 4. **Multi-Tenant Architecture**
Designed for multiple production companies:
- Tenant isolation at the database level
- Role-based permissions within tenants
- Subscription-based feature access

## Integration Points

### **n8n Automation Engine**
- Script parsing workflows
- PDF generation (Call Sheets)
- Notification triggers
- Budget tracking automation

### **Google Maps API**
- Location scouting and mapping
- Site photo management
- Logistics planning (parking, power, signal)

### **Weather API Integration**
- Weather forecasts for outdoor scenes
- Schedule optimization based on weather
- Automatic weather data in call sheets

## Development Guidelines

### **TypeScript First**
- Strict type checking enabled
- Comprehensive type definitions
- JSDoc comments for public APIs

### **Modular and Testable**
- Each package has a single responsibility
- Functions are pure where possible
- Comprehensive error handling

### **Cross-Platform Compatibility**
- Works with both Next.js and React Native
- Environment-agnostic utilities
- Consistent APIs across platforms

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build All Packages**:
   ```bash
   npm run build
   ```

3. **Run Type Checking**:
   ```bash
   npm run type-check
   ```

4. **Import in Your App**:
   ```typescript
   import { User, Project } from '@plotops/types';
   import { apiClient } from '@plotops/api-client';
   import { formatDate } from '@plotops/shared';
   ```

## Package Dependencies

```
@plotops/types (no dependencies)
├── @plotops/config
├── @plotops/shared
├── @plotops/auth
├── @plotops/api-client
├── @plotops/business-logic
└── @plotops/ui
```

## Contributing

When adding new features:

1. **Types First**: Add type definitions to `@plotops/types`
2. **Configuration**: Add any config to `@plotops/config`
3. **Business Logic**: Implement core logic in `@plotops/business-logic`
4. **API Integration**: Add database operations to `@plotops/api-client`
5. **UI Components**: Add component foundations to `@plotops/ui`
6. **Utilities**: Add helpers to `@plotops/shared`

## Support

For questions about the shared packages:
- Check the individual package README files
- Review the type definitions in `@plotops/types`
- Look at usage examples in this documentation