# ProjectPlanner Module - ConstructBMS Integration Guide

## Overview

This guide explains how to integrate the ProjectPlanner module into your existing ConstructBMS Webapp using your Supabase database.

## Database Schema

The ProjectPlanner module uses the following tables that will be added to your ConstructBMS database:

### Core Tables

1. **`projects`** - Main project information
2. **`project_tasks`** - Individual tasks within projects
3. **`project_dependencies`** - Task dependencies and relationships
4. **`project_resources`** - Resources assigned to projects/tasks
5. **`project_milestones`** - Key project milestones
6. **`project_documents`** - Project-related documents
7. **`project_comments`** - Project and task comments
8. **`project_templates`** - Reusable project templates
9. **`project_settings`** - Project-specific settings

## Integration Steps

### 1. Database Setup

Run the SQL schema in your ConstructBMS Supabase database:

```sql
-- Execute the database-schema.sql file in your Supabase SQL editor
```

### 2. Environment Configuration

The ProjectPlanner module is now configured to use your ConstructBMS Supabase instance:

```env
VITE_SUPABASE_URL=https://rleprzlnxhhckdzbptzm.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZXByemxueGhoY2tkemJwdHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NjMxOTcsImV4cCI6MjA2NzAzOTE5N30.Aw-dM-8TKqUfBTm7Er-apo6xvhKTfDW98l1pK_kdWRA
```

### 3. Authentication Integration

The ProjectPlanner module uses the same authentication system as ConstructBMS. Users will be automatically authenticated through your existing Supabase auth setup.

### 4. Data Relationships

The ProjectPlanner tables include foreign key references to integrate with your existing ConstructBMS data:

- **`manager_id`** - Links to your ConstructBMS users table
- **`client_id`** - Links to your ConstructBMS clients table
- **`contract_id`** - Links to your ConstructBMS contracts table
- **`resource_id`** - Links to your ConstructBMS resources/employees/equipment tables

## Row Level Security (RLS)

The schema includes basic RLS policies that you should customize based on your ConstructBMS user roles:

### Current Policies

- Users can view projects they're assigned to or manage
- Users can view tasks from projects they have access to

### Customization Required

You'll need to update the RLS policies to match your ConstructBMS user roles and permissions structure.

## API Integration Points

### 1. User Management

```javascript
// Get current user from ConstructBMS auth
const { user } = await supabase.auth.getUser();

// Use user.id for manager_id, assigned_to, etc.
```

### 2. Client Integration

```javascript
// Link projects to ConstructBMS clients
const project = {
  name: 'New Construction Project',
  client_id: constructBMSClientId, // From your ConstructBMS clients table
  manager_id: currentUserId,
  // ... other fields
};
```

### 3. Contract Integration

```javascript
// Link projects to ConstructBMS contracts
const project = {
  name: 'Contract Project',
  contract_id: constructBMSContractId, // From your ConstructBMS contracts table
  // ... other fields
};
```

## Module Integration into ConstructBMS

### 1. Navigation Integration

Add ProjectPlanner to your ConstructBMS navigation:

```javascript
// In your ConstructBMS navigation component
const navigationItems = [
  // ... existing ConstructBMS navigation
  {
    name: 'Project Planner',
    href: '/project-planner',
    icon: ProjectIcon,
    current: pathname === '/project-planner',
  },
];
```

### 2. Route Integration

Add the ProjectPlanner routes to your ConstructBMS routing:

```javascript
// In your ConstructBMS router
import PortfolioDashboard from './modules/ProjectPlanner/pages/PortfolioDashboard';
import ProgrammeManager from './modules/ProjectPlanner/modules/ProgrammeManager/AppShell';

const routes = [
  // ... existing ConstructBMS routes
  {
    path: '/project-planner',
    element: <PortfolioDashboard />,
  },
  {
    path: '/project-planner/project/:id',
    element: <ProgrammeManager />,
  },
];
```

### 3. Context Integration

The ProjectPlanner module uses React Context for state management. You can integrate it with your ConstructBMS context:

```javascript
// Wrap ProjectPlanner components with your ConstructBMS providers
<ConstructBMSProvider>
  <ProjectsProvider>
    <PortfolioDashboard />
  </ProjectsProvider>
</ConstructBMSProvider>
```

## Data Migration (if needed)

If you have existing project data in ConstructBMS, you may need to migrate it to the new ProjectPlanner schema:

```sql
-- Example migration script
INSERT INTO projects (
  name,
  description,
  status,
  start_date,
  end_date,
  budget,
  manager_id,
  client_id
)
SELECT
  project_name,
  project_description,
  CASE
    WHEN project_status = 'active' THEN 'active'
    WHEN project_status = 'completed' THEN 'completed'
    ELSE 'planning'
  END,
  start_date,
  end_date,
  budget,
  manager_id,
  client_id
FROM your_existing_projects_table;
```

## Testing the Integration

### 1. Verify Database Connection

Check that the ProjectPlanner module can connect to your ConstructBMS database:

```javascript
// Test connection
const { data, error } = await supabase.from('projects').select('*').limit(1);

console.log('Connection test:', { data, error });
```

### 2. Test Authentication

Verify that users can access projects based on their ConstructBMS permissions:

```javascript
// Test user access
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('manager_id', user.id);

console.log('User projects:', projects);
```

### 3. Test Data Relationships

Verify that projects can be linked to ConstructBMS entities:

```javascript
// Test client integration
const { data: projectWithClient } = await supabase
  .from('projects')
  .select(
    `
    *,
    clients:client_id(name, contact_info)
  `
  )
  .eq('id', projectId)
  .single();

console.log('Project with client:', projectWithClient);
```

## Customization Options

### 1. Styling Integration

The ProjectPlanner module uses Tailwind CSS. You can customize the styling to match your ConstructBMS theme:

```css
/* In your ConstructBMS CSS */
.project-planner {
  /* Custom styles to match ConstructBMS theme */
}
```

### 2. Feature Configuration

You can enable/disable features based on your ConstructBMS requirements:

```javascript
// In your ProjectPlanner configuration
const config = {
  enableResourceManagement: true,
  enableDocumentUpload: true,
  enableTimeTracking: false, // Disable if not needed
  enableBudgetTracking: true,
};
```

### 3. Workflow Integration

Integrate ProjectPlanner workflows with your ConstructBMS business processes:

```javascript
// Example: Auto-create project when contract is signed
const handleContractSigned = async contractId => {
  const contract = await getContract(contractId);

  // Create project from contract
  const project = await createProject({
    name: contract.name,
    contract_id: contractId,
    client_id: contract.client_id,
    budget: contract.value,
    start_date: contract.start_date,
    end_date: contract.end_date,
  });
};
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify RLS policies match your user roles
   - Check that users have proper permissions

2. **Data Relationship Errors**
   - Ensure foreign key references point to valid ConstructBMS data
   - Verify UUID formats match between systems

3. **Performance Issues**
   - Check that indexes are created properly
   - Monitor query performance in Supabase dashboard

### Support

For integration issues, check:

1. Supabase logs in your dashboard
2. Browser console for JavaScript errors
3. Network tab for API request failures

## Next Steps

1. **Deploy the schema** to your ConstructBMS database
2. **Test the integration** with sample data
3. **Customize RLS policies** for your user roles
4. **Integrate navigation** into your ConstructBMS app
5. **Configure styling** to match your theme
6. **Set up data relationships** with existing ConstructBMS entities

The ProjectPlanner module is now ready to be integrated into your ConstructBMS Webapp!
