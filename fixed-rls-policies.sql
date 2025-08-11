-- Fix RLS Policies for ProjectPlanner Integration
-- Using correct column names from actual table structure

-- =====================================================
-- DROP EXISTING POLICIES (if they exist)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view projectplanner data for managed projects" ON projectplanner_milestones;
DROP POLICY IF EXISTS "Users can view projectplanner data for assigned tasks" ON projectplanner_milestones;
DROP POLICY IF EXISTS "Users can view projectplanner resources for managed projects" ON projectplanner_resources;
DROP POLICY IF EXISTS "Users can view projectplanner resources for assigned tasks" ON projectplanner_resources;
DROP POLICY IF EXISTS "Users can view projectplanner documents for managed projects" ON projectplanner_documents;
DROP POLICY IF EXISTS "Users can view projectplanner documents for assigned tasks" ON projectplanner_documents;
DROP POLICY IF EXISTS "Users can view projectplanner comments for managed projects" ON projectplanner_comments;
DROP POLICY IF EXISTS "Users can view projectplanner comments for assigned tasks" ON projectplanner_comments;

-- =====================================================
-- CREATE CORRECTED RLS POLICIES
-- =====================================================

-- RLS policies for milestones (using manager_id from asta_projects and assigned_to from asta_tasks)
CREATE POLICY "Users can view projectplanner data for managed projects" ON projectplanner_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects
            WHERE id = projectplanner_milestones.asta_project_id
            AND manager_id = auth.uid()
        )
    );

CREATE POLICY "Users can view projectplanner data for assigned tasks" ON projectplanner_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks
            WHERE project_id = projectplanner_milestones.asta_project_id
            AND assigned_to = auth.uid()
        )
    );

-- RLS policies for resources (using manager_id from asta_projects and assigned_to from asta_tasks)
CREATE POLICY "Users can view projectplanner resources for managed projects" ON projectplanner_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects
            WHERE id = projectplanner_resources.asta_project_id
            AND manager_id = auth.uid()
        )
    );

CREATE POLICY "Users can view projectplanner resources for assigned tasks" ON projectplanner_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks
            WHERE project_id = projectplanner_resources.asta_project_id
            AND assigned_to = auth.uid()
        )
    );

-- RLS policies for documents (using manager_id from asta_projects and assigned_to from asta_tasks)
CREATE POLICY "Users can view projectplanner documents for managed projects" ON projectplanner_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects
            WHERE id = projectplanner_documents.asta_project_id
            AND manager_id = auth.uid()
        )
    );

CREATE POLICY "Users can view projectplanner documents for assigned tasks" ON projectplanner_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks
            WHERE project_id = projectplanner_documents.asta_project_id
            AND assigned_to = auth.uid()
        )
    );

-- RLS policies for comments (using manager_id from asta_projects and assigned_to from asta_tasks)
CREATE POLICY "Users can view projectplanner comments for managed projects" ON projectplanner_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_projects
            WHERE id = projectplanner_comments.asta_project_id
            AND manager_id = auth.uid()
        )
    );

CREATE POLICY "Users can view projectplanner comments for assigned tasks" ON projectplanner_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM asta_tasks
            WHERE project_id = projectplanner_comments.asta_project_id
            AND assigned_to = auth.uid()
        )
    );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS policies fixed successfully!';
    RAISE NOTICE 'Using correct column names: manager_id (asta_projects) and assigned_to (asta_tasks)';
END $$;
