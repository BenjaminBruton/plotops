# Database Reset Guide

## How to Wipe Your Supabase Database and Start Fresh

This guide will help you completely reset your PlotOps Supabase database and apply the new migrations.

## ⚠️ WARNING

**This will DELETE ALL DATA in your database!** Make sure you:
1. Have a backup if needed
2. Are working on a development/staging instance
3. Are absolutely sure you want to proceed

---

## Option 1: Via Supabase Dashboard (Recommended)

### Step 1: Drop All Existing Schemas

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your PlotOps project
3. Navigate to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Paste and run this SQL:

```sql
-- Drop all existing schemas and data
DROP SCHEMA IF EXISTS plotops CASCADE;
DROP SCHEMA IF EXISTS public CASCADE;

-- Recreate schemas
CREATE SCHEMA public;
CREATE SCHEMA plotops;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;

-- Grant permissions to plotops schema
GRANT USAGE ON SCHEMA plotops TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA plotops TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA plotops TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA plotops TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA plotops GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA plotops GRANT ALL ON SEQUENCES TO postgres, service_role;
```

6. Click **Run** (or press Ctrl/Cmd + Enter)

### Step 2: Run the Core Schema Migration

1. Still in the SQL Editor, create a **New Query**
2. Open the file: `services/supabase/migrations/20240327000001_create_plotops_schema.sql`
3. Copy the ENTIRE contents of that file
4. Paste into the SQL Editor
5. Click **Run**

You should see a success message. This creates all the core tables (projects, scenes, characters, locations, etc.).

### Step 3: Run the Projects Extension Migration

1. Create another **New Query** in SQL Editor
2. Open the file: `services/supabase/migrations/20240802000001_add_project_extensions.sql`
3. Copy the ENTIRE contents
4. Paste into the SQL Editor
5. Click **Run**

This adds budget tracking, documents, milestones, schedule, and production reports.

### Step 4: Verify the Schema

Run this query to verify all tables were created:

```sql
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'plotops'
ORDER BY tablename;
```

You should see approximately 25+ tables including:
- projects
- project_budgets
- project_documents
- project_milestones
- shooting_schedule
- production_reports
- scenes
- characters
- locations
- casting_calls
- etc.

---

## Option 2: Using psql Command Line

If you have PostgreSQL client tools installed and your Supabase connection string:

### Step 1: Get Your Connection String

1. Go to Supabase Dashboard → Settings → Database
2. Copy the connection string (use the "Direct connection" string)
3. Replace `[YOUR-PASSWORD]` with your database password

### Step 2: Run the Reset

```bash
# Navigate to your project directory
cd /Users/benjaminbruton/Desktop/PlotOps

# Run the drop schema command
psql "YOUR_CONNECTION_STRING" -c "
DROP SCHEMA IF EXISTS plotops CASCADE;
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
CREATE SCHEMA plotops;
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS \"postgis\" SCHEMA public;
"

# Run the migrations in order
psql "YOUR_CONNECTION_STRING" -f services/supabase/migrations/20240327000001_create_plotops_schema.sql
psql "YOUR_CONNECTION_STRING" -f services/supabase/migrations/20240802000001_add_project_extensions.sql
```

---

## Option 3: Reset via Supabase CLI (If Installed)

If you have the Supabase CLI installed:

```bash
# Link your local project to remote
supabase link --project-ref YOUR_PROJECT_ID

# Reset the database
supabase db reset

# Push migrations
supabase db push
```

---

## Verification Steps

After resetting, verify everything is working:

### 1. Check Tables Created

```sql
SELECT COUNT(*) as table_count 
FROM pg_tables 
WHERE schemaname = 'plotops';
```

Should return 25+ tables.

### 2. Test RLS Policies

```sql
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'plotops'
ORDER BY tablename, policyname;
```

Should show multiple RLS policies for each table.

### 3. Test Functions

```sql
-- Test the progress calculation function
SELECT plotops.calculate_project_progress('00000000-0000-0000-0000-000000000000');

-- Should return 0 (no project with that ID exists yet)
```

### 4. Create a Test Record

```sql
-- Insert a test organization
INSERT INTO plotops.organizations (name, slug, description)
VALUES ('Test Studio', 'test-studio', 'A test production company')
RETURNING id;

-- Use the returned ID to create a test project
INSERT INTO plotops.projects (organization_id, title, slug, status)
VALUES ('YOUR_ORG_ID_HERE', 'Test Project', 'test-project', 'development')
RETURNING id;
```

---

## Troubleshooting

### Error: "schema plotops does not exist"

Make sure you ran the DROP/CREATE schema commands first (Step 1).

### Error: "permission denied for schema plotops"

Run the GRANT commands from Step 1 again.

### Error: "relation already exists"

You may have residual tables. Run the DROP CASCADE command again:

```sql
DROP SCHEMA IF EXISTS plotops CASCADE;
```

### Error: "type plotops.user_role does not exist"

This means the first migration didn't complete. Ensure you're running the migrations in order:
1. First: `20240327000001_create_plotops_schema.sql`
2. Second: `20240802000001_add_project_extensions.sql`

### Migration Running Forever

Supabase SQL Editor has a timeout. For large migrations:
1. Split the migration into smaller chunks
2. Run each section separately
3. Or use psql command line instead

---

## Next Steps After Reset

1. **Update your .env file** with Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Test the connection** from your Next.js app

3. **Create test data** using the examples in `docs/PROJECTS_SCHEMA.md`

4. **Set up authentication** if not already configured

---

## Need Help?

- Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide
- Review [PROJECTS_SCHEMA.md](./PROJECTS_SCHEMA.md) for usage examples
- Verify your Supabase credentials are correct
- Check Supabase logs in Dashboard → Logs

---

## Rollback

If something goes wrong and you need to undo:

```sql
-- This will remove everything
DROP SCHEMA IF EXISTS plotops CASCADE;
```

Then you can start fresh again from Step 1.
