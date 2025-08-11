-- Test Enhanced Views for ProjectPlanner Integration

-- Test enhanced projects view
SELECT
    name,
    client,
    budget,
    actual_cost,
    projectplanner_priority,
    projectplanner_estimated_hours,
    total_task_cost,
    total_estimated_hours,
    calculated_progress
FROM projectplanner_enhanced_projects
LIMIT 3;

-- Test enhanced tasks view
SELECT
    name,
    project_name,
    project_client,
    projectplanner_cost,
    projectplanner_estimated_hours,
    projectplanner_notes,
    assigned_user_email
FROM projectplanner_enhanced_tasks
LIMIT 3;

-- Test milestones
SELECT
    name,
    milestone_date,
    status,
    milestone_type
FROM projectplanner_milestones
LIMIT 3;

-- Test resources
SELECT
    resource_name,
    resource_type,
    allocation_percentage,
    cost_per_hour
FROM projectplanner_resources
LIMIT 3;

-- Test documents
SELECT
    document_name,
    document_type,
    file_size,
    mime_type
FROM projectplanner_documents
LIMIT 3;

-- Test comments
SELECT
    comment,
    author_id,
    created_at
FROM projectplanner_comments
LIMIT 3;
