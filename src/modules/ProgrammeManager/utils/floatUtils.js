/**
 * Float Utilities
 * Handle float/slack calculation display and formatting
 */

/**
 * Format float value for display
 * @param {number} float - Float value in days
 * @returns {string} Formatted float string
 */
export const formatFloat = float => {
  if (float === undefined || float === null) {
    return '-';
  }

  if (float === 0) {
    return '0d';
  }

  return `${float}d`;
};

/**
 * Get float styling based on value
 * @param {number} float - Float value in days
 * @param {string} type - Type of float ('total' or 'free')
 * @returns {Object} Styling information
 */
export const getFloatStyling = (float, type = 'total') => {
  if (float === undefined || float === null) {
    return {
      color: 'text-gray-400',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      icon: '📊',
      tooltip: 'No float data available',
    };
  }

  if (float === 0) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      icon: '🔴',
      tooltip: `${type === 'total' ? 'Total' : 'Free'} float is zero - task is critical`,
    };
  }

  if (float <= 1) {
    return {
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      icon: '⚠️',
      tooltip: `${type === 'total' ? 'Total' : 'Free'} float is very low (${float} day)`,
    };
  }

  if (float <= 3) {
    return {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      icon: '⚡',
      tooltip: `${type === 'total' ? 'Total' : 'Free'} float is low (${float} days)`,
    };
  }

  return {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: '✅',
    tooltip: `${type === 'total' ? 'Total' : 'Free'} float is good (${float} days)`,
  };
};

/**
 * Get float tooltip content
 * @param {Object} task - Task object
 * @param {string} type - Type of float ('total' or 'free')
 * @returns {string} Tooltip text
 */
export const getFloatTooltip = (task, type = 'total') => {
  const float = type === 'total' ? task.totalFloat : task.freeFloat;

  if (float === undefined || float === null) {
    return `${type === 'total' ? 'Total' : 'Free'} float data not available`;
  }

  let tooltip = `${type === 'total' ? 'Total' : 'Free'} Float: ${formatFloat(float)}\n`;

  if (type === 'total') {
    tooltip +=
      'Total float is the maximum delay a task can have without delaying the project completion.\n';

    if (float === 0) {
      tooltip +=
        'This task is on the critical path - any delay will delay the project.';
    } else if (float <= 1) {
      tooltip += 'Very low float - task has minimal flexibility.';
    } else if (float <= 3) {
      tooltip += 'Low float - task has limited flexibility.';
    } else {
      tooltip += 'Good float - task has reasonable flexibility.';
    }
  } else {
    tooltip +=
      'Free float is the maximum delay a task can have without delaying any successor tasks.\n';

    if (float === 0) {
      tooltip +=
        'This task has no free float - any delay will affect successors.';
    } else if (float <= 1) {
      tooltip += 'Very low free float - minimal flexibility for successors.';
    } else if (float <= 3) {
      tooltip += 'Low free float - limited flexibility for successors.';
    } else {
      tooltip += 'Good free float - reasonable flexibility for successors.';
    }
  }

  return tooltip;
};

/**
 * Get float summary for multiple tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Float summary statistics
 */
export const getFloatSummary = tasks => {
  const summary = {
    total: tasks.length,
    withTotalFloat: 0,
    withFreeFloat: 0,
    criticalTasks: 0,
    lowFloatTasks: 0,
    goodFloatTasks: 0,
    averageTotalFloat: 0,
    averageFreeFloat: 0,
  };

  let totalFloatSum = 0;
  let freeFloatSum = 0;

  tasks.forEach(task => {
    if (task.totalFloat !== undefined && task.totalFloat !== null) {
      summary.withTotalFloat++;
      totalFloatSum += task.totalFloat;

      if (task.totalFloat === 0) {
        summary.criticalTasks++;
      } else if (task.totalFloat <= 3) {
        summary.lowFloatTasks++;
      } else {
        summary.goodFloatTasks++;
      }
    }

    if (task.freeFloat !== undefined && task.freeFloat !== null) {
      summary.withFreeFloat++;
      freeFloatSum += task.freeFloat;
    }
  });

  summary.averageTotalFloat =
    summary.withTotalFloat > 0
      ? Math.round(totalFloatSum / summary.withTotalFloat)
      : 0;
  summary.averageFreeFloat =
    summary.withFreeFloat > 0
      ? Math.round(freeFloatSum / summary.withFreeFloat)
      : 0;

  return summary;
};

/**
 * Check if float display should be enabled
 * @param {Object} viewState - View state object
 * @returns {boolean} True if float display is enabled
 */
export const isFloatDisplayEnabled = viewState => {
  return viewState.showSlack === true;
};

/**
 * Get float display position for Gantt bars
 * @param {Object} task - Task object
 * @param {number} barWidth - Width of the task bar in pixels
 * @returns {Object} Position information for float display
 */
export const getFloatDisplayPosition = (task, barWidth) => {
  const totalFloat = task.totalFloat || 0;
  const freeFloat = task.freeFloat || 0;

  // Only show float if it's low (≤ 3 days) or zero
  const shouldShowTotalFloat = totalFloat <= 3;
  const shouldShowFreeFloat = freeFloat <= 3 && freeFloat !== totalFloat;

  if (!shouldShowTotalFloat && !shouldShowFreeFloat) {
    return null;
  }

  return {
    showTotalFloat: shouldShowTotalFloat,
    showFreeFloat: shouldShowFreeFloat,
    totalFloatText: shouldShowTotalFloat ? `TF:${totalFloat}` : '',
    freeFloatText: shouldShowFreeFloat ? `FF:${freeFloat}` : '',
    position: 'top', // or 'bottom', 'inside'
    offset: 2,
  };
};

/**
 * Format float for Gantt bar display
 * @param {number} float - Float value
 * @param {string} type - Type of float ('TF' for total, 'FF' for free)
 * @returns {string} Formatted string for Gantt display
 */
export const formatFloatForGantt = (float, type = 'TF') => {
  if (float === undefined || float === null) {
    return '';
  }

  if (float === 0) {
    return `${type}:0`;
  }

  return `${type}:${float}`;
};

/**
 * Get float status for a task
 * @param {Object} task - Task object
 * @returns {string} Float status description
 */
export const getFloatStatus = task => {
  const totalFloat = task.totalFloat || 0;
  const freeFloat = task.freeFloat || 0;

  if (totalFloat === 0) {
    return 'Critical';
  } else if (totalFloat <= 1) {
    return 'Very Low Float';
  } else if (totalFloat <= 3) {
    return 'Low Float';
  } else if (freeFloat === 0) {
    return 'No Free Float';
  } else {
    return 'Good Float';
  }
};

/**
 * Get float status styling
 * @param {Object} task - Task object
 * @returns {Object} Status styling
 */
export const getFloatStatusStyling = task => {
  const status = getFloatStatus(task);

  switch (status) {
    case 'Critical':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '🔴',
      };
    case 'Very Low Float':
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        icon: '⚠️',
      };
    case 'Low Float':
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        icon: '⚡',
      };
    case 'No Free Float':
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        icon: '📊',
      };
    case 'Good Float':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: '✅',
      };
    default:
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '��',
      };
  }
};
