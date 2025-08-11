-- Test Enhanced Fields on Existing Data

-- Check enhanced fields on existing projects
SELECT
    name,
    client,
    budget,
    actual_cost,
    projectplanner_location,
    projectplanner_milestone_date,
    projectplanner_priority,
    projectplanner_estimated_hours,
    projectplanner_actual_hours
FROM asta_projects
WHERE projectplanner_priority IS NOT NULL
   OR projectplanner_location IS NOT NULL
   OR projectplanner_estimated_hours > 0
LIMIT 5;

-- Check enhanced fields on existing tasks
SELECT
    name,
    description,
    duration,
    progress,
    priority,
    projectplanner_cost,
    projectplanner_estimated_hours,
    projectplanner_actual_hours,
    projectplanner_notes,
    projectplanner_resource_type,
    projectplanner_cost_per_hour
FROM asta_tasks
WHERE projectplanner_cost > 0
   OR projectplanner_estimated_hours > 0
   OR projectplanner_notes IS NOT NULL
LIMIT 5;

-- Test adding enhanced data to existing projects
UPDATE asta_projects
SET projectplanner_priority = 'high',
    projectplanner_location = '123 Main Street, London',
    projectplanner_notes = 'High priority construction project'
WHERE name = (SELECT name FROM asta_projects LIMIT 1)
RETURNING name, projectplanner_priority, projectplanner_location, projectplanner_notes;

-- Test adding enhanced data to existing tasks
UPDATE asta_tasks
SET projectplanner_cost = 5000,
    projectplanner_estimated_hours = 40,
    projectplanner_notes = 'Foundation work requires special equipment',
    projectplanner_resource_type = 'human',
    projectplanner_cost_per_hour = 125
WHERE name = (SELECT name FROM asta_tasks LIMIT 1)
RETURNING name, projectplanner_cost, projectplanner_estimated_hours, projectplanner_notes;
