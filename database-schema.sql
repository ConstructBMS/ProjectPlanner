-- ProjectPlanner Module Database Schema for ConstructBMS Integration
-- This schema is designed to integrate with your existing ConstructBMS database

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on-hold', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0,
    actual_cost DECIMAL(15,2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    manager_id UUID, -- Link to ConstructBMS users table
    client_id UUID, -- Link to ConstructBMS clients table
    contract_id UUID, -- Link to ConstructBMS contracts table
    location VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Link to ConstructBMS users table
    updated_by UUID -- Link to ConstructBMS users table
);

-- =====================================================
-- PROJECT TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold')),
    start_date DATE,
    end_date DATE,
    duration INTEGER, -- Duration in days
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE, -- For subtasks
    assigned_to UUID, -- Link to ConstructBMS users table
    estimated_hours DECIMAL(8,2) DEFAULT 0,
    actual_hours DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =====================================================
-- PROJECT DEPENDENCIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_dependencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    predecessor_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    successor_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'finish-to-start' CHECK (dependency_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(predecessor_task_id, successor_task_id)
);

-- =====================================================
-- PROJECT RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('human', 'equipment', 'material', 'subcontractor')),
    resource_name VARCHAR(255) NOT NULL,
    resource_id UUID, -- Link to ConstructBMS resources/employees/equipment tables
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    start_date DATE,
    end_date DATE,
    cost_per_hour DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT MILESTONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    milestone_type VARCHAR(50) DEFAULT 'internal' CHECK (milestone_type IN ('internal', 'client', 'regulatory', 'financial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    author_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE, -- For threaded comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL, -- Stores the complete template structure
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS project_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, setting_key)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_dates ON project_tasks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON project_tasks(parent_task_id);

-- Dependencies indexes
CREATE INDEX IF NOT EXISTS idx_dependencies_project ON project_dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_predecessor ON project_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_successor ON project_dependencies(successor_task_id);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_project ON project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_resources_task ON project_resources(task_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON project_resources(resource_type);

-- Milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON project_milestones(milestone_date);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_task ON project_documents(task_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON project_documents(document_type);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_project ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON project_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON project_comments(author_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you'll need to customize these based on your ConstructBMS user roles)
-- Projects: Users can see projects they're assigned to or manage
CREATE POLICY "Users can view their assigned projects" ON projects
    FOR SELECT USING (
        manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM project_resources
            WHERE project_id = projects.id AND resource_id = auth.uid()
        )
    );

-- Tasks: Users can see tasks from projects they have access to
CREATE POLICY "Users can view tasks from accessible projects" ON project_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_tasks.project_id AND
            (manager_id = auth.uid() OR
             EXISTS (
                 SELECT 1 FROM project_resources
                 WHERE project_id = projects.id AND resource_id = auth.uid()
             ))
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

-- Triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON project_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON project_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON project_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON project_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate project progress based on tasks
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage INTEGER;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_tasks, completed_tasks
    FROM project_tasks
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
INSERT INTO project_templates (name, description, category, template_data) VALUES (
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
