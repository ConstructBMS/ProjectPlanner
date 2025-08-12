import React, { useState, useMemo, useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';
import { useSelectionContext } from '../context/SelectionContext';
import { useFilterContext } from '../context/FilterContext';
import { useLayoutContext } from '../context/LayoutContext';
import { useCalendarContext } from '../context/CalendarContext';
import TaskLinkModal from './modals/TaskLinkModal';
import ContextMenu from './ContextMenu';
import { calculateWorkingDays } from '../utils/dateUtils';
import {
  calculateBaselinePerformance,
  formatVariance,
  hasBaselineData,
} from '../utils/baselineUtils';
import {
  calculateTaskProgressStatus,
  getStatusStyling,
} from '../utils/progressLineUtils';
import {
  calculateDeadlineStatus,
  getDeadlineStatusStyling,
  hasDeadlineWarning,
  getDeadlineTooltip,
} from '../utils/deadlineUtils';
import {
  getCriticalPathStyling,
  getCriticalPathTooltip,
} from '../utils/criticalPathUtils';
import {
  formatFloat,
  getFloatStyling,
  getFloatTooltip,
} from '../utils/floatUtils';
import {
  isTaskSplit,
  getTaskSegments,
  getSegmentStyling,
  getSegmentTooltip,
  calculateSegmentGaps,
} from '../utils/taskSegmentUtils';
import TaskSplitModal from './modals/TaskSplitModal';
import {
  isRecurringTask,
  isRecurringInstance,
  formatRecurrenceRule,
  canDetachInstance,
  detachRecurringInstance,
} from '../utils/recurringTaskUtils';
import {
  calculateTaskCost,
  formatCost,
  getCostVariance,
} from '../utils/costUtils';

// Import milestone shape utilities
import {
  getTaskMilestoneShape,
  getMilestoneColor,
  createMilestoneShapeComponent,
} from '../utils/milestoneShapeUtils.jsx';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  PencilIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

const TaskGrid = React.memo(() => {
  const {
    selectedTaskId,
    selectedTaskIds,
    linkingMode,
    deleteTask,
    updateTask,
    selectMultipleTasks,
    handleTaskClickForLinking,
    getVisibleTasks,
    toggleGroupCollapse,
  } = useTaskContext();

  const { viewState } = useViewContext();
  const { globalCalendar } = useCalendarContext();

  const { isSelected, handleTaskClick, getSelectedCount } =
    useSelectionContext();

  const { applyFilters } = useFilterContext();

  const {
    gridConfig,
    getColumnWidth,
    isColumnVisible,
    getAvailableColumns,
    updateColumnWidth,
  } = useLayoutContext();

  // Resource calculation functions
  const calculateTaskWork = useCallback(task => {
    if (!task.resourceAssignments || !Array.isArray(task.resourceAssignments)) {
      return 0;
    }
    return task.resourceAssignments.reduce((total, assignment) => {
      return total + (assignment.work || 0);
    }, 0);
  }, []);

  const calculateTaskCost = useCallback(task => {
    if (!task.resourceAssignments || !Array.isArray(task.resourceAssignments)) {
      return 0;
    }
    return task.resourceAssignments.reduce((total, assignment) => {
      const work = assignment.work || 0;
      const rate = assignment.rate || 0;
      return total + work * rate;
    }, 0);
  }, []);

  const calculateTaskUnits = useCallback(task => {
    if (
      !task.resourceAssignments ||
      !Array.isArray(task.resourceAssignments) ||
      task.resourceAssignments.length === 0
    ) {
      return 0;
    }
    const totalAllocation = task.resourceAssignments.reduce(
      (total, assignment) => {
        return total + (assignment.allocation || 0);
      },
      0
    );
    return totalAllocation / task.resourceAssignments.length;
  }, []);

  // Render column content based on column type
  const renderColumnContent = (columnKey, task, isEditing, editingField) => {
    const isEditingThisField = isEditing && editingField.field === columnKey;

    switch (columnKey) {
      case 'taskName':
        return isEditingThisField ? (
          <input
            type='text'
            value={editValue}
            onChange={handleEditChange}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            className='w-full px-1 py-0.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
            autoFocus
          />
        ) : (
          <div
            className='truncate cursor-pointer flex items-center gap-1'
            onDoubleClick={e =>
              handleEditDoubleClick(task.id, 'name', task.name, e)
            }
          >
            <span>{task.name}</span>
            {/* Recurring Task Icon */}
            {(isRecurringTask(task) || isRecurringInstance(task)) && (
              <span
                className='text-xs text-blue-600'
                title={
                  task.recurrence
                    ? formatRecurrenceRule(task.recurrence)
                    : 'Recurring task instance'
                }
              >
                🔄
              </span>
            )}
          </div>
        );

      case 'startDate':
        return isEditingThisField ? (
          <input
            type='date'
            value={editValue}
            onChange={handleEditChange}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            className='w-full px-1 py-0.5 border border-blue-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
            autoFocus
          />
        ) : (
          <div
            className='cursor-pointer'
            onDoubleClick={e =>
              handleEditDoubleClick(task.id, 'startDate', task.startDate, e)
            }
          >
            {new Date(task.startDate).toLocaleDateString()}
          </div>
        );

      case 'endDate':
        return isEditingThisField ? (
          <input
            type='date'
            value={editValue}
            onChange={handleEditChange}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            className='w-full px-1 py-0.5 border border-blue-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
            autoFocus
          />
        ) : (
          <div
            className='cursor-pointer'
            onDoubleClick={e =>
              handleEditDoubleClick(task.id, 'endDate', task.endDate, e)
            }
          >
            {new Date(task.endDate).toLocaleDateString()}
          </div>
        );

      case 'duration':
        return (
          <div className='text-center'>
            {calculateWorkingDays(task.startDate, task.endDate)}d
          </div>
        );

      case 'resource':
        return (
          <div className='truncate'>
            {task.resource || task.assignedTo || '-'}
          </div>
        );

      case 'status':
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.status === 'Complete'
                ? 'bg-green-100 text-green-800'
                : task.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : task.status === 'Delayed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
          >
            {task.status || 'Not Started'}
          </span>
        );

      case 'progress':
        return (
          <div className='flex items-center gap-1'>
            <div className='flex-1 bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
            <span className='text-xs text-gray-600 w-8'>
              {task.progress || 0}%
            </span>
          </div>
        );

      case 'cost': {
        // Find the resource for this task
        const resource = getVisibleTasks().find(
          t => t.id === task.resourceId
        ) || {
          name: task.resource || task.assignedTo,
          costRate: 0,
        };
        const taskCost = calculateTaskCost(task, resource);
        const costVariance = getCostVariance(task, resource);

        return (
          <div className='text-right'>
            <div className='font-medium text-green-600'>
              {formatCost(taskCost.cost)}
            </div>
            {costVariance.isOverBudget && (
              <div className='text-xs text-red-600'>
                +{formatCost(costVariance.variance)}
              </div>
            )}
          </div>
        );
      }

      case 'work':
        return (
          <div className='text-right'>
            {calculateTaskWork(task).toFixed(1)}h
          </div>
        );

      case 'units':
        return (
          <div className='text-right'>
            {calculateTaskUnits(task).toFixed(1)}%
          </div>
        );

      case 'priority':
        return <div className='text-center'>{task.priority || '-'}</div>;

      case 'assignedTo':
        return <div className='truncate'>{task.assignedTo || '-'}</div>;

      case 'notes':
        return <div className='truncate'>{task.notes || '-'}</div>;

      case 'startVariance':
        return (
          <div className='text-center'>
            {hasBaselineData(task) ? (
              (() => {
                const performance = calculateBaselinePerformance(task);
                return (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${performance.startStatus.bgColor} ${performance.startStatus.color}`}
                  >
                    {formatVariance(performance.startVariance)}
                  </span>
                );
              })()
            ) : (
              <span className='text-gray-400 text-xs'>-</span>
            )}
          </div>
        );

      case 'finishVariance':
        return (
          <div className='text-center'>
            {hasBaselineData(task) ? (
              (() => {
                const performance = calculateBaselinePerformance(task);
                return (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${performance.finishStatus.bgColor} ${performance.finishStatus.color}`}
                  >
                    {formatVariance(performance.finishVariance)}
                  </span>
                );
              })()
            ) : (
              <span className='text-gray-400 text-xs'>-</span>
            )}
          </div>
        );

      case 'durationVariance':
        return (
          <div className='text-center'>
            {hasBaselineData(task) ? (
              (() => {
                const performance = calculateBaselinePerformance(task);
                return (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${performance.durationStatus.bgColor} ${performance.durationStatus.color}`}
                  >
                    {formatVariance(performance.durationVariance)}
                  </span>
                );
              })()
            ) : (
              <span className='text-gray-400 text-xs'>-</span>
            )}
          </div>
        );

      case 'scheduleStatus':
        return (
          <div className='text-center'>
            {(() => {
              const statusDate = viewState.statusDate
                ? new Date(viewState.statusDate)
                : new Date();
              const progressStatus = calculateTaskProgressStatus(
                task,
                statusDate,
                globalCalendar
              );
              const styling = getStatusStyling(progressStatus.status);

              return (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${styling.bgColor} ${styling.color} border ${styling.borderColor}`}
                  title={styling.tooltip}
                >
                  {styling.icon} {progressStatus.status}
                </span>
              );
            })()}
          </div>
        );

      case 'deadline':
        return (
          <div className='text-center'>
            {task.deadline ? (
              (() => {
                const deadlineStatus = calculateDeadlineStatus(task);
                const styling = getDeadlineStatusStyling(deadlineStatus.status);

                return (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${styling.bgColor} ${styling.color} border ${styling.borderColor}`}
                    title={getDeadlineTooltip(task)}
                  >
                    {styling.icon}{' '}
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                );
              })()
            ) : (
              <span className='text-gray-400 text-xs'>-</span>
            )}
          </div>
        );

      case 'criticalPath':
        return (
          <div className='text-center'>
            {task.isCritical ? (
              (() => {
                const styling = getCriticalPathStyling(true);

                return (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${styling.className} text-white`}
                    title={getCriticalPathTooltip(task)}
                  >
                    🔴 Critical
                  </span>
                );
              })()
            ) : (
              <span className='text-gray-400 text-xs'>Normal</span>
            )}
          </div>
        );

      case 'totalFloat':
        return (
          <div className='text-center'>
            {(() => {
              const styling = getFloatStyling(task.totalFloat, 'total');

              return (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${styling.bgColor} ${styling.color} border ${styling.borderColor}`}
                  title={getFloatTooltip(task, 'total')}
                >
                  {styling.icon} {formatFloat(task.totalFloat)}
                </span>
              );
            })()}
          </div>
        );

      case 'freeFloat':
        return (
          <div className='text-center'>
            {(() => {
              const styling = getFloatStyling(task.freeFloat, 'free');

              return (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${styling.bgColor} ${styling.color} border ${styling.borderColor}`}
                  title={getFloatTooltip(task, 'free')}
                >
                  {styling.icon} {formatFloat(task.freeFloat)}
                </span>
              );
            })()}
          </div>
        );

      default:
        return <div className='truncate'>{task[columnKey] || '-'}</div>;
    }
  };

  const visibleTasks = useMemo(() => {
    try {
      let tasks = [];
      if (
        getVisibleTasks &&
        typeof getVisibleTasks === 'function' &&
        viewState
      ) {
        tasks = getVisibleTasks(viewState.taskFilter || 'Show All');
      }

      // Apply quick filters
      return applyFilters(tasks);
    } catch (error) {
      console.warn('Error getting visible tasks:', error);
      return [];
    }
  }, [getVisibleTasks, viewState?.taskFilter, applyFilters]);

  // Inline editing state
  const [editingField, setEditingField] = useState(null); // { taskId, field }
  const [editValue, setEditValue] = useState('');

  // Task linking modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkFromTask, setLinkFromTask] = useState(null);
  const [linkToTask, setLinkToTask] = useState(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    task: null,
  });
  const [taskSplitModal, setTaskSplitModal] = useState({
    isOpen: false,
    task: null,
  });

  const handleDeleteTask = useCallback(
    (taskId, e) => {
      e.stopPropagation(); // Prevent row selection when clicking delete
      deleteTask(taskId);
    },
    [deleteTask]
  );

  const handleCreateLink = useCallback((taskId, e) => {
    e.stopPropagation(); // Prevent row selection when clicking link
    setLinkFromTask(taskId);
    setLinkToTask(null);
    setShowLinkModal(true);
  }, []);

  const closeLinkModal = useCallback(() => {
    setShowLinkModal(false);
    setLinkFromTask(null);
    setLinkToTask(null);
  }, []);

  // Context menu handlers
  const handleContextMenu = useCallback((e, task) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      task,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      task: null,
    });
  }, []);

  // Inline editing functions - moved before handleContextMenuAction
  const startEditing = useCallback((taskId, field, currentValue) => {
    setEditingField({ taskId, field });

    // Format initial value for editing
    let initialValue = currentValue;
    if (field === 'startDate' || field === 'endDate') {
      try {
        const date = new Date(currentValue);
        initialValue = date.toISOString().split('T')[0]; // YYYY-MM-DD format for date input
      } catch {
        initialValue = currentValue;
      }
    }

    setEditValue(initialValue);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingField) return;

    const { taskId, field } = editingField;
    let finalValue = editValue;

    // Handle name field - ensure it's not empty
    if (field === 'name') {
      if (!finalValue.trim()) {
        console.warn('Task name cannot be empty');
        stopEditing();
        return;
      }
      finalValue = finalValue.trim();
    }

    // Handle duration field - ensure it's a number
    if (field === 'duration') {
      const numericValue = parseInt(editValue.replace(' days', ''), 10);
      if (isNaN(numericValue) || numericValue < 1) {
        console.warn('Duration must be a positive number');
        stopEditing();
        return;
      }
      finalValue = numericValue;
    }

    // Handle date fields - validate format and convert to ISO string
    if (field === 'startDate' || field === 'endDate') {
      const date = new Date(finalValue);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format');
        stopEditing();
        return;
      }
      finalValue = date.toISOString();
    }

    // Update the task
    updateTask(taskId, { [field]: finalValue });
    stopEditing();
  }, [editingField, editValue, updateTask, stopEditing]);

  const handleEditKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopEditing();
      }
    },
    [commitEdit, stopEditing]
  );

  const handleEditBlur = useCallback(() => {
    // Small delay to allow for Enter key processing
    window.setTimeout(() => {
      commitEdit();
    }, 100);
  }, [commitEdit]);

  const handleEditDoubleClick = useCallback(
    (taskId, field, currentValue, e) => {
      e.stopPropagation();
      startEditing(taskId, field, currentValue);
    },
    [startEditing]
  );

  const handleEditChange = useCallback(e => {
    setEditValue(e.target.value);
  }, []);

  const handleContextMenuAction = useCallback(
    (action, task) => {
      switch (action) {
        case 'edit':
          // Start editing the task name
          startEditing(task.id, 'name', task.name);
          break;
        case 'delete':
          deleteTask(task.id);
          break;
        case 'addSubtask':
          // Add subtask functionality - you can implement this based on your needs
          console.log('Add subtask for:', task.name);
          break;
        case 'splitTask':
          setTaskSplitModal({ isOpen: true, task });
          break;
        case 'detachRecurring':
          if (canDetachInstance(task)) {
            const detachedTask = detachRecurringInstance(task);
            updateTask(task.id, detachedTask);
          }
          break;
        case 'link':
          // TODO: Implement link functionality
          console.log('Link task:', task.name);
          break;
        case 'milestone':
          updateTask(task.id, { isMilestone: !task.isMilestone });
          break;
        case 'expandAll':
          // TODO: Implement expand all functionality
          console.log('Expand all');
          break;
        case 'collapseAll':
          // TODO: Implement collapse all functionality
          console.log('Collapse all');
          break;
        default:
          console.log('Unknown context menu action:', action);
      }
    },
    [deleteTask, startEditing, updateTask]
  );

  const handleRowClick = useCallback(
    (taskId, e) => {
      // If in linking mode, handle linking logic
      if (linkingMode) {
        handleTaskClickForLinking(taskId);
        return;
      }

      // Use new selection context for multi-select
      handleTaskClick(
        taskId,
        e,
        visibleTasks.map(t => t.id)
      );
    },
    [linkingMode, handleTaskClickForLinking, handleTaskClick, visibleTasks]
  );

  const handleGroupToggle = useCallback(
    (taskId, e) => {
      e.stopPropagation(); // Prevent row selection when clicking expand/collapse
      toggleGroupCollapse(taskId);
    },
    [toggleGroupCollapse]
  );

  // Memoize the grid rows to prevent unnecessary re-renders
  const gridRows = useMemo(() => {
    return visibleTasks.map(task => {
      const isTaskSelected = isSelected(task.id);
      const isEditing = editingField?.taskId === task.id && editingField?.field;

      return (
        <div
          key={task.id}
          className={`asta-grid-row flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
            isTaskSelected ? 'bg-blue-50 ring-1 ring-blue-300' : ''
          }`}
          onClick={e => handleRowClick(task.id, e)}
          onContextMenu={e => handleContextMenu(e, task)}
        >
          {/* Expand/Collapse */}
          <div className='w-8 h-8 flex items-center justify-center'>
            {task.isGroup && (
              <button
                onClick={e => handleGroupToggle(task.id, e)}
                className='p-1 hover:bg-gray-200 rounded transition-colors duration-150'
              >
                {task.isExpanded ? (
                  <ChevronDownIcon className='w-4 h-4 text-gray-600' />
                ) : (
                  <ChevronRightIcon className='w-4 h-4 text-gray-600' />
                )}
              </button>
            )}
          </div>

          {/* Task Icon */}
          <div className='w-8 h-8 flex items-center justify-center'>
            {task.type === 'milestone' || task.isMilestone ? (
              createMilestoneShapeComponent(
                getTaskMilestoneShape(task, viewState.globalMilestoneShape),
                'w-4 h-4',
                getMilestoneColor(
                  {
                    ...task,
                    selected: selectedTaskId === task.id,
                  },
                  getTaskMilestoneShape(task, viewState.globalMilestoneShape)
                )
              )
            ) : task.isGroup ? (
              <FolderIcon className='w-4 h-4 text-blue-600' />
            ) : (
              <div className='w-2 h-2 bg-gray-400 rounded' />
            )}
          </div>

          {/* Dynamic Columns */}
          {gridConfig?.columns
            ?.filter(col => col.visible)
            .sort((a, b) => a.order - b.order)
            .map(column => (
              <div
                key={column.key}
                className='px-2 py-1 text-sm'
                style={{ width: column.width }}
              >
                {renderColumnContent(column.key, task, isEditing, editingField)}
              </div>
            ))}

          {/* Actions */}
          <div className='w-16 px-2 py-1 flex items-center justify-center gap-1'>
            <button
              onClick={e => handleCreateLink(task.id, e)}
              className='p-1 hover:bg-blue-100 rounded transition-colors duration-150'
              title='Create task link'
            >
              <LinkIcon className='w-3 h-3 text-gray-500 hover:text-blue-600' />
            </button>
            <button
              onClick={e => handleDeleteTask(task.id, e)}
              className='p-1 hover:bg-red-100 rounded transition-colors duration-150'
              title='Delete task'
            >
              <PencilIcon className='w-3 h-3 text-gray-500 hover:text-red-600' />
            </button>
          </div>
        </div>
      );
    });
  }, [
    visibleTasks,
    selectedTaskId,
    selectedTaskIds,
    editingField,
    editValue,
    handleRowClick,
    handleGroupToggle,
    handleEditDoubleClick,
    handleEditChange,
    handleEditKeyDown,
    handleEditBlur,
    handleDeleteTask,
    handleCreateLink,
    handleContextMenu,
  ]);

  return (
    <>
      <div className='asta-grid h-full pm-content-dark'>
        {/* Grid Header */}
        <div className='asta-grid-header flex items-center'>
          <div className='w-8 h-8' />
          <div className='w-8 h-8' />
          {gridConfig?.columns
            ?.filter(col => col.visible)
            .sort((a, b) => a.order - b.order)
            .map(column => (
              <div
                key={column.key}
                className='asta-grid-header-cell'
                style={{ width: column.width }}
              >
                {column.label ||
                  getAvailableColumns().find(col => col.key === column.key)
                    ?.label}
              </div>
            ))}
          <div className='asta-grid-header-cell w-16'>
            Actions
          </div>
        </div>

        {/* Grid Rows */}
        <div className='asta-grid-rows'>{gridRows}</div>
      </div>

      {/* Task Link Modal */}
      <TaskLinkModal
        isOpen={showLinkModal}
        onClose={closeLinkModal}
        fromTaskId={linkFromTask}
        toTaskId={linkToTask}
      />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onAction={handleContextMenuAction}
        task={contextMenu.task}
      />
      <TaskSplitModal
        isOpen={taskSplitModal.isOpen}
        task={taskSplitModal.task}
        onClose={() => setTaskSplitModal({ isOpen: false, task: null })}
        onSplitTask={updatedTask => {
          updateTask(updatedTask.id, updatedTask);
          setTaskSplitModal({ isOpen: false, task: null });
        }}
      />
    </>
  );
});

TaskGrid.displayName = 'TaskGrid';

export default TaskGrid;
