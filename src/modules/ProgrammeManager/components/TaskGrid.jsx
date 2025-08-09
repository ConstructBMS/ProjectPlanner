import React, { useState, useMemo, useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';
import { useSelectionContext } from '../context/SelectionContext';
import TaskLinkModal from './modals/TaskLinkModal';
import ContextMenu from './ContextMenu';
import { calculateWorkingDays } from '../utils/dateUtils';

// Diamond icon component for milestones
const DiamondIcon = ({ className = 'w-4 h-4', color = 'text-purple-600' }) => (
  <svg
    className={`${className} ${color}`}
    viewBox='0 0 24 24'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M12 2L2 12L12 22L22 12L12 2Z' />
  </svg>
);
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
  
  const {
    isSelected,
    handleTaskClick,
    getSelectedCount,
  } = useSelectionContext();

  const visibleTasks = useMemo(() => {
    try {
      if (getVisibleTasks && typeof getVisibleTasks === 'function' && viewState) {
        return getVisibleTasks(viewState.taskFilter || 'Show All');
      }
      return [];
    } catch (error) {
      console.warn('Error getting visible tasks:', error);
      return [];
    }
  }, [getVisibleTasks, viewState?.taskFilter]);

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
        default:
          console.log('Unknown context menu action:', action);
      }
    },
    [deleteTask, startEditing]
  );

  const handleRowClick = useCallback(
    (taskId, e) => {
      // If in linking mode, handle linking logic
      if (linkingMode) {
        handleTaskClickForLinking(taskId);
        return;
      }

      // Use new selection context for multi-select
      handleTaskClick(taskId, e, visibleTasks.map(t => t.id));
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
            {(task.type === 'milestone' || task.isMilestone) ? (
              <DiamondIcon className='w-4 h-4' color='text-purple-500' />
            ) : task.isGroup ? (
              <FolderIcon className='w-4 h-4 text-blue-600' />
            ) : (
              <div className='w-2 h-2 bg-gray-400 rounded' />
            )}
          </div>

          {/* Task Name */}
          <div className='flex-1 px-2 py-1 min-w-0'>
            {isEditing && editingField.field === 'name' ? (
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
                className='truncate cursor-pointer'
                onDoubleClick={e =>
                  handleEditDoubleClick(task.id, 'name', task.name, e)
                }
              >
                {task.name}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className='w-24 px-2 py-1 text-sm'>
            {isEditing && editingField.field === 'startDate' ? (
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
            )}
          </div>

          {/* End Date */}
          <div className='w-24 px-2 py-1 text-sm'>
            {isEditing && editingField.field === 'endDate' ? (
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
            )}
          </div>

          {/* Duration */}
          <div className='w-16 px-2 py-1 text-sm text-center'>
            {isEditing && editingField.field === 'duration' ? (
              <input
                type='text'
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
                  handleEditDoubleClick(task.id, 'duration', task.duration, e)
                }
              >
                {calculateWorkingDays(task.startDate, task.endDate)}d
              </div>
            )}
          </div>

          {/* Status */}
          <div className='w-20 px-2 py-1 text-sm'>
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
              {task.status}
            </span>
          </div>

          {/* Progress */}
          <div className='w-20 px-2 py-1 text-sm'>
            <div className='flex items-center gap-1'>
              <div className='flex-1 bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className='text-xs text-gray-600 w-8'>
                {task.progress}%
              </span>
            </div>
          </div>

          {/* Assignee */}
          <div className='w-24 px-2 py-1 text-sm truncate'>
            {task.assignee || '-'}
          </div>

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
      <div className='asta-grid h-full overflow-auto'>
        {/* Grid Header */}
        <div className='asta-grid-header flex items-center border-b-2 border-gray-300 bg-gray-50 sticky top-0 z-10'>
          <div className='w-8 h-8' />
          <div className='w-8 h-8' />
          <div className='flex-1 px-2 py-2 font-semibold'>Task Name</div>
          <div className='w-24 px-2 py-2 font-semibold'>Start Date</div>
          <div className='w-24 px-2 py-2 font-semibold'>End Date</div>
          <div className='w-16 px-2 py-2 font-semibold text-center'>
            Duration
          </div>
          <div className='w-20 px-2 py-2 font-semibold'>Status</div>
          <div className='w-20 px-2 py-2 font-semibold'>Progress</div>
          <div className='w-24 px-2 py-2 font-semibold'>Assignee</div>
          <div className='w-16 px-2 py-2 font-semibold text-center'>
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
    </>
  );
});

TaskGrid.displayName = 'TaskGrid';

export default TaskGrid;
