-- Test Template Functionality

-- Check available templates
SELECT
    name,
    description,
    category,
    is_public,
    created_at
FROM projectplanner_templates;

-- Test creating a project from template (optional - will create new data)
-- Uncomment the following if you want to test template creation:

/*
SELECT create_project_from_template(
    (SELECT id FROM projectplanner_templates WHERE name = 'Standard Construction Project'),
    'Test Project from Template',
    'This is a test project created from the construction template',
    'Test Construction Client',
    NULL, -- manager_id (set to your user ID if you want to assign it)
    CURRENT_DATE
);
*/

-- Check if the template function exists
SELECT
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'create_project_from_template'
AND routine_schema = 'public';

-- Test template data structure
SELECT
    name,
    jsonb_pretty(template_data) as template_structure
FROM projectplanner_templates
WHERE name = 'Standard Construction Project';
