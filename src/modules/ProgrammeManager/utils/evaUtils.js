/**
 * Earned Value Analysis (EVA) Utilities
 * Handle EVA calculations, metrics, and performance indices
 */

/**
 * Default EVA configuration
 */
export const DEFAULT_EVA_CONFIG = {
  currency: 'GBP',
  currencySymbol: '£',
  dateFormat: 'DD/MM/YYYY',
  precision: 2,
  includeIndices: true,
  includeForecasts: true,
  chartColors: {
    pv: '#3B82F6', // Blue
    ev: '#10B981', // Green
    ac: '#F59E0B', // Amber
    sv: '#EF4444', // Red
    cv: '#8B5CF6', // Purple
  },
};

/**
 * Calculate Planned Value (PV) - Budgeted Cost of Work Scheduled
 * @param {Array} tasks - Array of task objects
 * @param {Date} statusDate - Current status date
 * @returns {number} Planned Value
 */
export const calculatePlannedValue = (tasks, statusDate) => {
  if (!tasks || tasks.length === 0) return 0;

  return tasks.reduce((total, task) => {
    if (!task.startDate || !task.endDate || !task.cost) return total;

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const status = new Date(statusDate);

    // If task should have started by status date
    if (taskStart <= status) {
      const taskDuration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24);
      const elapsedDays = Math.min(
        (status - taskStart) / (1000 * 60 * 60 * 24),
        taskDuration
      );

      if (taskDuration > 0) {
        const plannedProgress = (elapsedDays / taskDuration) * 100;
        const plannedValue = (task.cost * plannedProgress) / 100;
        return total + plannedValue;
      }
    }

    return total;
  }, 0);
};

/**
 * Calculate Earned Value (EV) - Budgeted Cost of Work Performed
 * @param {Array} tasks - Array of task objects
 * @returns {number} Earned Value
 */
export const calculateEarnedValue = tasks => {
  if (!tasks || tasks.length === 0) return 0;

  return tasks.reduce((total, task) => {
    if (!task.cost || !task.progress) return total;

    const earnedValue = (task.cost * task.progress) / 100;
    return total + earnedValue;
  }, 0);
};

/**
 * Calculate Actual Cost (AC) - Actual Cost of Work Performed
 * @param {Array} tasks - Array of task objects
 * @returns {number} Actual Cost
 */
export const calculateActualCost = tasks => {
  if (!tasks || tasks.length === 0) return 0;

  return tasks.reduce((total, task) => {
    // Use actual cost if available, otherwise estimate from progress
    if (task.actualCost !== undefined) {
      return total + task.actualCost;
    }

    // Estimate actual cost based on progress and planned cost
    if (task.cost && task.progress) {
      const estimatedActualCost = (task.cost * task.progress) / 100;
      return total + estimatedActualCost;
    }

    return total;
  }, 0);
};

/**
 * Calculate Schedule Variance (SV) = EV - PV
 * @param {number} ev - Earned Value
 * @param {number} pv - Planned Value
 * @returns {number} Schedule Variance
 */
export const calculateScheduleVariance = (ev, pv) => {
  return ev - pv;
};

/**
 * Calculate Cost Variance (CV) = EV - AC
 * @param {number} ev - Earned Value
 * @param {number} ac - Actual Cost
 * @returns {number} Cost Variance
 */
export const calculateCostVariance = (ev, ac) => {
  return ev - ac;
};

/**
 * Calculate Schedule Performance Index (SPI) = EV / PV
 * @param {number} ev - Earned Value
 * @param {number} pv - Planned Value
 * @returns {number} Schedule Performance Index
 */
export const calculateSPI = (ev, pv) => {
  return pv > 0 ? ev / pv : 0;
};

/**
 * Calculate Cost Performance Index (CPI) = EV / AC
 * @param {number} ev - Earned Value
 * @param {number} ac - Actual Cost
 * @returns {number} Cost Performance Index
 */
export const calculateCPI = (ev, ac) => {
  return ac > 0 ? ev / ac : 0;
};

/**
 * Calculate Budget at Completion (BAC) - Total planned project cost
 * @param {Array} tasks - Array of task objects
 * @returns {number} Budget at Completion
 */
export const calculateBAC = tasks => {
  if (!tasks || tasks.length === 0) return 0;

  return tasks.reduce((total, task) => {
    return total + (task.cost || 0);
  }, 0);
};

/**
 * Calculate Estimate at Completion (EAC) using different methods
 * @param {number} bac - Budget at Completion
 * @param {number} ac - Actual Cost
 * @param {number} ev - Earned Value
 * @param {number} cpi - Cost Performance Index
 * @param {string} method - EAC calculation method
 * @returns {number} Estimate at Completion
 */
