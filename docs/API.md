# PlotOps API Documentation

This document provides comprehensive API documentation for the PlotOps film production ERP system, including REST endpoints, real-time subscriptions, and integration patterns.

## 🚀 API Overview

PlotOps uses a hybrid API architecture combining:

- **Supabase REST API**: Core CRUD operations with automatic OpenAPI documentation
- **Next.js API Routes**: Custom business logic and integrations
- **Supabase Realtime**: WebSocket subscriptions for live updates
- **n8n Webhooks**: Automation workflow triggers

### Base URLs

```
Development:  http://localhost:3000/api
Production:   https://your-domain.com/api
Supabase:     https://your-project.supabase.co/rest/v1
```

### Authentication

All API requests require authentication using JWT tokens from Supabase Auth.

```javascript
// Include in request headers
{
  "Authorization": "Bearer <jwt_token>",
  "apikey": "<supabase_anon_key>",
  "Content-Type": "application/json"
}
```

## 🔐 Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "producer"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1640995200
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token"
}
```

## 🏢 Organizations API

### Get Organization
```http
GET /api/organizations/{org_id}
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Acme Productions",
  "slug": "acme-productions",
  "description": "Independent film production company",
  "logo_url": "https://example.com/logo.png",
  "settings": {
    "timezone": "America/Los_Angeles",
    "currency": "USD"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update Organization
```http
PUT /api/organizations/{org_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Company Name",
  "description": "Updated description",
  "settings": {
    "timezone": "America/New_York"
  }
}
```

## 🎬 Projects API

### List Projects
```http
GET /api/projects
Authorization: Bearer <jwt_token>

Query Parameters:
- limit: number (default: 20)
- offset: number (default: 0)
- status: string (development|pre_production|production|post_production|completed)
- search: string
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "The Great Adventure",
      "slug": "the-great-adventure",
      "status": "production",
      "genre": "Action/Adventure",
      "start_date": "2024-03-01",
      "end_date": "2024-05-15",
      "created_at": "2024-01-15T00:00:00Z"
    }
  ],
  "count": 1,
  "total": 1
}
```

### Create Project
```http
POST /api/projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "New Film Project",
  "logline": "A thrilling adventure story",
  "genre": "Action",
  "budget_range": "1M-5M",
  "start_date": "2024-06-01",
  "end_date": "2024-08-30"
}
```

### Get Project Details
```http
GET /api/projects/{project_id}
Authorization: Bearer <jwt_token>

Query Parameters:
- include: string[] (scenes,characters,locations,cast,crew)
```

**Response:**
```json
{
  "id": "uuid",
  "title": "The Great Adventure",
  "logline": "A hero's journey through unknown lands",
  "synopsis": "Full synopsis text...",
  "genre": "Action/Adventure",
  "status": "production",
  "budget_range": "5M-10M",
  "start_date": "2024-03-01",
  "end_date": "2024-05-15",
  "scenes": [
    {
      "id": "uuid",
      "scene_number": "1",
      "location_name": "Forest Clearing",
      "scene_type": "EXT",
      "time_of_day": "DAY"
    }
  ],
  "characters": [
    {
      "id": "uuid",
      "name": "Hero",
      "description": "The main protagonist"
    }
  ]
}
```

### Update Project
```http
PUT /api/projects/{project_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "post_production",
  "end_date": "2024-06-01"
}
```

### Delete Project
```http
DELETE /api/projects/{project_id}
Authorization: Bearer <jwt_token>
```

## 🎭 Scenes API

### List Scenes
```http
GET /api/projects/{project_id}/scenes
Authorization: Bearer <jwt_token>

Query Parameters:
- location: string
- scene_type: string (INT|EXT)
- time_of_day: string (DAY|NIGHT)
- complexity: number (1-5)
- include: string[] (characters,locations,props)
```

### Create Scene
```http
POST /api/projects/{project_id}/scenes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "scene_number": "15A",
  "scene_name": "Kitchen Confrontation",
  "location_name": "Kitchen Set",
  "scene_type": "INT",
  "time_of_day": "DAY",
  "page_count": 2.5,
  "description": "Heated argument between main characters",
  "estimated_duration": 180,
  "complexity_rating": 3
}
```

### Update Scene
```http
PUT /api/projects/{project_id}/scenes/{scene_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "complexity_rating": 4,
  "estimated_duration": 240,
  "script_notes": "Added stunt coordinator requirements"
}
```

### Scene Breakdown
```http
GET /api/projects/{project_id}/scenes/{scene_id}/breakdown
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "scene": {
    "id": "uuid",
    "scene_number": "15A",
    "location_name": "Kitchen Set"
  },
  "characters": [
    {
      "id": "uuid",
      "name": "Sarah",
      "lines_count": 15,
      "wardrobe_change": true
    }
  ],
  "props": [
    {
      "id": "uuid",
      "name": "Kitchen Knife",
      "category": "prop",
      "quantity": 1
    }
  ],
  "locations": [
    {
      "id": "uuid",
      "name": "Studio Kitchen Set",
      "setup_time": 60
    }
  ]
}
```

## 👥 Characters API

### List Characters
```http
GET /api/projects/{project_id}/characters
Authorization: Bearer <jwt_token>

Query Parameters:
- character_type: string (lead|supporting|under_five|extra)
- cast_status: string (uncast|auditions|cast)
```

### Create Character
```http
POST /api/projects/{project_id}/characters
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Detective Johnson",
  "description": "Experienced detective with a troubled past",
  "age_range": "35-45",
  "gender": "Female",
  "character_type": "lead",
  "wardrobe_notes": "Professional attire, occasional casual wear",
  "special_requirements": "Must be comfortable with action sequences"
}
```

## 📍 Locations API

### List Locations
```http
GET /api/projects/{project_id}/locations
Authorization: Bearer <jwt_token>

Query Parameters:
- location_type: string (studio|practical|exterior)
- status: string (scouting|confirmed|booked|unavailable)
- coordinates: string (lat,lng,radius_km)
```

### Create Location
```http
POST /api/projects/{project_id}/locations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Downtown Coffee Shop",
  "address": "123 Main Street, Los Angeles, CA",
  "coordinates": {
    "lat": 34.0522,
    "lng": -118.2437
  },
  "location_type": "practical",
  "contact_name": "Shop Manager",
  "contact_phone": "(555) 123-4567",
  "cost_per_day": 500.00,
  "permits_required": true,
  "parking_info": "Street parking available",
  "power_info": "Standard 110V outlets available"
}
```

### Location Search
```http
GET /api/locations/search
Authorization: Bearer <jwt_token>

Query Parameters:
- q: string (search query)
- lat: number
- lng: number
- radius: number (km)
- type: string
```

## 🎪 Casting API

### List Casting Calls
```http
GET /api/projects/{project_id}/casting-calls
Authorization: Bearer <jwt_token>

Query Parameters:
- status: string (open|closed|filled)
- character_id: uuid
- is_public: boolean
```

### Create Casting Call
```http
POST /api/projects/{project_id}/casting-calls
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "character_id": "uuid",
  "title": "Lead Role - Detective Johnson",
  "description": "Seeking experienced actress for lead detective role",
  "requirements": "Age 35-45, strong dramatic acting experience",
  "audition_sides": "Scene 15A - Kitchen Confrontation",
  "submission_deadline": "2024-04-15T23:59:59Z",
  "is_public": true
}
```

### List Actors
```http
GET /api/actors
Authorization: Bearer <jwt_token>

Query Parameters:
- search: string
- age_range: string
- union_status: string
- special_skills: string[]
```

### Submit Audition
```http
POST /api/casting-calls/{casting_call_id}/auditions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "actor_id": "uuid",
  "audition_video_url": "https://example.com/audition.mp4",
  "notes": "Available for callbacks next week"
}
```

## 📅 Scheduling API

### Get Stripboard
```http
GET /api/projects/{project_id}/stripboard
Authorization: Bearer <jwt_token>

Query Parameters:
- start_date: string (YYYY-MM-DD)
- end_date: string (YYYY-MM-DD)
```

**Response:**
```json
{
  "project_id": "uuid",
  "schedule": [
    {
      "date": "2024-03-15",
      "scenes": [
        {
          "id": "uuid",
          "scene_number": "1",
          "location_name": "Forest Clearing",
          "estimated_duration": 240,
          "cast": ["Hero", "Mentor"],
          "call_time": "07:00",
          "wrap_time": "19:00"
        }
      ]
    }
  ],
  "statistics": {
    "total_scenes": 45,
    "scheduled_scenes": 30,
    "total_days": 25
  }
}
```

### Update Schedule
```http
PUT /api/projects/{project_id}/stripboard
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "schedule": [
    {
      "date": "2024-03-15",
      "scene_ids": ["uuid1", "uuid2", "uuid3"]
    }
  ]
}
```

### Generate Call Sheet
```http
POST /api/projects/{project_id}/call-sheets
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "date": "2024-03-15",
  "include_weather": true,
  "include_maps": true,
  "special_notes": "Early morning start - coffee and breakfast provided"
}
```

**Response:**
```json
{
  "call_sheet_id": "uuid",
  "pdf_url": "https://example.com/call-sheet.pdf",
  "date": "2024-03-15",
  "scenes": [
    {
      "scene_number": "1",
      "location": "Forest Clearing",
      "call_time": "07:00"
    }
  ],
  "weather": {
    "temperature": "72°F",
    "conditions": "Partly Cloudy",
    "precipitation": "10%"
  }
}
```

## 📁 Assets API

### Upload Asset
```http
POST /api/projects/{project_id}/assets
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: [binary data]
metadata: {
  "scene_id": "uuid",
  "asset_type": "raw_footage",
  "camera_angle": "wide",
  "take_number": 3,
  "tags": ["#VFX-Needed", "#Color-Correction"]
}
```

### List Assets
```http
GET /api/projects/{project_id}/assets
Authorization: Bearer <jwt_token>

Query Parameters:
- scene_id: uuid
- asset_type: string (raw_footage|stills|documents)
- tags: string[]
- date_range: string (YYYY-MM-DD,YYYY-MM-DD)
```

### Update Asset Tags
```http
PUT /api/projects/{project_id}/assets/{asset_id}/tags
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "tags": ["#VFX-Needed", "#Foley", "#Final-Cut"]
}
```

## 🔄 Real-time Subscriptions

PlotOps uses Supabase Realtime for live updates. Subscribe to changes using the Supabase client:

### Project Updates
```javascript
const subscription = supabase
  .channel('project-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'plotops',
    table: 'projects',
    filter: `id=eq.${projectId}`
  }, (payload) => {
    console.log('Project updated:', payload);
  })
  .subscribe();
```

### Scene Progress Updates
```javascript
const subscription = supabase
  .channel('scene-progress')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'plotops',
    table: 'scenes',
    filter: `project_id=eq.${projectId}`
  }, (payload) => {
    // Handle scene completion updates
    updateProgressBar(payload.new);
  })
  .subscribe();
```

### Casting Updates
```javascript
const subscription = supabase
  .channel('casting-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'plotops',
    table: 'auditions'
  }, (payload) => {
    // Handle new audition submissions
    refreshAuditionsList();
  })
  .subscribe();
```

## 🤖 Automation Webhooks (n8n)

### Script Processing Webhook
```http
POST /webhook/script-process
Content-Type: application/json

{
  "project_id": "uuid",
  "script_url": "https://example.com/script.pdf",
  "callback_url": "https://your-app.com/api/script-processed"
}
```

### Call Sheet Generation Webhook
```http
POST /webhook/call-sheet-generate
Content-Type: application/json

{
  "project_id": "uuid",
  "date": "2024-03-15",
  "recipients": [
    {
      "email": "actor@example.com",
      "role": "cast"
    }
  ]
}
```

### Notification Webhook
```http
POST /webhook/notify
Content-Type: application/json

{
  "type": "schedule_change",
  "project_id": "uuid",
  "message": "Tomorrow's call time moved to 6:00 AM",
  "recipients": ["user1@example.com", "user2@example.com"],
  "urgent": true
}
```

## 📊 Analytics API

### Project Statistics
```http
GET /api/projects/{project_id}/statistics
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "scenes": {
    "total": 45,
    "completed": 30,
    "in_progress": 5,
    "not_started": 10
  },
  "budget": {
    "allocated": 5000000,
    "spent": 3200000,
    "remaining": 1800000
  },
  "schedule": {
    "total_days": 60,
    "days_completed": 35,
    "days_remaining": 25,
    "on_schedule": true
  },
  "cast": {
    "total_roles": 15,
    "cast_roles": 12,
    "open_roles": 3
  }
}
```

### Production Reports
```http
GET /api/projects/{project_id}/reports
Authorization: Bearer <jwt_token>

Query Parameters:
- type: string (daily|weekly|monthly)
- start_date: string
- end_date: string
- format: string (json|pdf|csv)
```

## 🔍 Search API

### Global Search
```http
GET /api/search
Authorization: Bearer <jwt_token>

Query Parameters:
- q: string (search query)
- type: string[] (projects|scenes|characters|locations|actors)
- project_id: uuid (optional, limit to specific project)
```

**Response:**
```json
{
  "results": [
    {
      "type": "scene",
      "id": "uuid",
      "title": "Kitchen Confrontation",
      "project": "The Great Adventure",
      "match_score": 0.95
    },
    {
      "type": "character",
      "id": "uuid",
      "title": "Detective Johnson",
      "project": "The Great Adventure",
      "match_score": 0.87
    }
  ],
  "total": 2
}
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid scene number format",
    "details": {
      "field": "scene_number",
      "expected": "Alphanumeric with optional letter suffix"
    },
    "timestamp": "2024-03-15T10:30:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate scene number) |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

## 📝 API Client Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get projects
const { data: projects, error } = await supabase
  .from('projects')
  .select('*')
  .eq('organization_id', orgId);

// Create scene
const { data: scene, error } = await supabase
  .from('scenes')
  .insert({
    project_id: projectId,
    scene_number: '15A',
    location_name: 'Kitchen Set',
    scene_type: 'INT',
    time_of_day: 'DAY'
  })
  .select()
  .single();
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {jwt_token}',
    'apikey': supabase_anon_key,
    'Content-Type': 'application/json'
}

# Get projects
response = requests.get(
    f'{supabase_url}/rest/v1/projects',
    headers=headers,
    params={'organization_id': f'eq.{org_id}'}
)
projects = response.json()

# Create scene
scene_data = {
    'project_id': project_id,
    'scene_number': '15A',
    'location_name': 'Kitchen Set',
    'scene_type': 'INT',
    'time_of_day': 'DAY'
}

response = requests.post(
    f'{supabase_url}/rest/v1/scenes',
    headers=headers,
    json=scene_data
)
scene = response.json()
```

### cURL
```bash
# Get projects
curl -X GET \
  "${SUPABASE_URL}/rest/v1/projects?organization_id=eq.${ORG_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}"

# Create scene
curl -X POST \
  "${SUPABASE_URL}/rest/v1/scenes" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "uuid",
    "scene_number": "15A",
    "location_name": "Kitchen Set",
    "scene_type": "INT",
    "time_of_day": "DAY"
  }'
```

## 🔒 Security Considerations

### Row Level Security (RLS)
All database tables use RLS policies to ensure users can only access data from their organization and assigned projects.

### API Rate Limiting
- **Authenticated requests**: 1000 requests per hour per user
- **File uploads**: 100 MB per hour per user
- **Webhook endpoints**: 10 requests per minute per endpoint

### Data Validation
- All input data is validated against TypeScript schemas
- File uploads are scanned for malware
- SQL injection protection through parameterized queries

## 📚 Additional Resources

- **OpenAPI Specification**: Available at `/api/docs` when running locally
- **Postman Collection**: Import from `/api/postman.json`
- **SDK Documentation**: See [`packages/api-client/README.md`](../packages/api-client/README.md)
- **Real-time Guide**: See [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)

For questions or support with the API, please refer to the [troubleshooting guide](TROUBLESHOOTING.md) or create an issue in the repository.