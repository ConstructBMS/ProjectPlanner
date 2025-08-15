export interface Task {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  predecessors?: string[];
  successors?: string[];
}

export interface TaskLink {
  id: string;
  pred_id: string;
  succ_id: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag_days: number;
}

export interface CPMResult {
  id: string;
  es: number; // Earliest Start (days from project start)
  ef: number; // Earliest Finish
  ls: number; // Latest Start
  lf: number; // Latest Finish
  float: number; // Total Float (slack)
  isCritical: boolean;
}

export interface CPMData {
  tasks: CPMResult[];
  projectDuration: number;
  criticalPath: string[];
}

/**
 * Calculate Critical Path Method (CPM) for a set of tasks and links
 */
export function calculateCPM(tasks: Task[], links: TaskLink[]): CPMData {
  if (!tasks || tasks.length === 0) {
    return {
      tasks: [],
      projectDuration: 0,
      criticalPath: []
    };
  }

  // Build task map and dependency graph
  const taskMap = new Map<string, Task>();
  const predecessors = new Map<string, string[]>();
  const successors = new Map<string, string[]>();
  const taskDurations = new Map<string, number>();

  // Initialize maps
  tasks.forEach(task => {
    taskMap.set(task.id, task);
    predecessors.set(task.id, []);
    successors.set(task.id, []);
    
    // Calculate duration in days
    let duration = task.duration_days || 1;
    if (task.start_date && task.end_date) {
      const start = new Date(task.start_date);
      const end = new Date(task.end_date);
      duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }
    taskDurations.set(task.id, duration);
  });

  // Build dependency relationships from links
  links.forEach(link => {
    if (taskMap.has(link.pred_id) && taskMap.has(link.succ_id)) {
      const predList = predecessors.get(link.succ_id) || [];
      const succList = successors.get(link.pred_id) || [];
      
      predList.push(link.pred_id);
      succList.push(link.succ_id);
      
      predecessors.set(link.succ_id, predList);
      successors.set(link.pred_id, succList);
    }
  });

  // Find start tasks (no predecessors)
  const startTasks = tasks.filter(task => 
    (predecessors.get(task.id) || []).length === 0
  );

  if (startTasks.length === 0) {
    // If no start tasks, treat all as start tasks
    startTasks.push(...tasks);
  }

  // Forward pass - calculate ES and EF
  const es = new Map<string, number>();
  const ef = new Map<string, number>();
  const visited = new Set<string>();

  // Initialize start tasks
  startTasks.forEach(task => {
    es.set(task.id, 0);
    ef.set(task.id, taskDurations.get(task.id) || 1);
  });

  // Process remaining tasks
  const queue = [...startTasks];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const currentEF = ef.get(current.id) || 0;
    const currentSuccs = successors.get(current.id) || [];

    currentSuccs.forEach(succId => {
      const predList = predecessors.get(succId) || [];
      const allPredsVisited = predList.every(predId => visited.has(predId));
      
      if (allPredsVisited) {
        // Calculate ES for successor based on all predecessors
        let maxEF = 0;
        predList.forEach(predId => {
          const predEF = ef.get(predId) || 0;
          maxEF = Math.max(maxEF, predEF);
        });

        es.set(succId, maxEF);
        ef.set(succId, maxEF + (taskDurations.get(succId) || 1));
        queue.push(taskMap.get(succId)!);
      }
    });
  }

  // Find end tasks (no successors)
  const endTasks = tasks.filter(task => 
    (successors.get(task.id) || []).length === 0
  );

  if (endTasks.length === 0) {
    // If no end tasks, treat all as end tasks
    endTasks.push(...tasks);
  }

  // Calculate project duration
  const projectDuration = Math.max(...endTasks.map(task => ef.get(task.id) || 0));

  // Backward pass - calculate LS and LF
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();
  const backwardVisited = new Set<string>();

  // Initialize end tasks
  endTasks.forEach(task => {
    lf.set(task.id, projectDuration);
    ls.set(task.id, projectDuration - (taskDurations.get(task.id) || 1));
  });

  // Process remaining tasks
  const backwardQueue = [...endTasks];
  while (backwardQueue.length > 0) {
    const current = backwardQueue.shift()!;
    if (backwardVisited.has(current.id)) continue;
    backwardVisited.add(current.id);

    const currentLS = ls.get(current.id) || 0;
    const currentPreds = predecessors.get(current.id) || [];

    currentPreds.forEach(predId => {
      const succList = successors.get(predId) || [];
      const allSuccsVisited = succList.every(succId => backwardVisited.has(succId));
      
      if (allSuccsVisited) {
        // Calculate LF for predecessor based on all successors
        let minLS = Infinity;
        succList.forEach(succId => {
          const succLS = ls.get(succId) || 0;
          minLS = Math.min(minLS, succLS);
        });

        lf.set(predId, minLS);
        ls.set(predId, minLS - (taskDurations.get(predId) || 1));
        backwardQueue.push(taskMap.get(predId)!);
      }
    });
  }

  // Calculate float and identify critical path
  const results: CPMResult[] = [];
  const criticalPath: string[] = [];

  tasks.forEach(task => {
    const taskES = es.get(task.id) || 0;
    const taskEF = ef.get(task.id) || 0;
    const taskLS = ls.get(task.id) || 0;
    const taskLF = lf.get(task.id) || 0;
    const float = taskLS - taskES;
    const isCritical = Math.abs(float) < 0.1; // Consider critical if float is very small

    results.push({
      id: task.id,
      es: taskES,
      ef: taskEF,
      ls: taskLS,
      lf: taskLF,
      float,
      isCritical
    });

    if (isCritical) {
      criticalPath.push(task.id);
    }
  });

  return {
    tasks: results,
    projectDuration,
    criticalPath
  };
}

/**
 * Get CPM results for a specific task
 */
export function getCPMForTask(taskId: string, cpmData: CPMData): CPMResult | null {
  return cpmData.tasks.find(task => task.id === taskId) || null;
}

/**
 * Check if a task is on the critical path
 */
export function isTaskCritical(taskId: string, cpmData: CPMData): boolean {
  return cpmData.criticalPath.includes(taskId);
}

/**
 * Get all critical tasks
 */
export function getCriticalTasks(cpmData: CPMData): string[] {
  return cpmData.criticalPath;
}
