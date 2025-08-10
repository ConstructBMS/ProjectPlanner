/**
 * Deadline Utilities
 * Handle deadline tracking and status calculations
 */

/**
 * Calculate deadline status for a task
 * @param {Object} task - Task object
 * @returns {Object} Deadline status information
 */
export const calculateDeadlineStatus = (task) => {
  if (!task.deadline) {
    return {
      hasDeadline: false,
      status: 'none',
      isOverdue: false,
      daysUntilDeadline: null,
      daysOverdue: null,
      message: 'No deadline set',
      severity: 'none',
    };
  }

  const deadline = new Date(task.deadline);
  const endDate = task.endDate ? new Date(task.endDate) : null;
  const today = new Date();
  
  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(0, 0, 0, 0);

  const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let status = 'none';
  let isOverdue = false;
  let daysOverdue = null;
  let message = '';
  let severity = 'none';

  if (endDate && endDate > deadline) {
    // Task finished after deadline
    daysOverdue = Math.ceil((endDate.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
    status = 'exceeded';
    isOverdue = true;
    message = `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
    severity = 'error';
  } else if (daysUntilDeadline < 0) {
    // Deadline has passed but task not finished
    status = 'passed';
    isOverdue = true;
    message = 'Deadline has passed';
    severity = 'error';
  } else if (daysUntilDeadline === 0) {
    // Deadline is today
    status = 'today';
    message = 'Deadline is today';
    severity = 'warning';
  } else if (daysUntilDeadline <= 7) {
    // Deadline is approaching
    status = 'approaching';
    message = `Due in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}`;
    severity = 'warning';
  } else {
    // Deadline is far in the future
    status = 'on-track';
    message = `Due in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}`;
    severity = 'success';
  }

  return {
    hasDeadline: true,
    status,
    isOverdue,
    daysUntilDeadline,
    daysOverdue,
    message,
    severity,
  };
};

/**
 * Get deadline status styling
 * @param {string} status - Deadline status
 * @returns {Object} Styling information
 */
export const getDeadlineStatusStyling = (status) => {
  switch (status) {
    case 'exceeded':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '⚠️',
        tooltip: 'Deadline exceeded',
      };
    case 'passed':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '🚨',
        tooltip: 'Deadline has passed',
      };
    case 'today':
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        icon: '⏰',
        tooltip: 'Deadline is today',
      };
    case 'approaching':
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        icon: '⚠️',
        tooltip: 'Deadline approaching',
      };
    case 'on-track':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: '✅',
        tooltip: 'On track for deadline',
      };
    default:
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '📅',
        tooltip: 'No deadline set',
      };
  }
};

/**
 * Calculate deadline position in Gantt chart
 * @param {Date} deadline - Deadline date
 * @param {Date} projectStart - Project start date
 * @param {number} scaledDayWidth - Width per day in pixels
 * @returns {number} X position in pixels
 */
export const calculateDeadlinePosition = (deadline, projectStart, scaledDayWidth) => {
  const daysFromStart = Math.ceil((deadline.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysFromStart * scaledDayWidth);
};

/**
 * Get deadline tooltip content
 * @param {Object} task - Task object
 * @returns {string} Tooltip text
 */
export const getDeadlineTooltip = (task) => {
  if (!task.deadline) {
    return 'No deadline set';
  }

  const deadlineStatus = calculateDeadlineStatus(task);
  const deadline = new Date(task.deadline);
  
  let tooltip = `Deadline: ${deadline.toLocaleDateString()}\n`;
  tooltip += `${deadlineStatus.message}`;
  
  if (deadlineStatus.isOverdue && deadlineStatus.daysOverdue) {
    tooltip += `\nTask finished ${deadlineStatus.daysOverdue} day${deadlineStatus.daysOverdue !== 1 ? 's' : ''} late`;
  }
  
  return tooltip;
};

/**
 * Check if a task has a deadline warning
 * @param {Object} task - Task object
 * @returns {boolean} True if task has deadline warning
 */
export const hasDeadlineWarning = (task) => {
  if (!task.deadline) return false;
  
  const deadlineStatus = calculateDeadlineStatus(task);
  return deadlineStatus.isOverdue || deadlineStatus.status === 'today' || deadlineStatus.status === 'approaching';
};

/**
 * Get deadline warning level
 * @param {Object} task - Task object
 * @returns {string} Warning level: 'none', 'warning', 'error'
 */
export const getDeadlineWarningLevel = (task) => {
  if (!task.deadline) return 'none';
  
  const deadlineStatus = calculateDeadlineStatus(task);
  return deadlineStatus.severity;
};

/**
 * Format deadline for display
 * @param {string} deadline - Deadline date string
 * @returns {string} Formatted deadline string
 */
export const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline';
  
  const date = new Date(deadline);
  return date.toLocaleDateString();
};

/**
 * Get deadline status summary for multiple tasks
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Summary statistics
 */
export const getDeadlineSummary = (tasks) => {
  const summary = {
    total: tasks.length,
    withDeadlines: 0,
    onTrack: 0,
    approaching: 0,
    overdue: 0,
    exceeded: 0,
  };

  tasks.forEach(task => {
    const deadlineStatus = calculateDeadlineStatus(task);
    
    if (deadlineStatus.hasDeadline) {
      summary.withDeadlines++;
      
      switch (deadlineStatus.status) {
        case 'on-track':
          summary.onTrack++;
          break;
        case 'approaching':
        case 'today':
          summary.approaching++;
          break;
        case 'passed':
          summary.overdue++;
          break;
        case 'exceeded':
          summary.exceeded++;
          break;
      }
    }
  });

  return summary;
};
