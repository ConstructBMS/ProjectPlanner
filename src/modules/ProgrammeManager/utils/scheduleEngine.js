/**
 * Auto-Scheduling Engine for Gantt Chart
 * Implements forward/backward pass algorithms with dependency support
 */

import { addDays, isWorkday, snapToWorkday } from './calendarUtils';
import { calculateCriticalPath } from './criticalPathUtils';

/**
 * Link types supported by the scheduling engine
 */
export const LINK_TYPES = {
  FS: 'FS', // Finish-to-Start (default)
  SS: 'SS', // Start-to-Start
  FF: 'FF', // Finish-to-Finish
  SF: 'SF', // Start-to-Finish
};

/**
 * Calculate the earliest start date for a task based on its predecessors
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Date} Earliest possible start date
 */
export const calculateEarliestStart = (
  task,
  allTasks,
  taskLinks,
  getCalendarForTask
) => {
  const predecessors = getPredecessors(task.id, taskLinks);

  if (predecessors.length === 0) {
    // No predecessors - can start at project start or specified start date
    return task.startDate ? new Date(task.startDate) : new Date();
  }

  let earliestStart = new Date(0); // Start from epoch

  predecessors.forEach(link => {
    const predecessor = allTasks.find(t => t.id === link.fromTaskId);
    if (!predecessor) return;

    const predecessorStart = new Date(predecessor.startDate);
    const predecessorEnd = new Date(predecessor.endDate);
    const lag = link.lag || 0;
    const predecessorCalendar = getCalendarForTask(predecessor.id, predecessor);

    let dependencyDate;

    switch (link.type) {
      case LINK_TYPES.FS: // Finish-to-Start
        dependencyDate = addDays(predecessorEnd, lag + 1, predecessorCalendar);
        break;

      case LINK_TYPES.SS: // Start-to-Start
        dependencyDate = addDays(predecessorStart, lag, predecessorCalendar);
        break;

      case LINK_TYPES.FF: // Finish-to-Finish
        // For FF, we need to work backwards from predecessor end
        const taskDuration = task.duration || 1;
        dependencyDate = addDays(
          predecessorEnd,
          lag - taskDuration + 1,
          predecessorCalendar
        );
        break;

      case LINK_TYPES.SF: // Start-to-Finish
        // For SF, task must finish before predecessor starts
        const taskDurationForSF = task.duration || 1;
        dependencyDate = addDays(
          predecessorStart,
          lag - taskDurationForSF + 1,
          predecessorCalendar
        );
        break;

      default:
        dependencyDate = addDays(predecessorEnd, lag + 1, predecessorCalendar);
    }

    if (dependencyDate > earliestStart) {
      earliestStart = dependencyDate;
    }
  });

  // Ensure the date is a working day using the task's calendar
  const taskCalendar = getCalendarForTask(task.id, task);
  return snapToWorkday(earliestStart, taskCalendar);
};

/**
 * Calculate the latest start date for a task based on its successors
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Date} Latest possible start date
 */
