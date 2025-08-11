/**
 * Progress Edit Utilities
 * Handle inline progress editing with drag functionality
 */

/**
 * Default progress edit configuration
 */
export const DEFAULT_PROGRESS_EDIT_CONFIG = {
  minProgress: 0,
  maxProgress: 100,
  stepSize: 1,
  snapToGrid: true,
  gridSize: 5,
  dragThreshold: 3, // Minimum pixels to move before starting drag
  updateDelay: 100, // Delay before updating progress during drag
  showTooltip: true,
  tooltipOffset: { x: 10, y: -30 },
  visualFeedback: true,
  animationDuration: 200,
};

/**
 * Calculate progress percentage from mouse position
 * @param {number} mouseX - Mouse X position relative to bar
 * @param {number} barWidth - Width of the progress bar
 * @param {Object} config - Configuration
 * @returns {number} Progress percentage
 */
export const calculateProgressFromPosition = (
  mouseX,
  barWidth,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  if (barWidth <= 0) return config.minProgress;

  // Calculate raw percentage
  let progress = (mouseX / barWidth) * 100;

  // Clamp to min/max
  progress = Math.max(
    config.minProgress,
    Math.min(config.maxProgress, progress)
  );

  // Snap to grid if enabled
  if (config.snapToGrid) {
    progress = Math.round(progress / config.gridSize) * config.gridSize;
  }

  // Apply step size
  progress = Math.round(progress / config.stepSize) * config.stepSize;

  return Math.max(config.minProgress, Math.min(config.maxProgress, progress));
};

/**
 * Calculate mouse position from progress percentage
 * @param {number} progress - Progress percentage
 * @param {number} barWidth - Width of the progress bar
 * @returns {number} Mouse X position
 */
export const calculatePositionFromProgress = (progress, barWidth) => {
  return (progress / 100) * barWidth;
};

/**
 * Validate progress value
 * @param {number} progress - Progress value to validate
 * @param {Object} config - Configuration
 * @returns {Object} Validation result
 */
export const validateProgress = (
  progress,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  const errors = [];
  const warnings = [];

  if (typeof progress !== 'number' || isNaN(progress)) {
    errors.push('Progress must be a valid number');
  }

  if (progress < config.minProgress) {
    errors.push(`Progress cannot be less than ${config.minProgress}%`);
  }

  if (progress > config.maxProgress) {
    errors.push(`Progress cannot be greater than ${config.maxProgress}%`);
  }

  if (progress < 0) {
    warnings.push('Negative progress values are unusual');
  }

  if (progress > 100) {
    warnings.push('Progress values over 100% may indicate issues');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    progress: Math.max(
      config.minProgress,
      Math.min(config.maxProgress, progress)
    ),
  };
};

/**
 * Format progress for display
 * @param {number} progress - Progress value
 * @param {number} precision - Decimal precision
 * @returns {string} Formatted progress string
 */
export const formatProgress = (progress, precision = 0) => {
  if (typeof progress !== 'number' || isNaN(progress)) {
    return '0%';
  }

  return `${progress.toFixed(precision)}%`;
};

/**
 * Get progress color based on value
 * @param {number} progress - Progress value
 * @param {boolean} isCritical - Whether task is on critical path
 * @returns {string} CSS color value
 */
export const getProgressColor = (progress, isCritical = false) => {
  if (progress >= 100) {
    return isCritical ? '#059669' : '#10B981'; // Green
  } else if (progress >= 75) {
    return isCritical ? '#D97706' : '#F59E0B'; // Amber
  } else if (progress >= 50) {
    return isCritical ? '#DC2626' : '#EF4444'; // Red
  } else {
    return isCritical ? '#7C2D12' : '#991B1B'; // Dark red
  }
};

/**
 * Create progress edit state
 * @param {Object} task - Task object
 * @param {Object} config - Configuration
 * @returns {Object} Progress edit state
 */
export const createProgressEditState = (
  task,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  return {
    isEditing: false,
    isDragging: false,
    startProgress: task.progress || 0,
    currentProgress: task.progress || 0,
    startX: 0,
    currentX: 0,
    barWidth: 0,
    taskId: task.id,
    hasChanged: false,
    validation: validateProgress(task.progress || 0, config),
  };
};

/**
 * Update progress edit state
 * @param {Object} state - Current state
 * @param {Object} updates - Updates to apply
 * @param {Object} config - Configuration
 * @returns {Object} Updated state
 */
export const updateProgressEditState = (
  state,
  updates,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  const newState = { ...state, ...updates };

  // Calculate progress if position changed
  if (updates.currentX !== undefined && newState.barWidth > 0) {
    const newProgress = calculateProgressFromPosition(
      updates.currentX,
      newState.barWidth,
      config
    );
    newState.currentProgress = newProgress;
    newState.hasChanged = newProgress !== newState.startProgress;
  }

  // Update validation
  newState.validation = validateProgress(newState.currentProgress, config);

  return newState;
};

/**
 * Get progress edit styles
 * @param {Object} state - Progress edit state
 * @param {Object} config - Configuration
 * @returns {Object} CSS styles
 */
export const getProgressEditStyles = (
  state,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  const baseStyles = {
    cursor: state.isEditing ? 'col-resize' : 'pointer',
    userSelect: 'none',
    position: 'relative',
  };

  if (state.isDragging && config.visualFeedback) {
    return {
      ...baseStyles,
      cursor: 'col-resize',
      opacity: 0.8,
      transform: 'scale(1.02)',
      transition: 'transform 0.1s ease-out',
    };
  }

  return baseStyles;
};

