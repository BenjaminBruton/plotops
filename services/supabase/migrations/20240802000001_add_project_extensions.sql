-- PlotOps Projects Extension Migration
-- Adds budget tracking, documents, milestones, schedule, and production reports

BEGIN;

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

CREATE TYPE plotops.milestone_status AS ENUM (
    'pending', 
    'in_progress', 
    'completed', 
    'delayed', 
    'cancelled'
);

CREATE TYPE plotops.deliverable_status AS ENUM (
    'pending', 
    'in_progress', 
    'delivered', 
    'approved', 
    'rejected'
);

CREATE TYPE plotops.schedule_status AS ENUM (
    'scheduled', 
    'in_progress', 
    'wrapped', 
    'cancelled'
);

-- ============================================================================
-- UPDATE EXISTING TABLES
-- ============================================================================

-- Add progress tracking fields to projects table
ALTER TABLE plotops.projects 
    ADD COLUMN progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    ADD COLUMN progress_calculation_method VARCHAR(50) DEFAULT 'manual', -- manual, scenes_based, milestones_based, hybrid
    ADD COLUMN total_shoot_days INTEGER,
    ADD COLUMN completed_shoot_days INTEGER DEFAULT 0;

-- ============================================================================
-- BUDGET TRACKING TABLES
-- ============================================================================

-- Department-level budget tracking
CREATE TABLE plotops.project_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL, -- pre-production, production, post-production, cast, locations, etc.
    category VARCHAR(100), -- salaries, equipment, travel, permits, etc.
    budgeted_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget transactions/line items
CREATE TABLE plotops.budget_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES plotops.project_budgets(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    vendor VARCHAR(255),
    receipt_url TEXT, -- External link to receipt
    approved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENT MANAGEMENT TABLES
-- ============================================================================

-- Project documents with external storage URLs
CREATE TABLE plotops.project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100), -- script, contract, permit, insurance, call_sheet, production_report, etc.
    version VARCHAR(50), -- v1.0, Draft 2, Final, etc.
    file_url TEXT NOT NULL, -- Google Drive, Dropbox, etc.
    file_size BIGINT, -- bytes
    mime_type VARCHAR(100),
    description TEXT,
    is_current_version BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[], -- for searching/filtering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MILESTONES & DELIVERABLES TABLES
-- ============================================================================

-- Project milestones
CREATE TABLE plotops.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_type VARCHAR(100), -- script_lock, casting_complete, principal_photography_start, wrap, rough_cut, final_cut, etc.
    target_date DATE,
    actual_date DATE,
    status plotops.milestone_status DEFAULT 'pending',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    assigned_to UUID REFERENCES auth.users(id),
    dependencies JSONB, -- IDs of other milestones this depends on
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliverables tied to milestones
CREATE TABLE plotops.project_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES plotops.project_milestones(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    deliverable_type VARCHAR(100), -- rough_cut, final_cut, dcp, prores_master, trailer, poster, etc.
    description TEXT,
    due_date DATE,
    delivered_date DATE,
    status plotops.deliverable_status DEFAULT 'pending',
    file_url TEXT, -- External link
    review_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRODUCTION SCHEDULE & REPORTS TABLES
-- ============================================================================

-- Shooting schedule (links scenes to shoot dates)
CREATE TABLE plotops.shooting_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    shoot_date DATE NOT NULL,
    location_id UUID REFERENCES plotops.locations(id) ON DELETE SET NULL,
    call_time TIME,
    wrap_time TIME,
    crew_call TIME,
    notes TEXT,
    weather_conditions VARCHAR(100),
    status plotops.schedule_status DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenes scheduled for each shoot day
CREATE TABLE plotops.schedule_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES plotops.shooting_schedule(id) ON DELETE CASCADE,
    scene_id UUID NOT NULL REFERENCES plotops.scenes(id) ON DELETE CASCADE,
    planned_start_time TIME,
    planned_duration INTEGER, -- minutes
    actual_start_time TIME,
    actual_end_time TIME,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, skipped
    takes_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(schedule_id, scene_id)
);

