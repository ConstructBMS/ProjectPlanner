import React, { useState, useCallback } from 'react';
import RibbonButton from '../shared/RibbonButton';
import RibbonGroup from '../shared/RibbonGroup';
import { useTaskContext } from '../../context/TaskContext';
import { useCalendarContext } from '../../context/CalendarContext';
import { useGanttContext } from '../../context/GanttContext';
import {
  generateLevelingPreview,
  applyResourceLeveling,
  getLevelingStats,
} from '../../utils/levelingEngine';
import {
  detectOverallocations,
  calculateDailyAllocations,
} from '../../utils/resourceLevelingUtils';
import ResourceLevelingDialog from '../../modals/ResourceLevelingDialog';
import {
  ChartBarIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const AllocationTab = () => {
  const { tasks, taskLinks, updateTask } = useTaskContext();
  const { globalCalendar } = useCalendarContext();
  const { performAutoScheduling } = useGanttContext();

  // Leveling state
  const [levelingState, setLevelingState] = useState({
    isAnalyzing: false,
    preview: null,
    isApplying: false,
    result: null,
  });

  // Resource leveling dialog state
  const [showLevelingDialog, setShowLevelingDialog] = useState(false);

  // Mock resources for demonstration (in a real app, this would come from a resource context)
  const mockResources = [
    { id: 'resource-1', name: 'Crane Operator', capacity: 100 },
    { id: 'resource-2', name: 'Concrete Worker', capacity: 150 },
    { id: 'resource-3', name: 'Steel Worker', capacity: 120 },
    { id: 'resource-4', name: 'Electrician', capacity: 100 },
    { id: 'resource-5', name: 'Plumber', capacity: 100 },
  ];

  /**
   * Analyze resource conflicts and generate preview
   */
  const analyzeResources = useCallback(async () => {
    setLevelingState(prev => ({
      ...prev,
      isAnalyzing: true,
      preview: null,
      result: null,
    }));

    try {
      const preview = generateLevelingPreview(
        tasks,
        taskLinks,
        mockResources,
        globalCalendar
      );

      setLevelingState(prev => ({
        ...prev,
        isAnalyzing: false,
        preview,
      }));
    } catch (error) {
      setLevelingState(prev => ({
        ...prev,
        isAnalyzing: false,
        preview: {
          hasConflicts: false,
          message: `Error analyzing resources: ${error.message}`,
          proposedShifts: [],
          conflicts: [],
        },
      }));
    }
  }, [tasks, taskLinks, mockResources, globalCalendar]);

  /**
   * Apply resource leveling changes
   */
  const applyLeveling = useCallback(async () => {
    if (
      !levelingState.preview ||
      levelingState.preview.proposedShifts.length === 0
    ) {
      return;
    }

    setLevelingState(prev => ({
      ...prev,
      isApplying: true,
    }));

    try {
      const result = applyResourceLeveling(
        levelingState.preview.proposedShifts,
        tasks,
        updateTask
      );

      setLevelingState(prev => ({
        ...prev,
        isApplying: false,
        result,
      }));

      // Trigger auto-scheduling to recalculate dates and float
      if (result.success && result.appliedShifts.length > 0) {
        setTimeout(() => {
          performAutoScheduling();
        }, 100);
      }
    } catch (error) {
      setLevelingState(prev => ({
        ...prev,
        isApplying: false,
        result: {
          success: false,
          appliedShifts: [],
          errors: [error.message],
          message: `Failed to apply leveling: ${error.message}`,
        },
      }));
    }
  }, [levelingState.preview, tasks, updateTask, performAutoScheduling]);

  /**
   * Clear leveling results
   */
  const clearResults = useCallback(() => {
    setLevelingState({
      isAnalyzing: false,
      preview: null,
      isApplying: false,
      result: null,
    });
  }, []);

  /**
   * Get current leveling statistics
   */
  const getCurrentStats = useCallback(() => {
    return getLevelingStats(tasks, mockResources, globalCalendar);
  }, [tasks, mockResources, globalCalendar]);

  /**
   * Get current resource conflicts using new leveling utilities
   */
  const getCurrentConflicts = useCallback(() => {
    try {
      const allocations = calculateDailyAllocations(tasks, mockResources);
      return detectOverallocations(allocations, mockResources);
    } catch (error) {
      console.error('Error calculating conflicts:', error);
      return [];
    }
  }, [tasks, mockResources]);

  /**
   * Handle tasks update from leveling dialog
   */
  const handleTasksUpdate = useCallback(async (updatedTasks) => {
    try {
      // Update each task
      for (const task of updatedTasks) {
        await updateTask(task.id, task);
      }
      
      // Trigger auto-scheduling to recalculate dates and float
      setTimeout(() => {
        performAutoScheduling();
      }, 100);
    } catch (error) {
      console.error('Failed to update tasks:', error);
    }
  }, [updateTask, performAutoScheduling]);

  const stats = getCurrentStats();
  const currentConflicts = getCurrentConflicts();

  return (
    <div className='flex flex-nowrap gap-0 p-2 bg-white w-full min-w-0'>
      {/* Resource Analysis Group */}
      <RibbonGroup title='Resource Analysis'>
        <RibbonButton
          icon={<ChartBarIcon className='w-4 h-4 text-gray-700' />}
          label='Analyze Resources'
          onClick={analyzeResources}
          disabled={levelingState.isAnalyzing}
          tooltip='Analyze resource conflicts and generate leveling preview'
        />
        <RibbonButton
          icon={<EyeIcon className='w-4 h-4 text-gray-700' />}
          label='Show Conflicts'
          onClick={analyzeResources}
          disabled={levelingState.isAnalyzing}
          tooltip={`Show current resource conflicts (${stats.totalConflicts} detected)`}
        />
      </RibbonGroup>

      {/* Resource Leveling Group */}
      <RibbonGroup title='Resource Leveling'>
        <RibbonButton
          icon={<ArrowPathIcon className='w-4 h-4 text-gray-700' />}
          label='Level Resources'
          onClick={() => setShowLevelingDialog(true)}
          disabled={currentConflicts.length === 0}
          tooltip={
            currentConflicts.length > 0
              ? `Resolve ${currentConflicts.length} resource conflicts with automatic leveling`
              : 'No resource conflicts detected'
          }
        />
        <RibbonButton
          icon={<CogIcon className='w-4 h-4 text-gray-700' />}
          label='Advanced Leveling'
          onClick={() => setShowLevelingDialog(true)}
          tooltip='Open advanced resource leveling dialog with configuration options'
        />
        {currentConflicts.length > 0 && (
          <RibbonButton
            icon={
              <ExclamationTriangleIcon className='w-4 h-4 text-orange-600' />
            }
            label={`${currentConflicts.length} Conflicts`}
            onClick={() => {}} // Read-only display
            disabled={true}
            tooltip={`${currentConflicts.length} resource conflicts detected`}
          />
        )}
      </RibbonGroup>

      {/* Results Group */}
      {(levelingState.result || levelingState.preview) && (
        <RibbonGroup title='Results'>
          {levelingState.result?.success && (
            <RibbonButton
              icon={<CheckIcon className='w-4 h-4 text-green-600' />}
              label={`${levelingState.result.appliedShifts.length} Applied`}
              onClick={() => {}} // Read-only display
              disabled={true}
              tooltip={`Successfully applied ${levelingState.result.appliedShifts.length} shifts`}
            />
          )}
          {levelingState.result?.errors?.length > 0 && (
            <RibbonButton
              icon={<XMarkIcon className='w-4 h-4 text-red-600' />}
              label={`${levelingState.result.errors.length} Errors`}
              onClick={() => {}} // Read-only display
              disabled={true}
              tooltip={`${levelingState.result.errors.length} errors occurred during leveling`}
            />
          )}
          <RibbonButton
            icon={<XMarkIcon className='w-4 h-4 text-gray-700' />}
            label='Clear Results'
            onClick={clearResults}
            tooltip='Clear leveling results and preview'
          />
        </RibbonGroup>
      )}

      {/* Statistics Group */}
      <RibbonGroup title='Statistics'>
        <div className='px-3 py-2 text-xs text-gray-600 space-y-1'>
          <div className='flex justify-between'>
            <span>Conflicts:</span>
            <span className='font-medium'>{currentConflicts.length}</span>
          </div>
          <div className='flex justify-between'>
            <span>Non-Critical:</span>
            <span className='font-medium'>{stats.nonCriticalTasks}</span>
          </div>
          <div className='flex justify-between'>
            <span>Shiftable:</span>
            <span className='font-medium'>{stats.shiftableTasks}</span>
          </div>
          <div className='flex justify-between'>
            <span>Avg Float:</span>
            <span className='font-medium'>
              {stats.averageFloat.toFixed(1)}d
            </span>
          </div>
        </div>
      </RibbonGroup>

      {/* Preview Panel (if available) */}
      {levelingState.preview && (
        <div className='ml-4 p-3 bg-gray-50 rounded border border-gray-200 min-w-80'>
          <h4 className='text-sm font-medium text-gray-900 mb-2'>
            Leveling Preview
          </h4>
          <p className='text-xs text-gray-600 mb-3'>
            {levelingState.preview.message}
          </p>

          {levelingState.preview.proposedShifts.length > 0 && (
            <div className='space-y-2'>
              <h5 className='text-xs font-medium text-gray-700'>
                Proposed Shifts:
              </h5>
              {levelingState.preview.proposedShifts
                .slice(0, 3)
                .map((shift, index) => (
                  <div
                    key={index}
                    className='text-xs bg-white p-2 rounded border'
                  >
                    <div className='font-medium text-gray-800'>
                      {shift.taskName}
                    </div>
                    <div className='text-gray-600'>
                      Shift: {shift.maxShift}d • Float: {shift.totalFloat}d
                    </div>
                    <div className='text-gray-500'>
                      {shift.conflictResource} conflict on{' '}
                      {new Date(shift.conflictDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              {levelingState.preview.proposedShifts.length > 3 && (
                <div className='text-xs text-gray-500'>
                  +{levelingState.preview.proposedShifts.length - 3} more
                  shifts...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resource Leveling Dialog */}
      <ResourceLevelingDialog
        isOpen={showLevelingDialog}
        onClose={() => setShowLevelingDialog(false)}
        tasks={tasks}
        resources={mockResources}
        onTasksUpdate={handleTasksUpdate}
      />
    </div>
  );
};

export default AllocationTab;
