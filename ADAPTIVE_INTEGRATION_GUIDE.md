# ProjectPlanner Module - Adaptive Integration Guide

## Overview

This guide explains how to integrate the ProjectPlanner module into your ConstructBMS system using the adaptive schema that works with any existing database structure.

## Problem Solved

The original schema assumed specific column names like `manager_id` that don't exist in your ConstructBMS database. The adaptive schema uses prefixed table names and flexible column names to avoid conflicts.

## Database Schema

### Table Naming Convention

All ProjectPlanner tables use the `projectplanner_` prefix to avoid conflicts with your existing ConstructBMS tables:

- `projectplanner_projects` - Main project information
- `projectplanner_tasks` - Individual tasks within projects
- `projectplanner_dependencies` - Task dependencies and relationships
- `projectplanner_resources` - Resources assigned to projects/tasks
- `projectplanner_milestones` - Key project milestones
- `projectplanner_documents` - Project-related documents
- `projectplanner_comments` - Project and task comments
- `projectplanner_templates` - Reusable project templates
- `projectplanner_settings` - Project-specific settings

### Flexible Integration Fields

The schema uses generic column names that can be adapted to your existing structure:

- `project_manager_id` - Can link to your users/employees table
- `client_reference_id` - Can link to your clients table
- `contract_reference_id` - Can link to your contracts table
- `resource_reference_id` - Can link to your resources/employees/equipment tables

## Integration Steps

### 1. Check Your Existing Database Structure

First, run the schema check script to understand your existing ConstructBMS structure:

```sql
-- Run check-constructbms-schema.sql in your Supabase SQL editor
```

This will show you:

- All existing tables
- Column names and types for users, clients, contracts, etc.
- Any existing project-related tables

### 2. Deploy the Adaptive Schema

Run the adaptive schema in your Supabase SQL editor:

```sql
-- Execute database-schema-adaptive.sql
```

This creates all ProjectPlanner tables with the `projectplanner_` prefix.

### 3. Customize Column Mappings

Based on your existing database structure, you may need to customize the column mappings. Here are common scenarios:

#### Scenario A: You have a `users` table

```sql
-- If your users table has an 'id' column
-- The project_manager_id will work as-is
-- No changes needed
```

#### Scenario B: You have an `employees` table instead of `users`

```sql
-- You might want to rename the column for clarity
ALTER TABLE projectplanner_projects
RENAME COLUMN project_manager_id TO employee_manager_id;
```

#### Scenario C: You have different column names

```sql
-- If your clients table uses 'client_id' instead of 'id'
-- You can create a view or use the reference_id as-is
```

### 4. Update RLS Policies

Customize the Row Level Security policies to match your user authentication:

```sql
-- Example: If your users table is called 'employees'
CREATE POLICY "Employees can view their assigned projects" ON projectplanner_projects
    FOR SELECT USING (
        project_manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM projectplanner_resources
            WHERE project_id = projectplanner_projects.id
            AND resource_reference_id = auth.uid()
        )
    );
```

### 5. Test the Integration

Test the connection and basic functionality:

```javascript
// Test connection to new tables
const { data, error } = await supabase
  .from('projectplanner_projects')
  .select('*')
  .limit(1);

console.log('Connection test:', { data, error });
```

## Integration Options

### Option 1: Standalone Integration

Use ProjectPlanner as a separate module with its own data:

```javascript
// Create a new project in ProjectPlanner
const newProject = {
  name: 'New Construction Project',
  description: 'Project description',
  project_manager_id: currentUserId, // From your auth system
  client_reference_id: clientId, // From your clients table
  start_date: '2024-01-15',
  end_date: '2024-12-31',
  budget: 1000000,
};
```

### Option 2: Linked Integration

Link ProjectPlanner projects to existing ConstructBMS data:

```javascript
// Link to existing ConstructBMS project
const linkedProject = {
  name: 'Existing Project',
  constructbms_project_id: existingProjectId, // Link to your existing project
  project_manager_id: existingManagerId,
  client_reference_id: existingClientId,
};
```

### Option 3: Hybrid Integration

Use both standalone and linked projects:

```javascript
// Some projects are standalone
const standaloneProject = {
  name: 'New Project',
  project_manager_id: currentUserId,
};

// Some projects are linked to existing data
const linkedProject = {
  name: 'Existing Project',
  constructbms_project_id: existingId,
  project_manager_id: existingManagerId,
};
```

## Data Migration (if needed)

If you have existing project data in ConstructBMS, you can migrate it:

```sql
-- Example: Migrate from existing 'jobs' table
INSERT INTO projectplanner_projects (
  name,
  description,
  status,
  start_date,
  end_date,
  budget,
  project_manager_id,
  constructbms_project_id,
  created_by
)
SELECT
  job_name,
  job_description,
  CASE
    WHEN job_status = 'active' THEN 'active'
    WHEN job_status = 'completed' THEN 'completed'
    ELSE 'planning'
  END,
  start_date,
  end_date,
  budget,
  manager_id,
  job_id, -- Link to existing job
  created_by
FROM your_existing_jobs_table;
```

## Customization Examples

### Custom Column Names

If you want to use different column names:

```sql
-- Rename columns to match your naming convention
ALTER TABLE projectplanner_projects
RENAME COLUMN project_manager_id TO assigned_employee_id;

ALTER TABLE projectplanner_projects
RENAME COLUMN client_reference_id TO customer_id;
```

### Custom Status Values

If you want different status values:

```sql
-- Modify status constraints
ALTER TABLE projectplanner_projects
DROP CONSTRAINT projectplanner_projects_status_check;

ALTER TABLE projectplanner_projects
ADD CONSTRAINT projectplanner_projects_status_check
CHECK (status IN ('draft', 'approved', 'in-progress', 'completed', 'cancelled'));
```

### Custom Priority Values

If you want different priority values:

```sql
-- Modify priority constraints
ALTER TABLE projectplanner_projects
DROP CONSTRAINT projectplanner_projects_priority_check;

ALTER TABLE projectplanner_projects
ADD CONSTRAINT projectplanner_projects_priority_check
CHECK (priority IN ('urgent', 'high', 'normal', 'low'));
```

## Testing Checklist

- [ ] Schema deployed successfully
- [ ] Tables created with `projectplanner_` prefix
- [ ] RLS policies configured correctly
- [ ] Can create new projects
- [ ] Can view projects based on permissions
- [ ] Can link to existing ConstructBMS data
- [ ] Authentication works correctly
- [ ] No column name conflicts

## Troubleshooting

### Common Issues

1. **Column not found errors**
   - Check that you're using the correct table names with `projectplanner_` prefix
   - Verify column names match the schema

2. **Permission errors**
   - Check RLS policies match your user authentication
   - Verify `auth.uid()` returns the correct user ID

3. **Foreign key errors**
   - Ensure referenced UUIDs exist in your ConstructBMS tables
   - Check data types match (UUID vs string)

### Debug Queries

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'projectplanner_%';

-- Check table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projectplanner_projects';

-- Test RLS policies
SELECT * FROM projectplanner_projects
WHERE project_manager_id = auth.uid();
```

## Next Steps

1. **Deploy the adaptive schema** to your ConstructBMS database
2. **Run the schema check** to understand your existing structure
3. **Customize column mappings** if needed
4. **Test the integration** with sample data
5. **Configure RLS policies** for your user roles
6. **Integrate navigation** into your ConstructBMS app

The ProjectPlanner module is now ready to work with any ConstructBMS database structure!
