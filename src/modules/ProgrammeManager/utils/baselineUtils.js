/**
 * Calculate variance between baseline and actual dates
 * @param {string} baselineDate - Baseline date string
 * @param {string} actualDate - Actual date string
 * @returns {number} Variance in days (positive = actual is later than baseline)
 */
export const calculateDateVariance = (baselineDate, actualDate) => {
  if (!baselineDate || !actualDate) return 0;
  
  const baseline = new Date(baselineDate);
  const actual = new Date(actualDate);
  
  const diffTime = actual.getTime() - baseline.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculate duration variance between baseline and actual
 * @param {Object} task - Task object with baseline and actual dates
 * @returns {number} Duration variance in days
 */
export const calculateDurationVariance = (task) => {
  if (!task.baselineStart || !task.baselineEnd || !task.startDate || !task.endDate) {
    return 0;
  }
  
  const baselineDuration = Math.ceil(
    (new Date(task.baselineEnd) - new Date(task.baselineStart)) / (1000 * 60 * 60 * 24)
  );
  
  const actualDuration = Math.ceil(
    (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24)
  );
  
  return actualDuration - baselineDuration;
};

/**
 * Get variance status (ahead, on track, behind)
 * @param {number} variance - Variance in days
 * @returns {Object} Status object with type and color
 */
export const getVarianceStatus = (variance) => {
  if (variance < -1) {
    return { type: 'ahead', color: 'text-green-600', bgColor: 'bg-green-100' };
  } else if (variance > 1) {
    return { type: 'behind', color: 'text-red-600', bgColor: 'bg-red-100' };
  } else {
    return { type: 'on-track', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  }
};

/**
 * Format variance for display
 * @param {number} variance - Variance in days
 * @returns {string} Formatted variance string
 */
export const formatVariance = (variance) => {
  if (variance === 0) return '0d';
  if (variance > 0) return `+${variance}d`;
  return `${variance}d`;
};

/**
 * Check if task has baseline data
 * @param {Object} task - Task object
 * @returns {boolean} True if task has baseline data
 */
export const hasBaselineData = (task) => {
  return !!(task.baselineStart && task.baselineEnd);
};

/**
 * Get baseline progress percentage
 * @param {Object} task - Task object
 * @returns {number} Baseline progress percentage
 */
export const getBaselineProgress = (task) => {
  if (!hasBaselineData(task)) return 0;
  
  const today = new Date();
  const baselineStart = new Date(task.baselineStart);
  const baselineEnd = new Date(task.baselineEnd);
  
  if (today < baselineStart) return 0;
  if (today > baselineEnd) return 100;
  
  const totalDuration = baselineEnd.getTime() - baselineStart.getTime();
  const elapsed = today.getTime() - baselineStart.getTime();
  
  return Math.round((elapsed / totalDuration) * 100);
};

/**
 * Calculate baseline vs actual performance
 * @param {Object} task - Task object
 * @returns {Object} Performance metrics
 */
export const calculateBaselinePerformance = (task) => {
  if (!hasBaselineData(task)) {
    return {
      startVariance: 0,
      finishVariance: 0,
      durationVariance: 0,
      startStatus: { type: 'no-baseline', color: 'text-gray-500', bgColor: 'bg-gray-100' },
      finishStatus: { type: 'no-baseline', color: 'text-gray-500', bgColor: 'bg-gray-100' },
      durationStatus: { type: 'no-baseline', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    };
  }
  
  const startVariance = calculateDateVariance(task.baselineStart, task.startDate);
  const finishVariance = calculateDateVariance(task.baselineEnd, task.endDate);
  const durationVariance = calculateDurationVariance(task);
  
  return {
    startVariance,
    finishVariance,
    durationVariance,
    startStatus: getVarianceStatus(startVariance),
    finishStatus: getVarianceStatus(finishVariance),
    durationStatus: getVarianceStatus(durationVariance)
  };
};

/**
 * Get baseline tooltip content
 * @param {Object} task - Task object
 * @returns {string} Formatted tooltip text
 */
export const getBaselineTooltip = (task) => {
  if (!hasBaselineData(task)) {
    return 'No baseline data available';
  }
  
  const performance = calculateBaselinePerformance(task);
  
  return `
Baseline vs Actual:
Start: ${new Date(task.baselineStart).toLocaleDateString()} → ${new Date(task.startDate).toLocaleDateString()} (${formatVariance(performance.startVariance)})
Finish: ${new Date(task.baselineEnd).toLocaleDateString()} → ${new Date(task.endDate).toLocaleDateString()} (${formatVariance(performance.finishVariance)})
Duration: ${Math.ceil((new Date(task.baselineEnd) - new Date(task.baselineStart)) / (1000 * 60 * 60 * 24))}d → ${task.duration}d (${formatVariance(performance.durationVariance)})
  `.trim();
};
