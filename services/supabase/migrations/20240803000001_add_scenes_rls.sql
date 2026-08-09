-- Add RLS Policies for Scenes Table
-- This migration adds Row Level Security policies for the scenes table

BEGIN;

-- Enable RLS on scenes table if not already enabled
ALTER TABLE plotops.scenes ENABLE ROW LEVEL SECURITY;

-- Allow users to view scenes for their organization's projects
CREATE POLICY "Users can view scenes for their organization's projects"
    ON plotops.scenes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = scenes.project_id
            AND up.id = auth.uid()
        )
    );

-- Allow producers and ADs to insert scenes
CREATE POLICY "Producers and ADs can create scenes"
    ON plotops.scenes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = scenes.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'admin')
        )
    );

-- Allow producers and ADs to update scenes
CREATE POLICY "Producers and ADs can update scenes"
    ON plotops.scenes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = scenes.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'admin')
        )
    );

-- Allow producers and ADs to delete scenes
CREATE POLICY "Producers and ADs can delete scenes"
    ON plotops.scenes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = scenes.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'admin')
        )
    );

-- Add similar policies for related tables
ALTER TABLE plotops.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.props ENABLE ROW LEVEL SECURITY;
ALTER TABLE plotops.scene_props ENABLE ROW LEVEL SECURITY;

-- Characters policies
CREATE POLICY "Users can view characters for their organization's projects"
    ON plotops.characters FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = characters.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Team members can manage characters"
    ON plotops.characters FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = characters.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'casting_director', 'admin')
        )
    );

-- Scene Characters policies
CREATE POLICY "Users can view scene characters for their organization"
    ON plotops.scene_characters FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.scenes s
            JOIN plotops.projects p ON p.id = s.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE s.id = scene_characters.scene_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Team members can manage scene characters"
    ON plotops.scene_characters FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.scenes s
            JOIN plotops.projects p ON p.id = s.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE s.id = scene_characters.scene_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'casting_director', 'admin')
        )
    );

-- Props policies
CREATE POLICY "Users can view props for their organization's projects"
    ON plotops.props FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = props.project_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Team members can manage props"
    ON plotops.props FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.projects p
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE p.id = props.project_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'admin')
        )
    );

-- Scene Props policies
CREATE POLICY "Users can view scene props for their organization"
    ON plotops.scene_props FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM plotops.scenes s
            JOIN plotops.projects p ON p.id = s.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE s.id = scene_props.scene_id
            AND up.id = auth.uid()
        )
    );

CREATE POLICY "Team members can manage scene props"
    ON plotops.scene_props FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM plotops.scenes s
            JOIN plotops.projects p ON p.id = s.project_id
            JOIN plotops.user_profiles up ON up.organization_id = p.organization_id
            WHERE s.id = scene_props.scene_id
            AND up.id = auth.uid()
            AND up.role IN ('producer', 'ad', 'admin')
        )
    );

COMMIT;
