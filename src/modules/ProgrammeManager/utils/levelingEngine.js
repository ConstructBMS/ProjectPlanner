/**
 * Resource Leveling Engine
 * Provides basic resource leveling by shifting non-critical tasks within their float
 */

import { addDays, isWorkday, snapToWorkday } from './calendarUtils';
import { getPredecessors, getSuccessors } from './scheduleEngine';

/**
 * Calculate daily resource allocation for all tasks
 * @param {Array} tasks - All tasks in the project
 * @param {Object} globalCalendar - Global calendar for working days
 * @returns {Object} Daily allocation data: { date: { resourceId: allocation } }
 */
export const calculateDailyAllocations = (tasks, globalCalendar) => {
  const dailyAllocations = {};

  tasks.forEach(task => {
    if (!task.resourceAssignments || task.resourceAssignments.length === 0) {
      return;
    }

    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const duration = task.duration || 1;

    // Calculate allocation per day
    const allocationPerDay = task.resourceAssignments.reduce(
      (acc, assignment) => {
        const dailyAllocation = (assignment.work || 0) / duration;
        acc[assignment.resourceId] =
          (acc[assignment.resourceId] || 0) + dailyAllocation;
        return acc;
      },
      {}
    );

    // Apply allocation to each working day
    for (let i = 0; i < duration; i++) {
      const currentDate = addDays(startDate, i, globalCalendar);
      const dateKey = currentDate.toISOString().split('T')[0];

      if (!dailyAllocations[dateKey]) {
        dailyAllocations[dateKey] = {};
      }

      Object.entries(allocationPerDay).forEach(([resourceId, allocation]) => {
        dailyAllocations[dateKey][resourceId] =
          (dailyAllocations[dateKey][resourceId] || 0) + allocation;
      });
    }
  });

  return dailyAllocations;
};

/**
 * Detect over-allocations by comparing daily allocations to resource capacity
 * @param {Object} dailyAllocations - Daily allocation data
 * @param {Array} resources - Resource definitions with capacity
 * @returns {Array} Array of over-allocation conflicts
 */
export const detectOverAllocations = (dailyAllocations, resources) => {
  const conflicts = [];

  Object.entries(dailyAllocations).forEach(([date, resourceAllocations]) => {
    Object.entries(resourceAllocations).forEach(([resourceId, allocation]) => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      const capacity = resource.capacity || 100; // Default 100% capacity
      const overAllocation = allocation - capacity;

      if (overAllocation > 0) {
        conflicts.push({
          date,
          resourceId,
          resourceName: resource.name,
          allocation,
          capacity,
          overAllocation,
        });
      }
    });
  });

  return conflicts;
};

/**
 * Find tasks that can be shifted to resolve over-allocation
 * @param {Object} conflict - Over-allocation conflict
 * @param {Array} tasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Object} globalCalendar - Global calendar
 * @returns {Array} Array of tasks that can be shifted
 */
export const findShiftableTasks = (
  conflict,
  tasks,
  taskLinks,
  globalCalendar
) => {
  const shiftableTasks = [];

  tasks.forEach(task => {
    // Skip critical tasks (zero float)
    if (task.isCritical || task.totalFloat === 0) {
      return;
    }

    // Check if task uses the over-allocated resource on the conflict date
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const conflictDate = new Date(conflict.date);

    if (conflictDate >= taskStart && conflictDate <= taskEnd) {
      const hasResourceConflict = task.resourceAssignments?.some(
        assignment => assignment.resourceId === conflict.resourceId
      );

      if (hasResourceConflict) {
        // Calculate how much the task can be shifted
        const maxShift = Math.min(task.totalFloat, 5); // Limit shift to 5 days or total float
        const currentStart = new Date(task.startDate);
        const shiftedStart = addDays(currentStart, maxShift, globalCalendar);

        shiftableTasks.push({
          taskId: task.id,
          taskName: task.name,
          currentStart: task.startDate,
          shiftedStart: shiftedStart.toISOString(),
          maxShift,
          totalFloat: task.totalFloat,
          resourceAllocation:
            task.resourceAssignments.find(
              a => a.resourceId === conflict.resourceId
            )?.allocation || 0,
        });
      }
    }
  });

  // Sort by priority: tasks with more float first, then by allocation amount
  return shiftableTasks.sort((a, b) => {
    if (a.totalFloat !== b.totalFloat) {
      return b.totalFloat - a.totalFloat; // More float first
    }
    return b.resourceAllocation - a.resourceAllocation; // Higher allocation first
  });
};

