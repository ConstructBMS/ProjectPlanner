# Manual Data Insertion Guide

Since your database has RLS policies enabled, here's how to manually insert sample data through the Supabase dashboard.

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in and select your ConstructBMS project
3. Navigate to **Table Editor**

## Step 2: Insert Sample Projects

### Navigate to `asta_projects` table

1. Click on the `asta_projects` table
2. Click **"Insert row"** button

### Insert these projects one by one:

#### Project 1: Office Building Construction

```json
{
  "name": "Office Building Construction",
  "description": "New 10-story office building in downtown area",
  "client": "ABC Corporation",
  "start_date": "2024-01-15",
  "end_date": "2024-12-31",
  "status": "active",
  "progress": 65,
  "budget": 2500000,
  "actual_cost": 1625000,
  "projectplanner_priority": "high",
  "projectplanner_location": "123 Main Street, Downtown",
  "projectplanner_notes": "High priority construction project with tight timeline",
  "projectplanner_estimated_hours": 1200,
  "projectplanner_actual_hours": 780
}
```

#### Project 2: Residential Complex Development

```json
{
  "name": "Residential Complex Development",
  "description": "50-unit residential complex with modern amenities",
  "client": "Housing Development Ltd",
  "start_date": "2024-03-01",
  "end_date": "2025-02-28",
  "status": "active",
  "progress": 35,
  "budget": 1800000,
  "actual_cost": 630000,
  "projectplanner_priority": "medium",
  "projectplanner_location": "456 Suburban Drive",
  "projectplanner_notes": "Residential development with modern amenities and green building features",
  "projectplanner_estimated_hours": 900,
  "projectplanner_actual_hours": 315
}
```

#### Project 3: Shopping Mall Renovation

```json
{
  "name": "Shopping Mall Renovation",
  "description": "Complete renovation of existing shopping mall",
  "client": "Mall Properties Inc",
  "start_date": "2023-06-01",
  "end_date": "2024-05-31",
  "status": "completed",
  "progress": 100,
  "budget": 1200000,
  "actual_cost": 1150000,
  "projectplanner_priority": "medium",
  "projectplanner_location": "789 City Center Plaza",
  "projectplanner_notes": "Completed renovation ahead of schedule with excellent client satisfaction",
  "projectplanner_estimated_hours": 800,
  "projectplanner_actual_hours": 750
}
```

#### Project 4: Highway Bridge Construction

```json
{
  "name": "Highway Bridge Construction",
  "description": "New bridge connecting two districts over the river",
  "client": "Department of Transportation",
  "start_date": "2024-02-01",
  "end_date": "2025-01-31",
  "status": "active",
  "progress": 45,
  "budget": 3500000,
  "actual_cost": 1575000,
  "projectplanner_priority": "critical",
  "projectplanner_location": "Riverside Highway, Mile 42",
  "projectplanner_notes": "Critical infrastructure project with significant public impact",
  "projectplanner_estimated_hours": 1500,
  "projectplanner_actual_hours": 675
}
```

#### Project 5: Hospital Extension Wing

```json
{
  "name": "Hospital Extension Wing",
  "description": "New wing addition to existing hospital facility",
  "client": "City Medical Center",
  "start_date": "2024-09-01",
  "end_date": "2026-08-31",
  "status": "planning",
  "progress": 10,
  "budget": 4200000,
  "actual_cost": 420000,
  "projectplanner_priority": "high",
  "projectplanner_location": "Medical District, Block 7",
  "projectplanner_notes": "Healthcare facility expansion to meet growing community needs",
  "projectplanner_estimated_hours": 2000,
  "projectplanner_actual_hours": 200
}
```

## Step 3: Insert Sample Tasks

### Navigate to `asta_tasks` table

1. Click on the `asta_tasks` table
2. Click **"Insert row"** button

### Insert these tasks for the Office Building project:

**Note:** Replace `{PROJECT_ID}` with the actual ID of the "Office Building Construction" project from step 2.

#### Task 1: Site Preparation

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Site Preparation",
  "description": "Clear site and prepare for construction",
  "start_date": "2024-01-15",
  "end_date": "2024-01-25",
  "duration": 10,
  "status": "completed",
  "priority": "high",
  "progress": 100,
  "level": 0
}
```

#### Task 2: Foundation Work

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Foundation Work",
  "description": "Excavate and pour foundation",
  "start_date": "2024-01-26",
  "end_date": "2024-02-15",
  "duration": 20,
  "status": "completed",
  "priority": "high",
  "progress": 100,
  "level": 0
}
```

#### Task 3: Structural Framework

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Structural Framework",
  "description": "Install steel framework and concrete structure",
  "start_date": "2024-02-16",
  "end_date": "2024-04-15",
  "duration": 60,
  "status": "in-progress",
  "priority": "high",
  "progress": 75,
  "level": 0
}
```

#### Task 4: Electrical Systems

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Electrical Systems",
  "description": "Install electrical wiring and systems",
  "start_date": "2024-04-16",
  "end_date": "2024-06-15",
  "duration": 60,
  "status": "not-started",
  "priority": "medium",
  "progress": 0,
  "level": 0
}
```

#### Task 5: Plumbing Systems

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Plumbing Systems",
  "description": "Install plumbing and HVAC systems",
  "start_date": "2024-04-16",
  "end_date": "2024-06-15",
  "duration": 60,
  "status": "not-started",
  "priority": "medium",
  "progress": 0,
  "level": 0
}
```

#### Task 6: Interior Finishing

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Interior Finishing",
  "description": "Complete interior walls, flooring, and finishes",
  "start_date": "2024-06-16",
  "end_date": "2024-10-15",
  "duration": 120,
  "status": "not-started",
  "priority": "medium",
  "progress": 0,
  "level": 0
}
```

#### Task 7: Exterior Finishing

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Exterior Finishing",
  "description": "Complete exterior cladding and landscaping",
  "start_date": "2024-08-01",
  "end_date": "2024-11-30",
  "duration": 120,
  "status": "not-started",
  "priority": "medium",
  "progress": 0,
  "level": 0
}
```

#### Task 8: Final Inspection

```json
{
  "project_id": "{PROJECT_ID}",
  "name": "Final Inspection",
  "description": "Conduct final inspections and obtain occupancy permit",
  "start_date": "2024-12-01",
  "end_date": "2024-12-31",
  "duration": 30,
  "status": "not-started",
  "priority": "high",
  "progress": 0,
  "level": 0
}
```

## Step 4: Test Your Application

After inserting the data:

1. **Refresh your ProjectPlanner application** at `http://localhost:5173`
2. **Check the console** - you should see:
   ```
   Loaded projects from ConstructBMS: 5 projects
   Loaded tasks from ConstructBMS: 8 tasks
   ```
3. **Navigate to the Asta PowerProject replica** using the top navigation
4. **You should now see**:
   - Projects in the sidebar
   - Tasks in the task grid
   - Gantt chart with timeline
   - All the Asta PowerProject replica features working

## 🎯 What You'll See

Once the data is inserted, your ProjectPlanner will show:

- **5 sample construction projects** with different priorities and statuses
- **8 tasks for the Office Building project** with proper dependencies
- **Real Gantt chart timeline** showing task relationships
- **Enhanced ProjectPlanner features** like priority tracking and hour estimates
- **Full Asta PowerProject replica interface** with ribbon, sidebar, task grid, and properties pane

This will give you a complete demonstration of the Asta PowerProject replica working with your real ConstructBMS database!
