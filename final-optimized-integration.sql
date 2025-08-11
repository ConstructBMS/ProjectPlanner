-- Final Optimized ProjectPlanner Integration for ConstructBMS
-- Based on actual asta_projects and asta_tasks table structures

-- =====================================================
-- ENHANCED PROJECT FEATURES (asta_projects)
-- =====================================================

-- Add enhanced fields to existing asta_projects table
-- Note: budget and actual_cost already exist, so we'll add complementary fields
ALTER TABLE asta_projects
ADD COLUMN IF NOT EXISTS projectplanner_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS projectplanner_milestone_date DATE,
ADD COLUMN IF NOT EXISTS projectplanner_notes TEXT,
ADD COLUMN IF NOT EXISTS projectplanner_priority VARCHAR(20) DEFAULT 'medium' CHECK (projectplanner_priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS projectplanner_estimated_hours DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_actual_hours DECIMAL(8,2) DEFAULT 0;

-- =====================================================
-- ENHANCED TASK FEATURES (asta_tasks)
-- =====================================================

-- Add enhanced fields to existing asta_tasks table
-- Note: Many fields already exist (duration, progress, priority, status, assigned_to, start_date, end_date)
ALTER TABLE asta_tasks
ADD COLUMN IF NOT EXISTS projectplanner_estimated_hours DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_actual_hours DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_cost DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_notes TEXT,
ADD COLUMN IF NOT EXISTS projectplanner_resource_type VARCHAR(50) DEFAULT 'human',
ADD COLUMN IF NOT EXISTS projectplanner_cost_per_hour DECIMAL(10,2) DEFAULT 0;

-- =====================================================
-- NEW PROJECTPLANNER TABLES
-- =====================================================

-- Project milestones table
CREATE TABLE IF NOT EXISTS projectplanner_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asta_project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    milestone_type VARCHAR(50) DEFAULT 'internal' CHECK (milestone_type IN ('internal', 'client', 'regulatory', 'financial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Project resources table (enhanced resource allocation)
CREATE TABLE IF NOT EXISTS projectplanner_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asta_project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    asta_task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('human', 'equipment', 'material', 'subcontractor')),
    resource_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id), -- Link to existing users
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    start_date DATE,
    end_date DATE,
    cost_per_hour DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project documents table
CREATE TABLE IF NOT EXISTS projectplanner_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asta_project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    asta_task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project comments table
CREATE TABLE IF NOT EXISTS projectplanner_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asta_project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    asta_task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID REFERENCES projectplanner_comments(id) ON DELETE CASCADE, -- For threaded comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project templates table
CREATE TABLE IF NOT EXISTS projectplanner_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL, -- Stores the complete template structure
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project settings table
CREATE TABLE IF NOT EXISTS projectplanner_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asta_project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(asta_project_id, setting_key)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Projectplanner milestones indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_milestones_project ON projectplanner_milestones(asta_project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_milestones_date ON projectplanner_milestones(milestone_date);
CREATE INDEX IF NOT EXISTS idx_projectplanner_milestones_status ON projectplanner_milestones(status);

-- Projectplanner resources indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_resources_project ON projectplanner_resources(asta_project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_resources_task ON projectplanner_resources(asta_task_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_resources_type ON projectplanner_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_projectplanner_resources_user ON projectplanner_resources(user_id);

-- Projectplanner documents indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_documents_project ON projectplanner_documents(asta_project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_documents_task ON projectplanner_documents(asta_task_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_documents_type ON projectplanner_documents(document_type);

-- Projectplanner comments indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_comments_project ON projectplanner_comments(asta_project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_comments_task ON projectplanner_comments(asta_task_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_comments_author ON projectplanner_comments(author_id);

-- Enhanced asta_projects indexes
CREATE INDEX IF NOT EXISTS idx_asta_projects_planner_priority ON asta_projects(projectplanner_priority);
CREATE INDEX IF NOT EXISTS idx_asta_projects_planner_hours ON asta_projects(projectplanner_estimated_hours, projectplanner_actual_hours);

-- Enhanced asta_tasks indexes (using existing columns)
CREATE INDEX IF NOT EXISTS idx_asta_tasks_planner_cost ON asta_tasks(projectplanner_cost);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_planner_hours ON asta_tasks(projectplanner_estimated_hours, projectplanner_actual_hours);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE projectplanner_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies using the actual manager_id and assigned_to columns
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
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for new tables
CREATE TRIGGER update_projectplanner_milestones_updated_at BEFORE UPDATE ON projectplanner_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_resources_updated_at BEFORE UPDATE ON projectplanner_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_documents_updated_at BEFORE UPDATE ON projectplanner_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_comments_updated_at BEFORE UPDATE ON projectplanner_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_templates_updated_at BEFORE UPDATE ON projectplanner_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_settings_updated_at BEFORE UPDATE ON projectplanner_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate project progress based on tasks (using existing progress column)
CREATE OR REPLACE FUNCTION calculate_asta_project_progress(project_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage NUMERIC;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE progress = 100)
    INTO total_tasks, completed_tasks
    FROM asta_tasks
    WHERE project_id = project_uuid;

    IF total_tasks = 0 THEN
        progress_percentage := 0;
    ELSE
        progress_percentage := (completed_tasks * 100.0) / total_tasks;
    END IF;

    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to update project budget and hours when tasks change
CREATE OR REPLACE FUNCTION update_project_from_tasks()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the project's budget and hours when task costs/hours change
    UPDATE asta_projects
    SET
        budget = (
            SELECT COALESCE(SUM(projectplanner_cost), 0)
            FROM asta_tasks
            WHERE project_id = NEW.project_id
        ),
        projectplanner_estimated_hours = (
            SELECT COALESCE(SUM(projectplanner_estimated_hours), 0)
            FROM asta_tasks
            WHERE project_id = NEW.project_id
        ),
        projectplanner_actual_hours = (
            SELECT COALESCE(SUM(projectplanner_actual_hours), 0)
            FROM asta_tasks
            WHERE project_id = NEW.project_id
        )
    WHERE id = NEW.project_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update project budget and hours when task costs/hours change
CREATE TRIGGER update_project_from_tasks_trigger
    AFTER UPDATE OF projectplanner_cost, projectplanner_estimated_hours, projectplanner_actual_hours ON asta_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_from_tasks();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample project template
INSERT INTO projectplanner_templates (name, description, category, template_data) VALUES (
    'Standard Construction Project',
    'Template for typical construction projects',
    'Construction',
    '{
        "phases": [
            {
                "name": "Planning & Design",
                "tasks": [
                    {"name": "Site Survey", "duration": 3, "priority": "high"},
                    {"name": "Design Review", "duration": 5, "priority": "high"},
                    {"name": "Permit Application", "duration": 7, "priority": "medium"}
                ]
            },
            {
                "name": "Site Preparation",
                "tasks": [
                    {"name": "Site Clearing", "duration": 2, "priority": "medium"},
                    {"name": "Foundation Work", "duration": 10, "priority": "high"}
                ]
            },
            {
                "name": "Construction",
                "tasks": [
                    {"name": "Framing", "duration": 15, "priority": "high"},
                    {"name": "Electrical", "duration": 8, "priority": "medium"},
                    {"name": "Plumbing", "duration": 8, "priority": "medium"},
                    {"name": "Finishing", "duration": 12, "priority": "medium"}
                ]
            }
        ]
    }'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- INTEGRATION HELPER FUNCTIONS
-- =====================================================

-- Function to create project from template (using actual column names)
CREATE OR REPLACE FUNCTION create_project_from_template(
    template_id UUID,
    project_name VARCHAR(255),
    project_description TEXT DEFAULT NULL,
    client_name VARCHAR(255) DEFAULT NULL,
    manager_id UUID DEFAULT NULL,
    start_date DATE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_project_id UUID;
    template_data JSONB;
    phase JSONB;
    task JSONB;
BEGIN
    -- Get template data
    SELECT template_data INTO template_data
    FROM projectplanner_templates
    WHERE id = template_id;

    -- Create the project using actual column names
    INSERT INTO asta_projects (
        name,
        description,
        client,
        manager_id,
        start_date,
        status,
        progress,
        budget,
        actual_cost
    ) VALUES (
        project_name,
        project_description,
        client_name,
        manager_id,
        start_date,
        'planning',
        0,
        0,
        0
    ) RETURNING id INTO new_project_id;

    -- Create tasks from template using actual column names
    FOR phase IN SELECT * FROM jsonb_array_elements(template_data->'phases')
    LOOP
        FOR task IN SELECT * FROM jsonb_array_elements(phase->'tasks')
        LOOP
            INSERT INTO asta_tasks (
                name,
                description,
                project_id,
                assigned_to,
                duration,
                priority,
                start_date,
                end_date,
                status,
                progress
            ) VALUES (
                task->>'name',
                task->>'description',
                new_project_id,
                manager_id,
                (task->>'duration')::INTEGER,
                COALESCE(task->>'priority', 'medium'),
                start_date,
                start_date + (task->>'duration')::INTEGER * INTERVAL '1 day',
                'not-started',
                0
            );
        END LOOP;
    END LOOP;

    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR EASY DATA ACCESS
-- =====================================================

-- View for enhanced project information
CREATE OR REPLACE VIEW projectplanner_enhanced_projects AS
SELECT
    p.*,
    COALESCE(SUM(t.projectplanner_cost), 0) as total_task_cost,
    COALESCE(SUM(t.projectplanner_estimated_hours), 0) as total_estimated_hours,
    COALESCE(SUM(t.projectplanner_actual_hours), 0) as total_actual_hours,
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.progress = 100) as completed_tasks,
    CASE
        WHEN COUNT(t.id) = 0 THEN 0
        ELSE (COUNT(t.id) FILTER (WHERE t.progress = 100) * 100.0) / COUNT(t.id)
    END as calculated_progress
FROM asta_projects p
LEFT JOIN asta_tasks t ON p.id = t.project_id
GROUP BY p.id;

-- View for enhanced task information
CREATE OR REPLACE VIEW projectplanner_enhanced_tasks AS
SELECT
    t.*,
    p.name as project_name,
    p.client as project_client,
    p.budget as project_budget,
    p.actual_cost as project_actual_cost,
    u.email as assigned_user_email
FROM asta_tasks t
LEFT JOIN asta_projects p ON t.project_id = p.id
LEFT JOIN users u ON t.assigned_to = u.id;

-- =====================================================
-- DEPLOYMENT SUCCESS MESSAGE
-- =====================================================

-- This will show a success message when the deployment completes
DO $$
BEGIN
    RAISE NOTICE 'ProjectPlanner integration deployed successfully!';
    RAISE NOTICE 'Enhanced fields added to asta_projects and asta_tasks tables';
    RAISE NOTICE 'New ProjectPlanner tables created with proper relationships';
    RAISE NOTICE 'RLS policies configured for security using manager_id and assigned_to';
    RAISE NOTICE 'Sample template data inserted';
    RAISE NOTICE 'Views created for easy data access';
    RAISE NOTICE 'Your existing data is preserved and enhanced!';
    RAISE NOTICE 'Budget and cost tracking now available!';
END $$;
