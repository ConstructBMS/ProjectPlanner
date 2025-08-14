import { Task, TaskLink } from './types';

/**
 * Demo project data for seeding when no tasks exist
 */
export const DEMO_PROJECT = {
  id: 'demo-project',
  name: 'Demo Construction Project',
  code: 'DEMO-001',
  start_date: '2024-01-15',
  end_date: '2024-06-30',
  description: 'Sample construction project with typical phases and tasks'
};

/**
 * Demo tasks with realistic construction project structure
 */
export const DEMO_TASKS: Omit<Task, 'id'>[] = [
  {
    name: 'Project Planning',
    start_date: '2024-01-15',
    end_date: '2024-01-31',
    duration_days: 17,
    progress: 100,
    status: 'completed',
    wbs: '1.0',
    resource_id: 'PM-001',
    project_id: 'demo-project'
  },
  {
    name: 'Site Preparation',
    start_date: '2024-02-01',
    end_date: '2024-02-14',
    duration_days: 14,
    progress: 85,
    status: 'in-progress',
    wbs: '2.0',
    resource_id: 'SUP-001',
    project_id: 'demo-project'
  },
  {
    name: 'Foundation Work',
    start_date: '2024-02-15',
    end_date: '2024-03-15',
    duration_days: 29,
    progress: 60,
    status: 'in-progress',
    wbs: '3.0',
    resource_id: 'FND-001',
    project_id: 'demo-project'
  },
  {
    name: 'Structural Framework',
    start_date: '2024-03-16',
    end_date: '2024-04-30',
    duration_days: 45,
    progress: 30,
    status: 'in-progress',
    wbs: '4.0',
    resource_id: 'STR-001',
    project_id: 'demo-project'
  },
  {
    name: 'Roofing',
    start_date: '2024-05-01',
    end_date: '2024-05-15',
    duration_days: 15,
    progress: 0,
    status: 'not-started',
    wbs: '5.0',
    resource_id: 'ROF-001',
    project_id: 'demo-project'
  },
  {
    name: 'Electrical Installation',
    start_date: '2024-04-15',
    end_date: '2024-05-30',
    duration_days: 45,
    progress: 20,
    status: 'in-progress',
    wbs: '6.0',
    resource_id: 'ELE-001',
    project_id: 'demo-project'
  },
  {
    name: 'Plumbing Installation',
    start_date: '2024-04-20',
    end_date: '2024-06-05',
    duration_days: 46,
    progress: 15,
    status: 'in-progress',
    wbs: '7.0',
    resource_id: 'PLU-001',
    project_id: 'demo-project'
  },
  {
    name: 'HVAC Installation',
    start_date: '2024-05-10',
    end_date: '2024-06-20',
    duration_days: 41,
    progress: 0,
    status: 'not-started',
    wbs: '8.0',
    resource_id: 'HVAC-001',
    project_id: 'demo-project'
  },
  {
    name: 'Interior Finishing',
    start_date: '2024-06-01',
    end_date: '2024-06-25',
    duration_days: 25,
    progress: 0,
    status: 'not-started',
    wbs: '9.0',
    resource_id: 'FIN-001',
    project_id: 'demo-project'
  },
  {
    name: 'Final Inspection',
    start_date: '2024-06-26',
    end_date: '2024-06-30',
    duration_days: 5,
    progress: 0,
    status: 'not-started',
    wbs: '10.0',
    resource_id: 'INS-001',
    project_id: 'demo-project'
  }
];

/**
 * Demo task links with Finish-Start dependencies
 */
export const DEMO_LINKS: Omit<TaskLink, 'id'>[] = [
  // Project Planning → Site Preparation
  {
    project_id: 'demo-project',
    pred_id: 'task-1',
    succ_id: 'task-2',
    type: 'FS',
    lag_days: 0
  },
  // Site Preparation → Foundation Work
  {
    project_id: 'demo-project',
    pred_id: 'task-2',
    succ_id: 'task-3',
    type: 'FS',
    lag_days: 0
  },
  // Foundation Work → Structural Framework
  {
    project_id: 'demo-project',
    pred_id: 'task-3',
    succ_id: 'task-4',
    type: 'FS',
    lag_days: 0
  },
  // Structural Framework → Roofing
  {
    project_id: 'demo-project',
    pred_id: 'task-4',
    succ_id: 'task-5',
    type: 'FS',
    lag_days: 0
  },
  // Structural Framework → Electrical Installation (parallel)
  {
    project_id: 'demo-project',
    pred_id: 'task-4',
    succ_id: 'task-6',
    type: 'FS',
    lag_days: 0
  },
  // Structural Framework → Plumbing Installation (parallel)
  {
    project_id: 'demo-project',
    pred_id: 'task-4',
    succ_id: 'task-7',
    type: 'FS',
    lag_days: 5
  },
  // Electrical Installation → HVAC Installation
  {
    project_id: 'demo-project',
    pred_id: 'task-6',
    succ_id: 'task-8',
    type: 'FS',
    lag_days: 0
  },
  // Plumbing Installation → HVAC Installation
  {
    project_id: 'demo-project',
    pred_id: 'task-7',
    succ_id: 'task-8',
    type: 'FS',
    lag_days: 0
  },
  // HVAC Installation → Interior Finishing
  {
    project_id: 'demo-project',
    pred_id: 'task-8',
    succ_id: 'task-9',
    type: 'FS',
    lag_days: 0
  },
  // Interior Finishing → Final Inspection
  {
    project_id: 'demo-project',
    pred_id: 'task-9',
    succ_id: 'task-10',
    type: 'FS',
    lag_days: 0
  }
];

/**
 * Generate demo tasks with proper IDs
 */
export const generateDemoTasks = (projectId: string): Task[] => {
  return DEMO_TASKS.map((task, index) => ({
    ...task,
    id: `task-${index + 1}`,
    project_id: projectId
  }));
};

/**
 * Generate demo links with proper IDs
 */
export const generateDemoLinks = (projectId: string, taskIds: string[]): TaskLink[] => {
  return DEMO_LINKS.map((link, index) => ({
    ...link,
    id: `link-${index + 1}`,
    project_id: projectId,
    pred_id: taskIds[parseInt(link.pred_id.split('-')[1]) - 1],
    succ_id: taskIds[parseInt(link.succ_id.split('-')[1]) - 1]
  }));
};

/**
 * Check if a project has been seeded
 */
export const isProjectSeeded = (projectId: string): boolean => {
  try {
    const seeded = localStorage.getItem(`pm.seeded.${projectId}`);
    return seeded === 'true';
  } catch (error) {
    console.warn('Failed to check seeding status:', error);
    return false;
  }
};

/**
 * Mark a project as seeded
 */
export const markProjectSeeded = (projectId: string): void => {
  try {
    localStorage.setItem(`pm.seeded.${projectId}`, 'true');
  } catch (error) {
    console.warn('Failed to mark project as seeded:', error);
  }
};
