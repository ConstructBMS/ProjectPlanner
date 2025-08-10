/**
 * Critical Path Utilities
 * Handle critical path calculation and highlighting
 */

/**
 * Calculate critical path for all tasks
 * @param {Array} tasks - Array of task objects
 * @param {Array} taskLinks - Array of task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Array} Updated tasks with critical path flags
 */
export const calculateCriticalPath = (tasks, taskLinks, getCalendarForTask) => {
  if (!tasks || tasks.length === 0) return tasks;

  // First, perform forward and backward pass to get earliest/latest dates
  const tasksWithDates = performForwardBackwardPass(tasks, taskLinks, getCalendarForTask);
  
  // Identify critical path tasks
  const criticalTasks = identifyCriticalTasks(tasksWithDates);
  
  // Update tasks with critical path flags
  return tasks.map(task => {
    const criticalTask = criticalTasks.find(t => t.id === task.id);
    return {
      ...task,
      isCritical: criticalTask ? criticalTask.isCritical : false,
      totalFloat: criticalTask ? criticalTask.totalFloat : 0,
      freeFloat: criticalTask ? criticalTask.freeFloat : 0,
    };
  });
};

/**
 * Perform forward and backward pass to calculate earliest/latest dates
 * @param {Array} tasks - Array of task objects
 * @param {Array} taskLinks - Array of task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Array} Tasks with earliest/latest dates and float
 */
const performForwardBackwardPass = (tasks, taskLinks, getCalendarForTask) => {
  const updatedTasks = [...tasks];
  
  // Forward pass - calculate earliest start and finish times
  const forwardPass = performForwardPass(updatedTasks, taskLinks, getCalendarForTask);
  
  // Backward pass - calculate latest start and finish times
  const backwardPass = performBackwardPass(forwardPass, taskLinks, getCalendarForTask);
  
  return backwardPass;
};

/**
 * Perform forward pass to calculate earliest dates
 * @param {Array} tasks - Array of task objects
 * @param {Array} taskLinks - Array of task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Array} Tasks with earliest dates
 */
const performForwardPass = (tasks, taskLinks, getCalendarForTask) => {
  const updatedTasks = [...tasks];
  const visited = new Set();
  
  // Find tasks with no predecessors (start tasks)
  const startTasks = updatedTasks.filter(task => {
    const predecessors = taskLinks.filter(link => link.toTaskId === task.id);
    return predecessors.length === 0;
  });
  
  // Process start tasks first
  startTasks.forEach(task => {
    const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        earliestStart: new Date(task.startDate),
        earliestFinish: addDays(new Date(task.startDate), task.duration - 1, getCalendarForTask(task.id, task)),
      };
      visited.add(task.id);
    }
  });
  
  // Process remaining tasks in topological order
  let changed = true;
  while (changed) {
    changed = false;
    
    updatedTasks.forEach((task, index) => {
      if (visited.has(task.id)) return;
      
      const predecessors = taskLinks.filter(link => link.toTaskId === task.id);
      const unvisitedPredecessors = predecessors.filter(link => !visited.has(link.fromTaskId));
      
      if (unvisitedPredecessors.length === 0) {
        // All predecessors have been processed
        let earliestStart = new Date(0);
        
        predecessors.forEach(link => {
          const predecessor = updatedTasks.find(t => t.id === link.fromTaskId);
          if (predecessor && predecessor.earliestFinish) {
            const dependencyDate = addDays(predecessor.earliestFinish, link.lag || 0, getCalendarForTask(task.id, task));
            if (dependencyDate > earliestStart) {
              earliestStart = dependencyDate;
            }
          }
        });
        
        const earliestFinish = addDays(earliestStart, task.duration - 1, getCalendarForTask(task.id, task));
        
        updatedTasks[index] = {
          ...updatedTasks[index],
          earliestStart,
          earliestFinish,
        };
        
        visited.add(task.id);
        changed = true;
      }
    });
  }
  
  return updatedTasks;
};

/**
 * Perform backward pass to calculate latest dates and float
 * @param {Array} tasks - Array of task objects with earliest dates
 * @param {Array} taskLinks - Array of task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Array} Tasks with latest dates and float
 */
const performBackwardPass = (tasks, taskLinks, getCalendarForTask) => {
  const updatedTasks = [...tasks];
  const visited = new Set();
  
  // Find tasks with no successors (end tasks)
  const endTasks = updatedTasks.filter(task => {
    const successors = taskLinks.filter(link => link.fromTaskId === task.id);
    return successors.length === 0;
  });
  
  // Set latest finish for end tasks to their earliest finish
  endTasks.forEach(task => {
    const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        latestFinish: task.earliestFinish,
        latestStart: addDays(task.earliestFinish, -(task.duration - 1), getCalendarForTask(task.id, task)),
      };
      visited.add(task.id);
    }
  });
  
  // Process remaining tasks in reverse topological order
  let changed = true;
  while (changed) {
    changed = false;
    
    updatedTasks.forEach((task, index) => {
      if (visited.has(task.id)) return;
      
      const successors = taskLinks.filter(link => link.fromTaskId === task.id);
      const unvisitedSuccessors = successors.filter(link => !visited.has(link.toTaskId));
      
      if (unvisitedSuccessors.length === 0) {
        // All successors have been processed
        let latestFinish = new Date(Number.MAX_SAFE_INTEGER);
        
        successors.forEach(link => {
          const successor = updatedTasks.find(t => t.id === link.toTaskId);
          if (successor && successor.latestStart) {
            const dependencyDate = addDays(successor.latestStart, -(link.lag || 0), getCalendarForTask(task.id, task));
            if (dependencyDate < latestFinish) {
              latestFinish = dependencyDate;
            }
          }
        });
        
        const latestStart = addDays(latestFinish, -(task.duration - 1), getCalendarForTask(task.id, task));
        
        // Calculate float
        const totalFloat = Math.ceil((latestFinish.getTime() - task.earliestFinish.getTime()) / (1000 * 60 * 60 * 24));
        const freeFloat = calculateFreeFloat(task, successors, updatedTasks, getCalendarForTask);
        
        updatedTasks[index] = {
          ...updatedTasks[index],
          latestStart,
          latestFinish,
          totalFloat: Math.max(0, totalFloat),
          freeFloat: Math.max(0, freeFloat),
        };
        
        visited.add(task.id);
        changed = true;
      }
    });
  }
  
  return updatedTasks;
};

