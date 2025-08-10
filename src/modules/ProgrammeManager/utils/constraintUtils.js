/**
 * Advanced Constraint Utilities
 * Handle all Asta-style task constraints
 */

import { addDays, isWorkday, snapToWorkday } from './calendarUtils';

/**
 * Constraint types supported by the system
 */
export const CONSTRAINT_TYPES = {
  ASAP: 'ASAP', // As Soon As Possible (default)
  ALAP: 'ALAP', // As Late As Possible
  MSO: 'MSO', // Must Start On
  MFO: 'MFO', // Must Finish On
  SNET: 'SNET', // Start No Earlier Than
  FNLT: 'FNLT', // Finish No Later Than
};

/**
 * Get constraint type label for display
 * @param {string} constraintType - Constraint type
 * @returns {string} Human-readable label
 */
export const getConstraintLabel = (constraintType) => {
  switch (constraintType) {
    case CONSTRAINT_TYPES.ASAP:
      return 'As Soon As Possible';
    case CONSTRAINT_TYPES.ALAP:
      return 'As Late As Possible';
    case CONSTRAINT_TYPES.MSO:
      return 'Must Start On';
    case CONSTRAINT_TYPES.MFO:
      return 'Must Finish On';
    case CONSTRAINT_TYPES.SNET:
      return 'Start No Earlier Than';
    case CONSTRAINT_TYPES.FNLT:
      return 'Finish No Later Than';
    default:
      return 'No Constraint';
  }
};

/**
 * Get constraint type description
 * @param {string} constraintType - Constraint type
 * @returns {string} Detailed description
 */
export const getConstraintDescription = (constraintType) => {
  switch (constraintType) {
    case CONSTRAINT_TYPES.ASAP:
      return 'Task will be scheduled as early as possible based on dependencies';
    case CONSTRAINT_TYPES.ALAP:
      return 'Task will be scheduled as late as possible without delaying successors';
    case CONSTRAINT_TYPES.MSO:
      return 'Task must start exactly on the specified date';
    case CONSTRAINT_TYPES.MFO:
      return 'Task must finish exactly on the specified date';
    case CONSTRAINT_TYPES.SNET:
      return 'Task cannot start before the specified date';
    case CONSTRAINT_TYPES.FNLT:
      return 'Task cannot finish after the specified date';
    default:
      return 'No scheduling constraint applied';
  }
};

/**
 * Get constraint icon
 * @param {string} constraintType - Constraint type
 * @returns {string} Icon name
 */
export const getConstraintIcon = (constraintType) => {
  switch (constraintType) {
    case CONSTRAINT_TYPES.ASAP:
      return '⚡';
    case CONSTRAINT_TYPES.ALAP:
      return '⏰';
    case CONSTRAINT_TYPES.MSO:
      return '📅';
    case CONSTRAINT_TYPES.MFO:
      return '🎯';
    case CONSTRAINT_TYPES.SNET:
      return '⏭️';
    case CONSTRAINT_TYPES.FNLT:
      return '⏮️';
    default:
      return '📋';
  }
};

/**
 * Get constraint styling
 * @param {string} constraintType - Constraint type
 * @returns {Object} Styling information
 */
export const getConstraintStyling = (constraintType) => {
  switch (constraintType) {
    case CONSTRAINT_TYPES.ASAP:
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        icon: '⚡',
      };
    case CONSTRAINT_TYPES.ALAP:
      return {
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        icon: '⏰',
      };
    case CONSTRAINT_TYPES.MSO:
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        icon: '📅',
      };
    case CONSTRAINT_TYPES.MFO:
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        icon: '🎯',
      };
    case CONSTRAINT_TYPES.SNET:
      return {
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-300',
        icon: '⏭️',
      };
    case CONSTRAINT_TYPES.FNLT:
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        icon: '⏮️',
      };
    default:
      return {
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        icon: '📋',
      };
  }
};

/**
 * Validate constraint configuration
 * @param {Object} constraint - Constraint object
 * @returns {Object} Validation result
 */
