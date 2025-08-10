/**
 * Bar Style Utilities
 * Handle custom Gantt bar styling based on task attributes
 */

/**
 * Default bar styles for different task attributes
 */
export const DEFAULT_BAR_STYLES = {
  // Task Type Styles
  taskType: {
    task: {
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 1,
      borderRadius: 4,
    },
    milestone: {
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 2,
      borderRadius: 8,
    },
    summary: {
      backgroundColor: '#10B981',
      borderColor: '#059669',
      textColor: '#FFFFFF',
      opacity: 0.9,
      borderWidth: 2,
      borderRadius: 4,
    },
  },

  // Status Styles
  status: {
    'Not Started': {
      backgroundColor: '#6B7280',
      borderColor: '#4B5563',
      textColor: '#FFFFFF',
      opacity: 0.8,
      borderWidth: 1,
      borderRadius: 4,
    },
    'Planned': {
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 1,
      borderRadius: 4,
    },
    'In Progress': {
      backgroundColor: '#F59E0B',
      borderColor: '#D97706',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 1,
      borderRadius: 4,
    },
    'Complete': {
      backgroundColor: '#10B981',
      borderColor: '#059669',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 1,
      borderRadius: 4,
    },
    'Delayed': {
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 2,
      borderRadius: 4,
    },
    'On Hold': {
      backgroundColor: '#8B5CF6',
      borderColor: '#7C3AED',
      textColor: '#FFFFFF',
      opacity: 0.7,
      borderWidth: 1,
      borderRadius: 4,
    },
    'Cancelled': {
      backgroundColor: '#6B7280',
      borderColor: '#4B5563',
      textColor: '#FFFFFF',
      opacity: 0.5,
      borderWidth: 1,
      borderRadius: 4,
    },
  },

  // Priority Styles
  priority: {
    Low: {
      backgroundColor: '#6B7280',
      borderColor: '#4B5563',
      textColor: '#FFFFFF',
      opacity: 0.8,
      borderWidth: 1,
      borderRadius: 4,
    },
    Medium: {
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 1,
      borderRadius: 4,
    },
    High: {
      backgroundColor: '#F59E0B',
      borderColor: '#D97706',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 2,
      borderRadius: 4,
    },
    Critical: {
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 3,
      borderRadius: 4,
    },
  },

  // Resource Styles (default colors for different resources)
  resource: {
    default: {
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      textColor: '#FFFFFF',
      opacity: 1,
      borderWidth: 1,
      borderRadius: 4,
    },
  },
};

/**
 * Get the appropriate bar style for a task based on user settings
 * @param {Object} task - Task object
 * @param {Object} userSettings - User settings containing barStyles
 * @returns {Object} Bar style object
 */
export const getTaskBarStyle = (task, userSettings = {}) => {
  const barStyles = userSettings.barStyles || {};
  
  // Priority order: user-defined > status > priority > task type > default
  let style = { ...DEFAULT_BAR_STYLES.taskType.task };

  // Check for user-defined styles first
  if (barStyles.taskType && barStyles.taskType[task.type]) {
    style = { ...style, ...barStyles.taskType[task.type] };
  }

  if (barStyles.status && barStyles.status[task.status]) {
    style = { ...style, ...barStyles.status[task.status] };
  }

  if (barStyles.priority && barStyles.priority[task.priority]) {
    style = { ...style, ...barStyles.priority[task.priority] };
  }

  if (barStyles.resource && task.resource && barStyles.resource[task.resource]) {
    style = { ...style, ...barStyles.resource[task.resource] };
  }

  // Apply task type as base if no user-defined style
  if (task.type === 'milestone' || task.isMilestone) {
    style = { ...style, ...DEFAULT_BAR_STYLES.taskType.milestone };
  } else if (task.isGroup) {
    style = { ...style, ...DEFAULT_BAR_STYLES.taskType.summary };
  }

  // Apply status styles
  if (task.status && DEFAULT_BAR_STYLES.status[task.status]) {
    style = { ...style, ...DEFAULT_BAR_STYLES.status[task.status] };
  }

  // Apply priority styles
  if (task.priority && DEFAULT_BAR_STYLES.priority[task.priority]) {
    style = { ...style, ...DEFAULT_BAR_STYLES.priority[task.priority] };
  }

  return style;
};

