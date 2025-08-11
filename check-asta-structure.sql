-- Check actual structure of asta_projects table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'asta_projects'
ORDER BY ordinal_position;

-- Check actual structure of asta_tasks table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'asta_tasks'
ORDER BY ordinal_position;
