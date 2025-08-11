-- Complete Missing ProjectPlanner Deployment
-- Run this to finish the deployment

-- =====================================================
-- MISSING TABLES
-- =====================================================

-- Project resources table
CREATE TABLE IF NOT EXISTS projectplanner_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asta_project_id UUID NOT NULL REFERENCES asta_projects(id) ON DELETE CASCADE,
    asta_task_id UUID REFERENCES asta_tasks(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('human', 'equipment', 'material', 'subcontractor')),
    resource_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
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
    parent_comment_id UUID REFERENCES projectplanner_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project templates table
CREATE TABLE IF NOT EXISTS projectplanner_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
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
-- MISSING INDEXES
-- =====================================================

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

-- Enhanced asta_tasks indexes
CREATE INDEX IF NOT EXISTS idx_asta_tasks_planner_cost ON asta_tasks(projectplanner_cost);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_planner_hours ON asta_tasks(projectplanner_estimated_hours, projectplanner_actual_hours);

-- =====================================================
-- MISSING RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE projectplanner_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for resources
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

-- RLS policies for documents
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

-- RLS policies for comments
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
-- MISSING TRIGGERS
-- =====================================================

-- Triggers for new tables
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

-- =====================================================
-- MISSING SAMPLE DATA
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
-- MISSING VIEWS
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
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Missing ProjectPlanner components deployed successfully!';
    RAISE NOTICE 'All tables, views, and policies are now complete!';
END $$;