-- Daily production reports
CREATE TABLE plotops.production_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES plotops.projects(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES plotops.shooting_schedule(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    scenes_completed INTEGER DEFAULT 0,
    pages_completed DECIMAL(4,2) DEFAULT 0,
    total_scenes_to_date INTEGER DEFAULT 0,
    total_pages_to_date DECIMAL(5,2) DEFAULT 0,
    crew_count INTEGER,
    cast_count INTEGER,
    extras_count INTEGER,
    meals_served JSONB, -- {breakfast: 45, lunch: 50, dinner: 30}
    incidents TEXT,
    weather_summary VARCHAR(255),
    notes TEXT,
    submitted_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to auto-calculate progress from scenes
CREATE OR REPLACE FUNCTION plotops.calculate_project_progress(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_scenes INTEGER;
    completed_scenes INTEGER;
    progress INTEGER;
BEGIN
    -- Count total scenes
    SELECT COUNT(*) INTO total_scenes
    FROM plotops.scenes
    WHERE project_id = p_project_id;
    
    -- Count completed scenes (from schedule_scenes)
    SELECT COUNT(DISTINCT ss.scene_id) INTO completed_scenes
    FROM plotops.schedule_scenes ss
    JOIN plotops.shooting_schedule sh ON ss.schedule_id = sh.id
    WHERE sh.project_id = p_project_id
    AND ss.status = 'completed';
    
    -- Calculate percentage
    IF total_scenes > 0 THEN
        progress := ROUND((completed_scenes::DECIMAL / total_scenes::DECIMAL) * 100);
    ELSE
        progress := 0;
    END IF;
    
    RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Function to get total budget for a project
CREATE OR REPLACE FUNCTION plotops.get_project_budget_summary(p_project_id UUID)
RETURNS TABLE (
    total_budgeted DECIMAL,
    total_actual DECIMAL,
    variance DECIMAL,
    percentage_spent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(budgeted_amount), 0) as total_budgeted,
        COALESCE(SUM(actual_amount), 0) as total_actual,
        COALESCE(SUM(budgeted_amount - actual_amount), 0) as variance,
        CASE 
            WHEN SUM(budgeted_amount) > 0 THEN 
                ROUND((SUM(actual_amount) / SUM(budgeted_amount) * 100)::NUMERIC, 2)
            ELSE 0
        END as percentage_spent
    FROM plotops.project_budgets
    WHERE project_id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Budget indexes
CREATE INDEX idx_project_budgets_project_id ON plotops.project_budgets(project_id);
CREATE INDEX idx_project_budgets_department ON plotops.project_budgets(department);
CREATE INDEX idx_budget_transactions_budget_id ON plotops.budget_transactions(budget_id);
CREATE INDEX idx_budget_transactions_date ON plotops.budget_transactions(transaction_date);

-- Document indexes
CREATE INDEX idx_project_documents_project_id ON plotops.project_documents(project_id);
CREATE INDEX idx_project_documents_type ON plotops.project_documents(document_type);
CREATE INDEX idx_project_documents_current ON plotops.project_documents(project_id, is_current_version);
CREATE INDEX idx_project_documents_tags ON plotops.project_documents USING GIN(tags);

-- Milestone indexes
CREATE INDEX idx_project_milestones_project_id ON plotops.project_milestones(project_id);
CREATE INDEX idx_project_milestones_status ON plotops.project_milestones(status);
CREATE INDEX idx_project_milestones_target_date ON plotops.project_milestones(target_date);
CREATE INDEX idx_project_deliverables_project_id ON plotops.project_deliverables(project_id);
CREATE INDEX idx_project_deliverables_milestone_id ON plotops.project_deliverables(milestone_id);

-- Schedule indexes
CREATE INDEX idx_shooting_schedule_project_date ON plotops.shooting_schedule(project_id, shoot_date);
CREATE INDEX idx_shooting_schedule_status ON plotops.shooting_schedule(status);
CREATE INDEX idx_schedule_scenes_schedule_id ON plotops.schedule_scenes(schedule_id);
CREATE INDEX idx_schedule_scenes_scene_id ON plotops.schedule_scenes(scene_id);
CREATE INDEX idx_schedule_scenes_status ON plotops.schedule_scenes(status);

-- Production report indexes
CREATE INDEX idx_production_reports_project_date ON plotops.production_reports(project_id, report_date);
CREATE INDEX idx_production_reports_schedule_id ON plotops.production_reports(schedule_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE plotops.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.budget_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.shooting_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.schedule_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.production_reports ENABLE ROW LEVEL SECURITY;

-- Budget RLS Policies
CREATE POLICY "Users can view budgets for their organization's projects"
    ON plotops.project_budgets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_budgets.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Producers can manage budgets"
    ON plotops.project_budgets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_budgets.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'admin')
        )
    );

-- Budget Transactions RLS
CREATE POLICY "Users can view transactions for their organization"
    ON plotops.budget_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.project_budgets pb
            JOIN plotops.projects p ON p.id = pb.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE pb.id = budget_transactions.budget_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Producers can manage transactions"
    ON plotops.budget_transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.project_budgets pb
            JOIN plotops.projects p ON p.id = pb.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE pb.id = budget_transactions.budget_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'admin')
        )
    );

-- Documents RLS Policies
CREATE POLICY "Users can view documents for their organization's projects"
    ON plotops.project_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_documents.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Team members can upload documents"
    ON plotops.project_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plotops.project_members pm
            WHERE pm.project_id = project_documents.project_id
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Producers can manage documents"
    ON plotops.project_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_documents.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'admin')
        )
    );

-- Milestones RLS Policies
CREATE POLICY "Users can view milestones for their organization's projects"
    ON plotops.project_milestones FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_milestones.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Producers and ADs can manage milestones"
    ON plotops.project_milestones FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_milestones.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'admin')
        )
    );

-- Deliverables RLS Policies
CREATE POLICY "Users can view deliverables for their organization's projects"
    ON plotops.project_deliverables FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_deliverables.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Producers can manage deliverables"
    ON plotops.project_deliverables FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = project_deliverables.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'admin')
        )
    );

-- Schedule RLS Policies
CREATE POLICY "Users can view schedule for their organization's projects"
    ON plotops.shooting_schedule FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = shooting_schedule.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "ADs can manage schedule"
    ON plotops.shooting_schedule FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = shooting_schedule.project_id
            AND up.id = auth.uid()
            AND up.role IN ('ad', 'producer', 'admin')
        )
    );

-- Schedule Scenes RLS
CREATE POLICY "Users can view scheduled scenes for their organization"
    ON plotops.schedule_scenes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.shooting_schedule ss
            JOIN plotops.projects p ON p.id = ss.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE ss.id = schedule_scenes.schedule_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "ADs can manage scheduled scenes"
    ON plotops.schedule_scenes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.shooting_schedule ss
            JOIN plotops.projects p ON p.id = ss.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE ss.id = schedule_scenes.schedule_id
            AND up.id = auth.uid()
            AND up.role IN ('ad', 'producer', 'admin')
        )
    );

-- Production Reports RLS
CREATE POLICY "Users can view production reports for their organization"
    ON plotops.production_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = production_reports.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Team members can submit production reports"
    ON plotops.production_reports FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plotops.project_members pm
            WHERE pm.project_id = production_reports.project_id
            AND pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Producers can manage production reports"
    ON plotops.production_reports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = production_reports.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'admin')
        )
    );

COMMIT;
