// Grid Column Management Utilities

// Default column configuration
export const DEFAULT_COLUMN_CONFIG = {
  maxColumns: 20,
  minColumnWidth: 60,
  maxColumnWidth: 400,
  defaultColumnWidth: 120,
  allowReordering: true,
  allowResizing: true,
  allowHiding: true,
  autoSave: true,
  saveInterval: 5000, // 5 seconds
};

// Column type definitions with metadata
export const COLUMN_TYPES = {
  taskName: {
    key: 'taskName',
    label: 'Task Name',
    type: 'text',
    defaultWidth: 200,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
    category: 'basic',
    description: 'The name or title of the task',
  },
  startDate: {
    key: 'startDate',
    label: 'Start Date',
    type: 'date',
    defaultWidth: 120,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
    category: 'schedule',
    description: 'The planned start date of the task',
  },
  endDate: {
    key: 'endDate',
    label: 'End Date',
    type: 'date',
    defaultWidth: 120,
    sortable: true,
    filterable: true,
    editable: true,
    required: true,
    category: 'schedule',
    description: 'The planned end date of the task',
  },
  duration: {
    key: 'duration',
    label: 'Duration',
    type: 'number',
    defaultWidth: 80,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'schedule',
    description: 'The duration of the task in working days',
    unit: 'days',
  },
  resource: {
    key: 'resource',
    label: 'Resource',
    type: 'text',
    defaultWidth: 120,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'resource',
    description: 'The primary resource assigned to the task',
  },
  status: {
    key: 'status',
    label: 'Status',
    type: 'select',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'progress',
    description: 'The current status of the task',
    options: ['Not Started', 'In Progress', 'Complete', 'Delayed'],
  },
  progress: {
    key: 'progress',
    label: 'Progress',
    type: 'percentage',
    defaultWidth: 80,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'progress',
    description: 'The percentage completion of the task',
    min: 0,
    max: 100,
  },
  work: {
    key: 'work',
    label: 'Work (hrs)',
    type: 'number',
    defaultWidth: 80,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'resource',
    description: 'The total work hours for the task',
    unit: 'hours',
  },
  cost: {
    key: 'cost',
    label: 'Cost (£)',
    type: 'currency',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'cost',
    description: 'The total cost of the task',
    currency: 'GBP',
  },
  units: {
    key: 'units',
    label: 'Units (%)',
    type: 'percentage',
    defaultWidth: 80,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'resource',
    description: 'The resource allocation percentage',
    min: 0,
    max: 100,
  },
  startVariance: {
    key: 'startVariance',
    label: 'Start Variance',
    type: 'variance',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'baseline',
    description: 'Variance from baseline start date',
  },
  finishVariance: {
    key: 'finishVariance',
    label: 'Finish Variance',
    type: 'variance',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'baseline',
    description: 'Variance from baseline finish date',
  },
  durationVariance: {
    key: 'durationVariance',
    label: 'Duration Variance',
    type: 'variance',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'baseline',
    description: 'Variance from baseline duration',
  },
  scheduleStatus: {
    key: 'scheduleStatus',
    label: 'Schedule Status',
    type: 'status',
    defaultWidth: 120,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'progress',
    description: 'Current schedule status relative to status date',
  },
  deadline: {
    key: 'deadline',
    label: 'Deadline',
    type: 'date',
    defaultWidth: 120,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'schedule',
    description: 'The deadline date for the task',
  },
  criticalPath: {
    key: 'criticalPath',
    label: 'Critical Path',
    type: 'boolean',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'schedule',
    description: 'Whether the task is on the critical path',
  },
  totalFloat: {
    key: 'totalFloat',
    label: 'Total Float',
    type: 'number',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'schedule',
    description: 'Total float/slack for the task',
    unit: 'days',
  },
  freeFloat: {
    key: 'freeFloat',
    label: 'Free Float',
    type: 'number',
    defaultWidth: 100,
    sortable: true,
    filterable: true,
    editable: false,
    required: false,
    category: 'schedule',
    description: 'Free float/slack for the task',
    unit: 'days',
  },
  priority: {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    defaultWidth: 80,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'basic',
    description: 'The priority level of the task',
    options: ['Low', 'Medium', 'High', 'Critical'],
  },
  assignedTo: {
    key: 'assignedTo',
    label: 'Assigned To',
    type: 'text',
    defaultWidth: 120,
    sortable: true,
    filterable: true,
    editable: true,
    required: false,
    category: 'resource',
    description: 'The person assigned to the task',
  },
  notes: {
    key: 'notes',
    label: 'Notes',
    type: 'text',
    defaultWidth: 150,
    sortable: false,
    filterable: true,
    editable: true,
    required: false,
    category: 'basic',
    description: 'Additional notes for the task',
  },
};