export const calculateEAC = (bac, ac, ev, cpi, method = 'cpi') => {
  switch (method) {
    case 'cpi':
      // EAC = BAC / CPI
      return cpi > 0 ? bac / cpi : bac;

    case 'spi_cpi': {
      // EAC = AC + (BAC - EV) / (SPI * CPI)
      const spi = ev > 0 ? ev / (ev + (bac - ev)) : 1;
      const combinedIndex = spi * cpi;
      return combinedIndex > 0 ? ac + (bac - ev) / combinedIndex : bac;
    }

    case 'actual': {
      // EAC = AC + (BAC - EV)
      return ac + (bac - ev);
    }

    case 'optimistic': {
      // EAC = AC + (BAC - EV) / CPI
      return cpi > 0 ? ac + (bac - ev) / cpi : bac;
    }

    default:
      return cpi > 0 ? bac / cpi : bac;
  }
};

/**
 * Calculate Estimate to Complete (ETC) = EAC - AC
 * @param {number} eac - Estimate at Completion
 * @param {number} ac - Actual Cost
 * @returns {number} Estimate to Complete
 */
export const calculateETC = (eac, ac) => {
  return eac - ac;
};

/**
 * Calculate Variance at Completion (VAC) = BAC - EAC
 * @param {number} bac - Budget at Completion
 * @param {number} eac - Estimate at Completion
 * @returns {number} Variance at Completion
 */
export const calculateVAC = (bac, eac) => {
  return bac - eac;
};

/**
 * Calculate To Complete Performance Index (TCPI)
 * @param {number} bac - Budget at Completion
 * @param {number} ev - Earned Value
 * @param {number} ac - Actual Cost
 * @param {string} method - TCPI calculation method
 * @returns {number} To Complete Performance Index
 */
export const calculateTCPI = (bac, ev, ac, method = 'bac') => {
  const remainingWork = bac - ev;
  const remainingBudget =
    method === 'eac'
      ? calculateEAC(bac, ac, ev, calculateCPI(ev, ac)) - ac
      : bac - ac;

  return remainingBudget > 0 ? remainingWork / remainingBudget : 0;
};

/**
 * Calculate comprehensive EVA metrics for a project
 * @param {Array} tasks - Array of task objects
 * @param {Date} statusDate - Current status date
 * @param {Object} config - EVA configuration
 * @returns {Object} Complete EVA metrics
 */
export const calculateEVAMetrics = (
  tasks,
  statusDate,
  config = DEFAULT_EVA_CONFIG
) => {
  const pv = calculatePlannedValue(tasks, statusDate);
  const ev = calculateEarnedValue(tasks);
  const ac = calculateActualCost(tasks);
  const bac = calculateBAC(tasks);

  const sv = calculateScheduleVariance(ev, pv);
  const cv = calculateCostVariance(ev, ac);
  const spi = calculateSPI(ev, pv);
  const cpi = calculateCPI(ev, ac);

  const eac = calculateEAC(bac, ac, ev, cpi);
  const etc = calculateETC(eac, ac);
  const vac = calculateVAC(bac, eac);
  const tcpi = calculateTCPI(bac, ev, ac);

  return {
    // Basic metrics
    pv: roundToPrecision(pv, config.precision),
    ev: roundToPrecision(ev, config.precision),
    ac: roundToPrecision(ac, config.precision),
    bac: roundToPrecision(bac, config.precision),

    // Variances
    sv: roundToPrecision(sv, config.precision),
    cv: roundToPrecision(cv, config.precision),

    // Performance indices
    spi: roundToPrecision(spi, 3),
    cpi: roundToPrecision(cpi, 3),

    // Forecasts
    eac: roundToPrecision(eac, config.precision),
    etc: roundToPrecision(etc, config.precision),
    vac: roundToPrecision(vac, config.precision),
    tcpi: roundToPrecision(tcpi, 3),

    // Percentages
    pvPercentage: bac > 0 ? roundToPrecision((pv / bac) * 100, 1) : 0,
    evPercentage: bac > 0 ? roundToPrecision((ev / bac) * 100, 1) : 0,
    acPercentage: bac > 0 ? roundToPrecision((ac / bac) * 100, 1) : 0,

    // Status indicators
    scheduleStatus: getScheduleStatus(sv, spi),
    costStatus: getCostStatus(cv, cpi),
    overallStatus: getOverallStatus(sv, cv, spi, cpi),

    // Metadata
    statusDate,
    taskCount: tasks.length,
    completedTasks: tasks.filter(t => t.progress === 100).length,
    inProgressTasks: tasks.filter(t => t.progress > 0 && t.progress < 100)
      .length,
  };
};

