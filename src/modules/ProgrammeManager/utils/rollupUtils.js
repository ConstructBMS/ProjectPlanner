import { diffWorkdays } from './calendarUtils';

/**
 * Calculate rollup values for a summary task based on its children
 * @param {Object} summaryTask - The summary task
 * @param {Array} allTasks - All tasks in the project
 * @param {Object} globalCalendar - Global calendar settings
 * @returns {Object} Rollup values { startDate, endDate, duration, progress }
 */
export const calculateRollupValues = (
  summaryTask,
  allTasks,
  globalCalendar
) => {
  const children = allTasks.filter(task => task.parentId === summaryTask.id);

  if (children.length === 0) {
    return {
      startDate: summaryTask.startDate,
      endDate: summaryTask.endDate,
      duration: summaryTask.duration || 0,
      progress: summaryTask.progress || 0,
    };
  }

  // Calculate date range from children
  const childStartDates = children.map(child => new Date(child.startDate));
  const childEndDates = children.map(child => new Date(child.endDate));

  const startDate = new Date(Math.min(...childStartDates));
  const endDate = new Date(Math.max(...childEndDates));

  // Calculate duration in workdays
  const duration = diffWorkdays(startDate, endDate, globalCalendar);

  // Calculate weighted progress based on child durations
  const totalChildDuration = children.reduce(
    (sum, child) => sum + (child.duration || 0),
    0
  );

  let progress = 0;
  if (totalChildDuration > 0) {
    progress = children.reduce((sum, child) => {
      const childWeight = (child.duration || 0) / totalChildDuration;
      return sum + (child.progress || 0) * childWeight;
    }, 0);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    duration: Math.max(0, duration),
    progress: Math.min(100, Math.max(0, progress)),
  };
};

/**
 * Get all descendants of a task (children, grandchildren, etc.)
 * @param {string} taskId - The task ID
 * @param {Array} allTasks - All tasks in the project
 * @returns {Array} Array of descendant task IDs
 */
export const getTaskDescendants = (taskId, allTasks) => {
  const descendants = new Set();
  const queue = [taskId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    allTasks.forEach(task => {
      if (task.parentId === currentId) {
        descendants.add(task.id);
        queue.push(task.id);
      }
    });
  }

  return Array.from(descendants);
};

/**
 * Get all ancestors of a task (parent, grandparent, etc.)
 * @param {string} taskId - The task ID
 * @param {Array} allTasks - All tasks in the project
 * @returns {Array} Array of ancestor task IDs
 */
export const getTaskAncestors = (taskId, allTasks) => {
  const ancestors = [];
  let currentTask = allTasks.find(task => task.id === taskId);

  while (currentTask && currentTask.parentId) {
    ancestors.unshift(currentTask.parentId);
    currentTask = allTasks.find(task => task.id === currentTask.parentId);
  }

  return ancestors;
};

/**
 * Check if a task is visible (not hidden by collapsed parent)
 * @param {Object} task - The task to check
 * @param {Array} allTasks - All tasks in the project
 * @returns {boolean} True if task should be visible
 */
export const isTaskVisible = (task, allTasks) => {
  const ancestors = getTaskAncestors(task.id, allTasks);

  for (const ancestorId of ancestors) {
    const ancestor = allTasks.find(t => t.id === ancestorId);
    if (ancestor && ancestor.isGroup && !ancestor.isExpanded) {
      return false;
    }
  }

  return true;
};

/**
 * Get hierarchical tasks with proper ordering
 * @param {Array} allTasks - All tasks in the project
 * @returns {Array} Hierarchical tasks array
 */
export const getHierarchicalTasks = allTasks => {
  const taskMap = new Map(
    allTasks.map(task => [task.id, { ...task, children: [] }])
  );

  allTasks.forEach(task => {
    if (task.parentId && taskMap.has(task.parentId)) {
      taskMap.get(task.parentId).children.push(taskMap.get(task.id));
    }
  });

  const buildHierarchy = (parentId = null) => {
    return Array.from(taskMap.values())
      .filter(task => task.parentId === parentId)
      .sort((a, b) => {
        const indexA = allTasks.findIndex(t => t.id === a.id);
        const indexB = allTasks.findIndex(t => t.id === b.id);
        return indexA - indexB;
      })
      .map(task => ({
        ...task,
        children: buildHierarchy(task.id),
      }));
  };

  return buildHierarchy();
};

/**
 * Get visible tasks considering collapsed groups
 * @param {Array} allTasks - All tasks in the project
 * @returns {Array} Array of visible tasks
 */
export const getVisibleTasks = allTasks => {
  const visible = new Set();
  const queue = [...getHierarchicalTasks(allTasks)];

  while (queue.length > 0) {
    const currentTask = queue.shift();
    visible.add(currentTask.id);

    if (currentTask.isGroup && !currentTask.isExpanded) {
      // If it's a collapsed group, skip its children
      continue;
    }

    // Add children to the queue in order
    if (currentTask.children && currentTask.children.length > 0) {
      queue.unshift(...currentTask.children.slice().reverse()); // Add to front for correct order
    }
  }

  return allTasks.filter(task => visible.has(task.id));
};

/**
 * Update summary task with rollup values
 * @param {Object} summaryTask - The summary task to update
 * @param {Array} allTasks - All tasks in the project
 * @param {Object} globalCalendar - Global calendar settings
 * @returns {Object} Updated summary task
 */
export const updateSummaryTask = (summaryTask, allTasks, globalCalendar) => {
  const rollupValues = calculateRollupValues(
    summaryTask,
    allTasks,
    globalCalendar
  );

  return {
    ...summaryTask,
    startDate: rollupValues.startDate,
    endDate: rollupValues.endDate,
    duration: rollupValues.duration,
    progress: rollupValues.progress,
    isSummary: true,
  };
};

/**
 * Update all summary tasks in the project
 * @param {Array} allTasks - All tasks in the project
 * @param {Object} globalCalendar - Global calendar settings
 * @returns {Array} Updated tasks array
 */
export const updateAllSummaryTasks = (allTasks, globalCalendar) => {
  const summaryTasks = allTasks.filter(task => task.isGroup);

  return allTasks.map(task => {
    if (summaryTasks.some(summary => summary.id === task.id)) {
      return updateSummaryTask(task, allTasks, globalCalendar);
    }
    return task;
  });
};
