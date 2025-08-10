/**
 * Resource Leveling Utilities
 * Handle automatic resource leveling to resolve overallocations
 */

/**
 * Default resource leveling configuration
 */
export const DEFAULT_LEVELING_CONFIG = {
  maxIterations: 100,
  maxShiftDays: 30,
  criticalPathPriority: 1.0,
  nonCriticalPathPriority: 0.5,
  overallocationThreshold: 1.0, // 100% of capacity
  bufferDays: 1, // Days to add between tasks when possible
  respectDependencies: true,
  respectConstraints: true,
  levelingStrategy: 'forward', // 'forward', 'backward', 'balanced'
  undoEnabled: true,
  maxUndoSteps: 10,
  performanceMode: 'balanced', // 'fast', 'balanced', 'thorough'
};

/**
 * Resource allocation data structure
 */
export const createResourceAllocation = (resourceId, date, hours) => {
  return {
    resourceId,
    date,
    hours,
    tasks: [],
    isOverallocated: false,
    overloadHours: 0,
  };
};

/**
 * Calculate daily resource allocations
 * @param {Array} tasks - Array of tasks
 * @param {Array} resources - Array of resources
 * @param {Object} config - Configuration
 * @returns {Object} Daily allocations by resource and date
 */
export const calculateDailyAllocations = (tasks, resources, config = DEFAULT_LEVELING_CONFIG) => {
  const allocations = {};

  // Initialize allocations for all resources
  resources.forEach(resource => {
    allocations[resource.id] = {};
  });

  // Calculate task allocations
  tasks.forEach(task => {
    if (!task.resources || task.resources.length === 0) return;

    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const hoursPerDay = task.effort / duration;

    task.resources.forEach(resourceId => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      const maxHoursPerDay = resource.maxHoursPerDay || 8;
      const allocation = hoursPerDay / task.resources.length;

      for (let i = 0; i < duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateKey = currentDate.toISOString().split('T')[0];

        if (!allocations[resourceId][dateKey]) {
          allocations[resourceId][dateKey] = createResourceAllocation(resourceId, dateKey, 0);
        }

        allocations[resourceId][dateKey].hours += allocation;
        allocations[resourceId][dateKey].tasks.push({
          taskId: task.id,
          taskName: task.name,
          hours: allocation,
          isCritical: task.isCritical || false,
          float: task.totalFloat || 0,
        });
      }
    });
  });

  // Check for overallocations
  Object.keys(allocations).forEach(resourceId => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const maxHoursPerDay = resource.maxHoursPerDay || 8;
    const threshold = maxHoursPerDay * config.overallocationThreshold;

    Object.keys(allocations[resourceId]).forEach(dateKey => {
      const allocation = allocations[resourceId][dateKey];
      if (allocation.hours > threshold) {
        allocation.isOverallocated = true;
        allocation.overloadHours = allocation.hours - maxHoursPerDay;
      }
    });
  });

  return allocations;
};

/**
 * Detect overallocations
 * @param {Object} allocations - Daily allocations
 * @param {Array} resources - Array of resources
 * @param {Object} config - Configuration
 * @returns {Array} Array of overallocation conflicts
 */
export const detectOverallocations = (allocations, resources, config = DEFAULT_LEVELING_CONFIG) => {
  const conflicts = [];

  Object.keys(allocations).forEach(resourceId => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const maxHoursPerDay = resource.maxHoursPerDay || 8;
    const threshold = maxHoursPerDay * config.overallocationThreshold;

    Object.keys(allocations[resourceId]).forEach(dateKey => {
      const allocation = allocations[resourceId][dateKey];
      if (allocation.isOverallocated) {
        conflicts.push({
          resourceId,
          resourceName: resource.name,
          date: dateKey,
          allocatedHours: allocation.hours,
          maxHours: maxHoursPerDay,
          overloadHours: allocation.overloadHours,
          tasks: allocation.tasks,
          severity: allocation.overloadHours / maxHoursPerDay,
        });
      }
    });
  });

  return conflicts.sort((a, b) => b.severity - a.severity);
};

/**
 * Calculate task priority for leveling
 * @param {Object} task - Task object
 * @param {Object} config - Configuration
 * @returns {number} Priority score (higher = more critical)
 */
