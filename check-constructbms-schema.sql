-- Check ConstructBMS Database Structure
-- Run this in your Supabase SQL editor to see your existing table structure

-- List all tables in your database
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if there's a users table and its structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there's a clients table and its structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clients'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there's a contracts table and its structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contracts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there's a projects table already
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'projects'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any other relevant tables
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'employees',
    'staff',
    'team_members',
    'resources',
    'equipment',
    'materials',
    'tasks',
    'work_orders',
    'jobs'
)
ORDER BY table_name, ordinal_position;
