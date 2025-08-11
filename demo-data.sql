-- Demo Data for ProjectPlanner
-- Run this after creating the tables with database-schema.sql

-- Insert sample projects
INSERT INTO projects (id, name, description, status, start_date, end_date, budget, progress, priority, location) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Office Building Construction', 'New 5-story office building with modern amenities', 'active', '2024-01-15', '2024-12-31', 2500000.00, 35, 'high', 'Downtown Business District'),
('550e8400-e29b-41d4-a716-446655440002', 'Residential Complex', '50-unit apartment complex with parking garage', 'planning', '2024-03-01', '2025-02-28', 1800000.00, 0, 'medium', 'Suburban Development Zone'),
('550e8400-e29b-41d4-a716-446655440003', 'Shopping Center Renovation', 'Complete renovation of existing shopping center', 'active', '2024-02-01', '2024-08-31', 850000.00, 60, 'high', 'Retail District'),
('550e8400-e29b-41d4-a716-446655440004', 'Highway Bridge Repair', 'Emergency repair of critical bridge structure', 'completed', '2023-10-01', '2024-01-15', 450000.00, 100, 'critical', 'Main Highway Route'),
('550e8400-e29b-41d4-a716-446655440005', 'School Addition', 'New wing addition to elementary school', 'on-hold', '2024-04-01', '2024-11-30', 1200000.00, 15, 'medium', 'Educational Campus');

-- Insert sample tasks for Office Building Construction
INSERT INTO project_tasks (id, project_id, name, description, status, start_date, end_date, duration, progress, priority, estimated_hours, assigned_to) VALUES
('task-001', '550e8400-e29b-41d4-a716-446655440001', 'Site Preparation', 'Clear site and prepare foundation', 'completed', '2024-01-15', '2024-02-15', 30, 100, 'high', 240, 'user-001'),
('task-002', '550e8400-e29b-41d4-a716-446655440001', 'Foundation Work', 'Pour concrete foundation and basement', 'completed', '2024-02-16', '2024-03-31', 44, 100, 'high', 352, 'user-002'),
('task-003', '550e8400-e29b-41d4-a716-446655440001', 'Structural Framework', 'Erect steel framework and columns', 'in-progress', '2024-04-01', '2024-06-30', 90, 65, 'high', 720, 'user-003'),
('task-004', '550e8400-e29b-41d4-a716-446655440001', 'Electrical Systems', 'Install electrical wiring and panels', 'not-started', '2024-07-01', '2024-08-31', 61, 0, 'medium', 488, 'user-004'),
('task-005', '550e8400-e29b-41d4-a716-446655440001', 'Plumbing Systems', 'Install plumbing and HVAC systems', 'not-started', '2024-07-15', '2024-09-15', 62, 0, 'medium', 496, 'user-005'),
('task-006', '550e8400-e29b-41d4-a716-446655440001', 'Interior Finishing', 'Install drywall, flooring, and fixtures', 'not-started', '2024-09-01', '2024-11-30', 90, 0, 'medium', 720, 'user-006'),
('task-007', '550e8400-e29b-41d4-a716-446655440001', 'Exterior Finishing', 'Install facade and landscaping', 'not-started', '2024-10-01', '2024-12-15', 75, 0, 'medium', 600, 'user-007'),
('task-008', '550e8400-e29b-41d4-a716-446655440001', 'Final Inspection', 'Conduct final inspections and approvals', 'not-started', '2024-12-16', '2024-12-31', 15, 0, 'high', 120, 'user-008');

-- Insert sample tasks for Residential Complex
INSERT INTO project_tasks (id, project_id, name, description, status, start_date, end_date, duration, progress, priority, estimated_hours, assigned_to) VALUES
('task-009', '550e8400-e29b-41d4-a716-446655440002', 'Design Approval', 'Finalize architectural and engineering designs', 'in-progress', '2024-03-01', '2024-04-15', 45, 40, 'high', 360, 'user-009'),
('task-010', '550e8400-e29b-41d4-a716-446655440002', 'Permit Acquisition', 'Obtain all necessary building permits', 'not-started', '2024-04-16', '2024-05-31', 45, 0, 'high', 180, 'user-010'),
('task-011', '550e8400-e29b-41d4-a716-446655440002', 'Site Clearing', 'Clear and grade construction site', 'not-started', '2024-06-01', '2024-06-30', 30, 0, 'medium', 240, 'user-011'),
('task-012', '550e8400-e29b-41d4-a716-446655440002', 'Foundation Construction', 'Build foundation and underground parking', 'not-started', '2024-07-01', '2024-08-31', 61, 0, 'high', 488, 'user-012');

