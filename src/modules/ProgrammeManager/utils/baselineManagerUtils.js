/**
 * Baseline Manager Utilities
 * Handle multiple baseline storage, management, and comparison
 */

/**
 * Create a new baseline from current project state
 * @param {Array} tasks - Current tasks array
 * @param {string} name - Baseline name
 * @param {string} description - Optional description
 * @returns {Object} Baseline object
 */
export const createBaseline = (tasks, name, description = '') => {
  const baseline = {
    id: `baseline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    createdBy: 'Current User', // TODO: Get from user context
    version: '1.0',
    data: {
      tasks: tasks.map(task => ({
        id: task.id,
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        duration: task.duration,
        progress: task.progress,
        status: task.status,
        priority: task.priority,
        resource: task.resource,
        assignedTo: task.assignedTo,
        constraints: task.constraints,
        dependencies: task.dependencies,
        cost: task.cost,
        work: task.work,
        units: task.units,
      })),
      projectInfo: {
        totalTasks: tasks.length,
        totalDuration: tasks.reduce(
          (sum, task) => sum + (task.duration || 0),
          0
        ),
        totalProgress:
          tasks.reduce((sum, task) => sum + (task.progress || 0), 0) /
          tasks.length,
        startDate:
          tasks.length > 0
            ? Math.min(...tasks.map(t => new Date(t.startDate)))
            : null,
        endDate:
          tasks.length > 0
            ? Math.max(...tasks.map(t => new Date(t.endDate)))
            : null,
      },
    },
  };

  return baseline;
};

/**
 * Validate baseline data
 * @param {Object} baseline - Baseline object to validate
 * @returns {Object} Validation result
 */
export const validateBaseline = baseline => {
  const errors = [];
  const warnings = [];

  if (!baseline.name || baseline.name.trim() === '') {
    errors.push('Baseline name is required');
  }

  if (baseline.name && baseline.name.length > 50) {
    errors.push('Baseline name must be 50 characters or less');
  }

  if (baseline.description && baseline.description.length > 500) {
    errors.push('Baseline description must be 500 characters or less');
  }

  if (!baseline.data || !baseline.data.tasks) {
    errors.push('Baseline must contain task data');
  }

  if (
    baseline.data &&
    baseline.data.tasks &&
    baseline.data.tasks.length === 0
  ) {
    warnings.push('Baseline contains no tasks');
  }

  // Check for duplicate names (this would be checked against existing baselines)
  if (baseline.name && baseline.name.toLowerCase().includes('baseline')) {
    warnings.push('Consider using a more descriptive name');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get baseline by ID
 * @param {Array} baselines - Array of baseline objects
 * @param {string} baselineId - Baseline ID to find
 * @returns {Object|null} Baseline object or null if not found
 */
export const getBaselineById = (baselines, baselineId) => {
  return baselines.find(baseline => baseline.id === baselineId) || null;
};

/**
 * Get baseline by name
 * @param {Array} baselines - Array of baseline objects
 * @param {string} name - Baseline name to find
 * @returns {Object|null} Baseline object or null if not found
 */
export const getBaselineByName = (baselines, name) => {
  return (
    baselines.find(
      baseline => baseline.name.toLowerCase() === name.toLowerCase()
    ) || null
  );
};

/**
 * Compare current tasks with a baseline
 * @param {Array} currentTasks - Current tasks array
 * @param {Object} baseline - Baseline object to compare against
 * @returns {Object} Comparison results
 */
export const compareWithBaseline = (currentTasks, baseline) => {
  if (!baseline || !baseline.data || !baseline.data.tasks) {
    return {
      hasChanges: false,
      changes: [],
      summary: {
        added: 0,
        removed: 0,
        modified: 0,
        unchanged: 0,
      },
    };
  }

  const baselineTasks = baseline.data.tasks;
  const changes = [];
  let added = 0;
  let removed = 0;
  let modified = 0;
  let unchanged = 0;

  // Find added and modified tasks
  currentTasks.forEach(currentTask => {
    const baselineTask = baselineTasks.find(bt => bt.id === currentTask.id);

    if (!baselineTask) {
      // Task was added
      changes.push({
        type: 'added',
        taskId: currentTask.id,
        taskName: currentTask.name,
        current: currentTask,
        baseline: null,
      });
      added++;
    } else {
      // Check for modifications
      const modifications = [];

      const fieldsToCompare = [
        'startDate',
        'endDate',
        'duration',
        'progress',
        'status',
        'priority',
        'resource',
        'assignedTo',
        'cost',
        'work',
        'units',
      ];

      fieldsToCompare.forEach(field => {
        if (currentTask[field] !== baselineTask[field]) {
          modifications.push({
            field,
            baseline: baselineTask[field],
            current: currentTask[field],
          });
        }
      });

      if (modifications.length > 0) {
        changes.push({
          type: 'modified',
          taskId: currentTask.id,
          taskName: currentTask.name,
          modifications,
          current: currentTask,
          baseline: baselineTask,
        });
        modified++;
      } else {
        unchanged++;
      }
    }
  });

  // Find removed tasks
  baselineTasks.forEach(baselineTask => {
    const currentTask = currentTasks.find(ct => ct.id === baselineTask.id);

    if (!currentTask) {
      changes.push({
        type: 'removed',
        taskId: baselineTask.id,
        taskName: baselineTask.name,
        current: null,
        baseline: baselineTask,
      });
      removed++;
    }
  });

  return {
    hasChanges: changes.length > 0,
    changes,
    summary: {
      added,
      removed,
      modified,
      unchanged,
    },
  };
};

/**
 * Get baseline comparison summary
 * @param {Object} comparison - Comparison result from compareWithBaseline
 * @returns {Object} Summary statistics
 */
export const getBaselineComparisonSummary = comparison => {
  const { summary } = comparison;
  const totalTasks =
    summary.added + summary.removed + summary.modified + summary.unchanged;

  return {
    totalTasks,
    changePercentage:
      totalTasks > 0
        ? ((summary.added + summary.removed + summary.modified) / totalTasks) *
          100
        : 0,
    stabilityScore:
      totalTasks > 0 ? (summary.unchanged / totalTasks) * 100 : 100,
    ...summary,
  };
};

/**
 * Format baseline comparison for display
 * @param {Object} comparison - Comparison result
 * @returns {Array} Formatted changes for display
 */
export const formatBaselineChanges = comparison => {
  return comparison.changes.map(change => {
    switch (change.type) {
      case 'added':
        return {
          type: 'added',
          taskName: change.taskName,
          description: 'Task was added',
          icon: '➕',
          color: 'green',
        };

      case 'removed':
        return {
          type: 'removed',
          taskName: change.taskName,
          description: 'Task was removed',
          icon: '➖',
          color: 'red',
        };

      case 'modified':
        const modificationDescriptions = change.modifications.map(mod => {
          switch (mod.field) {
            case 'startDate':
              return `Start date: ${new Date(mod.baseline).toLocaleDateString()} → ${new Date(mod.current).toLocaleDateString()}`;
            case 'endDate':
              return `End date: ${new Date(mod.baseline).toLocaleDateString()} → ${new Date(mod.current).toLocaleDateString()}`;
            case 'duration':
              return `Duration: ${mod.baseline} → ${mod.current} days`;
            case 'progress':
              return `Progress: ${mod.baseline}% → ${mod.current}%`;
            case 'status':
              return `Status: ${mod.baseline} → ${mod.current}`;
            case 'priority':
              return `Priority: ${mod.baseline} → ${mod.current}`;
            case 'resource':
              return `Resource: ${mod.baseline || 'None'} → ${mod.current || 'None'}`;
            case 'cost':
              return `Cost: £${mod.baseline || 0} → £${mod.current || 0}`;
            default:
              return `${mod.field}: ${mod.baseline} → ${mod.current}`;
          }
        });

        return {
          type: 'modified',
          taskName: change.taskName,
          description: modificationDescriptions.join(', '),
          icon: '✏️',
          color: 'yellow',
          modifications: change.modifications,
        };

      default:
        return {
          type: 'unknown',
          taskName: change.taskName,
          description: 'Unknown change type',
          icon: '❓',
          color: 'gray',
        };
    }
  });
};

/**
 * Get baseline statistics
 * @param {Object} baseline - Baseline object
 * @returns {Object} Statistics object
 */
export const getBaselineStatistics = baseline => {
  if (!baseline || !baseline.data || !baseline.data.tasks) {
    return {
      taskCount: 0,
      totalDuration: 0,
      averageProgress: 0,
      statusBreakdown: {},
      priorityBreakdown: {},
      resourceBreakdown: {},
      dateRange: { start: null, end: null },
    };
  }

  const tasks = baseline.data.tasks;
  const statusBreakdown = {};
  const priorityBreakdown = {};
  const resourceBreakdown = {};

  let totalDuration = 0;
  let totalProgress = 0;
  const startDates = [];
  const endDates = [];

  tasks.forEach(task => {
    totalDuration += task.duration || 0;
    totalProgress += task.progress || 0;

    if (task.startDate) startDates.push(new Date(task.startDate));
    if (task.endDate) endDates.push(new Date(task.endDate));

    // Status breakdown
    const status = task.status || 'Unknown';
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

    // Priority breakdown
    const priority = task.priority || 'Medium';
    priorityBreakdown[priority] = (priorityBreakdown[priority] || 0) + 1;

    // Resource breakdown
    const resource = task.resource || task.assignedTo || 'Unassigned';
    resourceBreakdown[resource] = (resourceBreakdown[resource] || 0) + 1;
  });

  return {
    taskCount: tasks.length,
    totalDuration,
    averageProgress: tasks.length > 0 ? totalProgress / tasks.length : 0,
    statusBreakdown,
    priorityBreakdown,
    resourceBreakdown,
    dateRange: {
      start: startDates.length > 0 ? new Date(Math.min(...startDates)) : null,
      end: endDates.length > 0 ? new Date(Math.max(...endDates)) : null,
    },
  };
};

/**
 * Export baseline to JSON
 * @param {Object} baseline - Baseline object to export
 * @returns {Object} Exportable baseline object
 */
export const exportBaseline = baseline => {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    baseline: {
      ...baseline,
      exportedAt: new Date().toISOString(),
    },
  };
};

/**
 * Import baseline from JSON
 * @param {Object} importData - Import data object
 * @returns {Object} Import result
 */
export const importBaseline = importData => {
  const errors = [];
  const warnings = [];

  if (!importData.baseline) {
    errors.push('No baseline data found in import file');
    return { success: false, errors, warnings, baseline: null };
  }

  const baseline = importData.baseline;

  // Validate baseline structure
  if (!baseline.id || !baseline.name || !baseline.data) {
    errors.push('Invalid baseline structure');
  }

  if (baseline.name && baseline.name.length > 50) {
    errors.push('Baseline name is too long');
  }

  if (baseline.description && baseline.description.length > 500) {
    errors.push('Baseline description is too long');
  }

  if (!baseline.data.tasks || !Array.isArray(baseline.data.tasks)) {
    errors.push('Baseline must contain valid task data');
  }

  // Check for duplicate ID
  if (baseline.id && baseline.id.includes('baseline_')) {
    warnings.push('Baseline ID may conflict with existing baselines');
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    baseline: errors.length === 0 ? baseline : null,
  };
};

/**
 * Generate baseline name suggestions
 * @param {Array} existingBaselines - Array of existing baseline names
 * @returns {Array} Array of suggested names
 */
export const generateBaselineNameSuggestions = (existingBaselines = []) => {
  const baseNames = [
    'Initial Plan',
    'Approved Baseline',
    'Contract Baseline',
    'Current State',
    'Milestone Review',
    'Phase 1 Complete',
    'Pre-Construction',
    'Construction Start',
    'Project Handover',
  ];

  const existingNames = existingBaselines.map(b => b.name.toLowerCase());
  const suggestions = baseNames.filter(
    name => !existingNames.includes(name.toLowerCase())
  );

  // Add date-based suggestions
  const today = new Date();
  const dateSuggestions = [
    `${today.toLocaleDateString()} Baseline`,
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')} Baseline`,
    `Baseline ${today.toLocaleDateString()}`,
  ];

  return [...suggestions, ...dateSuggestions].slice(0, 10);
};

