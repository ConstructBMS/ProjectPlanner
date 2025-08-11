/**
 * Bar Label Utilities
 * Handle custom Gantt bar label configuration and placement
 */

/**
 * Default bar label configuration
 */
export const DEFAULT_BAR_LABELS = {
  enabled: true,
  labels: [
    {
      id: 'taskName',
      type: 'taskName',
      enabled: true,
      position: 'center',
      fontSize: 12,
      fontWeight: 'medium',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: 2,
      borderRadius: 2,
      showBackground: true,
    },
  ],
  globalSettings: {
    minBarWidth: 60,
    maxLabels: 3,
    showOnHover: false,
    truncateLongLabels: true,
    maxLabelLength: 20,
  },
};

/**
 * Available label types and their configurations
 */
export const LABEL_TYPES = {
  taskName: {
    id: 'taskName',
    label: 'Task Name',
    description: 'Display the task name on the bar',
    getValue: task => task.name || 'Untitled',
    defaultPosition: 'center',
    requiresBarWidth: 80,
  },
  startDate: {
    id: 'startDate',
    label: 'Start Date',
    description: 'Show the task start date',
    getValue: task => {
      if (!task.startDate) return '';
      const date = new Date(task.startDate);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
    },
    defaultPosition: 'left',
    requiresBarWidth: 50,
  },
  finishDate: {
    id: 'finishDate',
    label: 'Finish Date',
    description: 'Show the task finish date',
    getValue: task => {
      if (!task.endDate) return '';
      const date = new Date(task.endDate);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
      });
    },
    defaultPosition: 'right',
    requiresBarWidth: 50,
  },
  duration: {
    id: 'duration',
    label: 'Duration',
    description: 'Show task duration in days',
    getValue: task => {
      const duration = task.duration || 0;
      return `${duration}d`;
    },
    defaultPosition: 'center',
    requiresBarWidth: 40,
  },
  progress: {
    id: 'progress',
    label: '% Complete',
    description: 'Show task completion percentage',
    getValue: task => {
      const progress = task.progress || 0;
      return `${Math.round(progress)}%`;
    },
    defaultPosition: 'center',
    requiresBarWidth: 40,
  },
  resource: {
    id: 'resource',
    label: 'Resource',
    description: 'Show assigned resource name',
    getValue: task => task.resource || task.assignedTo || '',
    defaultPosition: 'top',
    requiresBarWidth: 60,
  },
  priority: {
    id: 'priority',
    label: 'Priority',
    description: 'Show task priority level',
    getValue: task => task.priority || 'Medium',
    defaultPosition: 'top',
    requiresBarWidth: 50,
  },
  status: {
    id: 'status',
    label: 'Status',
    description: 'Show task status',
    getValue: task => task.status || 'Not Started',
    defaultPosition: 'bottom',
    requiresBarWidth: 70,
  },
  cost: {
    id: 'cost',
    label: 'Cost',
    description: 'Show task cost',
    getValue: task => {
      const cost = task.cost || 0;
      return cost > 0 ? `£${cost.toFixed(0)}` : '';
    },
    defaultPosition: 'right',
    requiresBarWidth: 50,
  },
};

/**
 * Available label positions
 */
export const LABEL_POSITIONS = {
  left: {
    id: 'left',
    label: 'Left',
    description: 'Position label on the left side of the bar',
    className: 'left-0',
    style: { left: '2px' },
  },
  center: {
    id: 'center',
    label: 'Center',
    description: 'Position label in the center of the bar',
    className: 'left-1/2 transform -translate-x-1/2',
    style: { left: '50%', transform: 'translateX(-50%)' },
  },
  right: {
    id: 'right',
    label: 'Right',
    description: 'Position label on the right side of the bar',
    className: 'right-0',
    style: { right: '2px' },
  },
  top: {
    id: 'top',
    label: 'Top',
    description: 'Position label above the bar',
    className: 'bottom-full',
    style: { bottom: '100%', left: '50%', transform: 'translateX(-50%)' },
  },
  bottom: {
    id: 'bottom',
    label: 'Bottom',
    description: 'Position label below the bar',
    className: 'top-full',
    style: { top: '100%', left: '50%', transform: 'translateX(-50%)' },
  },
};

/**
 * Get label configuration for a task
 * @param {Object} task - Task object
 * @param {Object} userSettings - User settings containing barLabels
 * @param {number} barWidth - Width of the task bar in pixels
 * @returns {Array} Array of label configurations to render
 */
