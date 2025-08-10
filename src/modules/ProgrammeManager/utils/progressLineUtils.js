/**
 * Progress Line Utilities
 * Calculate task status relative to a progress line (status date)
 */

import { addDays, isWorkday, snapToWorkday } from './calendarUtils';

/**
 * Calculate task status relative to progress line
 * @param {Object} task - Task object
 * @param {Date} statusDate - Progress line date
 * @param {Object} globalCalendar - Global calendar for working days
 * @returns {Object} Task status information
 */
export const calculateTaskProgressStatus = (
  task,
  statusDate,
  globalCalendar
) => {
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);
  const progress = task.progress || 0;

  // Calculate expected progress at status date
  let expectedProgress = 0;
  let isCompleted = false;
  let isStarted = false;
  let isBehind = false;
  let isAhead = false;
  let status = 'Not Started';

  if (statusDate < taskStart) {
    // Status date is before task starts
    expectedProgress = 0;
    status = 'Not Started';
  } else if (statusDate >= taskEnd) {
    // Status date is after task should be complete
    expectedProgress = 100;
    isCompleted = true;
    if (progress >= 100) {
      status = 'Completed';
    } else {
      status = 'Behind';
      isBehind = true;
    }
  } else {
    // Status date is during task execution
    isStarted = true;
    const totalDuration = Math.ceil(
      (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (statusDate.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    expectedProgress = Math.min(
      100,
      Math.max(0, (elapsedDays / totalDuration) * 100)
    );

    if (progress >= expectedProgress + 10) {
      status = 'Ahead';
      isAhead = true;
    } else if (progress < expectedProgress - 10) {
      status = 'Behind';
      isBehind = true;
    } else {
      status = 'On Track';
    }
  }

  // Calculate progress variance
  const progressVariance = progress - expectedProgress;

  // Calculate schedule variance (days ahead/behind)
  let scheduleVariance = 0;
  if (progress > 0 && progress < 100) {
    // Task is in progress - calculate how many days ahead/behind
    const actualElapsedDays =
      (progress / 100) *
      Math.ceil(
        (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
      );
    const expectedElapsedDays = Math.ceil(
      (statusDate.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    scheduleVariance = actualElapsedDays - expectedElapsedDays;
  } else if (progress >= 100 && statusDate < taskEnd) {
    // Task completed early
    scheduleVariance = Math.ceil(
      (taskEnd.getTime() - statusDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  } else if (progress < 100 && statusDate >= taskEnd) {
    // Task is behind schedule
    const remainingProgress = 100 - progress;
    const totalDuration = Math.ceil(
      (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysBehind = (remainingProgress / 100) * totalDuration;
    scheduleVariance = -daysBehind;
  }

  return {
    status,
    expectedProgress,
    actualProgress: progress,
    progressVariance,
    scheduleVariance,
    isCompleted,
    isStarted,
    isBehind,
    isAhead,
    isOnTrack: !isBehind && !isAhead,
  };
};

/**
 * Get status color and styling
 * @param {string} status - Task status
 * @returns {Object} Color and styling information
 */
export const getStatusStyling = status => {
  switch (status) {
    case 'Ahead':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: '✓',
        tooltip: 'Task is ahead of schedule',
      };
    case 'Behind':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '⚠',
        tooltip: 'Task is behind schedule',
      };
    case 'On Track':
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        icon: '●',
        tooltip: 'Task is on track',
      };
    case 'Completed':
      return {
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '✓',
        tooltip: 'Task is completed',
      };
    case 'Not Started':
    default:
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '○',
        tooltip: 'Task has not started',
      };
  }
};

/**
 * Calculate progress line position in Gantt chart
 * @param {Date} statusDate - Progress line date
 * @param {Date} projectStart - Project start date
 * @param {number} scaledDayWidth - Pixels per day
 * @returns {number} X position in pixels
 */
export const calculateProgressLinePosition = (
  statusDate,
  projectStart,
  scaledDayWidth
) => {
  const daysFromStart = Math.ceil(
    (statusDate.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, daysFromStart * scaledDayWidth);
};

/**
 * Calculate task progress indicator position and size
 * @param {Object} task - Task object
 * @param {Object} progressStatus - Task progress status
 * @param {Date} statusDate - Progress line date
 * @param {number} scaledDayWidth - Pixels per day
 * @returns {Object} Indicator positioning and styling
 */
export const calculateProgressIndicator = (
  task,
  progressStatus,
  statusDate,
  scaledDayWidth
) => {
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);
  const taskDuration = Math.ceil(
    (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  let indicatorPosition = 0;
  let indicatorWidth = 0;
  let indicatorType = 'none';

  if (progressStatus.isBehind) {
    // Show red segment from current position to where it should be
    const currentPosition =
      (progressStatus.actualProgress / 100) * taskDuration;
    const expectedPosition =
      (progressStatus.expectedProgress / 100) * taskDuration;

    indicatorPosition = currentPosition * scaledDayWidth;
    indicatorWidth = Math.max(
      0,
      (expectedPosition - currentPosition) * scaledDayWidth
    );
    indicatorType = 'behind';
  } else if (progressStatus.isAhead) {
    // Show green tick at current position
    const currentPosition =
      (progressStatus.actualProgress / 100) * taskDuration;

    indicatorPosition = currentPosition * scaledDayWidth;
    indicatorWidth = 4; // Small tick width
    indicatorType = 'ahead';
  } else if (progressStatus.isOnTrack) {
    // Show small indicator at expected position
    const expectedPosition =
      (progressStatus.expectedProgress / 100) * taskDuration;

    indicatorPosition = expectedPosition * scaledDayWidth;
    indicatorWidth = 2; // Small dot width
    indicatorType = 'on-track';
  }

  return {
    position: indicatorPosition,
    width: indicatorWidth,
    type: indicatorType,
    status: progressStatus.status,
  };
};

/**
 * Get project-wide progress statistics
 * @param {Array} tasks - All tasks in the project
 * @param {Date} statusDate - Progress line date
 * @param {Object} globalCalendar - Global calendar
 * @returns {Object} Project progress statistics
 */
export const getProjectProgressStats = (tasks, statusDate, globalCalendar) => {
  const stats = {
    totalTasks: tasks.length,
    aheadTasks: 0,
    behindTasks: 0,
    onTrackTasks: 0,
    completedTasks: 0,
    notStartedTasks: 0,
    averageProgress: 0,
    overallStatus: 'Unknown',
  };

  let totalProgress = 0;

  tasks.forEach(task => {
    const progressStatus = calculateTaskProgressStatus(
      task,
      statusDate,
      globalCalendar
    );
    totalProgress += progressStatus.actualProgress;

    switch (progressStatus.status) {
      case 'Ahead':
        stats.aheadTasks++;
        break;
      case 'Behind':
        stats.behindTasks++;
        break;
      case 'On Track':
        stats.onTrackTasks++;
        break;
      case 'Completed':
        stats.completedTasks++;
        break;
      case 'Not Started':
        stats.notStartedTasks++;
        break;
    }
  });

  stats.averageProgress = tasks.length > 0 ? totalProgress / tasks.length : 0;

  // Determine overall project status
  if (stats.behindTasks > stats.aheadTasks + stats.onTrackTasks) {
    stats.overallStatus = 'Behind';
  } else if (stats.aheadTasks > stats.behindTasks) {
    stats.overallStatus = 'Ahead';
  } else {
    stats.overallStatus = 'On Track';
  }

  return stats;
};

/**
 * Format progress variance for display
 * @param {number} variance - Progress variance percentage
 * @returns {string} Formatted variance string
 */
export const formatProgressVariance = variance => {
  if (Math.abs(variance) < 1) return '0%';
  if (variance > 0) return `+${variance.toFixed(1)}%`;
  return `${variance.toFixed(1)}%`;
};

/**
 * Format schedule variance for display
 * @param {number} variance - Schedule variance in days
 * @returns {string} Formatted variance string
 */
export const formatScheduleVariance = variance => {
  if (Math.abs(variance) < 1) return '0d';
  if (variance > 0) return `+${Math.round(variance)}d`;
  return `${Math.round(variance)}d`;
};