/**
 * Check if shifting a task would create new conflicts
 * @param {Object} taskShift - Task shift proposal
 * @param {Array} tasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Object} globalCalendar - Global calendar
 * @returns {boolean} True if shift would create conflicts
 */
export const wouldCreateConflicts = (
  taskShift,
  tasks,
  taskLinks,
  globalCalendar
) => {
  const task = tasks.find(t => t.id === taskShift.taskId);
  if (!task) return true;

  const newStart = new Date(taskShift.shiftedStart);
  const newEnd = addDays(newStart, (task.duration || 1) - 1, globalCalendar);

  // Check if new dates conflict with dependencies
  const predecessors = getPredecessors(task.id, taskLinks);
  for (const link of predecessors) {
    const predecessor = tasks.find(t => t.id === link.fromTaskId);
    if (!predecessor) continue;

    const predecessorEnd = new Date(predecessor.endDate);
    if (newStart <= predecessorEnd) {
      return true; // Would create dependency conflict
    }
  }

  // Check if new dates conflict with successors
  const successors = getSuccessors(task.id, taskLinks);
  for (const link of successors) {
    const successor = tasks.find(t => t.id === link.toTaskId);
    if (!successor) continue;

    const successorStart = new Date(successor.startDate);
    if (newEnd >= successorStart) {
      return true; // Would create dependency conflict
    }
  }

  return false;
};

/**
 * Calculate the impact of shifting a task on resource allocation
 * @param {Object} taskShift - Task shift proposal
 * @param {Object} conflict - Original conflict
 * @param {Array} tasks - All tasks in the project
 * @param {Object} globalCalendar - Global calendar
 * @returns {Object} Impact analysis
 */
