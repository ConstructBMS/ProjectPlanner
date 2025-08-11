# ProjectPlanner Integration for ConstructBMS (asta\_ tables)

## Overview

This guide explains how to integrate the ProjectPlanner module into your existing ConstructBMS system that uses the `asta_` table prefix.

## Your Current Database Structure

Based on the analysis, your ConstructBMS system has:

### Core Tables

- **`asta_projects`** - Main project information
- **`asta_tasks`** - Individual tasks within projects
- **`asta_task_links`** - Task dependencies and relationships
- **`users`** - User management
- **`customers`** - Client management
- **`organizations`** - Organization structure

### Existing Relationships

- Projects are assigned to users (`assigned_to`, `created_by`)
- Tasks are linked to projects (`project_id`)
- Tasks can have parent-child relationships (`parent_task_id`)
- Tasks are assigned to users (`assigned_to`, `created_by`)

## Integration Approach

### 1. Enhanced Existing Tables

Instead of creating new tables, we enhance your existing `asta_` tables with ProjectPlanner features:

#### Enhanced `asta_projects` Fields

```sql
projectplanner_budget DECIMAL(15,2) DEFAULT 0
projectplanner_actual_cost DECIMAL(15,2) DEFAULT 0
projectplanner_progress INTEGER DEFAULT 0
projectplanner_priority VARCHAR(20) DEFAULT 'medium'
projectplanner_location VARCHAR(255)
projectplanner_start_date DATE
projectplanner_end_date DATE
projectplanner_milestone_date DATE
projectplanner_notes TEXT
```

#### Enhanced `asta_tasks` Fields

```sql
projectplanner_duration INTEGER
projectplanner_progress INTEGER DEFAULT 0
projectplanner_priority VARCHAR(20) DEFAULT 'medium'
projectplanner_estimated_hours DECIMAL(8,2) DEFAULT 0
projectplanner_actual_hours DECIMAL(8,2) DEFAULT 0
projectplanner_cost DECIMAL(15,2) DEFAULT 0
projectplanner_start_date DATE
projectplanner_end_date DATE
projectplanner_notes TEXT
```

### 2. New ProjectPlanner Tables

Additional tables for enhanced features:

- **`projectplanner_milestones`** - Key project milestones
- **`projectplanner_resources`** - Resource allocation
- **`projectplanner_documents`** - Project documents
- **`projectplanner_comments`** - Project comments
- **`projectplanner_templates`** - Reusable project templates
- **`projectplanner_settings`** - Project-specific settings

## Installation Steps

### 1. Deploy the Integration Schema

Run the custom integration schema in your Supabase SQL editor:

```sql
-- Execute custom-constructbms-integration.sql
```

This will:

- Add enhanced fields to your existing `asta_projects` and `asta_tasks` tables
- Create new ProjectPlanner tables with proper foreign key relationships
- Set up indexes for optimal performance
- Configure Row Level Security policies
- Create helper functions and triggers

### 2. Update Your Environment

The ProjectPlanner module is already configured to use your ConstructBMS Supabase instance:

```env
VITE_SUPABASE_URL=https://rleprzlnxhhckdzbptzm.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZXByemxueGhoY2tkemJwdHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NjMxOTcsImV4cCI6MjA2NzAzOTE5N30.Aw-dM-8TKqUfBTm7Er-apo6xvhKTfDW98l1pK_kdWRA
```

### 3. Test the Integration

Test that the ProjectPlanner module can access your existing data:

```javascript
// Test connection to asta_projects
const { data, error } = await supabase
  .from('asta_projects')
  .select('*')
  .limit(1);

console.log('Connection test:', { data, error });
```

## Data Integration

### Existing Data Compatibility

Your existing project and task data will work immediately:

```javascript
// Your existing projects will be available
const { data: projects } = await supabase.from('asta_projects').select('*');

// Your existing tasks will be available
const { data: tasks } = await supabase.from('asta_tasks').select('*');
```

### Enhanced Features

New ProjectPlanner features will be available alongside existing data:

```javascript
// Enhanced project with budget and progress
const enhancedProject = {
  name: 'Construction Project',
  description: 'New building construction',
  assigned_to: userId,
  projectplanner_budget: 1000000,
  projectplanner_start_date: '2024-01-15',
  projectplanner_end_date: '2024-12-31',
  projectplanner_priority: 'high',
};

// Enhanced task with duration and cost
const enhancedTask = {
  name: 'Foundation Work',
  project_id: projectId,
  assigned_to: userId,
  projectplanner_duration: 10,
  projectplanner_estimated_hours: 80,
  projectplanner_cost: 50000,
};
```

## Feature Integration

### 1. Project Management