export const calculateTaskPriority = (task, config = DEFAULT_LEVELING_CONFIG) => {
  let priority = 0;

  // Critical path priority
  if (task.isCritical) {
    priority += config.criticalPathPriority;
  } else {
    priority += config.nonCriticalPathPriority;
  }

  // Float-based priority (less float = higher priority)
  const float = task.totalFloat || 0;
  priority += Math.max(0, 10 - float) / 10;

  // Duration priority (shorter tasks get higher priority)
  const duration = task.duration || 1;
  priority += 1 / duration;

  // Progress priority (more progress = higher priority)
  const progress = task.progress || 0;
  priority += progress / 100;

  return priority;
};

/**
 * Find tasks that can be shifted
 * @param {Array} tasks - Array of tasks
 * @param {Array} conflicts - Overallocation conflicts
 * @param {Object} config - Configuration
 * @returns {Array} Array of shiftable tasks
 */
export const findShiftableTasks = (tasks, conflicts, config = DEFAULT_LEVELING_CONFIG) => {
  const shiftableTasks = [];

  conflicts.forEach(conflict => {
    const conflictTasks = conflict.tasks.map(t => t.taskId);
    
    conflictTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Check if task can be shifted
      const canShift = canTaskBeShifted(task, tasks, config);
      if (canShift) {
        const priority = calculateTaskPriority(task, config);
        shiftableTasks.push({
          task,
          priority,
          conflict,
          shiftDirection: 'forward', // Default to forward shifting
          maxShiftDays: calculateMaxShiftDays(task, config),
        });
      }
    });
  });

  return shiftableTasks.sort((a, b) => a.priority - b.priority); // Lower priority first
};

/**
 * Check if a task can be shifted
 * @param {Object} task - Task to check
 * @param {Array} tasks - All tasks
 * @param {Object} config - Configuration
 * @returns {boolean} Whether task can be shifted
 */
export const canTaskBeShifted = (task, tasks, config = DEFAULT_LEVELING_CONFIG) => {
  // Critical tasks with no float cannot be shifted
  if (task.isCritical && (task.totalFloat || 0) <= 0) {
    return false;
  }

  // Check dependencies
  if (config.respectDependencies) {
    const successors = getTaskSuccessors(task, tasks);
    if (successors.length > 0) {
      // Check if shifting would affect successors
      const hasCriticalSuccessor = successors.some(s => s.isCritical);
      if (hasCriticalSuccessor) {
        return false;
      }
    }
  }

  // Check constraints
  if (config.respectConstraints) {
    if (task.constraintType === 'MUST_START_ON' || task.constraintType === 'MUST_FINISH_ON') {
      return false;
    }
  }

  return true;
};

/**
 * Get task successors
 * @param {Object} task - Task object
 * @param {Array} tasks - All tasks
 * @returns {Array} Array of successor tasks
 */
export const getTaskSuccessors = (task, tasks) => {
  return tasks.filter(t => 
    t.predecessors && t.predecessors.some(p => p.taskId === task.id)
  );
};

/**
 * Calculate maximum shift days for a task
 * @param {Object} task - Task object
 * @param {Object} config - Configuration
 * @returns {number} Maximum shift days
 */
export const calculateMaxShiftDays = (task, config = DEFAULT_LEVELING_CONFIG) => {
  const float = task.totalFloat || 0;
  return Math.min(config.maxShiftDays, float);
};

/**
 * Perform resource leveling
 * @param {Array} tasks - Array of tasks
 * @param {Array} resources - Array of resources
 * @param {Object} config - Configuration
 * @returns {Object} Leveling result
 */