-- Insert sample tasks for Shopping Center Renovation
INSERT INTO project_tasks (id, project_id, name, description, status, start_date, end_date, duration, progress, priority, estimated_hours, assigned_to) VALUES
('task-013', '550e8400-e29b-41d4-a716-446655440003', 'Demolition', 'Remove existing interior structures', 'completed', '2024-02-01', '2024-02-28', 28, 100, 'high', 224, 'user-013'),
('task-014', '550e8400-e29b-41d4-a716-446655440003', 'Structural Repairs', 'Repair and reinforce building structure', 'completed', '2024-03-01', '2024-04-15', 45, 100, 'high', 360, 'user-014'),
('task-015', '550e8400-e29b-41d4-a716-446655440003', 'New Interior Layout', 'Install new walls and partitions', 'in-progress', '2024-04-16', '2024-06-15', 60, 75, 'medium', 480, 'user-015'),
('task-016', '550e8400-e29b-41d4-a716-446655440003', 'Electrical Upgrade', 'Upgrade electrical systems and lighting', 'in-progress', '2024-05-01', '2024-07-15', 75, 45, 'medium', 600, 'user-016'),
('task-017', '550e8400-e29b-41d4-a716-446655440003', 'Plumbing Upgrade', 'Upgrade plumbing and HVAC systems', 'not-started', '2024-06-01', '2024-07-31', 60, 0, 'medium', 480, 'user-017'),
('task-018', '550e8400-e29b-41d4-a716-446655440003', 'Interior Finishing', 'Install flooring, fixtures, and finishes', 'not-started', '2024-07-01', '2024-08-31', 61, 0, 'medium', 488, 'user-018');

-- Insert sample dependencies
INSERT INTO project_dependencies (project_id, predecessor_task_id, successor_task_id, dependency_type, lag_days) VALUES
-- Office Building dependencies
('550e8400-e29b-41d4-a716-446655440001', 'task-001', 'task-002', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440001', 'task-002', 'task-003', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440001', 'task-003', 'task-004', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440001', 'task-003', 'task-005', 'finish-to-start', 14),
('550e8400-e29b-41d4-a716-446655440001', 'task-004', 'task-006', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440001', 'task-005', 'task-006', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440001', 'task-006', 'task-007', 'start-to-start', 30),
('550e8400-e29b-41d4-a716-446655440001', 'task-006', 'task-008', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440001', 'task-007', 'task-008', 'finish-to-start', 0),

-- Residential Complex dependencies
('550e8400-e29b-41d4-a716-446655440002', 'task-009', 'task-010', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440002', 'task-010', 'task-011', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440002', 'task-011', 'task-012', 'finish-to-start', 0),

-- Shopping Center dependencies
('550e8400-e29b-41d4-a716-446655440003', 'task-013', 'task-014', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440003', 'task-014', 'task-015', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440003', 'task-015', 'task-016', 'start-to-start', 15),
('550e8400-e29b-41d4-a716-446655440003', 'task-016', 'task-017', 'start-to-start', 30),
('550e8400-e29b-41d4-a716-446655440003', 'task-016', 'task-018', 'finish-to-start', 0),
('550e8400-e29b-41d4-a716-446655440003', 'task-017', 'task-018', 'finish-to-start', 0);

-- Insert sample resources
INSERT INTO project_resources (project_id, task_id, resource_type, resource_name, allocation_percentage, start_date, end_date, cost_per_hour) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'task-001', 'human', 'Site Supervisor', 100, '2024-01-15', '2024-02-15', 45.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-001', 'equipment', 'Excavator', 80, '2024-01-15', '2024-02-15', 120.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-002', 'human', 'Concrete Crew', 100, '2024-02-16', '2024-03-31', 35.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-003', 'human', 'Steel Workers', 100, '2024-04-01', '2024-06-30', 40.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-003', 'equipment', 'Crane', 60, '2024-04-01', '2024-06-30', 200.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-004', 'human', 'Electricians', 100, '2024-07-01', '2024-08-31', 42.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-005', 'human', 'Plumbers', 100, '2024-07-15', '2024-09-15', 38.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-006', 'human', 'Carpenters', 100, '2024-09-01', '2024-11-30', 36.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-007', 'human', 'Masons', 100, '2024-10-01', '2024-12-15', 34.00),
('550e8400-e29b-41d4-a716-446655440001', 'task-008', 'human', 'Inspector', 100, '2024-12-16', '2024-12-31', 50.00);

-- Insert sample milestones
INSERT INTO project_milestones (project_id, name, description, milestone_date, status, milestone_type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Foundation Complete', 'Concrete foundation and basement completed', '2024-03-31', 'completed', 'internal'),
('550e8400-e29b-41d4-a716-446655440001', 'Structure Complete', 'Steel framework and columns erected', '2024-06-30', 'pending', 'internal'),
('550e8400-e29b-41d4-a716-446655440001', 'MEP Systems Complete', 'Electrical, plumbing, and HVAC systems installed', '2024-09-15', 'pending', 'internal'),
('550e8400-e29b-41d4-a716-446655440001', 'Project Complete', 'Building ready for occupancy', '2024-12-31', 'pending', 'client'),
('550e8400-e29b-41d4-a716-446655440002', 'Design Complete', 'Architectural and engineering designs finalized', '2024-04-15', 'pending', 'internal'),
('550e8400-e29b-41d4-a716-446655440002', 'Permits Obtained', 'All building permits acquired', '2024-05-31', 'pending', 'regulatory'),
('550e8400-e29b-41d4-a716-446655440003', 'Demolition Complete', 'Existing structures removed', '2024-02-28', 'completed', 'internal'),
('550e8400-e29b-41d4-a716-446655440003', 'Renovation Complete', 'Shopping center renovation finished', '2024-08-31', 'pending', 'client');

-- Update project progress based on completed tasks
UPDATE projects SET progress = 35 WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE projects SET progress = 0 WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE projects SET progress = 60 WHERE id = '550e8400-e29b-41d4-a716-446655440003';
UPDATE projects SET progress = 100 WHERE id = '550e8400-e29b-41d4-a716-446655440004';
UPDATE projects SET progress = 15 WHERE id = '550e8400-e29b-41d4-a716-446655440005';