/**
 * Create a CSS style object from bar style configuration
 * @param {Object} barStyle - Bar style configuration
 * @returns {Object} CSS style object
 */
export const createBarStyleObject = (barStyle) => {
  return {
    backgroundColor: barStyle.backgroundColor,
    border: `${barStyle.borderWidth}px solid ${barStyle.borderColor}`,
    color: barStyle.textColor,
    opacity: barStyle.opacity,
    borderRadius: `${barStyle.borderRadius}px`,
    transition: 'all 0.2s ease-in-out',
  };
};

/**
 * Validate bar style configuration
 * @param {Object} style - Style configuration to validate
 * @returns {Object} Validation result
 */
export const validateBarStyle = (style) => {
  const errors = [];
  const warnings = [];

  // Check required properties
  const requiredProps = ['backgroundColor', 'borderColor', 'textColor'];
  requiredProps.forEach(prop => {
    if (!style[prop]) {
      errors.push(`${prop} is required`);
    }
  });

  // Validate color formats
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  
  if (style.backgroundColor && !colorRegex.test(style.backgroundColor)) {
    errors.push('Invalid backgroundColor format');
  }
  
  if (style.borderColor && !colorRegex.test(style.borderColor)) {
    errors.push('Invalid borderColor format');
  }
  
  if (style.textColor && !colorRegex.test(style.textColor)) {
    errors.push('Invalid textColor format');
  }

  // Validate numeric properties
  if (style.opacity !== undefined && (style.opacity < 0 || style.opacity > 1)) {
    errors.push('Opacity must be between 0 and 1');
  }

  if (style.borderWidth !== undefined && style.borderWidth < 0) {
    errors.push('Border width cannot be negative');
  }

  if (style.borderRadius !== undefined && style.borderRadius < 0) {
    errors.push('Border radius cannot be negative');
  }

  // Warnings
  if (style.opacity !== undefined && style.opacity < 0.3) {
    warnings.push('Very low opacity may make bars hard to see');
  }

  if (style.borderWidth !== undefined && style.borderWidth > 5) {
    warnings.push('Very thick borders may affect visual clarity');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get available task types for styling
 * @returns {Array} Array of task type objects
 */
export const getAvailableTaskTypes = () => {
  return [
    { value: 'task', label: 'Regular Task', description: 'Standard project tasks' },
    { value: 'milestone', label: 'Milestone', description: 'Project milestones and key dates' },
    { value: 'summary', label: 'Summary Task', description: 'Group and summary tasks' },
  ];
};

/**
 * Get available statuses for styling
 * @returns {Array} Array of status objects
 */
export const getAvailableStatuses = () => {
  return [
    { value: 'Not Started', label: 'Not Started', description: 'Tasks that haven\'t begun' },
    { value: 'Planned', label: 'Planned', description: 'Tasks scheduled for future' },
    { value: 'In Progress', label: 'In Progress', description: 'Tasks currently being worked on' },
    { value: 'Complete', label: 'Complete', description: 'Finished tasks' },
    { value: 'Delayed', label: 'Delayed', description: 'Tasks behind schedule' },
    { value: 'On Hold', label: 'On Hold', description: 'Paused tasks' },
    { value: 'Cancelled', label: 'Cancelled', description: 'Cancelled tasks' },
  ];
};

/**
 * Get available priorities for styling
 * @returns {Array} Array of priority objects
 */
export const getAvailablePriorities = () => {
  return [
    { value: 'Low', label: 'Low', description: 'Low priority tasks' },
    { value: 'Medium', label: 'Medium', description: 'Standard priority tasks' },
    { value: 'High', label: 'High', description: 'High priority tasks' },
    { value: 'Critical', label: 'Critical', description: 'Critical priority tasks' },
  ];
};

/**
 * Get unique resources from tasks
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Array of resource objects
 */
export const getAvailableResources = (tasks) => {
  const resources = new Set();
  
  tasks.forEach(task => {
    if (task.resource) {
      resources.add(task.resource);
    }
    if (task.assignedTo) {
      resources.add(task.assignedTo);
    }
  });

  return Array.from(resources).map(resource => ({
    value: resource,
    label: resource,
    description: `Tasks assigned to ${resource}`,
  }));
};

/**
 * Create a new bar style configuration
 * @param {string} category - Style category (taskType, status, priority, resource)
 * @param {string} key - Style key
 * @returns {Object} Default bar style configuration
 */
export const createDefaultBarStyle = (category, key) => {
  const defaults = {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    textColor: '#FFFFFF',
    opacity: 1,
    borderWidth: 1,
    borderRadius: 4,
  };

  // Use existing default if available
  if (DEFAULT_BAR_STYLES[category] && DEFAULT_BAR_STYLES[category][key]) {
    return { ...DEFAULT_BAR_STYLES[category][key] };
  }

  return defaults;
};

/**
 * Export bar styles for backup/transfer
 * @param {Object} userSettings - User settings containing barStyles
 * @returns {Object} Exportable bar styles object
 */
export const exportBarStyles = (userSettings) => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    barStyles: userSettings.barStyles || {},
    metadata: {
      description: 'Custom Gantt bar styles export',
      categories: Object.keys(userSettings.barStyles || {}),
    },
  };
};

