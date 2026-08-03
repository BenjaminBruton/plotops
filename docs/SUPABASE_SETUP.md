# Supabase Frontend Integration Guide

This guide walks you through connecting your PlotOps Next.js frontend to your Supabase backend.

## Prerequisites

- ✅ Supabase database with migrations applied
- ✅ Supabase project created at [app.supabase.com](https://app.supabase.com)
- ✅ PlotOps schema loaded (see `docs/DATABASE_RESET_GUIDE.md`)

## Step 1: Install Supabase Package

The project should already have `@supabase/supabase-js` installed. Verify by checking:

```bash
cd apps/web
pnpm list @supabase/supabase-js
```

If not installed, add it:

```bash
cd apps/web
pnpm add @supabase/supabase-js
```

## Step 2: Get Your Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your PlotOps project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

## Step 3: Create Environment Variables File

1. In `apps/web/`, create a file called `.env.local`:

```bash
cd apps/web
touch .env.local
```

2. Add your Supabase credentials:

```env
# apps/web/.env.local

# Your Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon/Public Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** 
- Replace `your-project-id` with your actual Supabase project ID
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `NEXT_PUBLIC_` prefix makes variables available in the browser

## Step 4: Verify Connection

Create a test API route to verify the connection:

```typescript
// apps/web/src/app/api/test-db/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to fetch projects
    const { data, error } = await supabase
      .from('projects')
      .select('id, title')
      .limit(5);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      projectCount: data?.length || 0,
      projects: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

Then visit: `http://localhost:3000/api/test-db`

## Step 5: Test in the Browser

1. Start your dev server:

```bash
cd apps/web
pnpm dev
```

2. Open browser console and test:

```javascript
// Test in browser console
const testConnection = async () => {
  const response = await fetch('/api/test-db');
  const data = await response.json();
  console.log('Supabase connection:', data);
};

testConnection();
```

## Step 6: Set Up Row Level Security (RLS)

Your PlotOps schema has RLS enabled. To access data, you need to:

### Option A: Create a Test User (Recommended for Development)

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add user**
3. Create a test user with email/password
4. Note the user ID

### Option B: Temporarily Disable RLS (Development Only!)

**Warning: Only do this in development, never in production!**

```sql
-- In Supabase SQL Editor
ALTER TABLE plotops.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.organizations DISABLE ROW LEVEL SECURITY;
-- etc. for other tables
```

To re-enable:

```sql
ALTER TABLE plotops.projects ENABLE ROW LEVEL SECURITY;
-- etc.
```

## Step 7: Create Test Data

To see projects in your app, create some test data:

```sql
-- In Supabase SQL Editor

-- 1. Create an organization
INSERT INTO plotops.organizations (name, slug, description)
VALUES ('Test Studio', 'test-studio', 'A test production company')
RETURNING *;

-- 2. Create a project (use the organization ID from step 1)
INSERT INTO plotops.projects (
  organization_id, 
  title, 
  slug, 
  logline,
  status,
  progress_percentage
)
VALUES (
  'your-org-id-here',
  'The Heist',
  'the-heist',
  'A thrilling crime drama about the perfect heist',
  'production',
  65
)
RETURNING *;

-- 3. Add a few scenes
INSERT INTO plotops.scenes (
  project_id,
  scene_number,
  scene_name,
  location_name,
  scene_type,
  time_of_day,
  page_count
)
VALUES 
  ('your-project-id-here', '1', 'Opening', 'Bank Interior', 'int', 'day', 2.5),
  ('your-project-id-here', '2', 'The Setup', 'Warehouse', 'int', 'night', 3.0),
  ('your-project-id-here', '3', 'Chase Scene', 'City Streets', 'ext', 'day', 4.25);
```

## Step 8: Update Projects Page

The projects page is now ready to use real data. The API utilities are set up in:

- `apps/web/src/lib/supabase.ts` - Supabase client
- `apps/web/src/lib/api/projects.ts` - Projects API functions

Example usage in a component:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getProjects } from '@/lib/api/projects';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>
          <h3>{project.title}</h3>
          <p>{project.logline}</p>
        </div>
      ))}
    </div>
  );
}
```

## Available API Functions

All functions are in `apps/web/src/lib/api/projects.ts`:

- `getProjects()` - Get all projects
- `getProject(id)` - Get single project with details
- `createProject(data)` - Create new project
- `updateProject(id, updates)` - Update project
- `deleteProject(id)` - Delete project
- `getProjectBudgetSummary(id)` - Get budget overview
- `getProjectBudgets(id)` - Get budget line items
- `getProjectDocuments(id, type?)` - Get project documents
- `getProjectMilestones(id)` - Get project milestones
- `calculateProjectProgress(id)` - Auto-calculate progress from scenes
- `getProjectStats(id)` - Get scene/cast/location counts

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Make sure you created `.env.local` in `apps/web/`
- Check that variable names match exactly (with `NEXT_PUBLIC_` prefix)
- Restart your dev server after adding env variables

### Error: "Failed to fetch"

- Check your Supabase project URL is correct
- Verify the anon key is correct
- Check Supabase project is running (not paused)

### Error: "row-level security policy"

- You need to either:
  1. Create an authenticated user and sign in
  2. Temporarily disable RLS for development
  3. Update RLS policies to allow public access (not recommended)

### Empty Results

- Make sure you created test data (Step 7)
- Check you're querying the correct schema (`plotops`, not `public`)
- Verify RLS policies allow the query

### TypeScript Errors

- Run `pnpm install` in the project root
- Make sure `@supabase/supabase-js` is installed in `apps/web`
- Check that types are exported from `packages/types/src/database.ts`

## Next Steps

1. ✅ Set up authentication (sign in/sign up)
2. ✅ Create user profile on first sign in
3. ✅ Implement organization selection
4. ✅ Build out Projects page with real data
5. ✅ Add budget, documents, milestones views
6. ✅ Set up real-time subscriptions for production reports

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Projects Schema Docs](./PROJECTS_SCHEMA.md)
