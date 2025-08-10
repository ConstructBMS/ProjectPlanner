/**
 * Task Segment Utilities
 * Handle task splitting into multiple segments with gaps
 */

/**
 * Create a new task segment
 * @param {Date} startDate - Segment start date
 * @param {Date} endDate - Segment end date
 * @param {number} duration - Segment duration in days
 * @returns {Object} Task segment object
 */
export const createTaskSegment = (startDate, endDate, duration) => {
  return {
    id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    duration: duration,
    progress: 0,
    isActive: true,
  };
};

/**
 * Split a task into multiple segments
 * @param {Object} task - Original task object
 * @param {Array} segmentRanges - Array of {startDate, endDate, duration} objects
 * @returns {Object} Updated task with segments
 */
export const splitTask = (task, segmentRanges) => {
  if (!segmentRanges || segmentRanges.length === 0) {
    return task;
  }

  const segments = segmentRanges.map(range => 
    createTaskSegment(
      new Date(range.startDate),
      new Date(range.endDate),
      range.duration
    )
  );

  // Calculate total duration and progress
  const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
  const totalProgress = segments.reduce((sum, segment) => sum + (segment.progress || 0), 0);
  const averageProgress = segments.length > 0 ? totalProgress / segments.length : 0;

  // Update task with segments
  const updatedTask = {
    ...task,
    segments: segments,
    isSplit: true,
    originalDuration: task.duration,
    originalStartDate: task.startDate,
    originalEndDate: task.endDate,
    // Update main task dates to span all segments
    startDate: segments[0].startDate,
    endDate: segments[segments.length - 1].endDate,
    duration: totalDuration,
    progress: averageProgress,
  };

  return updatedTask;
};

/**
 * Merge task segments back into a single task
 * @param {Object} task - Task with segments
 * @returns {Object} Task without segments
 */
export const mergeTaskSegments = (task) => {
  if (!task.segments || task.segments.length === 0) {
    return task;
  }

  // Use original values if available, otherwise calculate from segments
  const startDate = task.originalStartDate || task.segments[0].startDate;
  const endDate = task.originalEndDate || task.segments[task.segments.length - 1].endDate;
  const duration = task.originalDuration || task.segments.reduce((sum, segment) => sum + segment.duration, 0);

  return {
    ...task,
    segments: undefined,
    isSplit: false,
    originalDuration: undefined,
    originalStartDate: undefined,
    originalEndDate: undefined,
    startDate: startDate,
    endDate: endDate,
    duration: duration,
  };
};

/**
 * Add a new segment to a split task
 * @param {Object} task - Task with segments
 * @param {Date} startDate - New segment start date
 * @param {Date} endDate - New segment end date
 * @param {number} duration - New segment duration
 * @returns {Object} Updated task with new segment
 */
export const addTaskSegment = (task, startDate, endDate, duration) => {
  if (!task.segments) {
    return task;
  }

  const newSegment = createTaskSegment(startDate, endDate, duration);
  const updatedSegments = [...task.segments, newSegment].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );

  return updateTaskWithSegments(task, updatedSegments);
};

/**
 * Remove a segment from a split task
 * @param {Object} task - Task with segments
 * @param {string} segmentId - ID of segment to remove
 * @returns {Object} Updated task without the segment
 */
export const removeTaskSegment = (task, segmentId) => {
  if (!task.segments) {
    return task;
  }

  const updatedSegments = task.segments.filter(segment => segment.id !== segmentId);
  
  if (updatedSegments.length === 0) {
    return mergeTaskSegments(task);
  }

  return updateTaskWithSegments(task, updatedSegments);
};

/**
 * Update a specific segment in a split task
 * @param {Object} task - Task with segments
 * @param {string} segmentId - ID of segment to update
 * @param {Object} updates - Updates to apply to segment
 * @returns {Object} Updated task with modified segment
 */
export const updateTaskSegment = (task, segmentId, updates) => {
  if (!task.segments) {
    return task;
  }

  const updatedSegments = task.segments.map(segment => 
    segment.id === segmentId ? { ...segment, ...updates } : segment
  );

  return updateTaskWithSegments(task, updatedSegments);
};

/**
 * Update task with new segments and recalculate main task properties
 * @param {Object} task - Original task
 * @param {Array} segments - Updated segments array
 * @returns {Object} Updated task
 */
const updateTaskWithSegments = (task, segments) => {
  if (segments.length === 0) {
    return mergeTaskSegments(task);
  }

  // Calculate total duration and progress
  const totalDuration = segments.reduce((sum, segment) => sum + segment.duration, 0);
  const totalProgress = segments.reduce((sum, segment) => sum + (segment.progress || 0), 0);
  const averageProgress = segments.length > 0 ? totalProgress / segments.length : 0;

  return {
    ...task,
    segments: segments,
    startDate: segments[0].startDate,
    endDate: segments[segments.length - 1].endDate,
    duration: totalDuration,
    progress: averageProgress,
  };
};

/**
 * Get all segments for a task
 * @param {Object} task - Task object
 * @returns {Array} Array of segments (empty if not split)
 */
export const getTaskSegments = (task) => {
  return task.segments || [];
};

/**
 * Check if a task is split into segments
 * @param {Object} task - Task object
 * @returns {boolean} True if task has segments
 */
export const isTaskSplit = (task) => {
  return task.isSplit === true && task.segments && task.segments.length > 0;
};

/**
 * Get the total duration of all segments
 * @param {Object} task - Task object
 * @returns {number} Total duration in days
 */
export const getTotalSegmentDuration = (task) => {
  if (!isTaskSplit(task)) {
    return task.duration || 0;
  }

  return task.segments.reduce((sum, segment) => sum + segment.duration, 0);
};

