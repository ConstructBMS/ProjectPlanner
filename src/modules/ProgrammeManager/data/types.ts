// Data types for ConstructBMS integration

export interface Project {
  id: string;
  name: string;
  code?: string;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  description?: string;
  status?: string;
  progress?: number;
  budget?: number;
  actual_cost?: number;
  manager_id?: string;
  client_id?: string;
  location?: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  duration_days?: number;
  progress?: number;
  status?: string;
  wbs?: string; // Work Breakdown Structure code
  resource_id?: string;
  description?: string;
  priority?: string;
  parent_task_id?: string;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TaskLink {
  id: string;
  project_id: string;
  pred_id: string; // Predecessor task ID
  succ_id: string; // Successor task ID
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag_days?: number;
  created_at?: string;
}

// Demo data interfaces for fallback
export interface DemoProject extends Project {
  code: string;
  start_date: string;
  end_date: string;
}

export interface DemoTask extends Task {
  start_date: string;
  end_date: string;
  duration_days: number;
  progress: number;
  status: string;
  wbs: string;
}

export interface DemoTaskLink extends TaskLink {
  type: 'finish-to-start';
  lag_days: number;
}

// Adapter result types
export interface AdapterResult<T> {
  data: T[];
  isDemo: boolean;
  error?: string;
}

export interface ProjectsResult extends AdapterResult<Project> {}
export interface TasksResult extends AdapterResult<Task> {}
export interface TaskLinksResult extends AdapterResult<TaskLink> {}
