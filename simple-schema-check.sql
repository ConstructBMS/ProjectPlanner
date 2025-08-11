-- Simple ConstructBMS Schema Check for ProjectPlanner Integration
-- Run this in your Supabase SQL editor

-- 1. List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check for user/employee tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('users', 'user', 'employees', 'employee', 'staff', 'profiles')
ORDER BY table_name, ordinal_position;

-- 3. Check for client/customer tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('clients', 'client', 'customers', 'customer', 'companies')
ORDER BY table_name, ordinal_position;

-- 4. Check for project/job tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('projects', 'project', 'jobs', 'job', 'contracts', 'contract')
ORDER BY table_name, ordinal_position;

-- 5. Check for task/work tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('tasks', 'task', 'work_orders', 'activities')
ORDER BY table_name, ordinal_position;

-- 6. Check for resource/equipment tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('resources', 'equipment', 'materials', 'assets')
ORDER BY table_name, ordinal_position;

-- 7. Check for financial tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('costs', 'budgets', 'expenses', 'invoices')
ORDER BY table_name, ordinal_position;

-- 8. Check for document/file tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('documents', 'files', 'attachments')
ORDER BY table_name, ordinal_position;

-- 9. Check for time/schedule tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('schedules', 'calendars', 'time_entries')
ORDER BY table_name, ordinal_position;

-- 10. Check foreign key relationships (simplified)
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