/**
 * Get the total progress of all segments
 * @param {Object} task - Task object
 * @returns {number} Total progress percentage
 */
export const getTotalSegmentProgress = (task) => {
  if (!isTaskSplit(task)) {
    return task.progress || 0;
  }

  const totalProgress = task.segments.reduce((sum, segment) => sum + (segment.progress || 0), 0);
  return task.segments.length > 0 ? totalProgress / task.segments.length : 0;
};

/**
 * Calculate gaps between segments
 * @param {Array} segments - Array of task segments
 * @returns {Array} Array of gap objects with start, end, and duration
 */
export const calculateSegmentGaps = (segments) => {
  if (!segments || segments.length < 2) {
    return [];
  }

  const sortedSegments = [...segments].sort((a, b) => 
    new Date(a.endDate) - new Date(b.endDate)
  );

  const gaps = [];
  
  for (let i = 0; i < sortedSegments.length - 1; i++) {
    const currentSegment = sortedSegments[i];
    const nextSegment = sortedSegments[i + 1];
    
    const gapStart = new Date(currentSegment.endDate);
    const gapEnd = new Date(nextSegment.startDate);
    const gapDuration = Math.ceil((gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (gapDuration > 0) {
      gaps.push({
        id: `gap_${currentSegment.id}_${nextSegment.id}`,
        startDate: gapStart.toISOString(),
        endDate: gapEnd.toISOString(),
        duration: gapDuration,
        beforeSegment: currentSegment.id,
        afterSegment: nextSegment.id,
      });
    }
  }

  return gaps;
};

/**
 * Get segment styling for Gantt chart
 * @param {Object} segment - Task segment
 * @param {Object} task - Parent task
 * @param {boolean} isSelected - Whether segment is selected
 * @returns {Object} Styling information
 */
export const getSegmentStyling = (segment, task, isSelected = false) => {
  const baseClasses = 'rounded-sm transition-all duration-200 cursor-move border';
  
  let segmentClasses = baseClasses;
  
  if (isSelected) {
    segmentClasses += ' ring-2 ring-blue-400 border-blue-500 shadow-md';
  } else {
    segmentClasses += ' ring-1 ring-gray-300 border-gray-400 shadow-sm';
  }

  // Add progress indicator styling
  if (segment.progress > 0) {
    segmentClasses += ' relative overflow-hidden';
  }

  return {
    className: segmentClasses,
    style: {
      backgroundColor: task.color ? `${task.color}20` : '#3b82f620',
      borderColor: task.color ? `${task.color}60` : '#3b82f660',
    },
  };
};

/**
 * Validate segment dates and durations
 * @param {Array} segments - Array of segments to validate
 * @returns {Object} Validation result
 */
export const validateSegments = (segments) => {
  const errors = [];
  const warnings = [];

  if (!segments || segments.length === 0) {
    errors.push('At least one segment is required');
    return { isValid: false, errors, warnings };
  }

  segments.forEach((segment, index) => {
    const startDate = new Date(segment.startDate);
    const endDate = new Date(segment.endDate);
    const duration = segment.duration || 0;

    // Check for valid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push(`Segment ${index + 1}: Invalid date format`);
    }

    // Check for positive duration
    if (duration <= 0) {
      errors.push(`Segment ${index + 1}: Duration must be positive`);
    }

    // Check for logical date order
    if (startDate >= endDate) {
      errors.push(`Segment ${index + 1}: Start date must be before end date`);
    }

    // Check for overlapping segments
    segments.forEach((otherSegment, otherIndex) => {
      if (index !== otherIndex) {
        const otherStart = new Date(otherSegment.startDate);
        const otherEnd = new Date(otherSegment.endDate);
        
        if (startDate < otherEnd && endDate > otherStart) {
          errors.push(`Segments ${index + 1} and ${otherIndex + 1} overlap`);
        }
      }
    });
  });

  // Check for large gaps (warnings)
  const gaps = calculateSegmentGaps(segments);
  gaps.forEach(gap => {
    if (gap.duration > 30) {
      warnings.push(`Large gap detected: ${gap.duration} days between segments`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get segment tooltip content
 * @param {Object} segment - Task segment
 * @param {Object} task - Parent task
 * @returns {string} Tooltip text
 */
export const getSegmentTooltip = (segment, task) => {
  const startDate = new Date(segment.startDate).toLocaleDateString();
  const endDate = new Date(segment.endDate).toLocaleDateString();
  const progress = segment.progress || 0;

  let tooltip = `Segment: ${task.name}\n`;
  tooltip += `Duration: ${segment.duration} days\n`;
  tooltip += `Progress: ${progress}%\n`;
  tooltip += `Period: ${startDate} - ${endDate}`;

  return tooltip;
};

/**
 * Get segment summary statistics
 * @param {Object} task - Task object
 * @returns {Object} Segment summary
 */
export const getSegmentSummary = (task) => {
  if (!isTaskSplit(task)) {
    return {
      isSplit: false,
      segmentCount: 0,
      totalDuration: task.duration || 0,
      totalProgress: task.progress || 0,
      gaps: [],
    };
  }

  const segments = getTaskSegments(task);
  const gaps = calculateSegmentGaps(segments);
  const totalDuration = getTotalSegmentDuration(task);
  const totalProgress = getTotalSegmentProgress(task);

  return {
    isSplit: true,
    segmentCount: segments.length,
    totalDuration,
    totalProgress,
    gaps,
    gapCount: gaps.length,
    totalGapDuration: gaps.reduce((sum, gap) => sum + gap.duration, 0),
  };
};
