-- ProjectPlanner Database Setup (Safe Version)
-- This script safely creates tables and handles existing schema conflicts
-- Run this in your Supabase SQL Editor

-- =====================================================
-- CHECK AND CREATE PROJECTS TABLE
-- =====================================================
DO $$
BEGIN
    -- Check if projects table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
        CREATE TABLE projects (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on-hold', 'cancelled')),
            start_date DATE,
            end_date DATE,
            budget DECIMAL(15,2) DEFAULT 0,
            actual_cost DECIMAL(15,2) DEFAULT 0,
            progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
            location VARCHAR(255),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created projects table';
    ELSE
        RAISE NOTICE 'Projects table already exists';

        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'description') THEN
            ALTER TABLE projects ADD COLUMN description TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status') THEN
            ALTER TABLE projects ADD COLUMN status VARCHAR(50) DEFAULT 'planning';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'budget') THEN
            ALTER TABLE projects ADD COLUMN budget DECIMAL(15,2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'actual_cost') THEN
            ALTER TABLE projects ADD COLUMN actual_cost DECIMAL(15,2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'progress') THEN
            ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'location') THEN
            ALTER TABLE projects ADD COLUMN location VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority') THEN
            ALTER TABLE projects ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
        END IF;
    END IF;
END $$;

-- =====================================================
-- CHECK AND CREATE PROJECT TASKS TABLE
-- =====================================================
DO $$
BEGIN
    -- Check if project_tasks table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_tasks') THEN
        CREATE TABLE project_tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'on-hold')),
            start_date DATE,
            end_date DATE,
            duration INTEGER,
            progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            parent_task_id UUID,
            assigned_to UUID,
            estimated_hours DECIMAL(8,2) DEFAULT 0,
            actual_hours DECIMAL(8,2) DEFAULT 0,
            cost DECIMAL(15,2) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add foreign key constraints
        ALTER TABLE project_tasks ADD CONSTRAINT fk_project_tasks_project_id
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        ALTER TABLE project_tasks ADD CONSTRAINT fk_project_tasks_parent_task_id
            FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE CASCADE;

        RAISE NOTICE 'Created project_tasks table';
    ELSE
        RAISE NOTICE 'Project_tasks table already exists';

        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'description') THEN
            ALTER TABLE project_tasks ADD COLUMN description TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'status') THEN
            ALTER TABLE project_tasks ADD COLUMN status VARCHAR(50) DEFAULT 'not-started';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'duration') THEN
            ALTER TABLE project_tasks ADD COLUMN duration INTEGER;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'progress') THEN
            ALTER TABLE project_tasks ADD COLUMN progress INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'priority') THEN
            ALTER TABLE project_tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'estimated_hours') THEN
            ALTER TABLE project_tasks ADD COLUMN estimated_hours DECIMAL(8,2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'actual_hours') THEN
            ALTER TABLE project_tasks ADD COLUMN actual_hours DECIMAL(8,2) DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'cost') THEN
            ALTER TABLE project_tasks ADD COLUMN cost DECIMAL(15,2) DEFAULT 0;
        END IF;
    END IF;
END $$;

-- =====================================================
-- CHECK AND CREATE PROJECT DEPENDENCIES TABLE
-- =====================================================
DO $$
BEGIN
    -- Check if project_dependencies table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_dependencies') THEN
        CREATE TABLE project_dependencies (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID NOT NULL,
            predecessor_task_id UUID NOT NULL,
            successor_task_id UUID NOT NULL,
            dependency_type VARCHAR(20) DEFAULT 'finish-to-start' CHECK (dependency_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
            lag_days INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(predecessor_task_id, successor_task_id)
        );

        -- Add foreign key constraints
        ALTER TABLE project_dependencies ADD CONSTRAINT fk_project_dependencies_project_id
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        ALTER TABLE project_dependencies ADD CONSTRAINT fk_project_dependencies_predecessor_task_id
            FOREIGN KEY (predecessor_task_id) REFERENCES project_tasks(id) ON DELETE CASCADE;
        ALTER TABLE project_dependencies ADD CONSTRAINT fk_project_dependencies_successor_task_id
            FOREIGN KEY (successor_task_id) REFERENCES project_tasks(id) ON DELETE CASCADE;

        RAISE NOTICE 'Created project_dependencies table';
    ELSE
        RAISE NOTICE 'Project_dependencies table already exists';
    END IF;
END $$;

-- =====================================================
-- CHECK AND CREATE USER SETTINGS TABLE
-- =====================================================
DO $$
BEGIN
    -- Check if user_settings table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        CREATE TABLE user_settings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            ribbon_state JSONB DEFAULT '{"expanded": true}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        RAISE NOTICE 'Created user_settings table';
    ELSE
        RAISE NOTICE 'User_settings table already exists';
    END IF;
END $$;

-- =====================================================
-- CREATE INDEXES (IF NOT EXISTS)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_dependencies_project ON project_dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- =====================================================
-- CREATE UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at') THEN
        CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON project_tasks
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at') THEN
        CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT
    'projects' as table_name,
    COUNT(*) as row_count
FROM projects
UNION ALL
SELECT
    'project_tasks' as table_name,
    COUNT(*) as row_count
FROM project_tasks
UNION ALL
SELECT
    'project_dependencies' as table_name,
    COUNT(*) as row_count
FROM project_dependencies
UNION ALL
SELECT
    'user_settings' as table_name,
    COUNT(*) as row_count
FROM user_settings;
