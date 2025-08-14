import { supabase } from '../../../supabase/client';
import { 
  Project, 
  Task, 
  TaskLink, 
  ProjectsResult, 
  TasksResult, 
  TaskLinksResult,
  DemoProject,
  DemoTask,
  DemoTaskLink
} from './types';

// Demo data generators
const generateDemoProjects = (): DemoProject[] => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 15);
  
  return [
    {
      id: 'demo-project-1',
      name: 'Office Building Construction',
      code: 'OB-2024-001',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      description: 'Construction of a 5-story office building in downtown area',
      status: 'active',
      progress: 35,
      budget: 2500000,
      actual_cost: 875000,
      priority: 'high',
      created_at: startDate.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: 'demo-project-2',
      name: 'Residential Complex Phase 1',
      code: 'RC-2024-002',
      start_date: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0],
      end_date: new Date(now.getFullYear(), now.getMonth() + 6, 30).toISOString().split('T')[0],
      description: 'Phase 1 of a 50-unit residential complex',
      status: 'planning',
      progress: 15,
      budget: 1800000,
      actual_cost: 270000,
      priority: 'medium',
      created_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      updated_at: now.toISOString()
    }
  ];
};

const generateDemoTasks = (projectId: string): DemoTask[] => {
  const now = new Date();
  const projectStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const tasks: DemoTask[] = [
    {
      id: 'demo-task-1',
      project_id: projectId,
      name: 'Site Preparation',
      start_date: projectStart.toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 14,
      progress: 100,
      status: 'completed',
      wbs: '1.1',
      description: 'Clear site, remove debris, and prepare foundation area',
      priority: 'high',
      estimated_hours: 80,
      actual_hours: 75,
      cost: 15000
    },
    {
      id: 'demo-task-2',
      project_id: projectId,
      name: 'Foundation Work',
      start_date: new Date(projectStart.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 21,
      progress: 85,
      status: 'in-progress',
      wbs: '1.2',
      description: 'Excavate, pour concrete, and install foundation',
      priority: 'high',
      estimated_hours: 160,
      actual_hours: 140,
      cost: 45000
    },
    {
      id: 'demo-task-3',
      project_id: projectId,
      name: 'Structural Framework',
      start_date: new Date(projectStart.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 35,
      progress: 0,
      status: 'not-started',
      wbs: '1.3',
      description: 'Erect steel framework and structural elements',
      priority: 'high',
      estimated_hours: 280,
      actual_hours: 0,
      cost: 120000
    },
    {
      id: 'demo-task-4',
      project_id: projectId,
      name: 'Electrical Installation',
      start_date: new Date(projectStart.getTime() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 35,
      progress: 0,
      status: 'not-started',
      wbs: '2.1',
      description: 'Install electrical systems and wiring',
      priority: 'medium',
      estimated_hours: 200,
      actual_hours: 0,
      cost: 85000
    },
    {
      id: 'demo-task-5',
      project_id: projectId,
      name: 'Plumbing Installation',
      start_date: new Date(projectStart.getTime() + 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 35,
      progress: 0,
      status: 'not-started',
      wbs: '2.2',
      description: 'Install plumbing systems and fixtures',
      priority: 'medium',
      estimated_hours: 180,
      actual_hours: 0,
      cost: 75000
    },
    {
      id: 'demo-task-6',
      project_id: projectId,
      name: 'Interior Finishing',
      start_date: new Date(projectStart.getTime() + 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 140 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 35,
      progress: 0,
      status: 'not-started',
      wbs: '3.1',
      description: 'Install drywall, flooring, and interior finishes',
      priority: 'medium',
      estimated_hours: 240,
      actual_hours: 0,
      cost: 95000
    },
    {
      id: 'demo-task-7',
      project_id: projectId,
      name: 'Exterior Finishing',
      start_date: new Date(projectStart.getTime() + 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 140 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 35,
      progress: 0,
      status: 'not-started',
      wbs: '3.2',
      description: 'Install siding, roofing, and exterior finishes',
      priority: 'medium',
      estimated_hours: 220,
      actual_hours: 0,
      cost: 88000
    },
    {
      id: 'demo-task-8',
      project_id: projectId,
      name: 'Final Inspection',
      start_date: new Date(projectStart.getTime() + 140 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(projectStart.getTime() + 147 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration_days: 7,
      progress: 0,
      status: 'not-started',
      wbs: '4.1',
      description: 'Conduct final inspections and obtain certificates',
      priority: 'high',
      estimated_hours: 40,
      actual_hours: 0,
      cost: 15000
    }
  ];
  
  return tasks;
};

const generateDemoTaskLinks = (projectId: string): DemoTaskLink[] => {
  return [
    {
      id: 'demo-link-1',
      project_id: projectId,
      pred_id: 'demo-task-1',
      succ_id: 'demo-task-2',
      type: 'finish-to-start',
      lag_days: 0
    },
    {
      id: 'demo-link-2',
      project_id: projectId,
      pred_id: 'demo-task-2',
      succ_id: 'demo-task-3',
      type: 'finish-to-start',
      lag_days: 0
    },
    {
      id: 'demo-link-3',
      project_id: projectId,
      pred_id: 'demo-task-3',
      succ_id: 'demo-task-4',
      type: 'finish-to-start',
      lag_days: 0
    },
    {
      id: 'demo-link-4',
      project_id: projectId,
      pred_id: 'demo-task-3',
      succ_id: 'demo-task-5',
      type: 'finish-to-start',
      lag_days: 0
    },
    {
      id: 'demo-link-5',
      project_id: projectId,
      pred_id: 'demo-task-4',
      succ_id: 'demo-task-6',
      type: 'finish-to-start',
      lag_days: 0
    },
    {
      id: 'demo-link-6',
      project_id: projectId,
      pred_id: 'demo-task-5',
      succ_id: 'demo-task-7',
      type: 'finish-to-start',
      lag_days: 0
    },
    {
      id: 'demo-link-7',
      project_id: projectId,
      pred_id: 'demo-task-6',
      succ_id: 'demo-task-8',
      type: 'finish-to-start',
      lag_days: 0
    },
    {
      id: 'demo-link-8',
      project_id: projectId,
      pred_id: 'demo-task-7',
      succ_id: 'demo-task-8',
      type: 'finish-to-start',
      lag_days: 0
    }
  ];
};

// Flag to prevent multiple fallback warnings
let hasLoggedFallback = false;

const logFallback = (tableName: string, error?: string) => {
  if (!hasLoggedFallback) {
    console.warn(`ConstructBMS adapter: Using demo data for ${tableName}${error ? ` (${error})` : ''}`);
    hasLoggedFallback = true;
  }
};

// Main adapter functions
export const getProjects = async (): Promise<ProjectsResult> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logFallback('projects', error.message);
      return {
        data: generateDemoProjects(),
        isDemo: true,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      logFallback('projects', 'No projects found');
      return {
        data: generateDemoProjects(),
        isDemo: true
      };
    }

    return {
      data: data as Project[],
      isDemo: false
    };
  } catch (error) {
    logFallback('projects', error instanceof Error ? error.message : 'Unknown error');
    return {
      data: generateDemoProjects(),
      isDemo: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getTasks = async (projectId: string): Promise<TasksResult> => {
  try {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('wbs', { ascending: true });

    if (error) {
      logFallback('project_tasks', error.message);
      return {
        data: generateDemoTasks(projectId),
        isDemo: true,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      logFallback('project_tasks', 'No tasks found');
      return {
        data: generateDemoTasks(projectId),
        isDemo: true
      };
    }

    return {
      data: data as Task[],
      isDemo: false
    };
  } catch (error) {
    logFallback('project_tasks', error instanceof Error ? error.message : 'Unknown error');
    return {
      data: generateDemoTasks(projectId),
      isDemo: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getLinks = async (projectId: string): Promise<TaskLinksResult> => {
  try {
    const { data, error } = await supabase
      .from('project_dependencies')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      logFallback('project_dependencies', error.message);
      return {
        data: generateDemoTaskLinks(projectId),
        isDemo: true,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      logFallback('project_dependencies', 'No task links found');
      return {
        data: generateDemoTaskLinks(projectId),
        isDemo: true
      };
    }

    // Transform project_dependencies to TaskLink format
    const transformedData: TaskLink[] = data.map(dep => ({
      id: dep.id,
      project_id: dep.project_id,
      pred_id: dep.predecessor_task_id,
      succ_id: dep.successor_task_id,
      type: dep.dependency_type,
      lag_days: dep.lag_days,
      created_at: dep.created_at
    }));

    return {
      data: transformedData,
      isDemo: false
    };
  } catch (error) {
    logFallback('project_dependencies', error instanceof Error ? error.message : 'Unknown error');
    return {
      data: generateDemoTaskLinks(projectId),
      isDemo: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const seedDemoTasks = async (projectId: string): Promise<boolean> => {
  // Only seed if we're in a development environment and have write access
  if (import.meta.env.DEV && import.meta.env.VITE_ALLOW_DEMO_SEED === 'true') {
    try {
      const demoTasks = generateDemoTasks(projectId);
      const demoLinks = generateDemoTaskLinks(projectId);

      // Insert demo tasks
      const { error: tasksError } = await supabase
        .from('project_tasks')
        .insert(demoTasks);

      if (tasksError) {
        console.warn('Failed to seed demo tasks:', tasksError.message);
        return false;
      }

      // Insert demo links
      const { error: linksError } = await supabase
        .from('project_dependencies')
        .insert(demoLinks.map(link => ({
          project_id: link.project_id,
          predecessor_task_id: link.pred_id,
          successor_task_id: link.succ_id,
          dependency_type: link.type,
          lag_days: link.lag_days
        })));

      if (linksError) {
        console.warn('Failed to seed demo links:', linksError.message);
        return false;
      }

      console.log('Demo data seeded successfully for project:', projectId);
      return true;
    } catch (error) {
      console.warn('Failed to seed demo data:', error);
      return false;
    }
  }

  return false;
};