// Column categories for organization
export const COLUMN_CATEGORIES = {
  basic: {
    name: 'Basic Information',
    description: 'Core task information',
    color: 'blue',
  },
  schedule: {
    name: 'Schedule',
    description: 'Date and duration information',
    color: 'green',
  },
  resource: {
    name: 'Resource',
    description: 'Resource assignment and allocation',
    color: 'purple',
  },
  progress: {
    name: 'Progress',
    description: 'Status and progress tracking',
    color: 'orange',
  },
  cost: {
    name: 'Cost',
    description: 'Financial information',
    color: 'red',
  },
  baseline: {
    name: 'Baseline',
    description: 'Baseline comparison data',
    color: 'gray',
  },
};

// Default column order
export const DEFAULT_COLUMN_ORDER = [
  'taskName',
  'startDate',
  'endDate',
  'duration',
  'resource',
  'status',
  'progress',
  'work',
  'cost',
  'units',
  'startVariance',
  'finishVariance',
  'durationVariance',
  'scheduleStatus',
  'deadline',
  'criticalPath',
  'totalFloat',
  'freeFloat',
  'priority',
  'assignedTo',
  'notes',
];

// Create a new column configuration
export const createColumnConfig = (key, customProps = {}) => {
  const baseConfig = COLUMN_TYPES[key];
  if (!baseConfig) {
    throw new Error(`Unknown column type: ${key}`);
  }

  return {
    ...baseConfig,
    ...customProps,
    id: `${key}_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
};

// Validate column configuration
export const validateColumnConfig = config => {
  const errors = [];

  if (!config.key) {
    errors.push('Column key is required');
  }

  if (!config.label) {
    errors.push('Column label is required');
  }

  if (
    config.width &&
    (config.width < DEFAULT_COLUMN_CONFIG.minColumnWidth ||
      config.width > DEFAULT_COLUMN_CONFIG.maxColumnWidth)
  ) {
    errors.push(
      `Column width must be between ${DEFAULT_COLUMN_CONFIG.minColumnWidth} and ${DEFAULT_COLUMN_CONFIG.maxColumnWidth}px`
    );
  }

  if (
    config.type &&
    !Object.values(COLUMN_TYPES).some(col => col.type === config.type)
  ) {
    errors.push(`Invalid column type: ${config.type}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get all available columns
export const getAvailableColumns = () => {
  return Object.values(COLUMN_TYPES).map(col => ({
    ...col,
    id: col.key,
  }));
};

// Get columns by category
export const getColumnsByCategory = () => {
  const categorized = {};

  Object.values(COLUMN_TYPES).forEach(column => {
    const category = column.category || 'other';
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(column);
  });

  return categorized;
};

// Filter columns by search term
export const filterColumnsBySearch = (columns, searchTerm) => {
  if (!searchTerm) return columns;

  const term = searchTerm.toLowerCase();
  return columns.filter(
    column =>
      column.label.toLowerCase().includes(term) ||
      column.key.toLowerCase().includes(term) ||
      column.description.toLowerCase().includes(term) ||
      (column.category &&
        COLUMN_CATEGORIES[column.category]?.name.toLowerCase().includes(term))
  );
};

// Sort columns by category and name
export const sortColumnsByCategory = columns => {
  return columns.sort((a, b) => {
    // First sort by category order
    const categoryOrder = Object.keys(COLUMN_CATEGORIES);
    const aCategoryIndex = categoryOrder.indexOf(a.category || 'other');
    const bCategoryIndex = categoryOrder.indexOf(b.category || 'other');

    if (aCategoryIndex !== bCategoryIndex) {
      return aCategoryIndex - bCategoryIndex;
    }

    // Then sort by label
    return a.label.localeCompare(b.label);
  });
};

// Create default grid configuration
export const createDefaultGridConfig = () => {
  return {
    columns: DEFAULT_COLUMN_ORDER.map(key => ({
      key,
      label: COLUMN_TYPES[key]?.label || key,
      visible: true,
      width:
        COLUMN_TYPES[key]?.defaultWidth ||
        DEFAULT_COLUMN_CONFIG.defaultColumnWidth,
      order: DEFAULT_COLUMN_ORDER.indexOf(key),
    })),
    settings: {
      ...DEFAULT_COLUMN_CONFIG,
      allowReordering: true,
      allowResizing: true,
      allowHiding: true,
      showColumnHeaders: true,
      showRowNumbers: false,
      alternatingRowColors: true,
      rowHeight: 32,
      headerHeight: 40,
    },
    lastModified: new Date().toISOString(),
  };
};

// Validate grid configuration
export const validateGridConfig = config => {
  const errors = [];

  if (!config.columns || !Array.isArray(config.columns)) {
    errors.push('Grid configuration must have a columns array');
    return { isValid: false, errors };
  }

  if (config.columns.length > DEFAULT_COLUMN_CONFIG.maxColumns) {
    errors.push(`Maximum ${DEFAULT_COLUMN_CONFIG.maxColumns} columns allowed`);
  }

  const visibleColumns = config.columns.filter(col => col.visible);
  if (visibleColumns.length === 0) {
    errors.push('At least one column must be visible');
  }

  // Check for duplicate keys
  const keys = config.columns.map(col => col.key);
  const uniqueKeys = new Set(keys);
  if (keys.length !== uniqueKeys.size) {
    errors.push('Duplicate column keys found');
  }

  // Validate individual columns
  config.columns.forEach((column, index) => {
    const validation = validateColumnConfig(column);
    if (!validation.isValid) {
      errors.push(
        `Column ${index + 1} (${column.key}): ${validation.errors.join(', ')}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Reorder columns
export const reorderColumns = (columns, fromIndex, toIndex) => {
  const result = [...columns];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  // Update order property
  return result.map((col, index) => ({
    ...col,
    order: index,
  }));
};

// Add column to grid
export const addColumnToGrid = (gridConfig, columnKey, position = null) => {
  const columnType = COLUMN_TYPES[columnKey];
  if (!columnType) {
    throw new Error(`Unknown column type: ${columnKey}`);
  }

  const newColumn = {
    key: columnKey,
    label: columnType.label || columnKey,
    visible: true,
    width: columnType.defaultWidth,
    order: position !== null ? position : gridConfig.columns.length,
  };

  const updatedColumns = [...gridConfig.columns];

  if (position !== null) {
    updatedColumns.splice(position, 0, newColumn);
    // Update order for all columns
    updatedColumns.forEach((col, index) => {
      col.order = index;
    });
  } else {
    updatedColumns.push(newColumn);
  }

  return {
    ...gridConfig,
    columns: updatedColumns,
    lastModified: new Date().toISOString(),
  };
};

// Remove column from grid
export const removeColumnFromGrid = (gridConfig, columnKey) => {
  const updatedColumns = gridConfig.columns.filter(
    col => col.key !== columnKey
  );

  // Update order for remaining columns
  updatedColumns.forEach((col, index) => {
    col.order = index;
  });

  return {
    ...gridConfig,
    columns: updatedColumns,
    lastModified: new Date().toISOString(),
  };
};

// Toggle column visibility
export const toggleColumnVisibility = (gridConfig, columnKey) => {
  const updatedColumns = gridConfig.columns.map(col =>
    col.key === columnKey ? { ...col, visible: !col.visible } : col
  );

  return {
    ...gridConfig,
    columns: updatedColumns,
    lastModified: new Date().toISOString(),
  };
};

// Update column width
export const updateColumnWidth = (gridConfig, columnKey, width) => {
  const validatedWidth = Math.max(
    DEFAULT_COLUMN_CONFIG.minColumnWidth,
    Math.min(DEFAULT_COLUMN_CONFIG.maxColumnWidth, width)
  );

  const updatedColumns = gridConfig.columns.map(col =>
    col.key === columnKey ? { ...col, width: validatedWidth } : col
  );

  return {
    ...gridConfig,
    columns: updatedColumns,
    lastModified: new Date().toISOString(),
  };
};

// Get column width
export const getColumnWidth = (gridConfig, columnKey) => {
  const column = gridConfig.columns.find(col => col.key === columnKey);
  if (!column) {
    // Return default width if column not found
    return (
      COLUMN_TYPES[columnKey]?.defaultWidth ||
      DEFAULT_COLUMN_CONFIG.defaultColumnWidth
    );
  }
  return (
    column.width ||
    COLUMN_TYPES[columnKey]?.defaultWidth ||
    DEFAULT_COLUMN_CONFIG.defaultColumnWidth
  );
};

// Get visible columns
export const getVisibleColumns = gridConfig => {
  return gridConfig.columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);
};

// Get hidden columns
export const getHiddenColumns = gridConfig => {
  return gridConfig.columns.filter(col => !col.visible);
};

// Export grid configuration
export const exportGridConfig = gridConfig => {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    config: gridConfig,
  };
};

// Import grid configuration
export const importGridConfig = exportedConfig => {
  if (!exportedConfig.config) {
    throw new Error('Invalid grid configuration format');
  }

  const validation = validateGridConfig(exportedConfig.config);
  if (!validation.isValid) {
    throw new Error(
      `Invalid grid configuration: ${validation.errors.join(', ')}`
    );
  }

  return {
    ...exportedConfig.config,
    lastModified: new Date().toISOString(),
  };
};

// Create preset from current configuration
export const createGridPreset = (gridConfig, name, description = '') => {
  return {
    id: `preset_${Date.now()}`,
    name,
    description,
    config: { ...gridConfig },
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  };
};

// Apply preset to grid configuration
export const applyGridPreset = (currentConfig, preset) => {
  const validation = validateGridConfig(preset.config);
  if (!validation.isValid) {
    throw new Error(
      `Invalid preset configuration: ${validation.errors.join(', ')}`
    );
  }

  return {
    ...preset.config,
    lastModified: new Date().toISOString(),
  };
};

// Get column statistics
export const getColumnStatistics = (gridConfig, tasks = []) => {
  const stats = {
    totalColumns: gridConfig.columns.length,
    visibleColumns: getVisibleColumns(gridConfig).length,
    hiddenColumns: getHiddenColumns(gridConfig).length,
    categories: {},
    dataTypes: {},
  };

  // Count by category
  gridConfig.columns.forEach(col => {
    const category = col.category || 'other';
    stats.categories[category] = (stats.categories[category] || 0) + 1;
  });

  // Count by data type
  gridConfig.columns.forEach(col => {
    const type = col.type || 'text';
    stats.dataTypes[type] = (stats.dataTypes[type] || 0) + 1;
  });

  // Add task data statistics if provided
  if (tasks.length > 0) {
    stats.taskCount = tasks.length;
    stats.dataCompleteness = {};

    gridConfig.columns.forEach(col => {
      const key = col.key;
      const nonEmptyCount = tasks.filter(
        task =>
          task[key] !== null && task[key] !== undefined && task[key] !== ''
      ).length;
      stats.dataCompleteness[key] = {
        total: tasks.length,
        filled: nonEmptyCount,
        percentage: Math.round((nonEmptyCount / tasks.length) * 100),
      };
    });
  }

  return stats;
};

// Auto-fit column widths based on content
export const autoFitColumnWidths = (gridConfig, tasks = []) => {
  const updatedColumns = gridConfig.columns.map(col => {
    const columnType = COLUMN_TYPES[col.key];
    if (!columnType) return col;

    let maxWidth = columnType.defaultWidth;

    // Calculate width based on header
    const headerWidth = col.label.length * 8 + 20; // Approximate character width
    maxWidth = Math.max(maxWidth, headerWidth);

    // Calculate width based on content
    if (tasks.length > 0) {
      const contentWidths = tasks.map(task => {
        const value = task[col.key];
        if (value === null || value === undefined) return 0;

        switch (columnType.type) {
          case 'date':
            return 100; // Fixed width for dates
          case 'number':
          case 'percentage':
            return value.toString().length * 8 + 20;
          case 'select':
            return (
              Math.max(...columnType.options.map(opt => opt.length * 8)) + 30
            );
          case 'boolean':
            return 80;
          case 'currency':
            return value.toString().length * 8 + 30;
          default:
            return value.toString().length * 8 + 20;
        }
      });

      const maxContentWidth = Math.max(...contentWidths);
      maxWidth = Math.max(maxWidth, maxContentWidth);
    }

    // Apply constraints
    maxWidth = Math.max(DEFAULT_COLUMN_CONFIG.minColumnWidth, maxWidth);
    maxWidth = Math.min(DEFAULT_COLUMN_CONFIG.maxColumnWidth, maxWidth);

    return {
      ...col,
      width: maxWidth,
    };
  });

  return {
    ...gridConfig,
    columns: updatedColumns,
    lastModified: new Date().toISOString(),
  };
};

// Reset to default configuration
export const resetToDefaultConfig = () => {
  return createDefaultGridConfig();
};

// Save configuration to localStorage
export const saveGridConfigToStorage = (
  gridConfig,
  key = 'gantt.gridConfig'
) => {
  try {
    localStorage.setItem(key, JSON.stringify(gridConfig));
    return true;
  } catch (error) {
    console.error('Error saving grid configuration to localStorage:', error);
    return false;
  }
};

// Load configuration from localStorage
export const loadGridConfigFromStorage = (key = 'gantt.gridConfig') => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      const validation = validateGridConfig(parsed);
      if (validation.isValid) {
        return parsed;
      } else {
        // Silently use default instead of warning
        console.debug(
          'Using default grid configuration due to validation errors'
        );
      }
    }
  } catch (error) {
    console.debug('Error loading grid configuration, using default');
  }

  return createDefaultGridConfig();
};