export const performResourceLeveling = (tasks, resources, config = DEFAULT_LEVELING_CONFIG) => {
  const originalTasks = JSON.parse(JSON.stringify(tasks));
  const levelingHistory = [];
  let iterations = 0;
  let totalShifts = 0;

  while (iterations < config.maxIterations) {
    iterations++;

    // Calculate current allocations
    const allocations = calculateDailyAllocations(tasks, resources, config);
    const conflicts = detectOverallocations(allocations, resources, config);

    // If no conflicts, we're done
    if (conflicts.length === 0) {
      break;
    }

    // Find shiftable tasks
    const shiftableTasks = findShiftableTasks(tasks, conflicts, config);

    if (shiftableTasks.length === 0) {
      // No more tasks can be shifted
      break;
    }

    // Shift the lowest priority task
    const taskToShift = shiftableTasks[0];
    const shiftResult = shiftTask(taskToShift.task, tasks, config);

    if (shiftResult.success) {
      levelingHistory.push({
        taskId: taskToShift.task.id,
        taskName: taskToShift.task.name,
        originalStartDate: shiftResult.originalStartDate,
        originalEndDate: shiftResult.originalEndDate,
        newStartDate: shiftResult.newStartDate,
        newEndDate: shiftResult.newEndDate,
        shiftDays: shiftResult.shiftDays,
        iteration: iterations,
      });

      totalShifts++;
    }
  }

  // Calculate final allocations
  const finalAllocations = calculateDailyAllocations(tasks, resources, config);
  const remainingConflicts = detectOverallocations(finalAllocations, resources, config);

  return {
    success: remainingConflicts.length === 0,
    iterations,
    totalShifts,
    levelingHistory,
    remainingConflicts,
    originalTasks,
    leveledTasks: tasks,
    summary: {
      tasksShifted: levelingHistory.length,
      conflictsResolved: conflicts.length - remainingConflicts.length,
      conflictsRemaining: remainingConflicts.length,
      totalIterations: iterations,
    },
  };
};

/**
 * Shift a task to resolve conflicts
 * @param {Object} task - Task to shift
 * @param {Array} tasks - All tasks
 * @param {Object} config - Configuration
 * @returns {Object} Shift result
 */
export const shiftTask = (task, tasks, config = DEFAULT_LEVELING_CONFIG) => {
  const originalStartDate = new Date(task.startDate);
  const originalEndDate = new Date(task.endDate);
  const duration = task.duration || 1;

  // Calculate new start date
  let newStartDate = new Date(originalStartDate);
  let shiftDays = 0;

  if (config.levelingStrategy === 'forward') {
    // Find the next available slot
    for (let i = 1; i <= config.maxShiftDays; i++) {
      const testDate = new Date(originalStartDate);
      testDate.setDate(testDate.getDate() + i);
      
      if (isSlotAvailable(task, testDate, tasks, config)) {
        newStartDate = testDate;
        shiftDays = i;
        break;
      }
    }
  } else if (config.levelingStrategy === 'backward') {
    // Find the previous available slot
    for (let i = 1; i <= config.maxShiftDays; i++) {
      const testDate = new Date(originalStartDate);
      testDate.setDate(testDate.getDate() - i);
      
      if (isSlotAvailable(task, testDate, tasks, config)) {
        newStartDate = testDate;
        shiftDays = -i;
        break;
      }
    }
  }

  if (shiftDays === 0) {
    return { success: false, reason: 'No available slot found' };
  }

  // Calculate new end date
  const newEndDate = new Date(newStartDate);
  newEndDate.setDate(newStartDate.getDate() + duration - 1);

  // Update task dates
  task.startDate = newStartDate.toISOString().split('T')[0];
  task.endDate = newEndDate.toISOString().split('T')[0];

  return {
    success: true,
    originalStartDate,
    originalEndDate,
    newStartDate,
    newEndDate,
    shiftDays,
  };
};

/**
 * Check if a time slot is available for a task
 * @param {Object} task - Task to check
 * @param {Date} startDate - Proposed start date
 * @param {Array} tasks - All tasks
 * @param {Object} config - Configuration
 * @returns {boolean} Whether slot is available
 */
