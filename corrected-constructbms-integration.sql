-- Corrected ProjectPlanner Integration for ConstructBMS
-- This schema uses more generic column names to avoid conflicts

-- =====================================================
-- ENHANCED PROJECT FEATURES
-- =====================================================

-- Add enhanced fields to existing asta_projects table
ALTER TABLE asta_projects
ADD COLUMN IF NOT EXISTS projectplanner_budget DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_actual_cost DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_progress INTEGER DEFAULT 0 CHECK (projectplanner_progress >= 0 AND projectplanner_progress <= 100),
ADD COLUMN IF NOT EXISTS projectplanner_priority VARCHAR(20) DEFAULT 'medium' CHECK (projectplanner_priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS projectplanner_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS projectplanner_start_date DATE,
ADD COLUMN IF NOT EXISTS projectplanner_end_date DATE,
ADD COLUMN IF NOT EXISTS projectplanner_milestone_date DATE,
ADD COLUMN IF NOT EXISTS projectplanner_notes TEXT;

-- Add enhanced fields to existing asta_tasks table
ALTER TABLE asta_tasks
ADD COLUMN IF NOT EXISTS projectplanner_duration INTEGER, -- Duration in days
ADD COLUMN IF NOT EXISTS projectplanner_progress INTEGER DEFAULT 0 CHECK (projectplanner_progress >= 0 AND projectplanner_progress <= 100),
ADD COLUMN IF NOT EXISTS projectplanner_priority VARCHAR(20) DEFAULT 'medium' CHECK (projectplanner_priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS projectplanner_estimated_hours DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_actual_hours DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_cost DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS projectplanner_start_date DATE,
ADD COLUMN IF NOT EXISTS projectplanner_end_date DATE,
ADD COLUMN IF NOT EXISTS projectplanner_notes TEXT;

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

-- Project resources table
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
CREATE INDEX IF NOT EXISTS idx_asta_projects_planner_dates ON asta_projects(projectplanner_start_date, projectplanner_end_date);
CREATE INDEX IF NOT EXISTS idx_asta_projects_planner_priority ON asta_projects(projectplanner_priority);
CREATE INDEX IF NOT EXISTS idx_asta_projects_planner_progress ON asta_projects(projectplanner_progress);

-- Enhanced asta_tasks indexes
CREATE INDEX IF NOT EXISTS idx_asta_tasks_planner_dates ON asta_tasks(projectplanner_start_date, projectplanner_end_date);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_planner_priority ON asta_tasks(projectplanner_priority);
CREATE INDEX IF NOT EXISTS idx_asta_tasks_planner_progress ON asta_tasks(projectplanner_progress);

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

-- Generic RLS policies (will need to be customized based on your actual column names)
-- For now, we'll use a simple policy that allows all authenticated users to see data
-- You can customize these based on your actual user assignment columns

CREATE POLICY "Authenticated users can view projectplanner data" ON projectplanner_milestones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view projectplanner resources" ON projectplanner_resources
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view projectplanner documents" ON projectplanner_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view projectplanner comments" ON projectplanner_comments
    FOR SELECT USING (auth.role() = 'authenticated');

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

-- Function to calculate project progress based on tasks
CREATE OR REPLACE FUNCTION calculate_asta_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage INTEGER;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE projectplanner_progress = 100)
    INTO total_tasks, completed_tasks
    FROM asta_tasks
    WHERE project_id = project_uuid;

    IF total_tasks = 0 THEN
        progress_percentage := 0;
    ELSE
        progress_percentage := (completed_tasks * 100) / total_tasks;
    END IF;

    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

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

-- Function to create project from template (simplified version)
CREATE OR REPLACE FUNCTION create_project_from_template(
    template_id UUID,
    project_name VARCHAR(255),
    project_description TEXT DEFAULT NULL,
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

    -- Create the project (using basic fields that should exist)
    INSERT INTO asta_projects (
        name,
        description,
        projectplanner_start_date
    ) VALUES (
        project_name,
        project_description,
        start_date
    ) RETURNING id INTO new_project_id;

    -- Create tasks from template
    FOR phase IN SELECT * FROM jsonb_array_elements(template_data->'phases')
    LOOP
        FOR task IN SELECT * FROM jsonb_array_elements(phase->'tasks')
        LOOP
            INSERT INTO asta_tasks (
                name,
                description,
                project_id,
                projectplanner_duration,
                projectplanner_priority,
                projectplanner_start_date
            ) VALUES (
                task->>'name',
                task->>'description',
                new_project_id,
                (task->>'duration')::INTEGER,
                COALESCE(task->>'priority', 'medium'),
                start_date
            );
        END LOOP;
    END LOOP;

    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql;
