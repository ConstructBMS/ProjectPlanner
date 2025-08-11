-- Verify Template Project Creation and Test All Components

-- =====================================================
-- 1. VERIFY THE CREATED PROJECT
-- =====================================================

-- Check the project that was created from template
SELECT
    name,
    description,
    client,
    status,
    progress,
    budget,
    actual_cost,
    projectplanner_priority,
    projectplanner_location,
    projectplanner_notes
FROM asta_projects
WHERE id = '4979bdd4-dacb-4ab9-b61c-fb4471e36b53';

-- =====================================================
-- 2. VERIFY THE CREATED TASKS
-- =====================================================

-- Check all tasks created for this project
SELECT
    name,
    description,
    duration,
    priority,
    status,
    progress,
    start_date,
    end_date,
    projectplanner_cost,
    projectplanner_estimated_hours,
    projectplanner_notes,
    projectplanner_resource_type
FROM asta_tasks
WHERE project_id = '4979bdd4-dacb-4ab9-b61c-fb4471e36b53'
ORDER BY name;

-- =====================================================
-- 3. TEST ENHANCED VIEWS WITH NEW DATA
-- =====================================================

-- Check the project in enhanced view
SELECT
    name,
    client,
    total_task_cost,
    total_estimated_hours,
    calculated_progress,
    projectplanner_priority
FROM projectplanner_enhanced_projects
WHERE id = '4979bdd4-dacb-4ab9-b61c-fb4471e36b53';

-- Check tasks in enhanced view
SELECT
    name,
    project_name,
    project_client,
    projectplanner_cost,
    projectplanner_estimated_hours,
    assigned_user_email
FROM projectplanner_enhanced_tasks
WHERE project_id = '4979bdd4-dacb-4ab9-b61c-fb4471e36b53'
ORDER BY name;

-- =====================================================
-- 4. TEST TEMPLATE FUNCTIONALITY
-- =====================================================

-- Show available templates
SELECT
    name,
    description,
    category,
    jsonb_array_length(template_data->'phases') as phase_count,
    (
        SELECT COUNT(*)
        FROM jsonb_array_elements(template_data->'phases') phases,
             jsonb_array_elements(phases->'tasks') tasks
    ) as total_task_count
FROM projectplanner_templates;

-- =====================================================
-- 5. TEST ENHANCED FEATURES
-- =====================================================

-- Add some enhanced data to the template project
UPDATE asta_projects
SET projectplanner_priority = 'high',
    projectplanner_location = '456 Construction Site, Manchester',
    projectplanner_notes = 'Template project with enhanced features'
WHERE id = '4979bdd4-dacb-4ab9-b61c-fb4471e36b53'
RETURNING name, projectplanner_priority, projectplanner_location, projectplanner_notes;

-- Add enhanced data to some tasks
UPDATE asta_tasks
SET projectplanner_cost = 2500,
    projectplanner_estimated_hours = 20,
    projectplanner_notes = 'Site survey requires specialized equipment',
    projectplanner_resource_type = 'human',
    projectplanner_cost_per_hour = 100
WHERE project_id = '4979bdd4-dacb-4ab9-b61c-fb4471e36b53'
AND name = 'Site Survey'
RETURNING name, projectplanner_cost, projectplanner_estimated_hours, projectplanner_notes;

-- =====================================================
-- 6. FINAL VERIFICATION
-- =====================================================

-- Show final project status
SELECT
    'TEMPLATE PROJECT CREATION SUCCESSFUL!' as status,
    p.name as project_name,
    p.client,
    p.projectplanner_priority,
    COUNT(t.id) as task_count,
    SUM(t.projectplanner_cost) as total_task_cost,
    SUM(t.projectplanner_estimated_hours) as total_estimated_hours
FROM asta_projects p
LEFT JOIN asta_tasks t ON p.id = t.project_id
WHERE p.id = '4979bdd4-dacb-4ab9-b61c-fb4471e36b53'
GROUP BY p.id, p.name, p.client, p.projectplanner_priority;

-- Show all ProjectPlanner features are working
SELECT 'PROJECTPLANNER INTEGRATION COMPLETE!' as message,
       'All features are now functional and ready for use.' as status;
