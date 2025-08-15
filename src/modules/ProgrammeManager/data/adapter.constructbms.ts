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
  DemoTaskLink,
  TaskUpdate
} from './types';
import { tables, safeGetColumn, tableNames, columns } from './adapter.config';
import { generateDemoTasks, generateDemoLinks, markProjectSeeded } from './demo';

// Adapter mode detection
export type AdapterMode = 'DB' | 'DEMO';

let adapterMode: AdapterMode = 'DB';
let modeInitialized = false;

// Realtime subscription management
let currentSubscription = null;

// Global last error tracking
let lastError: string | null = null;

// Enhanced logging with consistent format
const logAdapterError = (tableName: string, operation: string, error: any) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  lastError = `${tableName}.${operation}: ${errorMessage}`;
  console.warn(`[PP][adapter] ${lastError}`);
};

// Safe Supabase query wrapper
const safeSupabaseQuery = async (tableName: string, operation: string, queryFn: () => Promise<any>) => {
  try {
    const result = await queryFn();
    
    if (result.error) {
      logAdapterError(tableName, operation, result.error);
      return { data: [], error: result.error };
    }
    
    return { data: result.data || [], error: null };
  } catch (error) {
    logAdapterError(tableName, operation, error);
    return { data: [], error };
  }
};

// Health check interface
export interface HealthCheckResult {
  table: string;
  ok: boolean;
  count: number;
  message: string;
}

// Health check function - lightweight select with count
export const healthCheck = async (): Promise<HealthCheckResult[]> => {
  const results: HealthCheckResult[] = [];
  
  // Check each table with lightweight count query
  const tablesToCheck = [tableNames.projects, tableNames.tasks, tableNames.links];
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.push({
          table: tableName,
          ok: false,
          count: 0,
          message: error.message
        });
      } else {
        results.push({
          table: tableName,
          ok: true,
          count: count || 0,
          message: 'OK'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        table: tableName,
        ok: false,
        count: 0,
        message: errorMessage
      });
    }
  }
  
  return results;
};

// Check if database is healthy and has data
export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    const results = await healthCheck();
    
    // Check if all tables are accessible and have some data
    const hasData = results.some(result => result.ok && result.count > 0);
    const allAccessible = results.every(result => result.ok);
    
    return allAccessible && hasData;
  } catch (error) {
    console.warn('[PP][adapter] Health check failed:', error);
    return false;
  }
};

// Initialize adapter mode based on URL flag and database health
export const initializeAdapterMode = async (): Promise<AdapterMode> => {
  if (modeInitialized) {
    return adapterMode;
  }

  // Check URL for demo flag
  const urlParams = new URLSearchParams(window.location.search);
  const forceDemo = urlParams.get('ppDemo') === '1';
  
  if (forceDemo) {
    adapterMode = 'DEMO';
    console.log('[PP][adapter] mode: DEMO (forced via ?ppDemo=1)');
  } else {
    // Check database health
    const dbHealthy = await isDatabaseHealthy();
    
    if (dbHealthy) {
      adapterMode = 'DB';
      console.log('[PP][adapter] mode: DB (database healthy with data)');
    } else {
      adapterMode = 'DEMO';
      console.log('[PP][adapter] mode: DEMO (database unavailable or empty)');
    }
  }
  
  modeInitialized = true;
  return adapterMode;
};

// Get current adapter mode
export const getAdapterMode = (): AdapterMode => {
  return adapterMode;
};

// Get last error
export const getLastError = (): string | null => {
  return lastError;
};

// Clear last error
export const clearLastError = (): void => {
  lastError = null;
};

