/**
 * Cost Utilities
 * Handle resource cost rate management and task cost calculations
 */

/**
 * Calculate task cost based on duration, resource rate, and units
 * @param {Object} task - Task object
 * @param {Object} resource - Resource object with costRate
 * @param {number} resourceUnits - Number of resource units assigned (default: 1)
 * @returns {Object} Cost calculation result
 */
export const calculateTaskCost = (task, resource, resourceUnits = 1) => {
  if (!task || !resource || !resource.costRate) {
    return {
      cost: 0,
      breakdown: {
        duration: 0,
        rate: 0,
        units: 0,
        calculation: 'No cost data available',
      },
    };
  }

  const duration = task.duration || 0;
  const rate = resource.costRate || 0;
  const units = resourceUnits || 1;

  const cost = duration * rate * units;

  return {
    cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
    breakdown: {
      duration,
      rate,
      units,
      calculation: `${duration} days × £${rate}/day × ${units} unit(s) = £${cost.toFixed(2)}`,
    },
  };
};

/**
 * Calculate total project cost from all tasks
 * @param {Array} tasks - Array of task objects
 * @param {Array} resources - Array of resource objects
 * @returns {Object} Project cost summary
 */
export const calculateProjectCost = (tasks, resources) => {
  const costSummary = {
    totalCost: 0,
    taskCount: 0,
    resourceCount: 0,
    breakdown: {
      byTask: [],
      byResource: {},
      byStatus: {},
      byPriority: {},
    },
    averageCostPerTask: 0,
    averageCostPerDay: 0,
  };

  let totalDuration = 0;
  const resourceCosts = {};
  const statusCosts = {};
  const priorityCosts = {};

  tasks.forEach(task => {
    const resource = resources.find(
      r =>
        r.id === task.resourceId || r.name === task.resource || task.assignedTo
    );

    if (resource && resource.costRate) {
      const taskCost = calculateTaskCost(task, resource);

      costSummary.totalCost += taskCost.cost;
      costSummary.taskCount++;
      totalDuration += task.duration || 0;

      // Breakdown by task
      costSummary.breakdown.byTask.push({
        taskId: task.id,
        taskName: task.name,
        cost: taskCost.cost,
        duration: task.duration || 0,
        resource: resource.name,
        rate: resource.costRate,
        breakdown: taskCost.breakdown,
      });

      // Breakdown by resource
      if (!resourceCosts[resource.id]) {
        resourceCosts[resource.id] = {
          resourceId: resource.id,
          resourceName: resource.name,
          totalCost: 0,
          taskCount: 0,
          totalDuration: 0,
        };
      }
      resourceCosts[resource.id].totalCost += taskCost.cost;
      resourceCosts[resource.id].taskCount++;
      resourceCosts[resource.id].totalDuration += task.duration || 0;

      // Breakdown by status
      const status = task.status || 'Planned';
      if (!statusCosts[status]) {
        statusCosts[status] = 0;
      }
      statusCosts[status] += taskCost.cost;

      // Breakdown by priority
      const priority = task.priority || 'Medium';
      if (!priorityCosts[priority]) {
        priorityCosts[priority] = 0;
      }
      priorityCosts[priority] += taskCost.cost;
    }
  });

  // Convert breakdowns to arrays
  costSummary.breakdown.byResource = Object.values(resourceCosts);
  costSummary.breakdown.byStatus = Object.entries(statusCosts).map(
    ([status, cost]) => ({
      status,
      cost,
    })
  );
  costSummary.breakdown.byPriority = Object.entries(priorityCosts).map(
    ([priority, cost]) => ({
      priority,
      cost,
    })
  );

  // Calculate averages
  costSummary.averageCostPerTask =
    costSummary.taskCount > 0
      ? Math.round((costSummary.totalCost / costSummary.taskCount) * 100) / 100
      : 0;

  costSummary.averageCostPerDay =
    totalDuration > 0
      ? Math.round((costSummary.totalCost / totalDuration) * 100) / 100
      : 0;

  costSummary.resourceCount = Object.keys(resourceCosts).length;

  return costSummary;
};

/**
 * Format cost for display
 * @param {number} cost - Cost amount
 * @param {string} currency - Currency symbol (default: '£')
 * @returns {string} Formatted cost string
 */
export const formatCost = (cost, currency = '£') => {
  if (cost === null || cost === undefined || isNaN(cost)) {
    return `${currency}0.00`;
  }

  return `${currency}${cost.toFixed(2)}`;
};

/**
 * Get cost rate display text
 * @param {number} rate - Cost rate
 * @param {string} unit - Rate unit ('hour' or 'day', default: 'day')
 * @param {string} currency - Currency symbol (default: '£')
 * @returns {string} Formatted rate string
 */
