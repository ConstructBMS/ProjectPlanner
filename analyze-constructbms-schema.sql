-- Comprehensive ConstructBMS Database Schema Analysis
-- Run this in your Supabase SQL editor and share the results

-- =====================================================
-- 1. OVERVIEW - All Tables and Their Types
-- =====================================================
SELECT
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 2. DETAILED TABLE STRUCTURE
-- =====================================================
SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position,
    CASE
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE 'REGULAR'
    END as key_type,
    fk.foreign_table_name,
    fk.foreign_column_name
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT
        kcu.table_name,
        kcu.column_name,
        ccu.table_name as foreign_table_name,
        ccu.column_name as foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON t.table_name = fk.table_name AND c.column_name = fk.column_name
LEFT JOIN (
    SELECT
        kcu.table_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- =====================================================
-- 3. USER/EMPLOYEE RELATED TABLES
-- =====================================================
-- Check for user/employee/team member tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'users', 'user', 'employees', 'employee', 'staff', 'team_members',
        'team_member', 'personnel', 'people', 'accounts', 'profiles'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 4. CLIENT/CUSTOMER RELATED TABLES
-- =====================================================
-- Check for client/customer tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'clients', 'client', 'customers', 'customer', 'accounts',
        'companies', 'company', 'organizations', 'organization'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 5. PROJECT/JOB RELATED TABLES
-- =====================================================
-- Check for project/job/work order tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'projects', 'project', 'jobs', 'job', 'work_orders', 'work_order',
        'orders', 'order', 'contracts', 'contract', 'engagements', 'engagement'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 6. RESOURCE/EQUIPMENT RELATED TABLES
-- =====================================================
-- Check for resource/equipment/material tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'resources', 'resource', 'equipment', 'equipments', 'materials',
        'material', 'tools', 'tool', 'assets', 'asset', 'inventory'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 7. TASK/ACTIVITY RELATED TABLES
-- =====================================================
-- Check for task/activity/work item tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'tasks', 'task', 'activities', 'activity', 'work_items', 'work_item',
        'actions', 'action', 'steps', 'step', 'phases', 'phase'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 8. FINANCIAL/COST RELATED TABLES
-- =====================================================
-- Check for financial/cost/budget tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'costs', 'cost', 'budgets', 'budget', 'expenses', 'expense',
        'invoices', 'invoice', 'payments', 'payment', 'financials', 'financial'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 9. DOCUMENT/FILE RELATED TABLES
-- =====================================================
-- Check for document/file/attachment tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'documents', 'document', 'files', 'file', 'attachments', 'attachment',
        'uploads', 'upload', 'media', 'images', 'image'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 10. TIME/SCHEDULE RELATED TABLES
-- =====================================================
-- Check for time/schedule/calendar tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'schedules', 'schedule', 'calendars', 'calendar', 'time_entries',
        'time_entry', 'timesheets', 'timesheet', 'hours', 'hour'
    )
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 11. FOREIGN KEY RELATIONSHIPS
-- =====================================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 12. INDEXES
-- =====================================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 13. ROW LEVEL SECURITY POLICIES
-- =====================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 14. TRIGGERS
-- =====================================================
SELECT
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 15. FUNCTIONS
-- =====================================================
SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- =====================================================
-- 16. SAMPLE DATA ANALYSIS
-- =====================================================
-- Get row counts for all tables
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =====================================================
-- 17. AUTHENTICATION TABLES
-- =====================================================
-- Check for auth-related tables (Supabase auth)
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name LIKE '%auth%'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 18. CUSTOM TYPES
-- =====================================================
SELECT
    typname as type_name,
    typtype as type_type,
    typcategory as type_category
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typtype = 'c' -- composite types
ORDER BY typname;

-- =====================================================
-- 19. VIEWS
-- =====================================================
SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 20. SUMMARY STATISTICS
-- =====================================================
SELECT
    'Tables' as object_type,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
UNION ALL
SELECT
    'Views' as object_type,
    COUNT(*) as count
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT
    'Functions' as object_type,
    COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
UNION ALL
SELECT
    'Triggers' as object_type,
    COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT
    'Foreign Keys' as object_type,
    COUNT(*) as count
FROM information_schema.table_constraints
WHERE table_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';
