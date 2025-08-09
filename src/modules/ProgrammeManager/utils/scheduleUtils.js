import { addDays } from './dateUtils';

/**
 * Clamp a date to workdays (skip weekends)
 * @param {Date} date - The date to clamp
 * @param {boolean} showWeekends - Whether weekends are enabled
 * @returns {Date} - The clamped date
 */
export const clampToWorkdays = (date, showWeekends = false) => {
  if (showWeekends) return date;
  
  const clamped = new Date(date);
  while (clamped.getDay() === 0 || clamped.getDay() === 6) {
    clamped.setDate(clamped.getDate() + 1);
  }
  return clamped;
};

/**
 * Respect FS (Finish-to-Start) dependencies when calculating start date
 * @param {Array} predecessors - Array of predecessor tasks
 * @param {Date} candidateStart - The candidate start date
 * @param {boolean} showWeekends - Whether weekends are enabled
 * @returns {Date} - The adjusted start date respecting FS constraints
 */
export const respectFS = (predecessors, candidateStart, showWeekends = false) => {
  if (!predecessors || predecessors.length === 0) {
    return clampToWorkdays(candidateStart, showWeekends);
  }

  let latestPredecessorEnd = new Date(candidateStart);
  
  predecessors.forEach(pred => {
    const predEnd = new Date(pred.endDate);
    const lag = pred.lag || 0;
    const adjustedEnd = addDays(predEnd, lag);
    
    if (adjustedEnd > latestPredecessorEnd) {
      latestPredecessorEnd = adjustedEnd;
    }
  });

  return clampToWorkdays(latestPredecessorEnd, showWeekends);
};

/**
 * Calculate minimum valid duration for a task
 * @param {Object} task - The task object
 * @returns {number} - Minimum duration in days
 */
export const getMinDuration = (task) => {
  // Milestones have 0 duration
  if (task.type === 'milestone' || task.isMilestone) {
    return 0;
  }
  
  // Regular tasks have minimum 1 day duration
  return 1;
};

/**
 * Validate and adjust task dates based on constraints
 * @param {Object} task - The task object
 * @param {Date} candidateStart - Candidate start date
 * @param {Date} candidateEnd - Candidate end date
 * @param {Array} predecessors - Array of predecessor tasks
 * @param {boolean} showWeekends - Whether weekends are enabled
 * @returns {Object} - { startDate, endDate, wasConstrained }
 */
export const validateTaskDates = (task, candidateStart, candidateEnd, predecessors, showWeekends = false) => {
  let startDate = new Date(candidateStart);
  let endDate = new Date(candidateEnd);
  let wasConstrained = false;

  // Respect FS dependencies for start date
  const fsConstrainedStart = respectFS(predecessors, startDate, showWeekends);
  if (fsConstrainedStart > startDate) {
    startDate = fsConstrainedStart;
    wasConstrained = true;
  }

  // Ensure minimum duration
  const minDuration = getMinDuration(task);
  const currentDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (currentDuration < minDuration) {
    endDate = addDays(startDate, minDuration);
    endDate = clampToWorkdays(endDate, showWeekends);
    wasConstrained = true;
  }

  // Ensure end date is not before start date
  if (endDate <= startDate) {
    endDate = addDays(startDate, minDuration);
    endDate = clampToWorkdays(endDate, showWeekends);
    wasConstrained = true;
  }

  return {
    startDate,
    endDate,
    wasConstrained
  };
};

/**
 * Get predecessor tasks for a given task
 * @param {string} taskId - The task ID
 * @param {Array} taskLinks - Array of task links
 * @param {Array} tasks - Array of all tasks
 * @returns {Array} - Array of predecessor tasks with link information
 */
export const getPredecessors = (taskId, taskLinks, tasks) => {
  return taskLinks
    .filter(link => link.toId === taskId)
    .map(link => {
      const task = tasks.find(t => t.id === link.fromId);
      return task ? { ...task, lag: link.lag || 0, linkType: link.type } : null;
    })
    .filter(Boolean);
};