/**
 * Get baseline comparison mode settings
 * @param {string} activeBaselineId - Currently active baseline ID
 * @param {Object} comparisonSettings - Comparison display settings
 * @returns {Object} Comparison mode configuration
 */
export const getBaselineComparisonMode = (
  activeBaselineId,
  comparisonSettings = {}
) => {
  return {
    isEnabled: !!activeBaselineId,
    activeBaselineId,
    showVariance: comparisonSettings.showVariance !== false,
    showBaselineBars: comparisonSettings.showBaselineBars !== false,
    showConnectors: comparisonSettings.showConnectors !== false,
    varianceThreshold: comparisonSettings.varianceThreshold || 1, // days
    highlightChanges: comparisonSettings.highlightChanges !== false,
  };
};

/**
 * Calculate baseline performance metrics
 * @param {Array} currentTasks - Current tasks array
 * @param {Object} baseline - Baseline object
 * @returns {Object} Performance metrics
 */
export const calculateBaselinePerformance = (currentTasks, baseline) => {
  if (!baseline || !baseline.data || !baseline.data.tasks) {
    return {
      schedulePerformance: 0,
      costPerformance: 0,
      scopePerformance: 0,
      overallPerformance: 0,
      metrics: {},
    };
  }

  const baselineTasks = baseline.data.tasks;
  let scheduleVariance = 0;
  let costVariance = 0;
  let scopeVariance = 0;
  let totalTasks = 0;

  currentTasks.forEach(currentTask => {
    const baselineTask = baselineTasks.find(bt => bt.id === currentTask.id);
    if (baselineTask) {
      totalTasks++;

      // Schedule variance (days)
      const currentEnd = new Date(currentTask.endDate);
      const baselineEnd = new Date(baselineTask.endDate);
      const scheduleDiff = (currentEnd - baselineEnd) / (1000 * 60 * 60 * 24);
      scheduleVariance += scheduleDiff;

      // Cost variance
      const currentCost = currentTask.cost || 0;
      const baselineCost = baselineTask.cost || 0;
      costVariance += currentCost - baselineCost;

      // Scope variance (progress)
      const currentProgress = currentTask.progress || 0;
      const baselineProgress = baselineTask.progress || 0;
      scopeVariance += currentProgress - baselineProgress;
    }
  });

  const avgScheduleVariance =
    totalTasks > 0 ? scheduleVariance / totalTasks : 0;
  const avgCostVariance = totalTasks > 0 ? costVariance / totalTasks : 0;
  const avgScopeVariance = totalTasks > 0 ? scopeVariance / totalTasks : 0;

  // Calculate performance indices (higher is better)
  const schedulePerformance = Math.max(
    0,
    100 - Math.abs(avgScheduleVariance) * 10
  );
  const costPerformance = Math.max(0, 100 - Math.abs(avgCostVariance) * 5);
  const scopePerformance = Math.max(0, 100 - Math.abs(avgScopeVariance) * 2);

  const overallPerformance =
    (schedulePerformance + costPerformance + scopePerformance) / 3;

  return {
    schedulePerformance: Math.round(schedulePerformance * 100) / 100,
    costPerformance: Math.round(costPerformance * 100) / 100,
    scopePerformance: Math.round(scopePerformance * 100) / 100,
    overallPerformance: Math.round(overallPerformance * 100) / 100,
    metrics: {
      avgScheduleVariance: Math.round(avgScheduleVariance * 100) / 100,
      avgCostVariance: Math.round(avgCostVariance * 100) / 100,
      avgScopeVariance: Math.round(avgScopeVariance * 100) / 100,
      totalTasks,
    },
  };
};
