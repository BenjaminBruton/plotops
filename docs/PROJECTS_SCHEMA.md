# Projects Schema Documentation

## Overview

This document describes the extended Projects schema for PlotOps, which adds comprehensive functionality for budget tracking, document management, milestones, production scheduling, and reporting.

## Running the Migration

To apply this schema to your Supabase database:

```bash
# Using the migrate script
npm run migrate

# Or manually via Supabase CLI
supabase db push

# Or apply directly via SQL
psql -h your-db-host -U postgres -d plotops -f services/supabase/migrations/20240802000001_add_project_extensions.sql
```

## Schema Components

### 1. Budget Tracking

**Tables:**
- `project_budgets` - Department/category level budgets
- `budget_transactions` - Individual expenses and transactions

**Usage Example:**
```typescript
import { ProjectBudget, BudgetTransaction } from '@plotops/types';

// Create a budget line item
const budget: Omit<ProjectBudget, 'id' | 'created_at' | 'updated_at'> = {
  project_id: 'project-uuid',
  department: 'production',
  category: 'equipment',
  budgeted_amount: 50000,
  actual_amount: 0,
  notes: 'Camera and lighting equipment'
};

// Add a transaction
const transaction: Omit<BudgetTransaction, 'id' | 'created_at'> = {
  budget_id: 'budget-uuid',
  description: 'ARRI Alexa Mini rental',
  amount: 12500,
  transaction_date: '2024-08-15',
  vendor: 'Camera Rental Co.',
  receipt_url: 'https://drive.google.com/...'
};

// Get budget summary using function
const summary = await supabase.rpc('get_project_budget_summary', {
  p_project_id: 'project-uuid'
});
// Returns: { total_budgeted, total_actual, variance, percentage_spent }
```

### 2. Document Management

**Table:** `project_documents`

**Features:**
- Version control with `version` and `is_current_version` fields
- Tag-based organization
- External file storage (Google Drive, Dropbox, etc.)
- Approval workflow

**Usage Example:**
```typescript
import { ProjectDocument } from '@plotops/types';

// Upload a script version
const document: Omit<ProjectDocument, 'id' | 'created_at' | 'updated_at'> = {
  project_id: 'project-uuid',
  title: 'The Heist - Shooting Script',
  document_type: 'script',
  version: 'v2.1',
  file_url: 'https://drive.google.com/file/...',
  file_size: 2456789,
  mime_type: 'application/pdf',
  is_current_version: true,
  tags: ['final', 'shooting-script', '2024']
};

// Query current documents by type
const scripts = await supabase
  .from('project_documents')
  .select('*')
  .eq('project_id', projectId)
  .eq('document_type', 'script')
  .eq('is_current_version', true);
```

### 3. Milestones & Deliverables

**Tables:**
- `project_milestones` - Key production milestones
- `project_deliverables` - Deliverables tied to milestones

**Common Milestone Types:**
- `script_lock` - Script finalized
- `casting_complete` - All roles cast
- `principal_photography_start` - First day of shooting
- `wrap` - Last day of shooting
- `rough_cut` - First edit complete
- `final_cut` - Final edit approved

**Usage Example:**
```typescript
import { ProjectMilestone, ProjectDeliverable } from '@plotops/types';

// Create a milestone
const milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'> = {
  project_id: 'project-uuid',
  title: 'Principal Photography Complete',
  milestone_type: 'wrap',
  target_date: '2024-09-30',
  status: 'pending',
  completion_percentage: 0,
  assigned_to: 'producer-user-id'
};

// Create a deliverable
const deliverable: Omit<ProjectDeliverable, 'id' | 'created_at' | 'updated_at'> = {
  project_id: 'project-uuid',
  milestone_id: 'milestone-uuid',
  title: 'Rough Cut',
  deliverable_type: 'rough_cut',
  due_date: '2024-10-15',
  status: 'pending'
};
```

### 4. Production Schedule

**Tables:**
- `shooting_schedule` - Daily shooting schedule
- `schedule_scenes` - Scenes scheduled for each day
- `production_reports` - Daily wrap reports

**Usage Example:**
```typescript
import { ShootingSchedule, ScheduleScene, ProductionReport } from '@plotops/types';

// Create a shoot day
const scheduleDay: Omit<ShootingSchedule, 'id' | 'created_at' | 'updated_at'> = {
  project_id: 'project-uuid',
  shoot_date: '2024-08-20',
  location_id: 'location-uuid',
  call_time: '06:00:00',
  crew_call: '05:30:00',
  status: 'scheduled',
  weather_conditions: 'Clear, 75°F'
};

// Schedule scenes for the day
const sceneSchedule: Omit<ScheduleScene, 'id' | 'created_at' | 'updated_at'> = {
  schedule_id: 'schedule-uuid',
  scene_id: 'scene-uuid',
  planned_start_time: '08:00:00',
  planned_duration: 120, // minutes
  status: 'scheduled',
  takes_count: 0
};

// Submit daily report
const report: Omit<ProductionReport, 'id' | 'created_at' | 'updated_at'> = {
  project_id: 'project-uuid',
  schedule_id: 'schedule-uuid',
  report_date: '2024-08-20',
  scenes_completed: 3,
  pages_completed: 5.5,
  total_scenes_to_date: 45,
  total_pages_to_date: 78.25,
  crew_count: 32,
  cast_count: 8,
  extras_count: 15,
  meals_served: { breakfast: 40, lunch: 50, dinner: 30 },
  weather_summary: 'Clear and sunny all day'
};
```