export const formatCostRate = (rate, unit = 'day', currency = '£') => {
  if (!rate || isNaN(rate)) {
    return `${currency}0.00/${unit}`;
  }

  return `${currency}${rate.toFixed(2)}/${unit}`;
};

/**
 * Validate cost rate
 * @param {number} rate - Cost rate to validate
 * @returns {Object} Validation result
 */
export const validateCostRate = rate => {
  const errors = [];
  const warnings = [];

  if (rate === null || rate === undefined) {
    errors.push('Cost rate is required');
    return { isValid: false, errors, warnings };
  }

  if (isNaN(rate)) {
    errors.push('Cost rate must be a valid number');
  }

  if (rate < 0) {
    errors.push('Cost rate cannot be negative');
  }

  if (rate > 10000) {
    warnings.push('Cost rate seems unusually high');
  }

  if (rate === 0) {
    warnings.push('Cost rate is set to zero');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get cost summary for a specific resource
 * @param {string} resourceId - Resource ID
 * @param {Array} tasks - Array of task objects
 * @param {Array} resources - Array of resource objects
 * @returns {Object} Resource cost summary
 */
export const getResourceCostSummary = (resourceId, tasks, resources) => {
  const resource = resources.find(r => r.id === resourceId);
  if (!resource) {
    return {
      resourceId,
      resourceName: 'Unknown',
      totalCost: 0,
      taskCount: 0,
      totalDuration: 0,
      averageCostPerTask: 0,
      averageCostPerDay: 0,
      tasks: [],
    };
  }

  const resourceTasks = tasks.filter(
    task =>
      task.resourceId === resourceId ||
      task.resource === resource.name ||
      task.assignedTo === resource.name
  );

  let totalCost = 0;
  let totalDuration = 0;
  const taskCosts = [];

  resourceTasks.forEach(task => {
    const taskCost = calculateTaskCost(task, resource);
    totalCost += taskCost.cost;
    totalDuration += task.duration || 0;

    taskCosts.push({
      taskId: task.id,
      taskName: task.name,
      cost: taskCost.cost,
      duration: task.duration || 0,
      breakdown: taskCost.breakdown,
    });
  });

  return {
    resourceId: resource.id,
    resourceName: resource.name,
    costRate: resource.costRate,
    totalCost: Math.round(totalCost * 100) / 100,
    taskCount: resourceTasks.length,
    totalDuration,
    averageCostPerTask:
      resourceTasks.length > 0
        ? Math.round((totalCost / resourceTasks.length) * 100) / 100
        : 0,
    averageCostPerDay:
      totalDuration > 0
        ? Math.round((totalCost / totalDuration) * 100) / 100
        : 0,
    tasks: taskCosts,
  };
};

/**
 * Get cost breakdown by time period
 * @param {Array} tasks - Array of task objects
 * @param {Array} resources - Array of resource objects
 * @param {string} period - Time period ('week', 'month', 'quarter')
 * @returns {Array} Cost breakdown by period
 */
export const getCostBreakdownByPeriod = (
  tasks,
  resources,
  period = 'month'
) => {
  const periodCosts = {};

  tasks.forEach(task => {
    const resource = resources.find(
      r =>
        r.id === task.resourceId ||
        r.name === task.resource ||
        task.assignedTo === r.name
    );

    if (resource && resource.costRate) {
      const taskCost = calculateTaskCost(task, resource);
      const startDate = new Date(task.startDate);

      let periodKey;
      switch (period) {
        case 'week':
          const weekStart = new Date(startDate);
          weekStart.setDate(startDate.getDate() - startDate.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(startDate.getMonth() / 3) + 1;
          periodKey = `${startDate.getFullYear()}-Q${quarter}`;
          break;
        default:
          periodKey = startDate.toISOString().split('T')[0];
      }

      if (!periodCosts[periodKey]) {
        periodCosts[periodKey] = {
          period: periodKey,
          totalCost: 0,
          taskCount: 0,
          tasks: [],
        };
      }

      periodCosts[periodKey].totalCost += taskCost.cost;
      periodCosts[periodKey].taskCount++;
      periodCosts[periodKey].tasks.push({
        taskId: task.id,
        taskName: task.name,
        cost: taskCost.cost,
        startDate: task.startDate,
      });
    }
  });

  return Object.values(periodCosts).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
};

/**
 * Get cost variance between baseline and actual
 * @param {Object} task - Task object with baseline and actual data
 * @param {Object} resource - Resource object
 * @returns {Object} Cost variance information
 */
export const getCostVariance = (task, resource) => {
  if (!task || !resource || !resource.costRate) {
    return {
      baselineCost: 0,
      actualCost: 0,
      variance: 0,
      variancePercentage: 0,
      isOverBudget: false,
    };
  }

  const baselineDuration = task.baselineDuration || task.duration || 0;
  const actualDuration = task.duration || 0;

  const baselineCost = calculateTaskCost(
    { ...task, duration: baselineDuration },
    resource
  );
  const actualCost = calculateTaskCost(task, resource);

  const variance = actualCost.cost - baselineCost.cost;
  const variancePercentage =
    baselineCost.cost > 0 ? (variance / baselineCost.cost) * 100 : 0;

  return {
    baselineCost: baselineCost.cost,
    actualCost: actualCost.cost,
    variance: Math.round(variance * 100) / 100,
    variancePercentage: Math.round(variancePercentage * 100) / 100,
    isOverBudget: variance > 0,
  };
};

/**
 * Get cost efficiency metrics
 * @param {Array} tasks - Array of task objects
 * @param {Array} resources - Array of resource objects
 * @returns {Object} Cost efficiency metrics
 */
export const getCostEfficiencyMetrics = (tasks, resources) => {
  const metrics = {
    totalBudget: 0,
    totalActual: 0,
    totalVariance: 0,
    efficiencyScore: 0,
    overBudgetTasks: 0,
    underBudgetTasks: 0,
    onBudgetTasks: 0,
    averageVariance: 0,
  };

  let totalVariance = 0;
  let varianceCount = 0;

  tasks.forEach(task => {
    const resource = resources.find(
      r =>
        r.id === task.resourceId ||
        r.name === task.resource ||
        task.assignedTo === r.name
    );

    if (resource && resource.costRate) {
      const variance = getCostVariance(task, resource);

      metrics.totalBudget += variance.baselineCost;
      metrics.totalActual += variance.actualCost;
      metrics.totalVariance += variance.variance;

      if (variance.variance > 0) {
        metrics.overBudgetTasks++;
      } else if (variance.variance < 0) {
        metrics.underBudgetTasks++;
      } else {
        metrics.onBudgetTasks++;
      }

      if (variance.baselineCost > 0) {
        totalVariance += Math.abs(variance.variancePercentage);
        varianceCount++;
      }
    }
  });

  metrics.efficiencyScore =
    varianceCount > 0 ? Math.max(0, 100 - totalVariance / varianceCount) : 100;

  metrics.averageVariance =
    varianceCount > 0
      ? Math.round((totalVariance / varianceCount) * 100) / 100
      : 0;

  return metrics;
};

/**
 * Get cost trend analysis
 * @param {Array} tasks - Array of task objects
 * @param {Array} resources - Array of resource objects
 * @returns {Object} Cost trend analysis
 */
export const getCostTrendAnalysis = (tasks, resources) => {
  const trend = {
    totalCost: 0,
    costPerDay: 0,
    projectedCost: 0,
    trend: 'stable', // 'increasing', 'decreasing', 'stable'
    trendPercentage: 0,
    recommendations: [],
  };

  // Calculate current total cost
  const projectCost = calculateProjectCost(tasks, resources);
  trend.totalCost = projectCost.totalCost;

  // Calculate cost per day
  const totalDuration = tasks.reduce(
    (sum, task) => sum + (task.duration || 0),
    0
  );
  trend.costPerDay =
    totalDuration > 0 ? projectCost.totalCost / totalDuration : 0;

  // Simple trend analysis based on task completion
  const completedTasks = tasks.filter(task => task.status === 'Complete');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const plannedTasks = tasks.filter(task => task.status === 'Planned');

  const completedCost = calculateProjectCost(
    completedTasks,
    resources
  ).totalCost;
  const inProgressCost = calculateProjectCost(
    inProgressTasks,
    resources
  ).totalCost;
  const plannedCost = calculateProjectCost(plannedTasks, resources).totalCost;

  // Projected cost based on current rate
  trend.projectedCost = completedCost + inProgressCost + plannedCost;

  // Generate recommendations
  if (trend.projectedCost > trend.totalCost * 1.1) {
    trend.recommendations.push(
      'Project is trending over budget. Consider resource optimization.'
    );
  }

  if (inProgressCost > plannedCost * 0.8) {
    trend.recommendations.push(
      'High cost tasks in progress. Monitor resource allocation.'
    );
  }

  if (completedCost < trend.totalCost * 0.3 && tasks.length > 5) {
    trend.recommendations.push(
      'Low completion rate. Review project timeline and resource allocation.'
    );
  }

  return trend;
};