/**
 * Get schedule performance status
 * @param {number} sv - Schedule Variance
 * @param {number} spi - Schedule Performance Index
 * @returns {Object} Schedule status
 */
export const getScheduleStatus = (sv, spi) => {
  if (sv >= 0 && spi >= 1) {
    return {
      status: 'ahead',
      label: 'Ahead of Schedule',
      color: '#10B981',
      icon: '📈',
    };
  } else if (sv < 0 && spi < 1) {
    return {
      status: 'behind',
      label: 'Behind Schedule',
      color: '#EF4444',
      icon: '📉',
    };
  } else {
    return {
      status: 'on-track',
      label: 'On Schedule',
      color: '#3B82F6',
      icon: '📊',
    };
  }
};

/**
 * Get cost performance status
 * @param {number} cv - Cost Variance
 * @param {number} cpi - Cost Performance Index
 * @returns {Object} Cost status
 */
export const getCostStatus = (cv, cpi) => {
  if (cv >= 0 && cpi >= 1) {
    return {
      status: 'under-budget',
      label: 'Under Budget',
      color: '#10B981',
      icon: '💰',
    };
  } else if (cv < 0 && cpi < 1) {
    return {
      status: 'over-budget',
      label: 'Over Budget',
      color: '#EF4444',
      icon: '💸',
    };
  } else {
    return {
      status: 'on-budget',
      label: 'On Budget',
      color: '#3B82F6',
      icon: '💳',
    };
  }
};

/**
 * Get overall project status
 * @param {number} sv - Schedule Variance
 * @param {number} cv - Cost Variance
 * @param {number} spi - Schedule Performance Index
 * @param {number} cpi - Cost Performance Index
 * @returns {Object} Overall status
 */
export const getOverallStatus = (sv, cv, spi, cpi) => {
  const scheduleScore = spi >= 1 ? 1 : spi;
  const costScore = cpi >= 1 ? 1 : cpi;
  const overallScore = (scheduleScore + costScore) / 2;

  if (overallScore >= 0.9) {
    return {
      status: 'excellent',
      label: 'Excellent Performance',
      color: '#10B981',
      icon: '🏆',
      score: overallScore,
    };
  } else if (overallScore >= 0.8) {
    return {
      status: 'good',
      label: 'Good Performance',
      color: '#3B82F6',
      icon: '✅',
      score: overallScore,
    };
  } else if (overallScore >= 0.6) {
    return {
      status: 'fair',
      label: 'Fair Performance',
      color: '#F59E0B',
      icon: '⚠️',
      score: overallScore,
    };
  } else {
    return {
      status: 'poor',
      label: 'Poor Performance',
      color: '#EF4444',
      icon: '🚨',
      score: overallScore,
    };
  }
};

/**
 * Generate EVA chart data for Chart.js
 * @param {Object} evaMetrics - EVA metrics object
 * @param {Object} config - Chart configuration
 * @returns {Object} Chart.js compatible data
 */
export const generateEVAChartData = (
  evaMetrics,
  config = DEFAULT_EVA_CONFIG
) => {
  return {
    labels: ['Planned Value (PV)', 'Earned Value (EV)', 'Actual Cost (AC)'],
    datasets: [
      {
        label: 'Value',
        data: [evaMetrics.pv, evaMetrics.ev, evaMetrics.ac],
        backgroundColor: [
          config.chartColors.pv,
          config.chartColors.ev,
          config.chartColors.ac,
        ],
        borderColor: [
          config.chartColors.pv,
          config.chartColors.ev,
          config.chartColors.ac,
        ],
        borderWidth: 2,
      },
    ],
  };
};

/**
 * Generate EVA trend chart data
 * @param {Array} evaHistory - Array of EVA metrics over time
 * @param {Object} config - Chart configuration
 * @returns {Object} Chart.js compatible trend data
 */