export const calculateShiftImpact = (
  taskShift,
  conflict,
  tasks,
  globalCalendar
) => {
  const task = tasks.find(t => t.id === taskShift.taskId);
  if (!task) return null;

  const currentStart = new Date(task.startDate);
  const shiftedStart = new Date(taskShift.shiftedStart);
  const duration = task.duration || 1;

  // Calculate allocation on conflict date before shift
  const allocationOnConflictDate =
    task.resourceAssignments?.find(a => a.resourceId === conflict.resourceId)
      ?.allocation || 0;

  // Calculate if task would still be active on conflict date after shift
  const shiftedEnd = addDays(shiftedStart, duration - 1, globalCalendar);
  const conflictDate = new Date(conflict.date);
  const stillActiveOnConflictDate =
    conflictDate >= shiftedStart && conflictDate <= shiftedEnd;

  const impact = {
    taskId: taskShift.taskId,
    taskName: taskShift.taskName,
    allocationRemoved: stillActiveOnConflictDate ? 0 : allocationOnConflictDate,
    allocationReduced: stillActiveOnConflictDate
      ? allocationOnConflictDate * 0.5
      : 0, // Estimate
    newOverAllocation: Math.max(
      0,
      conflict.overAllocation -
        (stillActiveOnConflictDate ? 0 : allocationOnConflictDate)
    ),
    daysShifted: Math.ceil(
      (shiftedStart.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
    ),
  };

  return impact;
};

/**
 * Generate resource leveling preview
 * @param {Array} tasks - All tasks in the project
 * @param {Array} taskLinks - Task dependency links
 * @param {Array} resources - Resource definitions
 * @param {Object} globalCalendar - Global calendar
 * @returns {Object} Leveling preview with proposed changes
 */
export const generateLevelingPreview = (
  tasks,
  taskLinks,
  resources,
  globalCalendar
) => {
  const dailyAllocations = calculateDailyAllocations(tasks, globalCalendar);
  const conflicts = detectOverAllocations(dailyAllocations, resources);

  if (conflicts.length === 0) {
    return {
      hasConflicts: false,
      message: 'No resource conflicts detected',
      proposedShifts: [],
      conflicts: [],
    };
  }

  const proposedShifts = [];
  const resolvedConflicts = new Set();

  // Process conflicts in order of severity (highest over-allocation first)
  const sortedConflicts = conflicts.sort(
    (a, b) => b.overAllocation - a.overAllocation
  );

  for (const conflict of sortedConflicts) {
    if (resolvedConflicts.has(`${conflict.date}-${conflict.resourceId}`)) {
      continue; // Already resolved
    }

    const shiftableTasks = findShiftableTasks(
      conflict,
      tasks,
      taskLinks,
      globalCalendar
    );

    for (const taskShift of shiftableTasks) {
      if (wouldCreateConflicts(taskShift, tasks, taskLinks, globalCalendar)) {
        continue; // Skip if would create new conflicts
      }

      const impact = calculateShiftImpact(
        taskShift,
        conflict,
        tasks,
        globalCalendar
      );
      if (impact && impact.allocationRemoved > 0) {
        proposedShifts.push({
          ...taskShift,
          impact,
          conflictDate: conflict.date,
          conflictResource: conflict.resourceName,
        });

        // Mark this conflict as resolved
        resolvedConflicts.add(`${conflict.date}-${conflict.resourceId}`);
        break; // Move to next conflict
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    message:
      conflicts.length > 0
        ? `${conflicts.length} resource conflicts detected, ${proposedShifts.length} tasks can be shifted`
        : 'No resource conflicts detected',
    proposedShifts,
    conflicts,
  };
};

/**
 * Apply resource leveling changes
 * @param {Array} proposedShifts - Proposed task shifts
 * @param {Array} tasks - All tasks in the project
 * @param {Function} updateTask - Function to update task dates
 * @returns {Object} Result of leveling operation
 */
export const applyResourceLeveling = (proposedShifts, tasks, updateTask) => {
  const appliedShifts = [];
  const errors = [];

  for (const shift of proposedShifts) {
    try {
      const task = tasks.find(t => t.id === shift.taskId);
      if (!task) {
        errors.push(`Task ${shift.taskName} not found`);
        continue;
      }

      // Calculate new end date
      const newStart = new Date(shift.shiftedStart);
      const duration = task.duration || 1;
      const newEnd = new Date(
        newStart.getTime() + (duration - 1) * 24 * 60 * 60 * 1000
      );

      // Update task dates
      updateTask(shift.taskId, {
        startDate: newStart.toISOString(),
        endDate: newEnd.toISOString(),
      });

      appliedShifts.push({
        taskId: shift.taskId,
        taskName: shift.taskName,
        oldStart: task.startDate,
        newStart: shift.shiftedStart,
        daysShifted: shift.maxShift,
      });
    } catch (error) {
      errors.push(`Failed to shift task ${shift.taskName}: ${error.message}`);
    }
  }

  return {
    success: errors.length === 0,
    appliedShifts,
    errors,
    message:
      errors.length === 0
        ? `Successfully shifted ${appliedShifts.length} tasks`
        : `Applied ${appliedShifts.length} shifts with ${errors.length} errors`,
  };
};

/**
 * Get resource leveling statistics
 * @param {Array} tasks - All tasks in the project
 * @param {Array} resources - Resource definitions
 * @param {Object} globalCalendar - Global calendar
 * @returns {Object} Leveling statistics
 */
export const getLevelingStats = (tasks, resources, globalCalendar) => {
  const dailyAllocations = calculateDailyAllocations(tasks, globalCalendar);
  const conflicts = detectOverAllocations(dailyAllocations, resources);

  const totalOverAllocation = conflicts.reduce(
    (sum, conflict) => sum + conflict.overAllocation,
    0
  );
  const nonCriticalTasks = tasks.filter(
    task => !task.isCritical && task.totalFloat > 0
  );
  const shiftableTasks = nonCriticalTasks.filter(
    task => task.resourceAssignments && task.resourceAssignments.length > 0
  );

  return {
    totalConflicts: conflicts.length,
    totalOverAllocation,
    nonCriticalTasks: nonCriticalTasks.length,
    shiftableTasks: shiftableTasks.length,
    averageFloat:
      nonCriticalTasks.length > 0
        ? nonCriticalTasks.reduce(
            (sum, task) => sum + (task.totalFloat || 0),
            0
          ) / nonCriticalTasks.length
        : 0,
  };
};
