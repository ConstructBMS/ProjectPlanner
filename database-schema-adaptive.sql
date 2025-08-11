-- ProjectPlanner Module - Adaptive Database Schema for ConstructBMS Integration
-- This schema is designed to work with various ConstructBMS database structures

-- =====================================================
-- PROJECTS TABLE (Adaptive)
-- =====================================================
CREATE TABLE IF NOT EXISTS projectplanner_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on-hold', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0,
    actual_cost DECIMAL(15,2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

    -- Integration fields - these can be linked to your existing ConstructBMS tables
    -- You can modify these column names to match your existing structure
    project_manager_id UUID, -- Link to your users/employees table
    client_reference_id UUID, -- Link to your clients table
    contract_reference_id UUID, -- Link to your contracts table
    location VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- Link to your users table
    updated_by UUID, -- Link to your users table

    -- Additional fields for ConstructBMS integration
    constructbms_project_id UUID, -- If you have existing projects, link them here
    external_reference VARCHAR(255), -- For any external system references
    notes TEXT
);

-- =====================================================
-- PROJECT TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projectplanner_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projectplanner_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold')),
    start_date DATE,
    end_date DATE,
    duration INTEGER, -- Duration in days
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    parent_task_id UUID REFERENCES projectplanner_tasks(id) ON DELETE CASCADE, -- For subtasks
    assigned_to_id UUID, -- Link to your users/employees table
    estimated_hours DECIMAL(8,2) DEFAULT 0,
    actual_hours DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,

    -- Additional fields for ConstructBMS integration
    constructbms_task_id UUID, -- If you have existing tasks, link them here
    work_order_reference VARCHAR(255), -- Link to work orders if applicable
    job_reference VARCHAR(255) -- Link to jobs if applicable
);

-- =====================================================
-- PROJECT DEPENDENCIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projectplanner_dependencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projectplanner_projects(id) ON DELETE CASCADE,
    predecessor_task_id UUID NOT NULL REFERENCES projectplanner_tasks(id) ON DELETE CASCADE,
    successor_task_id UUID NOT NULL REFERENCES projectplanner_tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'finish-to-start' CHECK (dependency_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(predecessor_task_id, successor_task_id)
);

-- =====================================================
-- PROJECT RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projectplanner_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projectplanner_projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES projectplanner_tasks(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('human', 'equipment', 'material', 'subcontractor')),
    resource_name VARCHAR(255) NOT NULL,
    resource_reference_id UUID, -- Link to your existing resources/employees/equipment tables
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
CREATE TABLE IF NOT EXISTS projectplanner_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projectplanner_projects(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS projectplanner_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projectplanner_projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES projectplanner_tasks(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS projectplanner_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projectplanner_projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES projectplanner_tasks(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    author_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES projectplanner_comments(id) ON DELETE CASCADE, -- For threaded comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projectplanner_templates (
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
CREATE TABLE IF NOT EXISTS projectplanner_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projectplanner_projects(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_projectplanner_projects_status ON projectplanner_projects(status);
CREATE INDEX IF NOT EXISTS idx_projectplanner_projects_manager ON projectplanner_projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_projects_client ON projectplanner_projects(client_reference_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_projects_dates ON projectplanner_projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projectplanner_projects_priority ON projectplanner_projects(priority);
CREATE INDEX IF NOT EXISTS idx_projectplanner_projects_constructbms_id ON projectplanner_projects(constructbms_project_id);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_tasks_project ON projectplanner_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_tasks_status ON projectplanner_tasks(status);
CREATE INDEX IF NOT EXISTS idx_projectplanner_tasks_assigned ON projectplanner_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_tasks_dates ON projectplanner_tasks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_projectplanner_tasks_parent ON projectplanner_tasks(parent_task_id);

-- Dependencies indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_dependencies_project ON projectplanner_dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_dependencies_predecessor ON projectplanner_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_dependencies_successor ON projectplanner_dependencies(successor_task_id);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_resources_project ON projectplanner_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_resources_task ON projectplanner_resources(task_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_resources_type ON projectplanner_resources(resource_type);

-- Milestones indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_milestones_project ON projectplanner_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_milestones_date ON projectplanner_milestones(milestone_date);
CREATE INDEX IF NOT EXISTS idx_projectplanner_milestones_status ON projectplanner_milestones(status);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_documents_project ON projectplanner_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_documents_task ON projectplanner_documents(task_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_documents_type ON projectplanner_documents(document_type);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_projectplanner_comments_project ON projectplanner_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_comments_task ON projectplanner_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_projectplanner_comments_author ON projectplanner_comments(author_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE projectplanner_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projectplanner_settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your ConstructBMS user roles)
-- Projects: Users can see projects they're assigned to or manage
CREATE POLICY "Users can view their assigned projects" ON projectplanner_projects
    FOR SELECT USING (
        project_manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM projectplanner_resources
            WHERE project_id = projectplanner_projects.id AND resource_reference_id = auth.uid()
        )
    );

-- Tasks: Users can see tasks from projects they have access to
CREATE POLICY "Users can view tasks from accessible projects" ON projectplanner_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projectplanner_projects
            WHERE id = projectplanner_tasks.project_id AND
            (project_manager_id = auth.uid() OR
             EXISTS (
                 SELECT 1 FROM projectplanner_resources
                 WHERE project_id = projectplanner_projects.id AND resource_reference_id = auth.uid()
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
CREATE TRIGGER update_projectplanner_projects_updated_at BEFORE UPDATE ON projectplanner_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_tasks_updated_at BEFORE UPDATE ON projectplanner_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_resources_updated_at BEFORE UPDATE ON projectplanner_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projectplanner_milestones_updated_at BEFORE UPDATE ON projectplanner_milestones
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
CREATE OR REPLACE FUNCTION calculate_projectplanner_project_progress(project_uuid UUID)
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
    FROM projectplanner_tasks
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

-- Function to link ProjectPlanner project to existing ConstructBMS project
CREATE OR REPLACE FUNCTION link_to_constructbms_project(
    projectplanner_id UUID,
    constructbms_project_id UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE projectplanner_projects
    SET constructbms_project_id = link_to_constructbms_project.constructbms_project_id
    WHERE id = projectplanner_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create ProjectPlanner project from ConstructBMS data
CREATE OR REPLACE FUNCTION create_project_from_constructbms(
    constructbms_project_id UUID,
    project_name VARCHAR(255),
    project_description TEXT DEFAULT NULL,
    project_manager_id UUID DEFAULT NULL,
    client_id UUID DEFAULT NULL,
    contract_id UUID DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    budget DECIMAL(15,2) DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    new_project_id UUID;
BEGIN
    INSERT INTO projectplanner_projects (
        name,
        description,
        project_manager_id,
        client_reference_id,
        contract_reference_id,
        start_date,
        end_date,
        budget,
        constructbms_project_id,
        created_by
    ) VALUES (
        project_name,
        project_description,
        project_manager_id,
        client_id,
        contract_id,
        start_date,
        end_date,
        budget,
        constructbms_project_id,
        auth.uid()
    ) RETURNING id INTO new_project_id;

    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql;
