/**
 * Recurring Task Utilities
 * Handle recurring task creation, generation, and management
 */

/**
 * Create a recurrence rule
 * @param {string} frequency - 'daily', 'weekly', 'monthly'
 * @param {number} interval - Number of units (e.g., every 2 weeks)
 * @param {Date} startDate - Start date for the series
 * @param {Date} endDate - End date for the series (optional)
 * @param {number} maxOccurrences - Maximum number of occurrences (optional)
 * @param {Array} weekdays - Array of weekdays for weekly recurrence (0-6, Sunday=0)
 * @param {number} dayOfMonth - Day of month for monthly recurrence (1-31)
 * @returns {Object} Recurrence rule object
 */
export const createRecurrenceRule = (
  frequency,
  interval,
  startDate,
  endDate = null,
  maxOccurrences = null,
  weekdays = null,
  dayOfMonth = null
) => {
  return {
    id: `recurrence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    frequency,
    interval,
    startDate: startDate.toISOString(),
    endDate: endDate ? endDate.toISOString() : null,
    maxOccurrences,
    weekdays,
    dayOfMonth,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Generate recurring task instances
 * @param {Object} baseTask - Original task with recurrence rule
 * @param {Date} projectStartDate - Project start date
 * @param {Date} projectEndDate - Project end date
 * @returns {Array} Array of generated task instances
 */
export const generateRecurringTasks = (
  baseTask,
  projectStartDate,
  projectEndDate
) => {
  if (!baseTask.recurrence || !baseTask.recurrence.isActive) {
    return [baseTask];
  }

  const rule = baseTask.recurrence;
  const instances = [];
  let currentDate = new Date(rule.startDate);
  let occurrenceCount = 0;

  // Set maximum occurrences based on rule or project constraints
  const maxOccurrences = rule.maxOccurrences || 100;
  const endDate = rule.endDate ? new Date(rule.endDate) : projectEndDate;

  while (
    currentDate <= endDate &&
    occurrenceCount < maxOccurrences &&
    currentDate <= projectEndDate
  ) {
    // Create task instance
    const instance = createTaskInstance(baseTask, currentDate, occurrenceCount);
    instances.push(instance);
    occurrenceCount++;

    // Calculate next occurrence date
    currentDate = getNextOccurrenceDate(currentDate, rule);
  }

  return instances;
};

/**
 * Create a task instance from the base task
 * @param {Object} baseTask - Original task
 * @param {Date} startDate - Start date for this instance
 * @param {number} instanceIndex - Index of this instance (0-based)
 * @returns {Object} Task instance
 */
const createTaskInstance = (baseTask, startDate, instanceIndex) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (baseTask.duration || 1) - 1);

  return {
    ...baseTask,
    id: `${baseTask.id}_${instanceIndex}`,
    originalTaskId: baseTask.id,
    instanceIndex,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isRecurringInstance: true,
    recurrenceSeriesId: baseTask.recurrence.id,
    name: getInstanceName(baseTask.name, instanceIndex),
  };
};

/**
 * Get the name for a task instance
 * @param {string} baseName - Original task name
 * @param {number} instanceIndex - Instance index
 * @returns {string} Instance name
 */
const getInstanceName = (baseName, instanceIndex) => {
  if (instanceIndex === 0) {
    return baseName;
  }
  return `${baseName} (${instanceIndex + 1})`;
};

/**
 * Calculate the next occurrence date based on recurrence rule
 * @param {Date} currentDate - Current occurrence date
 * @param {Object} rule - Recurrence rule
 * @returns {Date} Next occurrence date
 */
const getNextOccurrenceDate = (currentDate, rule) => {
  const nextDate = new Date(currentDate);

  switch (rule.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + rule.interval);
      break;

    case 'weekly':
      if (rule.weekdays && rule.weekdays.length > 0) {
        // Find next weekday in the specified days
        let found = false;
        let attempts = 0;
        while (!found && attempts < 14) {
          nextDate.setDate(nextDate.getDate() + 1);
          if (rule.weekdays.includes(nextDate.getDay())) {
            found = true;
          }
          attempts++;
        }
      } else {
        nextDate.setDate(nextDate.getDate() + 7 * rule.interval);
      }
      break;

    case 'monthly':
      if (rule.dayOfMonth) {
        // Recur on specific day of month
        nextDate.setMonth(nextDate.getMonth() + rule.interval);
        nextDate.setDate(rule.dayOfMonth);
      } else {
        // Recur on same day of month
        nextDate.setMonth(nextDate.getMonth() + rule.interval);
      }
      break;

    default:
      nextDate.setDate(nextDate.getDate() + rule.interval);
  }

  return nextDate;
};

/**
 * Check if a task is part of a recurring series
 * @param {Object} task - Task object
 * @returns {boolean} True if task is recurring
 */
export const isRecurringTask = task => {
  return task.recurrence && task.recurrence.isActive;
};

/**
 * Check if a task is a recurring instance
 * @param {Object} task - Task object
 * @returns {boolean} True if task is a recurring instance
 */
export const isRecurringInstance = task => {
  return task.isRecurringInstance === true;
};

/**
 * Get all instances of a recurring series
 * @param {Array} allTasks - All tasks in the project
 * @param {string} seriesId - Recurrence series ID
 * @returns {Array} Array of task instances in the series
 */
export const getRecurringSeriesInstances = (allTasks, seriesId) => {
  return allTasks
    .filter(
      task =>
        task.recurrenceSeriesId === seriesId ||
        (task.recurrence && task.recurrence.id === seriesId)
    )
    .sort((a, b) => a.instanceIndex - b.instanceIndex);
};

/**
 * Update all instances in a recurring series
 * @param {Array} allTasks - All tasks in the project
 * @param {string} seriesId - Recurrence series ID
 * @param {Object} updates - Updates to apply to all instances
 * @param {boolean} updateFutureOnly - Only update future instances
 * @returns {Array} Updated tasks array
 */
export const updateRecurringSeries = (
  allTasks,
  seriesId,
  updates,
  updateFutureOnly = false
) => {
  const instances = getRecurringSeriesInstances(allTasks, seriesId);
  const today = new Date();

  return allTasks.map(task => {
    const isInSeries =
      task.recurrenceSeriesId === seriesId ||
      (task.recurrence && task.recurrence.id === seriesId);

    if (!isInSeries) {
      return task;
    }

    // Check if this is a future instance
    const taskStartDate = new Date(task.startDate);
    const isFuture = taskStartDate >= today;

    if (updateFutureOnly && !isFuture) {
      return task;
    }

    // Apply updates, but preserve recurrence-specific fields
    const updatedTask = { ...task, ...updates };

    // Preserve recurrence fields
    if (task.recurrence) {
      updatedTask.recurrence = task.recurrence;
    }
    if (task.isRecurringInstance) {
      updatedTask.isRecurringInstance = task.isRecurringInstance;
      updatedTask.recurrenceSeriesId = task.recurrenceSeriesId;
      updatedTask.originalTaskId = task.originalTaskId;
      updatedTask.instanceIndex = task.instanceIndex;
    }

    return updatedTask;
  });
};

/**
 * Detach a recurring instance from its series
 * @param {Object} task - Task instance to detach
 * @returns {Object} Detached task
 */
export const detachRecurringInstance = task => {
  if (!isRecurringInstance(task)) {
    return task;
  }

  return {
    ...task,
    isRecurringInstance: false,
    recurrenceSeriesId: null,
    originalTaskId: null,
    instanceIndex: null,
    name: task.name.replace(/ \(\d+\)$/, ''), // Remove instance number
  };
};

/**
 * Get recurrence pattern description
 * @param {Object} rule - Recurrence rule
 * @returns {string} Human-readable pattern description
 */
export const getRecurrencePatternDescription = rule => {
  if (!rule) return 'No recurrence';

  const interval = rule.interval;
  const frequency = rule.frequency;

  switch (frequency) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;

    case 'weekly':
      if (rule.weekdays && rule.weekdays.length > 0) {
        const dayNames = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const selectedDays = rule.weekdays.map(day => dayNames[day]).join(', ');
        return `Weekly on ${selectedDays}`;
      }
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;

    case 'monthly':
      if (rule.dayOfMonth) {
        return `Monthly on day ${rule.dayOfMonth}`;
      }
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;

    default:
      return `Every ${interval} ${frequency}`;
  }
};

/**
 * Validate recurrence rule
 * @param {Object} rule - Recurrence rule to validate
 * @returns {Object} Validation result
 */
export const validateRecurrenceRule = rule => {
  const errors = [];
  const warnings = [];

  if (!rule) {
    errors.push('Recurrence rule is required');
    return { isValid: false, errors, warnings };
  }

  if (
    !rule.frequency ||
    !['daily', 'weekly', 'monthly'].includes(rule.frequency)
  ) {
    errors.push('Invalid frequency. Must be daily, weekly, or monthly');
  }

  if (!rule.interval || rule.interval < 1) {
    errors.push('Interval must be at least 1');
  }

  if (!rule.startDate) {
    errors.push('Start date is required');
  }

  if (
    rule.frequency === 'weekly' &&
    rule.weekdays &&
    rule.weekdays.length === 0
  ) {
    errors.push('At least one weekday must be selected for weekly recurrence');
  }

  if (rule.frequency === 'monthly' && rule.dayOfMonth) {
    if (rule.dayOfMonth < 1 || rule.dayOfMonth > 31) {
      errors.push('Day of month must be between 1 and 31');
    }
  }

  if (rule.maxOccurrences && rule.maxOccurrences > 1000) {
    warnings.push('Large number of occurrences may impact performance');
  }

  if (rule.endDate && new Date(rule.endDate) <= new Date(rule.startDate)) {
    errors.push('End date must be after start date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get recurrence summary statistics
 * @param {Array} allTasks - All tasks in the project
 * @returns {Object} Recurrence summary
 */
export const getRecurrenceSummary = allTasks => {
  const recurringTasks = allTasks.filter(task => isRecurringTask(task));
  const recurringInstances = allTasks.filter(task => isRecurringInstance(task));

  const seriesCount = new Set(recurringTasks.map(task => task.recurrence.id))
    .size;

  const instanceCount = recurringInstances.length;

  const frequencyBreakdown = recurringTasks.reduce((acc, task) => {
    const frequency = task.recurrence.frequency;
    acc[frequency] = (acc[frequency] || 0) + 1;
    return acc;
  }, {});

  return {
    totalRecurringTasks: recurringTasks.length,
    totalInstances: instanceCount,
    seriesCount,
    frequencyBreakdown,
    averageInstancesPerSeries:
      seriesCount > 0 ? Math.round(instanceCount / seriesCount) : 0,
  };
};

/**
 * Format recurrence rule for display
 * @param {Object} rule - Recurrence rule
 * @returns {string} Formatted rule string
 */
export const formatRecurrenceRule = rule => {
  if (!rule) return 'No recurrence';

  const pattern = getRecurrencePatternDescription(rule);
  const startDate = new Date(rule.startDate).toLocaleDateString();

  let ruleText = `${pattern} starting ${startDate}`;

  if (rule.endDate) {
    const endDate = new Date(rule.endDate).toLocaleDateString();
    ruleText += ` until ${endDate}`;
  }

  if (rule.maxOccurrences) {
    ruleText += ` (max ${rule.maxOccurrences} occurrences)`;
  }

  return ruleText;
};

/**
 * Check if a task can be made recurring
 * @param {Object} task - Task to check
 * @returns {boolean} True if task can be made recurring
 */
export const canMakeRecurring = task => {
  // Cannot make already recurring tasks or instances recurring
  return !isRecurringTask(task) && !isRecurringInstance(task);
};

/**
 * Check if a recurring instance can be detached
 * @param {Object} task - Task to check
 * @returns {boolean} True if task can be detached
 */
export const canDetachInstance = task => {
  return isRecurringInstance(task);
};
