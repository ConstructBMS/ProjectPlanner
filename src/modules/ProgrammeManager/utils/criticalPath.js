/**
 * Critical Path Analysis Utility
 * Implements forward/backward pass algorithm to compute earliest/latest dates and identify critical tasks
 */

/**
 * Calculate the critical path for a set of tasks
 * @param {Array} tasks - Array of task objects with id, startDate, endDate, duration, and dependencies
 * @param {Array} taskLinks - Array of link objects with fromId, toId, type, lag
 * @returns {Array} Array of task IDs that are on the critical path (total float = 0)
 */
export function calculateCriticalPath(tasks, taskLinks) {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  // Create a map of tasks by ID for easier lookup
  const taskMap = new Map(tasks.map(task => [task.id, { ...task }]));

  // Create adjacency lists for predecessors and successors
  const predecessors = new Map();
  const successors = new Map();

  // Initialize maps
  tasks.forEach(task => {
    predecessors.set(task.id, []);
    successors.set(task.id, []);
  });

  // Build dependency relationships from taskLinks
  taskLinks.forEach(link => {
    const fromTask = taskMap.get(link.fromId);
    const toTask = taskMap.get(link.toId);

    if (fromTask && toTask) {
      // Add predecessor relationship
      const predList = predecessors.get(link.toId) || [];
      predList.push({
        taskId: link.fromId,
        type: link.type,
        lag: link.lag || 0,
      });
      predecessors.set(link.toId, predList);

      // Add successor relationship
      const succList = successors.get(link.fromId) || [];
      succList.push({
        taskId: link.toId,
        type: link.type,
        lag: link.lag || 0,
      });
      successors.set(link.fromId, succList);
    }
  });

  // Forward Pass - Calculate Earliest Start (ES) and Earliest Finish (EF)
  const forwardPass = () => {
    const visited = new Set();
    const queue = [];

    // Find tasks with no predecessors (start tasks)
    tasks.forEach(task => {
      const preds = predecessors.get(task.id) || [];
      if (preds.length === 0) {
        queue.push(task.id);
      }
    });

    while (queue.length > 0) {
      const taskId = queue.shift();
      if (visited.has(taskId)) continue;

      visited.add(taskId);
      const task = taskMap.get(taskId);
      const preds = predecessors.get(taskId) || [];

      // Calculate earliest start based on predecessors
      let earliestStart = new Date(task.startDate);
      if (preds.length > 0) {
        let maxEarliestFinish = new Date(0);
        preds.forEach(pred => {
          const predTask = taskMap.get(pred.taskId);
          if (predTask) {
            const predFinish = new Date(
              predTask.earliestFinish || predTask.endDate
            );

            // Apply lag/lead time
            predFinish.setDate(predFinish.getDate() + pred.lag);

            if (predFinish > maxEarliestFinish) {
              maxEarliestFinish = predFinish;
            }
          }
        });
        earliestStart = maxEarliestFinish;
      }

      // Calculate earliest finish
      const earliestFinish = new Date(earliestStart);
      earliestFinish.setDate(earliestFinish.getDate() + (task.duration || 1));

      // Store calculated values
      task.earliestStart = earliestStart;
      task.earliestFinish = earliestFinish;

      // Add successors to queue
      const succs = successors.get(taskId) || [];
      succs.forEach(succ => {
        const succPreds = predecessors.get(succ.taskId) || [];
        const allPredsVisited = succPreds.every(pred =>
          visited.has(pred.taskId)
        );
        if (allPredsVisited && !queue.includes(succ.taskId)) {
          queue.push(succ.taskId);
        }
      });
    }
  };

  // Backward Pass - Calculate Latest Start (LS) and Latest Finish (LF)
  const backwardPass = () => {
    const visited = new Set();
    const queue = [];

    // Find tasks with no successors (end tasks)
    tasks.forEach(task => {
      const succs = successors.get(task.id) || [];
      if (succs.length === 0) {
        queue.push(task.id);
      }
    });

    while (queue.length > 0) {
      const taskId = queue.shift();
      if (visited.has(taskId)) continue;

      visited.add(taskId);
      const task = taskMap.get(taskId);
      const succs = successors.get(task.id) || [];

      // Calculate latest finish based on successors
      let latestFinish = task.earliestFinish; // Default to earliest finish for end tasks
      if (succs.length > 0) {
        let minLatestStart = new Date(8640000000000000); // Max date
        succs.forEach(succ => {
          const succTask = taskMap.get(succ.taskId);
          if (succTask) {
            const succStart = new Date(
              succTask.latestStart || succTask.earliestStart
            );

            // Apply lag/lead time
            succStart.setDate(succStart.getDate() - succ.lag);

            if (succStart < minLatestStart) {
              minLatestStart = succStart;
            }
          }
        });
        latestFinish = minLatestStart;
      }

      // Calculate latest start
      const latestStart = new Date(latestFinish);
      latestStart.setDate(latestStart.getDate() - (task.duration || 1));

      // Store calculated values
      task.latestStart = latestStart;
      task.latestFinish = latestFinish;

      // Calculate total float
      task.totalFloat = Math.max(
        0,
        (latestStart - task.earliestStart) / (1000 * 60 * 60 * 24)
      );

      // Add predecessors to queue
      const preds = predecessors.get(taskId) || [];
      preds.forEach(pred => {
        const predSuccs = successors.get(pred.taskId) || [];
        const allSuccsVisited = predSuccs.every(succ =>
          visited.has(succ.taskId)
        );
        if (allSuccsVisited && !queue.includes(pred.taskId)) {
          queue.push(pred.taskId);
        }
      });
    }
  };

  // Execute forward and backward passes
  forwardPass();
  backwardPass();

  // Identify critical tasks (total float = 0)
  const criticalTasks = [];
  tasks.forEach(task => {
    const taskWithFloat = taskMap.get(task.id);
    if (taskWithFloat && taskWithFloat.totalFloat === 0) {
      criticalTasks.push(task.id);
    }
  });

  return criticalTasks;
}