export const isSlotAvailable = (task, startDate, tasks, config = DEFAULT_LEVELING_CONFIG) => {
  const duration = task.duration || 1;
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + duration - 1);

  // Check dependencies
  if (config.respectDependencies && task.predecessors) {
    for (const predecessor of task.predecessors) {
      const predTask = tasks.find(t => t.id === predecessor.taskId);
      if (predTask) {
        const predEndDate = new Date(predTask.endDate);
        if (startDate <= predEndDate) {
          return false;
        }
      }
    }
  }

  // Check successors
  const successors = getTaskSuccessors(task, tasks);
  for (const successor of successors) {
    const succStartDate = new Date(successor.startDate);
    if (endDate >= succStartDate) {
      return false;
    }
  }

  // Check constraints
  if (config.respectConstraints) {
    if (task.constraintType === 'START_NO_EARLIER_THAN') {
      const constraintDate = new Date(task.constraintDate);
      if (startDate < constraintDate) {
        return false;
      }
    }
    if (task.constraintType === 'FINISH_NO_LATER_THAN') {
      const constraintDate = new Date(task.constraintDate);
      if (endDate > constraintDate) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Undo resource leveling
 * @param {Array} levelingHistory - Leveling history
 * @param {Array} tasks - Current tasks
 * @param {number} steps - Number of steps to undo
 * @returns {Object} Undo result
 */
export const undoResourceLeveling = (levelingHistory, tasks, steps = 1) => {
  const undoSteps = Math.min(steps, levelingHistory.length);
  const undoneSteps = [];

  for (let i = 0; i < undoSteps; i++) {
    const historyEntry = levelingHistory[levelingHistory.length - 1 - i];
    const task = tasks.find(t => t.id === historyEntry.taskId);
    
    if (task) {
      task.startDate = historyEntry.originalStartDate.toISOString().split('T')[0];
      task.endDate = historyEntry.originalEndDate.toISOString().split('T')[0];
      undoneSteps.push(historyEntry);
    }
  }

  return {
    success: undoneSteps.length > 0,
    undoneSteps,
    remainingHistory: levelingHistory.slice(0, levelingHistory.length - undoSteps),
  };
};

/**
 * Generate leveling report
 * @param {Object} levelingResult - Result from performResourceLeveling
 * @param {Array} resources - Array of resources
 * @returns {Object} Leveling report
 */
export const generateLevelingReport = (levelingResult, resources) => {
  const report = {
    summary: levelingResult.summary,
    details: {
      tasksShifted: levelingResult.levelingHistory.map(entry => ({
        taskName: entry.taskName,
        shiftDays: entry.shiftDays,
        originalDates: `${entry.originalStartDate.toLocaleDateString()} - ${entry.originalEndDate.toLocaleDateString()}`,
        newDates: `${entry.newStartDate.toLocaleDateString()} - ${entry.newEndDate.toLocaleDateString()}`,
      })),
      conflictsResolved: levelingResult.remainingConflicts.length === 0 ? 'All conflicts resolved' : `${levelingResult.remainingConflicts.length} conflicts remain`,
      performance: {
        iterations: levelingResult.iterations,
        efficiency: levelingResult.totalShifts > 0 ? levelingResult.iterations / levelingResult.totalShifts : 0,
      },
    },
    recommendations: [],
  };

  // Add recommendations
  if (levelingResult.remainingConflicts.length > 0) {
    report.recommendations.push('Consider adding more resources or extending project timeline');
  }

  if (levelingResult.summary.tasksShifted > 10) {
    report.recommendations.push('Many tasks were shifted - consider reviewing resource allocation strategy');
  }

  if (levelingResult.iterations > 50) {
    report.recommendations.push('Leveling took many iterations - consider adjusting leveling parameters');
  }

  return report;
};

/**
 * Validate leveling configuration
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
export const validateLevelingConfig = (config) => {
  const errors = [];
  const warnings = [];

  if (config.maxIterations <= 0) {
    errors.push('maxIterations must be greater than 0');
  }

  if (config.maxShiftDays <= 0) {
    errors.push('maxShiftDays must be greater than 0');
  }

  if (config.criticalPathPriority <= 0) {
    errors.push('criticalPathPriority must be greater than 0');
  }

  if (config.overallocationThreshold <= 0) {
    errors.push('overallocationThreshold must be greater than 0');
  }

  if (!['forward', 'backward', 'balanced'].includes(config.levelingStrategy)) {
    errors.push('levelingStrategy must be one of: forward, backward, balanced');
  }

  if (config.maxIterations > 1000) {
    warnings.push('High maxIterations may cause performance issues');
  }

  if (config.maxShiftDays > 100) {
    warnings.push('High maxShiftDays may result in unrealistic schedules');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
