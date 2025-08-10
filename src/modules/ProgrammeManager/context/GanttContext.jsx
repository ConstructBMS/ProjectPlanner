import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  performScheduling,
  detectCircularDependencies,
  validateTaskLinks,
  LINK_TYPES,
} from '../utils/scheduleEngine';
import {
  generateLevelingPreview,
  applyResourceLeveling,
  getLevelingStats,
} from '../utils/levelingEngine';
import { useTaskContext } from './TaskContext';
import { useCalendarContext } from './CalendarContext';

const GanttContext = createContext();

export const useGanttContext = () => {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGanttContext must be used within a GanttProvider');
  }
  return context;
};

export const GanttProvider = ({ children }) => {
  const { tasks, taskLinks, updateTask, updateTaskLinks } = useTaskContext();
  const { globalCalendar } = useCalendarContext();

  // Scheduling state
  const [schedulingState, setSchedulingState] = useState({
    isAutoScheduling: false,
    lastScheduledAt: null,
    schedulingErrors: [],
    circularDependencies: [],
    validationErrors: [],
  });

  // Auto-scheduling settings
  const [autoScheduleSettings, setAutoScheduleSettings] = useState({
    enabled: true,
    triggerOnTaskChange: true,
    triggerOnLinkChange: true,
    triggerOnCalendarChange: true,
    respectConstraints: true,
    calculateFloat: true,
  });

  // Resource leveling state
  const [levelingState, setLevelingState] = useState({
    isLeveling: false,
    lastLeveledAt: null,
    levelingErrors: [],
  });

  /**
   * Perform auto-scheduling with current tasks and links
   */
  const performAutoScheduling = useCallback(async () => {
    if (!autoScheduleSettings.enabled) return;

    setSchedulingState(prev => ({
      ...prev,
      isAutoScheduling: true,
      schedulingErrors: [],
      circularDependencies: [],
      validationErrors: [],
    }));

    try {
      // Validate task links first
      const validationErrors = validateTaskLinks(taskLinks, tasks);

      // Check for circular dependencies
      const circularDeps = detectCircularDependencies(taskLinks);

      if (validationErrors.length > 0 || circularDeps.length > 0) {
        setSchedulingState(prev => ({
          ...prev,
          isAutoScheduling: false,
          validationErrors,
          circularDependencies: circularDeps,
        }));
        return;
      }

      // Perform scheduling
      const result = performScheduling(tasks, taskLinks, globalCalendar);

      if (result.success) {
        // Update tasks with new dates
        result.tasks.forEach(updatedTask => {
          const originalTask = tasks.find(t => t.id === updatedTask.id);
          if (originalTask) {
            // Only update if dates have actually changed
            const startChanged =
              originalTask.startDate !== updatedTask.startDate;
            const endChanged = originalTask.endDate !== updatedTask.endDate;

            if (startChanged || endChanged) {
              updateTask(updatedTask.id, {
                startDate: updatedTask.startDate,
                endDate: updatedTask.endDate,
                earliestStart: updatedTask.earliestStart,
                earliestFinish: updatedTask.earliestFinish,
                latestStart: updatedTask.latestStart,
                latestFinish: updatedTask.latestFinish,
                totalFloat: updatedTask.totalFloat,
                freeFloat: updatedTask.freeFloat,
                isCritical: updatedTask.isCritical,
              });
            }
          }
        });

        setSchedulingState(prev => ({
          ...prev,
          isAutoScheduling: false,
          lastScheduledAt: new Date().toISOString(),
          schedulingErrors: [],
        }));
      } else {
        setSchedulingState(prev => ({
          ...prev,
          isAutoScheduling: false,
          schedulingErrors: result.errors,
        }));
      }
    } catch (error) {
      setSchedulingState(prev => ({
        ...prev,
        isAutoScheduling: false,
        schedulingErrors: [error.message],
      }));
    }
  }, [
    tasks,
    taskLinks,
    globalCalendar,
    autoScheduleSettings.enabled,
    updateTask,
  ]);

  /**
   * Trigger auto-scheduling based on settings
   */
  const triggerAutoScheduling = useCallback(
    triggerType => {
      if (!autoScheduleSettings.enabled) return;

      switch (triggerType) {
        case 'taskChange':
          if (autoScheduleSettings.triggerOnTaskChange) {
            performAutoScheduling();
          }
          break;
        case 'linkChange':
          if (autoScheduleSettings.triggerOnLinkChange) {
            performAutoScheduling();
          }
          break;
        case 'calendarChange':
          if (autoScheduleSettings.triggerOnCalendarChange) {
            performAutoScheduling();
          }
          break;
        default:
          performAutoScheduling();
      }
    },
    [autoScheduleSettings, performAutoScheduling]
  );

  /**
   * Update auto-scheduling settings
   */
  const updateAutoScheduleSettings = useCallback(newSettings => {
    setAutoScheduleSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  /**
   * Manually trigger scheduling
   */
  const manualSchedule = useCallback(() => {
    performAutoScheduling();
  }, [performAutoScheduling]);

  /**
   * Get scheduling statistics
   */
  const getSchedulingStats = useCallback(() => {
    const criticalTasks = tasks.filter(task => task.isCritical);
    const tasksWithFloat = tasks.filter(task => task.totalFloat > 0);
    const totalFloat = tasks.reduce(
      (sum, task) => sum + (task.totalFloat || 0),
      0
    );

    return {
      totalTasks: tasks.length,
      criticalTasks: criticalTasks.length,
      tasksWithFloat: tasksWithFloat.length,
      averageFloat: tasks.length > 0 ? totalFloat / tasks.length : 0,
      projectDuration:
        tasks.length > 0
          ? Math.max(...tasks.map(t => new Date(t.endDate))) -
            Math.min(...tasks.map(t => new Date(t.startDate)))
          : 0,
    };
  }, [tasks]);

  /**
   * Perform resource leveling
   */
  const performResourceLeveling = useCallback(async (resources) => {
    setLevelingState(prev => ({
      ...prev,
      isLeveling: true,
      levelingErrors: [],
    }));

    try {
      const preview = generateLevelingPreview(tasks, taskLinks, resources, globalCalendar);
      
      if (preview.proposedShifts.length === 0) {
        setLevelingState(prev => ({
          ...prev,
          isLeveling: false,
        }));
        return {
          success: true,
          message: 'No leveling actions required',
          appliedShifts: [],
        };
      }

      const result = applyResourceLeveling(preview.proposedShifts, tasks, updateTask);

      if (result.success) {
        // Trigger auto-scheduling to recalculate dates and float
        setTimeout(() => {
          performAutoScheduling();
        }, 100);
      }

      setLevelingState(prev => ({
        ...prev,
        isLeveling: false,
        lastLeveledAt: new Date().toISOString(),
      }));

      return result;
    } catch (error) {
      setLevelingState(prev => ({
        ...prev,
        isLeveling: false,
        levelingErrors: [error.message],
      }));
      return {
        success: false,
        errors: [error.message],
        message: `Leveling failed: ${error.message}`,
      };
    }
  }, [tasks, taskLinks, globalCalendar, updateTask, performAutoScheduling]);

  /**
   * Get resource leveling statistics
   */
  const getResourceLevelingStats = useCallback((resources) => {
    return getLevelingStats(tasks, resources, globalCalendar);
  }, [tasks, globalCalendar]);

  /**
   * Clear scheduling errors
   */
  const clearSchedulingErrors = useCallback(() => {
    setSchedulingState(prev => ({
      ...prev,
      schedulingErrors: [],
      validationErrors: [],
      circularDependencies: [],
    }));
  }, []);

  // Auto-trigger scheduling when dependencies change
  useEffect(() => {
    if (autoScheduleSettings.enabled && tasks.length > 0) {
      // Debounce the scheduling to avoid excessive recalculations
      const timeoutId = setTimeout(() => {
        triggerAutoScheduling('taskChange');
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [tasks, autoScheduleSettings.enabled, triggerAutoScheduling]);

  // Auto-trigger scheduling when links change
  useEffect(() => {
    if (autoScheduleSettings.enabled && taskLinks.length > 0) {
      const timeoutId = setTimeout(() => {
        triggerAutoScheduling('linkChange');
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [taskLinks, autoScheduleSettings.enabled, triggerAutoScheduling]);

  // Auto-trigger scheduling when calendar changes
  useEffect(() => {
    if (autoScheduleSettings.enabled && globalCalendar) {
      const timeoutId = setTimeout(() => {
        triggerAutoScheduling('calendarChange');
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [globalCalendar, autoScheduleSettings.enabled, triggerAutoScheduling]);

  const value = {
    // State
    schedulingState,
    autoScheduleSettings,
    levelingState,

    // Actions
    performAutoScheduling,
    triggerAutoScheduling,
    manualSchedule,
    updateAutoScheduleSettings,
    clearSchedulingErrors,
    performResourceLeveling,

    // Utilities
    getSchedulingStats,
    getResourceLevelingStats,
    LINK_TYPES,
  };

  return (
    <GanttContext.Provider value={value}>{children}</GanttContext.Provider>
  );
};