/**
 * Import bar styles from backup/transfer
 * @param {Object} importData - Import data object
 * @returns {Object} Import result
 */
export const importBarStyles = (importData) => {
  const errors = [];
  const warnings = [];

  if (!importData.barStyles) {
    errors.push('No bar styles found in import data');
    return { success: false, errors, warnings };
  }

  // Validate imported styles
  Object.entries(importData.barStyles).forEach(([category, styles]) => {
    Object.entries(styles).forEach(([key, style]) => {
      const validation = validateBarStyle(style);
      if (!validation.isValid) {
        errors.push(`Invalid style for ${category}.${key}: ${validation.errors.join(', ')}`);
      }
      warnings.push(...validation.warnings.map(w => `${category}.${key}: ${w}`));
    });
  });

  return {
    success: errors.length === 0,
    barStyles: importData.barStyles,
    errors,
    warnings,
  };
};

/**
 * Get style preview for a given configuration
 * @param {Object} style - Bar style configuration
 * @returns {Object} Preview style object
 */
export const getStylePreview = (style) => {
  return createBarStyleObject(style);
};

/**
 * Generate a color palette for resources
 * @param {Array} resources - Array of resource names
 * @returns {Object} Color mapping for resources
 */
export const generateResourceColors = (resources) => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#FBBF24', '#F87171', '#A78BFA', '#60A5FA',
  ];

  const colorMap = {};
  resources.forEach((resource, index) => {
    colorMap[resource] = colors[index % colors.length];
  });

  return colorMap;
};

/**
 * Apply resource colors to bar styles
 * @param {Object} barStyles - Current bar styles
 * @param {Array} resources - Array of resource names
 * @returns {Object} Updated bar styles with resource colors
 */
export const applyResourceColors = (barStyles, resources) => {
  const resourceColors = generateResourceColors(resources);
  const updatedStyles = { ...barStyles };

  if (!updatedStyles.resource) {
    updatedStyles.resource = {};
  }

  resources.forEach(resource => {
    if (!updatedStyles.resource[resource]) {
      updatedStyles.resource[resource] = {
        backgroundColor: resourceColors[resource],
        borderColor: resourceColors[resource],
        textColor: '#FFFFFF',
        opacity: 1,
        borderWidth: 1,
        borderRadius: 4,
      };
    }
  });

  return updatedStyles;
};
