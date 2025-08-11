-- Create Missing Template Function
-- This function was referenced in the schema but needs to be created

-- Function to create project from template (using actual column names)
CREATE OR REPLACE FUNCTION create_project_from_template(
    template_id UUID,
    project_name VARCHAR(255),
    project_description TEXT DEFAULT NULL,
    client_name VARCHAR(255) DEFAULT NULL,
    manager_id UUID DEFAULT NULL,
    start_date DATE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_project_id UUID;
    template_data JSONB;
    phase JSONB;
    task JSONB;
BEGIN
    -- Get template data (using table alias to avoid ambiguity)
    SELECT pt.template_data INTO template_data
    FROM projectplanner_templates pt
    WHERE pt.id = template_id;

    -- Check if template exists
    IF template_data IS NULL THEN
        RAISE EXCEPTION 'Template with ID % not found', template_id;
    END IF;

    -- Create the project using actual column names
    INSERT INTO asta_projects (
        name,
        description,
        client,
        manager_id,
        start_date,
        status,
        progress,
        budget,
        actual_cost
    ) VALUES (
        project_name,
        project_description,
        client_name,
        manager_id,
        start_date,
        'planning',
        0,
        0,
        0
    ) RETURNING id INTO new_project_id;

    -- Create tasks from template using actual column names
    FOR phase IN SELECT * FROM jsonb_array_elements(template_data->'phases')
    LOOP
        FOR task IN SELECT * FROM jsonb_array_elements(phase->'tasks')
        LOOP
            INSERT INTO asta_tasks (
                name,
                description,
                project_id,
                assigned_to,
                duration,
                priority,
                start_date,
                end_date,
                status,
                progress
            ) VALUES (
                task->>'name',
                task->>'description',
                new_project_id,
                manager_id,
                (task->>'duration')::INTEGER,
                COALESCE(task->>'priority', 'medium'),
                start_date,
                start_date + (task->>'duration')::INTEGER * INTERVAL '1 day',
                'not-started',
                0
            );
        END LOOP;
    END LOOP;

    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql;

-- Test the function exists
SELECT
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'create_project_from_template'
AND routine_schema = 'public';

-- Test creating a project from template
SELECT create_project_from_template(
    (SELECT id FROM projectplanner_templates WHERE name = 'Standard Construction Project'),
    'Test Project from Template',
    'This is a test project created from the construction template',
    'Test Construction Client',
    NULL, -- manager_id (set to your user ID if you want to assign it)
    CURRENT_DATE
);