export const generateEVATrendChartData = (
  evaHistory,
  config = DEFAULT_EVA_CONFIG
) => {
  const labels = evaHistory.map(item =>
    new Date(item.statusDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    })
  );

  return {
    labels,
    datasets: [
      {
        label: 'Planned Value (PV)',
        data: evaHistory.map(item => item.pv),
        borderColor: config.chartColors.pv,
        backgroundColor: `${config.chartColors.pv}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Earned Value (EV)',
        data: evaHistory.map(item => item.ev),
        borderColor: config.chartColors.ev,
        backgroundColor: `${config.chartColors.ev}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Actual Cost (AC)',
        data: evaHistory.map(item => item.ac),
        borderColor: config.chartColors.ac,
        backgroundColor: `${config.chartColors.ac}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };
};

/**
 * Generate performance indices chart data
 * @param {Object} evaMetrics - EVA metrics object
 * @param {Object} config - Chart configuration
 * @returns {Object} Chart.js compatible data
 */
export const generatePerformanceIndicesChartData = (
  evaMetrics,
  config = DEFAULT_EVA_CONFIG
) => {
  return {
    labels: [
      'Schedule Performance Index (SPI)',
      'Cost Performance Index (CPI)',
    ],
    datasets: [
      {
        label: 'Performance Index',
        data: [evaMetrics.spi, evaMetrics.cpi],
        backgroundColor: [
          evaMetrics.spi >= 1 ? '#10B981' : '#EF4444',
          evaMetrics.cpi >= 1 ? '#10B981' : '#EF4444',
        ],
        borderColor: [
          evaMetrics.spi >= 1 ? '#10B981' : '#EF4444',
          evaMetrics.cpi >= 1 ? '#10B981' : '#EF4444',
        ],
        borderWidth: 2,
      },
    ],
  };
};

/**
 * Generate variance chart data
 * @param {Object} evaMetrics - EVA metrics object
 * @param {Object} config - Chart configuration
 * @returns {Object} Chart.js compatible data
 */
export const generateVarianceChartData = (
  evaMetrics,
  config = DEFAULT_EVA_CONFIG
) => {
  return {
    labels: ['Schedule Variance (SV)', 'Cost Variance (CV)'],
    datasets: [
      {
        label: 'Variance',
        data: [evaMetrics.sv, evaMetrics.cv],
        backgroundColor: [
          evaMetrics.sv >= 0 ? '#10B981' : '#EF4444',
          evaMetrics.cv >= 0 ? '#10B981' : '#EF4444',
        ],
        borderColor: [
          evaMetrics.sv >= 0 ? '#10B981' : '#EF4444',
          evaMetrics.cv >= 0 ? '#10B981' : '#EF4444',
        ],
        borderWidth: 2,
      },
    ],
  };
};

/**
 * Format currency value
 * @param {number} value - Value to format
 * @param {Object} config - EVA configuration
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, config = DEFAULT_EVA_CONFIG) => {
  return `${config.currencySymbol}${value.toLocaleString('en-GB', {
    minimumFractionDigits: config.precision,
    maximumFractionDigits: config.precision,
  })}`;
};

/**
 * Format percentage value
 * @param {number} value - Value to format
 * @param {number} precision - Decimal precision
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, precision = 1) => {
  return `${roundToPrecision(value, precision)}%`;
};

/**
 * Round number to specified precision
 * @param {number} value - Value to round
 * @param {number} precision - Decimal precision
 * @returns {number} Rounded value
 */
export const roundToPrecision = (value, precision = 2) => {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Validate EVA metrics
 * @param {Object} evaMetrics - EVA metrics to validate
 * @returns {Object} Validation result
 */
export const validateEVAMetrics = evaMetrics => {
  const errors = [];
  const warnings = [];

  // Check for required fields
  const requiredFields = ['pv', 'ev', 'ac', 'bac'];
  requiredFields.forEach(field => {
    if (evaMetrics[field] === undefined || evaMetrics[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check for negative values
  if (evaMetrics.pv < 0) warnings.push('Planned Value should not be negative');
  if (evaMetrics.ev < 0) warnings.push('Earned Value should not be negative');
  if (evaMetrics.ac < 0) warnings.push('Actual Cost should not be negative');
  if (evaMetrics.bac < 0)
    warnings.push('Budget at Completion should not be negative');

  // Check for logical relationships
  if (evaMetrics.ev > evaMetrics.bac) {
    warnings.push('Earned Value exceeds Budget at Completion');
  }

  if (evaMetrics.ac > evaMetrics.bac * 2) {
    warnings.push(
      'Actual Cost is significantly higher than Budget at Completion'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Export EVA metrics
 * @param {Object} evaMetrics - EVA metrics to export
 * @returns {Object} Exportable EVA data
 */
export const exportEVAMetrics = evaMetrics => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    evaMetrics,
    metadata: {
      description: 'Earned Value Analysis metrics export',
      currency: 'GBP',
      precision: 2,
    },
  };
};

/**
 * Import EVA metrics
 * @param {Object} importData - Import data object
 * @returns {Object} Import result
 */
export const importEVAMetrics = importData => {
  const errors = [];
  const warnings = [];

  if (!importData.evaMetrics) {
    errors.push('No EVA metrics found in import data');
    return { success: false, errors, warnings, evaMetrics: null };
  }

  const evaMetrics = importData.evaMetrics;
  const validation = validateEVAMetrics(evaMetrics);

  errors.push(...validation.errors);
  warnings.push(...validation.warnings);

  return {
    success: errors.length === 0,
    errors,
    warnings,
    evaMetrics: errors.length === 0 ? evaMetrics : null,
  };
};
