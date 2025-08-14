-- Migration: Add ConstructBMS tables for ProjectPlanner integration
-- This migration adds the required tables if they don't exist in the ConstructBMS database
-- Run this manually if needed: DO NOT auto-run

-- =====================================================
-- PROJECTS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on-hold', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0,
    actual_cost DECIMAL(15,2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    manager_id UUID,
    client_id UUID,
    contract_id UUID,
    location VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =====================================================
-- PROJECT TASKS TABLE (if not exists)
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
    wbs VARCHAR(50), -- Work Breakdown Structure code
    resource_id UUID, -- Link to ConstructBMS resources table
    estimated_hours DECIMAL(8,2) DEFAULT 0,
    actual_hours DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- =====================================================
-- PROJECT DEPENDENCIES TABLE (if not exists)
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
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_start_date ON project_tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_wbs ON project_tasks(wbs);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_project_dependencies_project_id ON project_dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_project_dependencies_pred_id ON project_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_project_dependencies_succ_id ON project_dependencies(successor_task_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_dependencies ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your ConstructBMS auth system)
-- Projects: Users can view projects they're assigned to or manage
CREATE POLICY IF NOT EXISTS "Users can view projects" ON projects
    FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY IF NOT EXISTS "Users can insert projects" ON projects
    FOR INSERT WITH CHECK (true); -- Adjust based on your auth requirements

CREATE POLICY IF NOT EXISTS "Users can update projects" ON projects
    FOR UPDATE USING (true); -- Adjust based on your auth requirements

-- Project tasks: Users can view tasks for projects they have access to
CREATE POLICY IF NOT EXISTS "Users can view project tasks" ON project_tasks
    FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY IF NOT EXISTS "Users can insert project tasks" ON project_tasks
    FOR INSERT WITH CHECK (true); -- Adjust based on your auth requirements

CREATE POLICY IF NOT EXISTS "Users can update project tasks" ON project_tasks
    FOR UPDATE USING (true); -- Adjust based on your auth requirements

-- Project dependencies: Users can view dependencies for projects they have access to
CREATE POLICY IF NOT EXISTS "Users can view project dependencies" ON project_dependencies
    FOR SELECT USING (true); -- Adjust based on your auth requirements

CREATE POLICY IF NOT EXISTS "Users can insert project dependencies" ON project_dependencies
    FOR INSERT WITH CHECK (true); -- Adjust based on your auth requirements

CREATE POLICY IF NOT EXISTS "Users can update project dependencies" ON project_dependencies
    FOR UPDATE USING (true); -- Adjust based on your auth requirements

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE projects IS 'Projects table for ConstructBMS integration with ProjectPlanner';
COMMENT ON TABLE project_tasks IS 'Project tasks table for ConstructBMS integration with ProjectPlanner';
COMMENT ON TABLE project_dependencies IS 'Project dependencies/task links table for ConstructBMS integration with ProjectPlanner';

COMMENT ON COLUMN projects.code IS 'Project code/identifier';
COMMENT ON COLUMN project_tasks.wbs IS 'Work Breakdown Structure code for task hierarchy';
COMMENT ON COLUMN project_tasks.resource_id IS 'Link to ConstructBMS resources table';
COMMENT ON COLUMN project_dependencies.dependency_type IS 'Type of dependency between tasks';
COMMENT ON COLUMN project_dependencies.lag_days IS 'Lag time in days between predecessor and successor';