export const getRealtimeChannel = (projectId: string) => {
  // Unsubscribe from any existing subscription
  if (currentSubscription) {
    currentSubscription.unsubscribe();
    currentSubscription = null;
  }

  // Create new subscription for the project
  currentSubscription = supabase
    .channel(`project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableNames.tasks,
        filter: `${columns.tasks.project}=eq.${projectId}`
      },
      (payload) => {
        console.log('Task change detected:', payload);
        // This will be handled by the store
        window.dispatchEvent(new CustomEvent('TASK_REALTIME_UPDATE', {
          detail: { type: payload.eventType, data: payload.new, old: payload.old }
        }));
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'project_dependencies', // Using the actual table name for links
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        console.log('Task link change detected:', payload);
        // Transform the data to match our TaskLink format
        const transformedData = payload.new ? {
          id: payload.new.id,
          project_id: payload.new.project_id,
          pred_id: payload.new.predecessor_task_id,
          succ_id: payload.new.successor_task_id,
          type: payload.new.dependency_type,
          lag_days: payload.new.lag_days,
          created_at: payload.new.created_at
        } : null;

        const transformedOld = payload.old ? {
          id: payload.old.id,
          project_id: payload.old.project_id,
          pred_id: payload.old.predecessor_task_id,
          succ_id: payload.old.successor_task_id,
          type: payload.old.dependency_type,
          lag_days: payload.old.lag_days,
          created_at: payload.old.created_at
        } : null;

        window.dispatchEvent(new CustomEvent('TASK_LINK_REALTIME_UPDATE', {
          detail: { 
            type: payload.eventType, 
            data: transformedData, 
            old: transformedOld 
          }
        }));
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

  return currentSubscription;
};

export const unsubscribeRealtime = () => {
  if (currentSubscription) {
    currentSubscription.unsubscribe();
    currentSubscription = null;
    console.log('Unsubscribed from realtime updates');
  }
};

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


// Transform raw DB data to our interface using safe column access
const transformProject = (rawData: any): Project => ({
  id: safeGetColumn(rawData, tableNames.projects, columns.projects.id, ''),
  name: safeGetColumn(rawData, tableNames.projects, columns.projects.name, ''),
  code: safeGetColumn(rawData, tableNames.projects, columns.projects.code),
  start_date: safeGetColumn(rawData, tableNames.projects, columns.projects.start),
  end_date: safeGetColumn(rawData, tableNames.projects, columns.projects.end),
  description: safeGetColumn(rawData, tableNames.projects, 'description'),
  status: safeGetColumn(rawData, tableNames.projects, 'status'),
  progress: safeGetColumn(rawData, tableNames.projects, 'progress'),
  budget: safeGetColumn(rawData, tableNames.projects, 'budget'),
  actual_cost: safeGetColumn(rawData, tableNames.projects, 'actual_cost'),
  manager_id: safeGetColumn(rawData, tableNames.projects, 'manager_id'),
  client_id: safeGetColumn(rawData, tableNames.projects, 'client_id'),
  location: safeGetColumn(rawData, tableNames.projects, 'location'),
  priority: safeGetColumn(rawData, tableNames.projects, 'priority'),
  created_at: safeGetColumn(rawData, tableNames.projects, 'created_at'),
  updated_at: safeGetColumn(rawData, tableNames.projects, 'updated_at')
});

const transformTask = (rawData: any): Task => ({
  id: safeGetColumn(rawData, tableNames.tasks, columns.tasks.id, ''),
  project_id: safeGetColumn(rawData, tableNames.tasks, columns.tasks.project, ''),
  name: safeGetColumn(rawData, tableNames.tasks, columns.tasks.name, ''),
  start_date: safeGetColumn(rawData, tableNames.tasks, columns.tasks.start),
  end_date: safeGetColumn(rawData, tableNames.tasks, columns.tasks.end),
  duration_days: safeGetColumn(rawData, tableNames.tasks, columns.tasks.duration),
  progress: safeGetColumn(rawData, tableNames.tasks, columns.tasks.progress),
  status: safeGetColumn(rawData, tableNames.tasks, columns.tasks.status),
  wbs: safeGetColumn(rawData, tableNames.tasks, columns.tasks.wbs),
  resource_id: safeGetColumn(rawData, tableNames.tasks, columns.tasks.resource),
  description: safeGetColumn(rawData, tableNames.tasks, 'description'),
  priority: safeGetColumn(rawData, tableNames.tasks, 'priority'),
  parent_task_id: safeGetColumn(rawData, tableNames.tasks, 'parent_task_id'),
  assigned_to: safeGetColumn(rawData, tableNames.tasks, 'assigned_to'),
  estimated_hours: safeGetColumn(rawData, tableNames.tasks, 'estimated_hours'),
  actual_hours: safeGetColumn(rawData, tableNames.tasks, 'actual_hours'),
  cost: safeGetColumn(rawData, tableNames.tasks, 'cost'),
  created_at: safeGetColumn(rawData, tableNames.tasks, 'created_at'),
  updated_at: safeGetColumn(rawData, tableNames.tasks, 'updated_at')
});

const transformTaskLink = (rawData: any): TaskLink => ({
  id: safeGetColumn(rawData, tableNames.links, columns.links.id, ''),
  project_id: safeGetColumn(rawData, tableNames.links, columns.links.project, ''),
  pred_id: safeGetColumn(rawData, tableNames.links, columns.links.pred),
  succ_id: safeGetColumn(rawData, tableNames.links, columns.links.succ),
  type: safeGetColumn(rawData, tableNames.links, columns.links.type),
  lag_days: safeGetColumn(rawData, tableNames.links, columns.links.lag),
  created_at: safeGetColumn(rawData, tableNames.links, 'created_at')
});

// Main adapter functions
export const getProjects = async (): Promise<Project[]> => {
  // Initialize adapter mode if not already done
  await initializeAdapterMode();
  
  if (adapterMode === 'DEMO') {
    console.log('[PP][adapter] Using demo projects');
    return generateDemoProjects();
  }

  const { data, error } = await safeSupabaseQuery(
    tableNames.projects,
    'select',
    () => supabase
      .from(tableNames.projects)
      .select('*')
      .order('created_at', { ascending: false })
  );

  if (error || !data || data.length === 0) {
    console.warn(`[PP][adapter] ${tableNames.projects}: No data available, falling back to demo projects`);
    return generateDemoProjects();
  }

  return data.map(transformProject);
};

export const getTasks = async (projectId: string): Promise<Task[]> => {
  // Initialize adapter mode if not already done
  await initializeAdapterMode();
  
  if (adapterMode === 'DEMO') {
    console.log('[PP][adapter] Using demo tasks');
    return generateDemoTasks(projectId);
  }

  const { data, error } = await safeSupabaseQuery(
    tableNames.tasks,
    'select',
    () => supabase
      .from(tableNames.tasks)
      .select('*')
      .eq(columns.tasks.project, projectId)
      .order(columns.tasks.wbs || 'id', { ascending: true })
  );

  if (error || !data || data.length === 0) {
    console.warn(`[PP][adapter] ${tableNames.tasks}: No data available for project ${projectId}, falling back to demo tasks`);
    return generateDemoTasks(projectId);
  }

  return data.map(transformTask);
};

export const getLinks = async (projectId: string): Promise<TaskLink[]> => {
  // Initialize adapter mode if not already done
  await initializeAdapterMode();
  
  if (adapterMode === 'DEMO') {
    console.log('[PP][adapter] Using demo links');
    return generateDemoLinks(projectId, []);
  }

  const { data, error } = await safeSupabaseQuery(
    'project_dependencies',
    'select',
    () => supabase
      .from('project_dependencies')
      .select('*')
      .eq('project_id', projectId)
  );

  if (error || !data || data.length === 0) {
    console.warn(`[PP][adapter] project_dependencies: No data available for project ${projectId}, falling back to demo links`);
    return generateDemoLinks(projectId, []);
  }

  // Transform project_dependencies to TaskLink format
  return data.map(dep => ({
    id: dep.id,
    project_id: dep.project_id,
    pred_id: dep.predecessor_task_id,
    succ_id: dep.successor_task_id,
    type: dep.dependency_type,
    lag_days: dep.lag_days,
    created_at: dep.created_at
  }));
};

// New function for partial task updates
export const updateTaskPartial = async (projectId: string, taskId: string, patch: Partial<TaskUpdate>): Promise<boolean> => {
  // Remove id from patch as it's not updatable
  const { id, ...updateData } = patch;
  
  const { error } = await safeSupabaseQuery(
    tableNames.tasks,
    'update',
    () => supabase
      .from(tableNames.tasks)
      .update(updateData)
      .eq(columns.tasks.id, taskId)
      .eq(columns.tasks.project, projectId)
  );

  if (error) {
    console.warn(`[PP][adapter] ${tableNames.tasks}.update: Failed to update task ${taskId}: ${error.message || error}`);
    return false;
  }

  return true;
};

// New function for batch task updates
export const updateTasksBatch = async (projectId: string, patches: Array<{taskId: string, patch: Partial<TaskUpdate>}>): Promise<boolean> => {
  // For now, implement as individual updates
  // TODO: Implement as actual batch update when Supabase supports it
  const results = await Promise.allSettled(
    patches.map(({ taskId, patch }) => updateTaskPartial(projectId, taskId, patch))
  );
  
  const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
  const totalCount = patches.length;
  
  if (successCount !== totalCount) {
    console.warn(`[PP][adapter] ${tableNames.tasks}.batchUpdate: ${successCount}/${totalCount} successful`);
  }
  
  return successCount === totalCount;
};

// Link management functions
export const createLink = async (projectId: string, predecessorId: string, successorId: string, type: string, lagDays: number = 0): Promise<boolean> => {
  const { error } = await safeSupabaseQuery(
    'project_dependencies',
    'insert',
    () => supabase
      .from('project_dependencies')
      .insert({
        project_id: projectId,
        predecessor_task_id: predecessorId,
        successor_task_id: successorId,
        dependency_type: type,
        lag_days: lagDays
      })
  );

  if (error) {
    console.warn(`[PP][adapter] project_dependencies.insert: Failed to create link ${predecessorId}→${successorId}: ${error.message || error}`);
    return false;
  }

  console.log('Link created successfully:', { predecessorId, successorId, type, lagDays });
  return true;
};

export const updateLink = async (projectId: string, linkId: string, type: string, lagDays: number): Promise<boolean> => {
  const { error } = await safeSupabaseQuery(
    'project_dependencies',
    'update',
    () => supabase
      .from('project_dependencies')
      .update({ dependency_type: type, lag_days: lagDays })
      .eq('id', linkId)
      .eq('project_id', projectId)
  );

  if (error) {
    console.warn(`[PP][adapter] project_dependencies.update: Failed to update link ${linkId}: ${error.message || error}`);
    return false;
  }

  console.log('Link updated successfully:', { linkId, type, lagDays });
  return true;
};

export const deleteLink = async (projectId: string, linkId: string): Promise<boolean> => {
  const { error } = await safeSupabaseQuery(
    'project_dependencies',
    'delete',
    () => supabase
      .from('project_dependencies')
      .delete()
      .eq('id', linkId)
      .eq('project_id', projectId)
  );

  if (error) {
    console.warn(`[PP][adapter] project_dependencies.delete: Failed to delete link ${linkId}: ${error.message || error}`);
    return false;
  }

  console.log('Link deleted successfully:', { linkId });
  return true;
};

/**
 * Seed demo tasks and links for a project
 */
export const seedDemoTasks = async (projectId: string): Promise<boolean> => {
  console.log('Seeding demo tasks for project:', projectId);
  
  // Generate demo tasks and links
  const demoTasks = generateDemoTasks(projectId);
  const taskIds = demoTasks.map(task => task.id);
  const demoLinks = generateDemoLinks(projectId, taskIds);
  
  // Insert demo tasks
  const { error: tasksError } = await safeSupabaseQuery(
    tableNames.tasks,
    'insert',
    () => supabase
      .from(tableNames.tasks)
      .insert(demoTasks.map(task => ({
        id: task.id,
        project_id: task.project_id,
        name: task.name,
        start_date: task.start_date,
        end_date: task.end_date,
        duration_days: task.duration_days,
        progress: task.progress,
        status: task.status,
        wbs: task.wbs,
        resource_id: task.resource_id
      })))
  );

  if (tasksError) {
    console.warn(`[PP][adapter] ${tableNames.tasks}.insert: Failed to seed demo tasks: ${tasksError.message || tasksError}`);
    return false;
  }

  // Insert demo links
  const { error: linksError } = await safeSupabaseQuery(
    'project_dependencies',
    'insert',
    () => supabase
      .from('project_dependencies')
      .insert(demoLinks.map(link => ({
        id: link.id,
        project_id: link.project_id,
        predecessor_task_id: link.pred_id,
        successor_task_id: link.succ_id,
        dependency_type: link.type,
        lag_days: link.lag_days
      })))
  );

  if (linksError) {
    console.warn(`[PP][adapter] project_dependencies.insert: Failed to seed demo links: ${linksError.message || linksError}`);
    return false;
  }

  // Mark project as seeded
  markProjectSeeded(projectId);
  
  console.log('Demo data seeded successfully:', {
    projectId,
    tasksCount: demoTasks.length,
    linksCount: demoLinks.length
  });
  
  return true;
};