/**
 * Calculate free float for a task
 * @param {Object} task - Task object
 * @param {Array} successors - Successor links
 * @param {Array} allTasks - All tasks
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {number} Free float in days
 */
const calculateFreeFloat = (task, successors, allTasks, getCalendarForTask) => {
  if (successors.length === 0) return 0;
  
  let minSuccessorStart = new Date(Number.MAX_SAFE_INTEGER);
  
  successors.forEach(link => {
    const successor = allTasks.find(t => t.id === link.toTaskId);
    if (successor && successor.earliestStart) {
      const dependencyDate = addDays(successor.earliestStart, -(link.lag || 0), getCalendarForTask(task.id, task));
      if (dependencyDate < minSuccessorStart) {
        minSuccessorStart = dependencyDate;
      }
    }
  });
  
  const freeFloat = Math.ceil((minSuccessorStart.getTime() - task.earliestFinish.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, freeFloat);
};

/**
 * Identify critical path tasks
 * @param {Array} tasks - Tasks with earliest/latest dates and float
 * @returns {Array} Tasks with critical path flags
 */
const identifyCriticalTasks = (tasks) => {
  return tasks.map(task => {
    // A task is critical if it has zero total float
    const isCritical = task.totalFloat === 0;
    
    return {
      ...task,
      isCritical,
    };
  });
};

/**
 * Add days to a date considering working days
 * @param {Date} date - Start date
 * @param {number} days - Number of days to add (can be negative)
 * @param {Object} calendar - Calendar object
 * @returns {Date} New date
 */
const addDays = (date, days, calendar) => {
  if (!calendar) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }
  
  let currentDate = new Date(date);
  let remainingDays = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;
  
  while (remainingDays > 0) {
    currentDate.setDate(currentDate.getDate() + direction);
    
    if (isWorkday(currentDate, calendar)) {
      remainingDays--;
    }
  }
  
  return currentDate;
};

/**
 * Check if a date is a working day
 * @param {Date} date - Date to check
 * @param {Object} calendar - Calendar object
 * @returns {boolean} True if working day
 */
const isWorkday = (date, calendar) => {
  if (!calendar || !calendar.workingDays) return true;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];
  
  return calendar.workingDays[dayName] === true;
};

/**
 * Get critical path styling
 * @param {boolean} isCritical - Whether task is on critical path
 * @returns {Object} Styling information
 */
export const getCriticalPathStyling = (isCritical) => {
  if (isCritical) {
    return {
      backgroundColor: '#ef4444', // Red
      borderColor: '#dc2626',
      color: '#ffffff',
      className: 'critical-task',
      tooltip: 'Critical Path Task',
    };
  }
  
  return {
    backgroundColor: '#3b82f6', // Blue (default)
    borderColor: '#2563eb',
    color: '#ffffff',
    className: 'normal-task',
    tooltip: 'Normal Task',
  };
};

/**
 * Get critical path statistics
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Critical path statistics
 */
export const getCriticalPathStats = (tasks) => {
  const criticalTasks = tasks.filter(task => task.isCritical);
  const totalTasks = tasks.length;
  const criticalCount = criticalTasks.length;
  const criticalPercentage = totalTasks > 0 ? Math.round((criticalCount / totalTasks) * 100) : 0;
  
  // Calculate critical path duration
  let criticalPathDuration = 0;
  if (criticalTasks.length > 0) {
    const earliestStart = new Date(Math.min(...criticalTasks.map(t => new Date(t.startDate))));
    const latestFinish = new Date(Math.max(...criticalTasks.map(t => new Date(t.endDate))));
    criticalPathDuration = Math.ceil((latestFinish.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  
  return {
    totalTasks,
    criticalCount,
    criticalPercentage,
    criticalPathDuration,
    criticalTasks: criticalTasks.map(t => ({ id: t.id, name: t.name })),
  };
};

/**
 * Check if critical path highlighting should be enabled
 * @param {Object} viewState - View state object
 * @returns {boolean} True if critical path highlighting is enabled
 */
export const isCriticalPathHighlightingEnabled = (viewState) => {
  return viewState.showCriticalPath === true;
};

/**
 * Get critical path tooltip content
 * @param {Object} task - Task object
 * @returns {string} Tooltip text
 */
export const getCriticalPathTooltip = (task) => {
  if (!task.isCritical) {
    return 'Normal task';
  }
  
  let tooltip = 'Critical Path Task\n';
  
  if (task.totalFloat !== undefined) {
    tooltip += `Total Float: ${task.totalFloat} days\n`;
  }
  
  if (task.freeFloat !== undefined) {
    tooltip += `Free Float: ${task.freeFloat} days`;
  }
  
  return tooltip;
};