export const calculateLatestStart = (
  task,
  allTasks,
  taskLinks,
  getCalendarForTask
) => {
  const successors = getSuccessors(task.id, taskLinks);

  if (successors.length === 0) {
    // No successors - can finish at project end or specified end date
    return task.endDate
      ? new Date(task.endDate)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  let latestStart = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Far future date

  successors.forEach(link => {
    const successor = allTasks.find(t => t.id === link.toTaskId);
    if (!successor) return;

    const successorStart = new Date(successor.startDate);
    const successorEnd = new Date(successor.endDate);
    const lag = link.lag || 0;
    const taskDuration = task.duration || 1;
    const successorCalendar = getCalendarForTask(successor.id, successor);

    let dependencyDate;

    switch (link.type) {
      case LINK_TYPES.FS: // Finish-to-Start (reverse)
        // Task must finish before successor starts
        dependencyDate = addDays(
          successorStart,
          -lag - taskDuration,
          successorCalendar
        );
        break;

      case LINK_TYPES.SS: // Start-to-Start (reverse)
        // Task must start before successor starts
        dependencyDate = addDays(successorStart, -lag, successorCalendar);
        break;

      case LINK_TYPES.FF: // Finish-to-Finish (reverse)
        // Task must finish before successor finishes
        dependencyDate = addDays(
          successorEnd,
          -lag - taskDuration,
          successorCalendar
        );
        break;

      case LINK_TYPES.SF: // Start-to-Finish (reverse)
        // Task must start before successor finishes
        dependencyDate = addDays(successorEnd, -lag, successorCalendar);
        break;

      default:
        dependencyDate = addDays(
          successorStart,
          -lag - taskDuration,
          successorCalendar
        );
    }

    if (dependencyDate < latestStart) {
      latestStart = dependencyDate;
    }
  });

  // Ensure the date is a working day using the task's calendar
  const taskCalendar = getCalendarForTask(task.id, task);
  return snapToWorkday(latestStart, taskCalendar);
};

/**
 * Get all predecessor tasks for a given task
 * @param {string} taskId - Task ID
 * @param {Array} taskLinks - Task dependency links
 * @returns {Array} Array of predecessor links
 */
export const getPredecessors = (taskId, taskLinks) => {
  return taskLinks.filter(link => link.toTaskId === taskId);
};

/**
 * Get all successor tasks for a given task
 * @param {string} taskId - Task ID
 * @param {Array} taskLinks - Task dependency links
 * @returns {Array} Array of successor links
 */
export const getSuccessors = (taskId, taskLinks) => {
  return taskLinks.filter(link => link.fromTaskId === taskId);
};

/**
 * Calculate total float (slack) for a task
 * @param {Date} earliestStart - Earliest possible start date
 * @param {Date} latestStart - Latest possible start date
 * @returns {number} Total float in days
 */
export const calculateTotalFloat = (earliestStart, latestStart) => {
  const diffTime = latestStart.getTime() - earliestStart.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * Calculate free float for a task
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Object} globalCalendar - Global calendar for working days
 * @returns {number} Free float in days
 */
export const calculateFreeFloat = (
  task,
  allTasks,
  taskLinks,
  globalCalendar
) => {
  const successors = getSuccessors(task.id, taskLinks);

  if (successors.length === 0) return Infinity;

  let freeFloat = Infinity;
  const taskEnd = new Date(task.endDate);

  successors.forEach(link => {
    const successor = allTasks.find(t => t.id === link.toTaskId);
    if (!successor) return;

    const successorStart = new Date(successor.startDate);
    const lag = link.lag || 0;

    let earliestSuccessorStart;

    switch (link.type) {
      case LINK_TYPES.FS:
        earliestSuccessorStart = addDays(taskEnd, lag + 1, globalCalendar);
        break;
      case LINK_TYPES.SS:
        earliestSuccessorStart = addDays(
          new Date(task.startDate),
          lag,
          globalCalendar
        );
        break;
      case LINK_TYPES.FF:
        earliestSuccessorStart = addDays(taskEnd, lag, globalCalendar);
        break;
      case LINK_TYPES.SF:
        earliestSuccessorStart = addDays(
          new Date(task.startDate),
          lag,
          globalCalendar
        );
        break;
      default:
        earliestSuccessorStart = addDays(taskEnd, lag + 1, globalCalendar);
    }

    const float = Math.ceil(
      (earliestSuccessorStart.getTime() - successorStart.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (float < freeFloat) {
      freeFloat = Math.max(0, float);
    }
  });

  return freeFloat === Infinity ? 0 : freeFloat;
};

/**
 * Perform forward pass to calculate earliest start and finish dates
 * @param {Array} allTasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Array} Updated tasks with earliest dates
 */
export const performForwardPass = (allTasks, taskLinks, getCalendarForTask) => {
  const updatedTasks = [...allTasks];
  const visited = new Set();
  const processing = new Set();

  const visitTask = taskId => {
    if (processing.has(taskId)) {
      throw new Error(`Circular dependency detected: ${taskId}`);
    }
    if (visited.has(taskId)) return;

    processing.add(taskId);
    const task = updatedTasks.find(t => t.id === taskId);
    if (!task) return;

    // Visit all predecessors first
    const predecessors = getPredecessors(taskId, taskLinks);
    predecessors.forEach(link => visitTask(link.fromTaskId));

    // Calculate earliest start date
    const earliestStart = calculateEarliestStart(
      task,
      updatedTasks,
      taskLinks,
      getCalendarForTask
    );

    // Calculate earliest finish date
    const duration = task.duration || 1;
    const taskCalendar = getCalendarForTask(task.id, task);
    const earliestFinish = addDays(earliestStart, duration - 1, taskCalendar);

    // Update task dates
    task.startDate = earliestStart.toISOString();
    task.endDate = earliestFinish.toISOString();
    task.earliestStart = earliestStart.toISOString();
    task.earliestFinish = earliestFinish.toISOString();

    visited.add(taskId);
    processing.delete(taskId);
  };

  // Visit all tasks in dependency order
  updatedTasks.forEach(task => visitTask(task.id));

  return updatedTasks;
};

/**
 * Perform backward pass to calculate latest start and finish dates
 * @param {Array} allTasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Array} Updated tasks with latest dates and float
 */
export const performBackwardPass = (
  allTasks,
  taskLinks,
  getCalendarForTask
) => {
  const updatedTasks = [...allTasks];
  const visited = new Set();
  const processing = new Set();

  const visitTask = taskId => {
    if (processing.has(taskId)) {
      throw new Error(`Circular dependency detected: ${taskId}`);
    }
    if (visited.has(taskId)) return;

    processing.add(taskId);
    const task = updatedTasks.find(t => t.id === taskId);
    if (!task) return;

    // Visit all successors first
    const successors = getSuccessors(taskId, taskLinks);
    successors.forEach(link => visitTask(link.toTaskId));

    // Calculate latest start date
    const latestStart = calculateLatestStart(
      task,
      updatedTasks,
      taskLinks,
      getCalendarForTask
    );

    // Calculate latest finish date
    const duration = task.duration || 1;
    const taskCalendar = getCalendarForTask(task.id, task);
    const latestFinish = addDays(latestStart, duration - 1, taskCalendar);

    // Update task dates
    task.latestStart = latestStart.toISOString();
    task.latestFinish = latestFinish.toISOString();

    // Calculate float
    const earliestStart = new Date(task.earliestStart || task.startDate);
    task.totalFloat = calculateTotalFloat(earliestStart, latestStart);
    task.freeFloat = calculateFreeFloat(
      task,
      updatedTasks,
      taskLinks,
      globalCalendar
    );

    // Determine if task is critical (zero float)
    task.isCritical = task.totalFloat === 0;

    visited.add(taskId);
    processing.delete(taskId);
  };

  // Visit all tasks in reverse dependency order
  const reverseOrder = [...updatedTasks].reverse();
  reverseOrder.forEach(task => visitTask(task.id));

  return updatedTasks;
};

/**
 * Perform complete scheduling (forward + backward pass)
 * @param {Array} allTasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Function} getCalendarForTask - Function to get calendar for a task
 * @returns {Object} Result with updated tasks and any errors
 */
export const performScheduling = (allTasks, taskLinks, getCalendarForTask) => {
  try {
    // Forward pass to calculate earliest dates
    let updatedTasks = performForwardPass(
      allTasks,
      taskLinks,
      getCalendarForTask
    );

    // Backward pass to calculate latest dates and float
    updatedTasks = performBackwardPass(
      updatedTasks,
      taskLinks,
      getCalendarForTask
    );

    // Calculate critical path
    updatedTasks = calculateCriticalPath(updatedTasks, taskLinks, getCalendarForTask);

    return {
      tasks: updatedTasks,
      errors: [],
      success: true,
    };
  } catch (error) {
    return {
      tasks: allTasks,
      errors: [error.message],
      success: false,
    };
  }
};

/**
 * Check for circular dependencies in the project
 * @param {Array} taskLinks - Task dependency links
 * @returns {Array} Array of circular dependency paths
 */
export const detectCircularDependencies = taskLinks => {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  const dfs = (taskId, path = []) => {
    if (recursionStack.has(taskId)) {
      const cycleStart = path.indexOf(taskId);
      cycles.push([...path.slice(cycleStart), taskId]);
      return;
    }
    if (visited.has(taskId)) return;

    visited.add(taskId);
    recursionStack.add(taskId);
    path.push(taskId);

    const successors = getSuccessors(taskId, taskLinks);
    successors.forEach(link => {
      dfs(link.toTaskId, [...path]);
    });

    recursionStack.delete(taskId);
  };

  // Get all unique task IDs
  const allTaskIds = new Set();
  taskLinks.forEach(link => {
    allTaskIds.add(link.fromTaskId);
    allTaskIds.add(link.toTaskId);
  });

  allTaskIds.forEach(taskId => {
    if (!visited.has(taskId)) {
      dfs(taskId);
    }
  });

  return cycles;
};

/**
 * Validate task links for consistency
 * @param {Array} taskLinks - Task dependency links
 * @param {Array} allTasks - All tasks in the project
 * @returns {Array} Array of validation errors
 */
export const validateTaskLinks = (taskLinks, allTasks) => {
  const errors = [];
  const taskIds = new Set(allTasks.map(t => t.id));

  taskLinks.forEach((link, index) => {
    if (!taskIds.has(link.fromTaskId)) {
      errors.push(
        `Link ${index}: Predecessor task ${link.fromTaskId} does not exist`
      );
    }
    if (!taskIds.has(link.toTaskId)) {
      errors.push(
        `Link ${index}: Successor task ${link.toTaskId} does not exist`
      );
    }
    if (link.fromTaskId === link.toTaskId) {
      errors.push(`Link ${index}: Task cannot depend on itself`);
    }
    if (!Object.values(LINK_TYPES).includes(link.type)) {
      errors.push(`Link ${index}: Invalid link type ${link.type}`);
    }
  });

  return errors;
};