export const validateConstraint = (constraint) => {
  const errors = [];
  const warnings = [];

  if (!constraint.type) {
    errors.push('Constraint type is required');
    return { isValid: false, errors, warnings };
  }

  if (!Object.values(CONSTRAINT_TYPES).includes(constraint.type)) {
    errors.push(`Invalid constraint type: ${constraint.type}`);
  }

  // Validate date constraints
  if ([CONSTRAINT_TYPES.MSO, CONSTRAINT_TYPES.MFO, CONSTRAINT_TYPES.SNET, CONSTRAINT_TYPES.FNLT].includes(constraint.type)) {
    if (!constraint.date) {
      errors.push(`${getConstraintLabel(constraint.type)} requires a date`);
    } else {
      const constraintDate = new Date(constraint.date);
      if (isNaN(constraintDate.getTime())) {
        errors.push('Invalid constraint date');
      }
    }
  }

  // Validate ALAP constraint (requires successors)
  if (constraint.type === CONSTRAINT_TYPES.ALAP) {
    warnings.push('ALAP constraint requires successors to be effective');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Apply constraint to task dates
 * @param {Object} task - Task object
 * @param {Object} constraint - Constraint object
 * @param {Object} globalCalendar - Global calendar
 * @returns {Object} Constrained dates
 */
export const applyConstraint = (task, constraint, globalCalendar) => {
  if (!constraint || !constraint.type) {
    return {
      startDate: task.startDate,
      endDate: task.endDate,
      isConstrained: false,
    };
  }

  const duration = task.duration || 1;
  let startDate = new Date(task.startDate);
  let endDate = new Date(task.endDate);
  let isConstrained = true;

  switch (constraint.type) {
    case CONSTRAINT_TYPES.ASAP:
      // ASAP is the default behavior - no change needed
      isConstrained = false;
      break;

    case CONSTRAINT_TYPES.ALAP:
      // ALAP will be handled during scheduling
      isConstrained = false;
      break;

    case CONSTRAINT_TYPES.MSO:
      // Must start exactly on constraint date
      if (constraint.date) {
        startDate = snapToWorkday(new Date(constraint.date), globalCalendar);
        endDate = addDays(startDate, duration - 1, globalCalendar);
      }
      break;

    case CONSTRAINT_TYPES.MFO:
      // Must finish exactly on constraint date
      if (constraint.date) {
        endDate = snapToWorkday(new Date(constraint.date), globalCalendar);
        startDate = addDays(endDate, -(duration - 1), globalCalendar);
      }
      break;

    case CONSTRAINT_TYPES.SNET:
      // Start no earlier than constraint date
      if (constraint.date) {
        const constraintDate = snapToWorkday(new Date(constraint.date), globalCalendar);
        if (startDate < constraintDate) {
          startDate = constraintDate;
          endDate = addDays(startDate, duration - 1, globalCalendar);
        }
      }
      break;

    case CONSTRAINT_TYPES.FNLT:
      // Finish no later than constraint date
      if (constraint.date) {
        const constraintDate = snapToWorkday(new Date(constraint.date), globalCalendar);
        if (endDate > constraintDate) {
          endDate = constraintDate;
          startDate = addDays(endDate, -(duration - 1), globalCalendar);
        }
      }
      break;

    default:
      isConstrained = false;
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isConstrained,
  };
};

/**
 * Check for constraint conflicts
 * @param {Object} task - Task object
 * @param {Array} allTasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Object} globalCalendar - Global calendar
 * @returns {Object} Conflict analysis
 */
export const checkConstraintConflicts = (task, allTasks, taskLinks, globalCalendar) => {
  const conflicts = [];
  const warnings = [];

  if (!task.constraints || !task.constraints.type) {
    return { conflicts, warnings };
  }

  const constraint = task.constraints;
  const duration = task.duration || 1;

  // Check for dependency conflicts
  const predecessors = taskLinks.filter(link => link.toTaskId === task.id);
  const successors = taskLinks.filter(link => link.fromTaskId === task.id);

  if (constraint.type === CONSTRAINT_TYPES.MSO && constraint.date) {
    const constraintStart = new Date(constraint.date);
    
    // Check if predecessors would conflict
    predecessors.forEach(link => {
      const predecessor = allTasks.find(t => t.id === link.fromTaskId);
      if (predecessor) {
        const predecessorEnd = new Date(predecessor.endDate);
        if (constraintStart <= predecessorEnd) {
          conflicts.push({
            type: 'dependency',
            message: `Must Start On constraint conflicts with predecessor ${predecessor.name}`,
            severity: 'error',
          });
        }
      }
    });
  }

  if (constraint.type === CONSTRAINT_TYPES.MFO && constraint.date) {
    const constraintEnd = new Date(constraint.date);
    
    // Check if successors would conflict
    successors.forEach(link => {
      const successor = allTasks.find(t => t.id === link.toTaskId);
      if (successor) {
        const successorStart = new Date(successor.startDate);
        if (constraintEnd >= successorStart) {
          conflicts.push({
            type: 'dependency',
            message: `Must Finish On constraint conflicts with successor ${successor.name}`,
            severity: 'error',
          });
        }
      }
    });
  }

  // Check for duration conflicts
  if (constraint.type === CONSTRAINT_TYPES.MSO && constraint.date && constraint.type === CONSTRAINT_TYPES.MFO && constraint.date) {
    const startDate = new Date(constraint.date);
    const endDate = new Date(constraint.date);
    const actualDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (actualDuration !== duration) {
      conflicts.push({
        type: 'duration',
        message: `Duration mismatch: constraint requires ${actualDuration} days but task duration is ${duration} days`,
        severity: 'error',
      });
    }
  }

  // Check for calendar conflicts
  if (constraint.date) {
    const constraintDate = new Date(constraint.date);
    if (!isWorkday(constraintDate, globalCalendar)) {
      warnings.push({
        type: 'calendar',
        message: `Constraint date falls on a non-working day`,
        severity: 'warning',
      });
    }
  }

  return { conflicts, warnings };
};

/**
 * Get constraint tooltip content
 * @param {Object} constraint - Constraint object
 * @returns {string} Tooltip text
 */
export const getConstraintTooltip = (constraint) => {
  if (!constraint || !constraint.type) {
    return 'No constraint applied';
  }

  const label = getConstraintLabel(constraint.type);
  const description = getConstraintDescription(constraint.type);
  
  if (constraint.date) {
    const date = new Date(constraint.date).toLocaleDateString();
    return `${label}: ${date}\n${description}`;
  }
  
  return `${label}\n${description}`;
};

/**
 * Format constraint for display
 * @param {Object} constraint - Constraint object
 * @returns {string} Formatted constraint string
 */
export const formatConstraint = (constraint) => {
  if (!constraint || !constraint.type) {
    return 'No Constraint';
  }

  const label = getConstraintLabel(constraint.type);
  
  if (constraint.date) {
    const date = new Date(constraint.date).toLocaleDateString();
    return `${label}: ${date}`;
  }
  
  return label;
};

/**
 * Get all available constraint types
 * @returns {Array} Array of constraint type objects
 */
export const getAvailableConstraintTypes = () => {
  return Object.values(CONSTRAINT_TYPES).map(type => ({
    value: type,
    label: getConstraintLabel(type),
    description: getConstraintDescription(type),
    icon: getConstraintIcon(type),
    styling: getConstraintStyling(type),
  }));
};