/**
 * Get progress bar styles
 * @param {number} progress - Progress value
 * @param {boolean} isCritical - Whether task is on critical path
 * @param {Object} config - Configuration
 * @returns {Object} CSS styles
 */
export const getProgressBarStyles = (
  progress,
  isCritical = false,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  const backgroundColor = getProgressColor(progress, isCritical);

  return {
    width: `${progress}%`,
    backgroundColor,
    height: '100%',
    borderRadius: 'inherit',
    transition: config.visualFeedback
      ? `width ${config.animationDuration}ms ease-out`
      : 'none',
    position: 'relative',
  };
};

/**
 * Get drag handle styles
 * @param {Object} state - Progress edit state
 * @param {Object} config - Configuration
 * @returns {Object} CSS styles
 */
export const getDragHandleStyles = (
  state,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  const position = calculatePositionFromProgress(
    state.currentProgress,
    state.barWidth
  );

  return {
    position: 'absolute',
    left: `${position}px`,
    top: '0',
    width: '4px',
    height: '100%',
    backgroundColor: state.isDragging ? '#3B82F6' : '#6B7280',
    cursor: 'col-resize',
    borderRadius: '2px',
    transform: 'translateX(-50%)',
    zIndex: 10,
    transition: state.isDragging ? 'none' : 'left 0.1s ease-out',
    boxShadow: state.isDragging ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
  };
};

/**
 * Get tooltip styles
 * @param {Object} state - Progress edit state
 * @param {Object} mousePosition - Mouse position
 * @param {Object} config - Configuration
 * @returns {Object} CSS styles
 */
export const getTooltipStyles = (
  state,
  mousePosition,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  if (!config.showTooltip || !state.isDragging) {
    return { display: 'none' };
  }

  return {
    position: 'fixed',
    left: `${mousePosition.x + config.tooltipOffset.x}px`,
    top: `${mousePosition.y + config.tooltipOffset.y}px`,
    backgroundColor: '#1F2937',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    zIndex: 1000,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  };
};

/**
 * Check if mouse movement exceeds drag threshold
 * @param {number} startX - Starting X position
 * @param {number} currentX - Current X position
 * @param {Object} config - Configuration
 * @returns {boolean} Whether threshold is exceeded
 */
export const exceedsDragThreshold = (
  startX,
  currentX,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  return Math.abs(currentX - startX) >= config.dragThreshold;
};

/**
 * Debounce function for progress updates
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for progress updates
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Create progress update handler
 * @param {Function} updateTask - Function to update task
 * @param {Object} config - Configuration
 * @returns {Function} Progress update handler
 */
export const createProgressUpdateHandler = (
  updateTask,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  const debouncedUpdate = debounce(async (taskId, progress) => {
    try {
      await updateTask(taskId, { progress });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }, config.updateDelay);

  return debouncedUpdate;
};

/**
 * Get progress edit accessibility attributes
 * @param {Object} state - Progress edit state
 * @param {Object} task - Task object
 * @returns {Object} Accessibility attributes
 */
export const getProgressEditAccessibility = (state, task) => {
  return {
    role: 'slider',
    'aria-label': `Progress for task: ${task.name}`,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': state.currentProgress,
    'aria-valuetext': `${state.currentProgress}% complete`,
    tabIndex: 0,
  };
};

/**
 * Handle keyboard navigation for progress editing
 * @param {Object} state - Current state
 * @param {string} key - Key pressed
 * @param {Object} config - Configuration
 * @returns {Object} Updated state
 */
export const handleProgressKeyboard = (
  state,
  key,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  let newProgress = state.currentProgress;

  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      newProgress = Math.max(config.minProgress, newProgress - config.stepSize);
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      newProgress = Math.min(config.maxProgress, newProgress + config.stepSize);
      break;
    case 'Home':
      newProgress = config.minProgress;
      break;
    case 'End':
      newProgress = config.maxProgress;
      break;
    case 'PageDown':
      newProgress = Math.max(config.minProgress, newProgress - config.gridSize);
      break;
    case 'PageUp':
      newProgress = Math.min(config.maxProgress, newProgress + config.gridSize);
      break;
    default:
      return state;
  }

  return updateProgressEditState(
    state,
    { currentProgress: newProgress },
    config
  );
};

/**
 * Get progress edit event handlers
 * @param {Object} state - Current state
 * @param {Function} setState - State setter function
 * @param {Function} onProgressChange - Progress change callback
 * @param {Object} config - Configuration
 * @returns {Object} Event handlers
 */
export const getProgressEditHandlers = (
  state,
  setState,
  onProgressChange,
  config = DEFAULT_PROGRESS_EDIT_CONFIG
) => {
  const handleMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const startX = e.clientX - rect.left;

    setState(prev => ({
      ...prev,
      isEditing: true,
      isDragging: false,
      startX,
      currentX: startX,
      barWidth: rect.width,
    }));
  };

  const handleMouseMove = e => {
    if (!state.isEditing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;

    if (
      !state.isDragging &&
      exceedsDragThreshold(state.startX, currentX, config)
    ) {
      setState(prev => ({ ...prev, isDragging: true }));
    }

    if (state.isDragging) {
      const newState = updateProgressEditState(state, { currentX }, config);
      setState(newState);
      onProgressChange(newState.currentProgress);
    }
  };

  const handleMouseUp = () => {
    if (state.isEditing) {
      setState(prev => ({
        ...prev,
        isEditing: false,
        isDragging: false,
      }));
    }
  };

  const handleKeyDown = e => {
    const newState = handleProgressKeyboard(state, e.key, config);
    if (newState !== state) {
      setState(newState);
      onProgressChange(newState.currentProgress);
    }
  };

  return {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onKeyDown: handleKeyDown,
  };
};