### 5. Progress Tracking

**Fields added to `projects` table:**
- `progress_percentage` - 0-100 percentage complete
- `progress_calculation_method` - 'manual', 'scenes_based', 'milestones_based', or 'hybrid'
- `total_shoot_days` - Planned total shoot days
- `completed_shoot_days` - Actual completed shoot days

**Usage Example:**
```typescript
// Manual progress update
await supabase
  .from('projects')
  .update({ 
    progress_percentage: 65,
    progress_calculation_method: 'manual'
  })
  .eq('id', projectId);

// Auto-calculate from completed scenes
const progress = await supabase.rpc('calculate_project_progress', {
  p_project_id: projectId
});

// Then update the project
await supabase
  .from('projects')
  .update({ 
    progress_percentage: progress,
    progress_calculation_method: 'scenes_based'
  })
  .eq('id', projectId);
```

## Row Level Security (RLS)

All tables have RLS policies enabled:

### Read Access (SELECT)
- All users in the same organization can view project data

### Write Access (INSERT/UPDATE/DELETE)
- **Budgets**: Producers and Admins only
- **Documents**: Team members can upload, Producers can manage
- **Milestones**: Producers and ADs
- **Schedule**: ADs and Producers
- **Reports**: Team members can submit, Producers/ADs can manage

## Helper Functions

### `calculate_project_progress(p_project_id UUID)`
Auto-calculates progress based on completed scenes.

**Returns:** INTEGER (0-100)

### `get_project_budget_summary(p_project_id UUID)`
Returns budget overview for a project.

**Returns:**
```typescript
{
  total_budgeted: number,
  total_actual: number,
  variance: number,
  percentage_spent: number
}
```

## Integration Examples

### Next.js API Route Example

```typescript
// app/api/projects/[id]/budget/route.ts
import { createClient } from '@supabase/supabase-js';
import type { ProjectBudget } from '@plotops/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('project_budgets')
    .select('*')
    .eq('project_id', params.id);

  if (error) return Response.json({ error }, { status: 500 });
  return Response.json({ budgets: data });
}
```

### React Component Example

```typescript
// components/ProjectBudgetDashboard.tsx
import { useEffect, useState } from 'react';
import { BudgetSummary } from '@plotops/types';

export function ProjectBudgetDashboard({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);

  useEffect(() => {
    async function fetchBudget() {
      const { data } = await supabase.rpc('get_project_budget_summary', {
        p_project_id: projectId
      });
      setSummary(data);
    }
    fetchBudget();
  }, [projectId]);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <h3>Budgeted</h3>
        <p>${summary.total_budgeted.toLocaleString()}</p>
      </div>
      <div>
        <h3>Spent</h3>
        <p>${summary.total_actual.toLocaleString()}</p>
      </div>
      <div>
        <h3>Remaining</h3>
        <p>${summary.variance.toLocaleString()}</p>
      </div>
      <div>
        <h3>% Used</h3>
        <p>{summary.percentage_spent}%</p>
      </div>
    </div>
  );
}
```

## Testing

After running the migration, test with:

```sql
-- Create a test project budget
INSERT INTO plotops.project_budgets (project_id, department, category, budgeted_amount)
VALUES ('your-project-id', 'production', 'equipment', 50000);

-- Add a transaction
INSERT INTO plotops.budget_transactions (budget_id, description, amount, transaction_date)
VALUES ('budget-id', 'Test transaction', 5000, CURRENT_DATE);

-- Test the budget summary function
SELECT * FROM plotops.get_project_budget_summary('your-project-id');

-- Test progress calculation
SELECT plotops.calculate_project_progress('your-project-id');
```

## Rollback

If you need to rollback this migration:

```sql
BEGIN;

-- Drop all new tables
DROP TABLE IF EXISTS plotops.production_reports CASCADE;
DROP TABLE IF EXISTS plotops.schedule_scenes CASCADE;
DROP TABLE IF EXISTS plotops.shooting_schedule CASCADE;
DROP TABLE IF EXISTS plotops.project_deliverables CASCADE;
DROP TABLE IF EXISTS plotops.project_milestones CASCADE;
DROP TABLE IF EXISTS plotops.project_documents CASCADE;
DROP TABLE IF EXISTS plotops.budget_transactions CASCADE;
DROP TABLE IF EXISTS plotops.project_budgets CASCADE;

-- Drop types
DROP TYPE IF EXISTS plotops.schedule_status;
DROP TYPE IF EXISTS plotops.deliverable_status;
DROP TYPE IF EXISTS plotops.milestone_status;

-- Drop functions
DROP FUNCTION IF EXISTS plotops.calculate_project_progress(UUID);
DROP FUNCTION IF EXISTS plotops.get_project_budget_summary(UUID);

-- Remove added columns from projects
ALTER TABLE plotops.projects 
    DROP COLUMN IF EXISTS progress_percentage,
    DROP COLUMN IF EXISTS progress_calculation_method,
    DROP COLUMN IF EXISTS total_shoot_days,
    DROP COLUMN IF EXISTS completed_shoot_days;

COMMIT;
```

## Next Steps

1. Run the migration on your Supabase instance
2. Update your frontend to use the new types from `@plotops/types`
3. Build UI components for budget management, milestones, schedule, etc.
4. Implement API routes for CRUD operations
5. Add real-time subscriptions for production reports

## Support

For issues or questions:
- Check the main [ARCHITECTURE.md](./ARCHITECTURE.md) documentation
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Create an issue in the project repository