/**
 * Get the total project duration based on critical path
 * @param {Array} tasks - Array of task objects
 * @param {Array} taskLinks - Array of link objects
 * @returns {number} Project duration in days
 */
export function getProjectDuration(tasks, taskLinks) {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  // Calculate critical path first
  calculateCriticalPath(tasks, taskLinks);

  // Find the maximum earliest finish time
  let maxFinish = new Date(0);
  tasks.forEach(task => {
    if (task.earliestFinish && task.earliestFinish > maxFinish) {
      maxFinish = task.earliestFinish;
    }
  });

  // Find the minimum earliest start time
  let minStart = new Date(8640000000000000);
  tasks.forEach(task => {
    if (task.earliestStart && task.earliestStart < minStart) {
      minStart = task.earliestStart;
    }
  });

  // Calculate duration in days
  const durationMs = maxFinish - minStart;
  return Math.ceil(durationMs / (1000 * 60 * 60 * 24));
}

/**
 * Get task float information
 * @param {string} taskId - Task ID
 * @param {Array} tasks - Array of task objects
 * @param {Array} taskLinks - Array of link objects
 * @returns {Object} Float information for the task
 */
export function getTaskFloat(taskId, tasks, taskLinks) {
  if (!tasks || tasks.length === 0) {
    return { totalFloat: 0, freeFloat: 0, isCritical: false };
  }

  // Calculate critical path first
  calculateCriticalPath(tasks, taskLinks);

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return { totalFloat: 0, freeFloat: 0, isCritical: false };
  }

  return {
    totalFloat: task.totalFloat || 0,
    freeFloat: task.freeFloat || 0,
    isCritical: task.totalFloat === 0,
  };
}