export const getTaskBarLabels = (task, userSettings = {}, barWidth = 0) => {
  const barLabels = userSettings.barLabels || DEFAULT_BAR_LABELS;

  if (!barLabels.enabled || !barLabels.labels) {
    return [];
  }

  const enabledLabels = barLabels.labels.filter(label => label.enabled);
  const globalSettings =
    barLabels.globalSettings || DEFAULT_BAR_LABELS.globalSettings;

  // Filter labels based on bar width and max labels
  const availableLabels = enabledLabels
    .filter(label => {
      const labelType = LABEL_TYPES[label.type];
      return labelType && barWidth >= labelType.requiresBarWidth;
    })
    .slice(0, globalSettings.maxLabels || 3);

  return availableLabels.map(label => {
    const labelType = LABEL_TYPES[label.type];
    const position =
      LABEL_POSITIONS[label.position || labelType.defaultPosition];

    let value = labelType ? labelType.getValue(task) : '';

    // Truncate long labels if enabled
    if (
      globalSettings.truncateLongLabels &&
      value.length > globalSettings.maxLabelLength
    ) {
      value = `${value.substring(0, globalSettings.maxLabelLength)}...`;
    }

    return {
      id: label.id,
      type: label.type,
      value,
      position: label.position || labelType.defaultPosition,
      className: position.className,
      style: {
        ...position.style,
        fontSize: `${label.fontSize || 12}px`,
        fontWeight: label.fontWeight || 'medium',
        color: label.color || '#FFFFFF',
        backgroundColor: label.showBackground
          ? label.backgroundColor || 'rgba(0, 0, 0, 0.3)'
          : 'transparent',
        padding: `${label.padding || 2}px`,
        borderRadius: `${label.borderRadius || 2}px`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: `${barWidth - 4}px`,
        zIndex: 10,
      },
      showBackground: label.showBackground !== false,
    };
  });
};

/**
 * Create a new label configuration
 * @param {string} type - Label type
 * @param {string} position - Label position
 * @returns {Object} Label configuration object
 */
export const createLabelConfig = (type, position = 'center') => {
  const labelType = LABEL_TYPES[type];
  if (!labelType) {
    throw new Error(`Invalid label type: ${type}`);
  }

  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    enabled: true,
    position: position || labelType.defaultPosition,
    fontSize: 12,
    fontWeight: 'medium',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 2,
    borderRadius: 2,
    showBackground: true,
  };
};

/**
 * Validate label configuration
 * @param {Object} label - Label configuration to validate
 * @returns {Object} Validation result
 */
