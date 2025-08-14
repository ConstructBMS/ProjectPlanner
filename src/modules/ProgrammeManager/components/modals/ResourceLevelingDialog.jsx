// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  PlayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  InformationCircleIcon,
  CogIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  performResourceLeveling,
  detectOverallocations,
  calculateDailyAllocations,
  generateLevelingReport,
  validateLevelingConfig,
  undoResourceLeveling,
  DEFAULT_LEVELING_CONFIG,
} from '../../utils/resourceLevelingUtils';

const ResourceLevelingDialog = ({
  isOpen,
  onClose,
  tasks,
  resources,
  onTasksUpdate,
}) => {
  const [config, setConfig] = useState(DEFAULT_LEVELING_CONFIG);
  const [isLeveling, setIsLeveling] = useState(false);
  const [levelingResult, setLevelingResult] = useState(null);
  const [levelingHistory, setLevelingHistory] = useState([]);
  const [currentConflicts, setCurrentConflicts] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });

  // Calculate current conflicts when dialog opens
  useEffect(() => {
    if (isOpen && tasks.length > 0 && resources.length > 0) {
      const allocations = calculateDailyAllocations(tasks, resources, config);
      const conflicts = detectOverallocations(allocations, resources, config);
      setCurrentConflicts(conflicts);
    }
  }, [isOpen, tasks, resources, config]);

  // Validate configuration when it changes
  useEffect(() => {
    const validation = validateLevelingConfig(config);
    setValidation(validation);
  }, [config]);

  // Handle configuration change
  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Perform resource leveling
  const handleLevelResources = useCallback(async () => {
    if (!validation.isValid) return;

    setIsLeveling(true);
    setLevelingResult(null);

    try {
      // Create a copy of tasks for leveling
      const tasksCopy = JSON.parse(JSON.stringify(tasks));

      const result = await performResourceLeveling(
        tasksCopy,
        resources,
        config
      );

      setLevelingResult(result);
      setLevelingHistory(result.levelingHistory);

      // Update tasks if leveling was successful
      if (result.success) {
        await onTasksUpdate(result.leveledTasks);
      }
    } catch (error) {
      console.error('Resource leveling failed:', error);
      setLevelingResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsLeveling(false);
    }
  }, [tasks, resources, config, validation.isValid, onTasksUpdate]);

  // Undo leveling
  const handleUndoLeveling = useCallback(
    async (steps = 1) => {
      if (levelingHistory.length === 0) return;

      try {
        const undoResult = undoResourceLeveling(levelingHistory, tasks, steps);

        if (undoResult.success) {
          setLevelingHistory(undoResult.remainingHistory);
          await onTasksUpdate(tasks);

          // Recalculate conflicts
          const allocations = calculateDailyAllocations(
            tasks,
            resources,
            config
          );
          const conflicts = detectOverallocations(
            allocations,
            resources,
            config
          );
          setCurrentConflicts(conflicts);
        }
      } catch (error) {
        console.error('Undo failed:', error);
      }
    },
    [levelingHistory, tasks, resources, config, onTasksUpdate]
  );

  // Reset to original state
  const handleReset = useCallback(async () => {
    if (levelingResult && levelingResult.originalTasks) {
      await onTasksUpdate(levelingResult.originalTasks);
      setLevelingResult(null);
      setLevelingHistory([]);

      // Recalculate conflicts
      const allocations = calculateDailyAllocations(
        levelingResult.originalTasks,
        resources,
        config
      );
      const conflicts = detectOverallocations(allocations, resources, config);
      setCurrentConflicts(conflicts);
    }
  }, [levelingResult, resources, config, onTasksUpdate]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <ArrowPathIcon className='w-6 h-6 text-blue-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Resource Leveling
            </h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        <div className='flex h-[calc(90vh-120px)]'>
          {/* Left Panel - Configuration and Actions */}
          <div className='w-1/3 border-r border-gray-200 p-6 overflow-y-auto'>
            {/* Current Status */}
            <div className='mb-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-3'>
                Current Status
              </h3>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Total Tasks:</span>
                  <span className='text-sm font-medium'>{tasks.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Resources:</span>
                  <span className='text-sm font-medium'>
                    {resources.length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Conflicts:</span>
                  <span
                    className={`text-sm font-medium ${currentConflicts.length > 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {currentConflicts.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Configuration
                </h3>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700'
                >
                  <CogIcon className='w-4 h-4' />
                  {showConfig ? 'Hide' : 'Show'}
                </button>
              </div>

              {showConfig && (
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Max Iterations
                    </label>
                    <input
                      type='number'
                      value={config.maxIterations}
                      onChange={e =>
                        handleConfigChange(
                          'maxIterations',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='1'
                      max='1000'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Max Shift Days
                    </label>
                    <input
                      type='number'
                      value={config.maxShiftDays}
                      onChange={e =>
                        handleConfigChange(
                          'maxShiftDays',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='1'
                      max='100'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Leveling Strategy
                    </label>
                    <select
                      value={config.levelingStrategy}
                      onChange={e =>
                        handleConfigChange('levelingStrategy', e.target.value)
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='forward'>Forward</option>
                      <option value='backward'>Backward</option>
                      <option value='balanced'>Balanced</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Overallocation Threshold
                    </label>
                    <input
                      type='number'
                      value={config.overallocationThreshold}
                      onChange={e =>
                        handleConfigChange(
                          'overallocationThreshold',
                          parseFloat(e.target.value)
                        )
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='0.1'
                      max='2.0'
                      step='0.1'
                    />
                  </div>

                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      id='respectDependencies'
                      checked={config.respectDependencies}
                      onChange={e =>
                        handleConfigChange(
                          'respectDependencies',
                          e.target.checked
                        )
                      }
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label
                      htmlFor='respectDependencies'
                      className='text-sm text-gray-700'
                    >
                      Respect Dependencies
                    </label>
                  </div>

                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      id='respectConstraints'
                      checked={config.respectConstraints}
                      onChange={e =>
                        handleConfigChange(
                          'respectConstraints',
                          e.target.checked
                        )
                      }
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label
                      htmlFor='respectConstraints'
                      className='text-sm text-gray-700'
                    >
                      Respect Constraints
                    </label>
                  </div>
                </div>
              )}

              {/* Validation */}
              {!validation.isValid && (
                <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded'>
                  <div className='flex items-center gap-2 mb-2'>
                    <ExclamationTriangleIcon className='w-4 h-4 text-red-600' />
                    <span className='text-sm font-medium text-red-900'>
                      Configuration Errors
                    </span>
                  </div>
                  <ul className='text-xs text-red-700 space-y-1'>
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded'>
                  <div className='flex items-center gap-2 mb-2'>
                    <ExclamationTriangleIcon className='w-4 h-4 text-yellow-600' />
                    <span className='text-sm font-medium text-yellow-900'>
                      Warnings
                    </span>
                  </div>
                  <ul className='text-xs text-yellow-700 space-y-1'>
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='space-y-3'>
              <button
                onClick={handleLevelResources}
                disabled={
                  isLeveling ||
                  !validation.isValid ||
                  currentConflicts.length === 0
                }
                className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLeveling ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Leveling...
                  </>
                ) : (
                  <>
                    <PlayIcon className='w-4 h-4' />
                    Level Resources
                  </>
                )}
              </button>

              {levelingHistory.length > 0 && (
                <>
                  <button
                    onClick={() => handleUndoLeveling(1)}
                    disabled={levelingHistory.length === 0}
                    className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <ArrowPathIcon className='w-4 h-4' />
                    Undo Last Shift
                  </button>

                  <button
                    onClick={handleReset}
                    className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
                  >
                    <ArrowPathIcon className='w-4 h-4' />
                    Reset to Original
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Results and Details */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {levelingResult ? (
              <div className='space-y-6'>
                {/* Summary */}
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h3 className='text-lg font-medium text-gray-900 mb-3'>
                    Leveling Results
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <span className='text-sm text-gray-600'>Status:</span>
                      <div className='flex items-center gap-2'>
                        {levelingResult.success ? (
                          <>
                            <CheckIcon className='w-4 h-4 text-green-600' />
                            <span className='text-sm font-medium text-green-600'>
                              Success
                            </span>
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className='w-4 h-4 text-yellow-600' />
                            <span className='text-sm font-medium text-yellow-600'>
                              Partial Success
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className='text-sm text-gray-600'>
                        Tasks Shifted:
                      </span>
                      <span className='text-sm font-medium'>
                        {levelingResult.summary.tasksShifted}
                      </span>
                    </div>
                    <div>
                      <span className='text-sm text-gray-600'>
                        Conflicts Resolved:
                      </span>
                      <span className='text-sm font-medium'>
                        {levelingResult.summary.conflictsResolved}
                      </span>
                    </div>
                    <div>
                      <span className='text-sm text-gray-600'>
                        Remaining Conflicts:
                      </span>
                      <span className='text-sm font-medium'>
                        {levelingResult.summary.conflictsRemaining}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Shifts */}
                {levelingHistory.length > 0 && (
                  <div>
                    <h3 className='text-lg font-medium text-gray-900 mb-3'>
                      Task Shifts
                    </h3>
                    <div className='space-y-2 max-h-60 overflow-y-auto'>
                      {levelingHistory.map((entry, index) => (
                        <div
                          key={index}
                          className='bg-white border border-gray-200 rounded p-3'
                        >
                          <div className='flex justify-between items-start mb-2'>
                            <span className='font-medium text-sm'>
                              {entry.taskName}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                entry.shiftDays > 0
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {entry.shiftDays > 0 ? '+' : ''}
                              {entry.shiftDays} days
                            </span>
                          </div>
                          <div className='text-xs text-gray-600'>
                            <div>
                              From:{' '}
                              {entry.originalStartDate.toLocaleDateString()} -{' '}
                              {entry.originalEndDate.toLocaleDateString()}
                            </div>
                            <div>
                              To: {entry.newStartDate.toLocaleDateString()} -{' '}
                              {entry.newEndDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remaining Conflicts */}
                {levelingResult.remainingConflicts.length > 0 && (
                  <div>
                    <h3 className='text-lg font-medium text-gray-900 mb-3'>
                      Remaining Conflicts
                    </h3>
                    <div className='space-y-2'>
                      {levelingResult.remainingConflicts
                        .slice(0, 5)
                        .map((conflict, index) => (
                          <div
                            key={index}
                            className='bg-red-50 border border-red-200 rounded p-3'
                          >
                            <div className='flex justify-between items-start mb-2'>
                              <span className='font-medium text-sm'>
                                {conflict.resourceName}
                              </span>
                              <span className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded'>
                                {conflict.overloadHours.toFixed(1)}h overload
                              </span>
                            </div>
                            <div className='text-xs text-gray-600'>
                              <div>
                                Date:{' '}
                                {new Date(conflict.date).toLocaleDateString()}
                              </div>
                              <div>
                                Allocated: {conflict.allocatedHours.toFixed(1)}h
                                / {conflict.maxHours}h
                              </div>
                            </div>
                          </div>
                        ))}
                      {levelingResult.remainingConflicts.length > 5 && (
                        <div className='text-sm text-gray-500 text-center'>
                          ... and {levelingResult.remainingConflicts.length - 5}{' '}
                          more conflicts
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center text-gray-500 py-12'>
                <InformationCircleIcon className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                <p className='text-lg font-medium mb-2'>
                  Ready to Level Resources
                </p>
                <p className='text-sm'>
                  {currentConflicts.length > 0
                    ? `Found ${currentConflicts.length} resource conflicts to resolve.`
                    : 'No resource conflicts detected.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLevelingDialog;
