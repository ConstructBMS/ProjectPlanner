 
/**
 * Milestone Shape Utilities
 * Handle milestone shape options and rendering
 */

// Available milestone shapes
export const MILESTONE_SHAPES = {
  diamond: {
    key: 'diamond',
    label: 'Diamond',
    description: 'Classic diamond shape for milestones',
    icon: '💎',
    defaultColor: 'text-purple-600',
  },
  triangle: {
    key: 'triangle',
    label: 'Triangle',
    description: 'Triangle pointing upward',
    icon: '▲',
    defaultColor: 'text-blue-600',
  },
  circle: {
    key: 'circle',
    label: 'Circle',
    description: 'Simple circular milestone',
    icon: '●',
    defaultColor: 'text-green-600',
  },
  star: {
    key: 'star',
    label: 'Star',
    description: 'Star shape for important milestones',
    icon: '★',
    defaultColor: 'text-yellow-600',
  },
};

// Default milestone shape
export const DEFAULT_MILESTONE_SHAPE = 'diamond';

// Get milestone shape configuration
export const getMilestoneShape = (shapeKey = DEFAULT_MILESTONE_SHAPE) => {
  return (
    MILESTONE_SHAPES[shapeKey] || MILESTONE_SHAPES[DEFAULT_MILESTONE_SHAPE]
  );
};

// Get all available milestone shapes
export const getAvailableMilestoneShapes = () => {
  return Object.values(MILESTONE_SHAPES);
};

// Validate milestone shape
export const validateMilestoneShape = shapeKey => {
  return Object.keys(MILESTONE_SHAPES).includes(shapeKey);
};

// Get milestone shape for a specific task
export const getTaskMilestoneShape = (
  task,
  globalShape = DEFAULT_MILESTONE_SHAPE
) => {
  // Check if task has a specific milestone shape override
  if (task.milestoneShape && validateMilestoneShape(task.milestoneShape)) {
    return task.milestoneShape;
  }

  // Fall back to global shape
  return globalShape;
};

// Get milestone color based on task state and shape
export const getMilestoneColor = (task, shapeKey = DEFAULT_MILESTONE_SHAPE) => {
  const shape = getMilestoneShape(shapeKey);

  if (task.isCritical) {
    return 'text-red-600';
  }

  if (task.selected) {
    return 'text-blue-600';
  }

  if (task.hovered) {
    return 'text-blue-500';
  }

  return shape.defaultColor;
};

// Create milestone shape component
export const createMilestoneShapeComponent = (
  shapeKey,
  className = 'w-4 h-4',
  color = null
) => {
  const shape = getMilestoneShape(shapeKey);

  switch (shapeKey) {
    case 'diamond':
      return (
        <svg
          className={`${className} ${color || shape.defaultColor}`}
          viewBox='0 0 24 24'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M12 2L22 12L12 22L2 12L12 2Z' />
        </svg>
      );

    case 'triangle':
      return (
        <svg
          className={`${className} ${color || shape.defaultColor}`}
          viewBox='0 0 24 24'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M12 2L22 20H2L12 2Z' />
        </svg>
      );

    case 'circle':
      return (
        <svg
          className={`${className} ${color || shape.defaultColor}`}
          viewBox='0 0 24 24'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle cx='12' cy='12' r='10' />
        </svg>
      );

    case 'star':
      return (
        <svg
          className={`${className} ${color || shape.defaultColor}`}
          viewBox='0 0 24 24'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z' />
        </svg>
      );

    default:
      return (
        <svg
          className={`${className} ${color || shape.defaultColor}`}
          viewBox='0 0 24 24'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M12 2L22 12L12 22L2 12L12 2Z' />
        </svg>
      );
  }
};

// Get milestone shape preview
export const getMilestoneShapePreview = (shapeKey, size = 'w-6 h-6') => {
  return createMilestoneShapeComponent(
    shapeKey,
    size,
    getMilestoneShape(shapeKey).defaultColor
  );
};

// Apply milestone shape to task
export const applyMilestoneShape = (task, shapeKey) => {
  if (!validateMilestoneShape(shapeKey)) {
    console.warn(`Invalid milestone shape: ${shapeKey}`);
    return task;
  }

  return {
    ...task,
    milestoneShape: shapeKey,
  };
};

// Apply global milestone shape to all tasks
export const applyGlobalMilestoneShape = (tasks, shapeKey) => {
  if (!validateMilestoneShape(shapeKey)) {
    console.warn(`Invalid milestone shape: ${shapeKey}`);
    return tasks;
  }

  return tasks.map(task => {
    if (task.type === 'milestone' || task.isMilestone) {
      return applyMilestoneShape(task, shapeKey);
    }
    return task;
  });
};

// Get milestone shape statistics
export const getMilestoneShapeStats = tasks => {
  const stats = {
    total: 0,
    byShape: {},
    defaultShape: 0,
  };

  tasks.forEach(task => {
    if (task.type === 'milestone' || task.isMilestone) {
      stats.total++;

      const shape = task.milestoneShape || DEFAULT_MILESTONE_SHAPE;
      stats.byShape[shape] = (stats.byShape[shape] || 0) + 1;

      if (!task.milestoneShape) {
        stats.defaultShape++;
      }
    }
  });

  return stats;
};

// Export milestone shape configuration
export const exportMilestoneShapeConfig = (globalShape, tasks) => {
  const milestoneTasks = tasks.filter(
    task => task.type === 'milestone' || task.isMilestone
  );

  return {
    version: '1.0',
    globalShape,
    taskOverrides: milestoneTasks
      .filter(task => task.milestoneShape)
      .map(task => ({
        taskId: task.id,
        taskName: task.name,
        shape: task.milestoneShape,
      })),
    stats: getMilestoneShapeStats(tasks),
    exportedAt: new Date().toISOString(),
  };
};

// Import milestone shape configuration
export const importMilestoneShapeConfig = (config, tasks) => {
  if (!config.globalShape || !validateMilestoneShape(config.globalShape)) {
    throw new Error('Invalid global milestone shape in configuration');
  }

  const updatedTasks = tasks.map(task => {
    if (task.type === 'milestone' || task.isMilestone) {
      const override = config.taskOverrides?.find(o => o.taskId === task.id);
      return {
        ...task,
        milestoneShape: override?.shape || config.globalShape,
      };
    }
    return task;
  });

  return {
    globalShape: config.globalShape,
    tasks: updatedTasks,
  };
};