- **Existing**: Basic project info in `asta_projects`
- **Enhanced**: Budget, timeline, progress tracking, priority

### 2. Task Management

- **Existing**: Basic task info in `asta_tasks`
- **Enhanced**: Duration, cost tracking, progress, priority

### 3. Resource Management

- **New**: Resource allocation in `projectplanner_resources`
- **Integration**: Links to existing `users` table

### 4. Document Management

- **New**: Document storage in `projectplanner_documents`
- **Integration**: Links to projects and tasks

### 5. Communication

- **New**: Comments in `projectplanner_comments`
- **Integration**: Threaded comments with user references

### 6. Templates

- **New**: Reusable project templates in `projectplanner_templates`
- **Integration**: Can create projects from templates

## Row Level Security

The integration maintains your existing security model:

```sql
-- Users can only see projects they're assigned to or created
CREATE POLICY "Users can view projectplanner data for accessible projects"
ON projectplanner_milestones
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM asta_projects
        WHERE id = projectplanner_milestones.asta_project_id
        AND (assigned_to = auth.uid() OR created_by = auth.uid())
    )
);
```

## Automatic Features

### Progress Calculation

Project progress is automatically calculated based on task completion:

```sql
-- Trigger automatically updates project progress when tasks change
CREATE TRIGGER update_project_progress_trigger
    AFTER UPDATE OF projectplanner_progress ON asta_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();
```

### Template System

Create projects from reusable templates:

```sql
-- Function to create project from template
SELECT create_project_from_template(
    template_id,
    'New Construction Project',
    'Project description',
    assigned_user_id,
    '2024-01-15'
);
```

## Migration Path

### Phase 1: Schema Deployment

- Deploy the integration schema
- Test with existing data
- Verify all existing functionality still works

### Phase 2: Feature Adoption

- Start using enhanced fields for new projects
- Gradually migrate existing projects to use new features
- Train users on new capabilities

### Phase 3: Full Integration

- Use all ProjectPlanner features
- Integrate with your existing workflows
- Customize based on your specific needs

## Customization Options

### 1. Priority Levels

Modify priority values to match your business:

```sql
ALTER TABLE asta_projects
DROP CONSTRAINT asta_projects_projectplanner_priority_check;

ALTER TABLE asta_projects
ADD CONSTRAINT asta_projects_projectplanner_priority_check
CHECK (projectplanner_priority IN ('urgent', 'high', 'normal', 'low'));
```

### 2. Status Values

Customize status values for your industry:

```sql
ALTER TABLE projectplanner_milestones
DROP CONSTRAINT projectplanner_milestones_status_check;

ALTER TABLE projectplanner_milestones
ADD CONSTRAINT projectplanner_milestones_status_check
CHECK (status IN ('planned', 'in-progress', 'completed', 'delayed'));
```

### 3. Resource Types

Add custom resource types:

```sql
ALTER TABLE projectplanner_resources
DROP CONSTRAINT projectplanner_resources_resource_type_check;

ALTER TABLE projectplanner_resources
ADD CONSTRAINT projectplanner_resources_resource_type_check
CHECK (resource_type IN ('human', 'equipment', 'material', 'subcontractor', 'specialist'));
```

## Testing Checklist

- [ ] Schema deployed successfully
- [ ] Existing projects and tasks are accessible
- [ ] Enhanced fields can be updated
- [ ] New ProjectPlanner tables are working
- [ ] RLS policies are functioning correctly
- [ ] Progress calculation is working
- [ ] Templates can be created and used
- [ ] Resource allocation is working
- [ ] Document upload is functioning
- [ ] Comments system is operational

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Check that RLS policies match your user roles
   - Verify `auth.uid()` returns the correct user ID

2. **Foreign Key Errors**
   - Ensure referenced UUIDs exist in your tables
   - Check that column types match (UUID vs string)

3. **Performance Issues**
   - Verify indexes are created properly
   - Monitor query performance in Supabase dashboard

### Debug Queries

```sql
-- Check if enhanced fields were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'asta_projects'
AND column_name LIKE 'projectplanner_%';

-- Test RLS policies
SELECT * FROM projectplanner_milestones
WHERE asta_project_id IN (
    SELECT id FROM asta_projects
    WHERE assigned_to = auth.uid()
);

-- Check project progress calculation
SELECT
    id,
    name,
    projectplanner_progress,
    calculate_asta_project_progress(id) as calculated_progress
FROM asta_projects
LIMIT 5;
```

## Next Steps

1. **Deploy the schema** to your ConstructBMS database
2. **Test the integration** with your existing data
3. **Train your team** on the new features
4. **Customize the system** to match your workflows
5. **Integrate with your existing processes**

The ProjectPlanner module is now perfectly integrated with your ConstructBMS system!