export const validateLabelConfig = label => {
  const errors = [];
  const warnings = [];

  if (!label.type || !LABEL_TYPES[label.type]) {
    errors.push('Invalid label type');
  }

  if (label.position && !LABEL_POSITIONS[label.position]) {
    errors.push('Invalid label position');
  }

  if (label.fontSize && (label.fontSize < 8 || label.fontSize > 20)) {
    warnings.push('Font size should be between 8 and 20 pixels');
  }

  if (label.padding && (label.padding < 0 || label.padding > 10)) {
    warnings.push('Padding should be between 0 and 10 pixels');
  }

  if (
    label.borderRadius &&
    (label.borderRadius < 0 || label.borderRadius > 10)
  ) {
    warnings.push('Border radius should be between 0 and 10 pixels');
  }

  // Validate color format
  const colorRegex =
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;

  if (label.color && !colorRegex.test(label.color)) {
    errors.push('Invalid color format');
  }

  if (label.backgroundColor && !colorRegex.test(label.backgroundColor)) {
    errors.push('Invalid background color format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get available label types for selection
 * @returns {Array} Array of label type objects
 */
export const getAvailableLabelTypes = () => {
  return Object.values(LABEL_TYPES).map(type => ({
    value: type.id,
    label: type.label,
    description: type.description,
    defaultPosition: type.defaultPosition,
    requiresBarWidth: type.requiresBarWidth,
  }));
};

/**
 * Get available label positions
 * @returns {Array} Array of position objects
 */
export const getAvailablePositions = () => {
  return Object.values(LABEL_POSITIONS).map(position => ({
    value: position.id,
    label: position.label,
    description: position.description,
  }));
};

/**
 * Calculate label visibility based on bar width and settings
 * @param {number} barWidth - Width of the task bar in pixels
 * @param {Object} label - Label configuration
 * @param {Object} globalSettings - Global label settings
 * @returns {boolean} Whether the label should be visible
 */
export const shouldShowLabel = (barWidth, label, globalSettings = {}) => {
  const minBarWidth = globalSettings.minBarWidth || 60;
  const labelType = LABEL_TYPES[label.type];

  if (!labelType) return false;

  return barWidth >= Math.max(minBarWidth, labelType.requiresBarWidth);
};

/**
 * Get label preview for configuration
 * @param {Object} label - Label configuration
 * @param {Object} sampleTask - Sample task for preview
 * @returns {Object} Preview configuration
 */
export const getLabelPreview = (label, sampleTask = {}) => {
  const labelType = LABEL_TYPES[label.type];
  const position = LABEL_POSITIONS[label.position];

  if (!labelType || !position) {
    return null;
  }

  const value = labelType.getValue(sampleTask);

  return {
    value,
    className: position.className,
    style: {
      ...position.style,
      fontSize: `${label.fontSize || 12}px`,
      fontWeight: label.fontWeight || 'medium',
      color: label.color || '#FFFFFF',
      backgroundColor: label.showBackground
        ? label.backgroundColor || 'rgba(0, 0, 0, 0.3)'
        : 'transparent',
      padding: `${label.padding || 2}px`,
      borderRadius: `${label.borderRadius || 2}px`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '120px',
      zIndex: 10,
    },
  };
};

/**
 * Export bar label configuration
 * @param {Object} userSettings - User settings containing barLabels
 * @returns {Object} Exportable bar labels object
 */
export const exportBarLabels = userSettings => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    barLabels: userSettings.barLabels || DEFAULT_BAR_LABELS,
    metadata: {
      description: 'Custom Gantt bar labels export',
      labelCount: (userSettings.barLabels?.labels || []).length,
    },
  };
};

/**
 * Import bar label configuration
 * @param {Object} importData - Import data object
 * @returns {Object} Import result
 */
export const importBarLabels = importData => {
  const errors = [];
  const warnings = [];

  if (!importData.barLabels) {
    errors.push('No bar labels found in import data');
    return { success: false, errors, warnings, barLabels: null };
  }

  const barLabels = importData.barLabels;

  // Validate bar labels structure
  if (!Array.isArray(barLabels.labels)) {
    errors.push('Invalid bar labels structure');
  }

  // Validate each label
  if (barLabels.labels) {
    barLabels.labels.forEach((label, index) => {
      const validation = validateLabelConfig(label);
      if (!validation.isValid) {
        errors.push(
          `Invalid label at index ${index}: ${validation.errors.join(', ')}`
        );
      }
      warnings.push(...validation.warnings.map(w => `Label ${index}: ${w}`));
    });
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    barLabels: errors.length === 0 ? barLabels : null,
  };
};

/**
 * Get default sample task for preview
 * @returns {Object} Sample task object
 */
export const getSampleTask = () => {
  return {
    name: 'Sample Task',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    duration: 10,
    progress: 60,
    resource: 'John Doe',
    priority: 'High',
    status: 'In Progress',
    cost: 1500,
  };
};

/**
 * Calculate optimal label placement to avoid overlaps
 * @param {Array} labels - Array of label configurations
 * @param {number} barWidth - Width of the task bar
 * @param {number} barHeight - Height of the task bar
 * @returns {Array} Array of labels with adjusted positions
 */
export const calculateOptimalPlacement = (labels, barWidth, barHeight) => {
  if (labels.length <= 1) return labels;

  const positions = ['left', 'center', 'right', 'top', 'bottom'];
  const adjustedLabels = [...labels];

  // Group labels by position
  const positionGroups = {};
  positions.forEach(pos => {
    positionGroups[pos] = adjustedLabels.filter(
      label => label.position === pos
    );
  });

  // Adjust overlapping labels
  Object.entries(positionGroups).forEach(([position, groupLabels]) => {
    if (groupLabels.length > 1) {
      // For horizontal positions, stack vertically
      if (['left', 'center', 'right'].includes(position)) {
        groupLabels.forEach((label, index) => {
          label.style = {
            ...label.style,
            top: `${index * 16}px`,
          };
        });
      }
      // For vertical positions, stack horizontally
      else if (['top', 'bottom'].includes(position)) {
        groupLabels.forEach((label, index) => {
          label.style = {
            ...label.style,
            left: `${index * 80}px`,
            transform: 'translateX(-50%)',
          };
        });
      }
    }
  });

  return adjustedLabels;
};

/**
 * Get label tooltip content
 * @param {Object} label - Label configuration
 * @param {Object} task - Task object
 * @returns {string} Tooltip content
 */
export const getLabelTooltip = (label, task) => {
  const labelType = LABEL_TYPES[label.type];
  if (!labelType) return '';

  const fullValue = labelType.getValue(task);
  const currentValue = label.value;

  if (fullValue !== currentValue) {
    return `${labelType.label}: ${fullValue}`;
  }

  return `${labelType.label}: ${fullValue}`;
};
