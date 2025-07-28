import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const TaskGrid = () => {
  const {
    tasks,
    selectedTaskId,
    selectedTaskIds,
    linkingMode,
    linkStartTaskId,
    deleteTask,
    updateTask,
    selectMultipleTasks,
    handleTaskClickForLinking,
    getVisibleTasks,
    toggleGroupCollapse,
  } = useTaskContext();

  const { viewState } = useViewContext();

  const visibleTasks = getVisibleTasks();

  // Inline editing state
  const [editingField, setEditingField] = useState(null); // { taskId, field }
  const [editValue, setEditValue] = useState('');

  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation(); // Prevent row selection when clicking delete
    deleteTask(taskId);
  };

  const handleRowClick = (taskId, e) => {
    // If in linking mode, handle linking logic
    if (linkingMode) {
      handleTaskClickForLinking(taskId);
      return;
    }

    // Normal selection logic
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectMultipleTasks(taskId, isMultiSelect);
  };

  const handleGroupToggle = (taskId, e) => {
    e.stopPropagation(); // Prevent row selection when clicking expand/collapse
    toggleGroupCollapse(taskId);
  };

  // Inline editing functions
  const startEditing = (taskId, field, currentValue) => {
    setEditingField({ taskId, field });

    // Format initial value for editing
    let initialValue = currentValue;
    if (field === 'startDate' || field === 'endDate') {
      try {
        const date = new Date(currentValue);
        initialValue = date.toISOString().split('T')[0]; // YYYY-MM-DD format for date input
      } catch (e) {
        initialValue = currentValue;
      }
    }

    setEditValue(initialValue);
  };

  const stopEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleEditDoubleClick = (taskId, field, currentValue, e) => {
    e.stopPropagation();
    startEditing(taskId, field, currentValue);
  };

  const handleEditChange = e => {
    setEditValue(e.target.value);
  };

  const handleEditKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing();
    }
  };

  const handleEditBlur = () => {
    // Small delay to allow for Enter key processing
    window.setTimeout(() => {
      commitEdit();
    }, 100);
  };

  const commitEdit = () => {
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

    // Validate date relationships
    if (field === 'startDate' || field === 'endDate') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const startDate =
          field === 'startDate'
            ? new Date(finalValue)
            : new Date(task.startDate);
        const endDate =
          field === 'endDate' ? new Date(finalValue) : new Date(task.endDate);

        if (endDate < startDate) {
          console.warn('End date cannot be before start date');
          stopEditing();
          return;
        }
      }
    }

    const updates = { [field]: finalValue };
    updateTask(taskId, updates);
    stopEditing();
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Planned':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'Delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const getStatusBackgroundColor = status => {
    if (!viewState.statusHighlighting) return '';

    switch (status) {
      case 'Planned':
        return 'bg-white';
      case 'In Progress':
        return 'bg-blue-50';
      case 'Complete':
        return 'bg-green-50';
      case 'Delayed':
        return 'bg-red-50';
      default:
        return 'bg-white';
    }
  };

  const getRowHighlightClass = taskId => {
    const task = tasks.find(t => t.id === taskId);
    const isSelected = selectedTaskId === taskId;
    const isMultiSelected = selectedTaskIds.includes(taskId);
    const isLinkStart = linkingMode && linkStartTaskId === taskId;
    const statusBackground = getStatusBackgroundColor(task?.status);

    if (isLinkStart) {
      return 'bg-purple-100 border-l-4 border-purple-500';
    } else if (isMultiSelected) {
      return 'bg-yellow-100 border-l-4 border-yellow-500';
    } else if (isSelected) {
      return 'bg-blue-100 border-l-4 border-blue-500';
    } else {
      return `${statusBackground} hover:bg-gray-50`;
    }
  };

  const getSelectionStatus = () => {
    if (linkingMode) {
      if (linkStartTaskId) {
        const startTask = tasks.find(task => task.id === linkStartTaskId);
        return `Linking mode: Click another task to link from "${startTask?.name || linkStartTaskId}"`;
      } else {
        return 'Linking mode: Click first task to start link';
      }
    } else if (selectedTaskIds.length === 0 && !selectedTaskId) {
      return 'No task selected';
    } else if (selectedTaskIds.length === 1 || selectedTaskId) {
      const taskId = selectedTaskId || selectedTaskIds[0];
      const task = tasks.find(t => t.id === taskId);
      return `1 task selected: ${task?.name || taskId}`;
    } else if (selectedTaskIds.length === 2) {
      return '2 tasks selected (ready to link)';
    } else {
      return `${selectedTaskIds.length} tasks selected`;
    }
  };

  // Render editable field
  const renderEditableField = (task, field, value, type = 'text') => {
    const isEditing =
      editingField?.taskId === task.id && editingField?.field === field;

    if (isEditing) {
      // Handle duration field specially - extract numeric value
      let inputValue = editValue;
      if (field === 'duration') {
        inputValue = editValue.replace(' days', '');
      }

      return (
        <input
          type={type}
          value={inputValue}
          onChange={handleEditChange}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditBlur}
          className='w-full bg-white border border-blue-500 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
          autoFocus
        />
      );
    }

    // Format display value for different field types
    let displayValue = value;
    if (field === 'startDate' || field === 'endDate') {
      try {
        const date = new Date(value);
        displayValue = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (e) {
        displayValue = value;
      }
    }

    return (
      <div
        className='w-full px-1 py-0.5 text-sm cursor-pointer hover:bg-blue-50 hover:border hover:border-blue-200 rounded flex items-center justify-between group'
        onDoubleClick={e => handleEditDoubleClick(task.id, field, value, e)}
        title='Double-click to edit'
      >
        <span className='truncate'>{displayValue}</span>
        <PencilIcon className='w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity' />
      </div>
    );
  };

  return (
    <div className='h-full flex flex-col bg-white'>
      {/* Header */}
      <div className='bg-gray-50 border-b px-4 py-3'>
        <h3 className='text-sm font-semibold text-gray-700'>Task Grid</h3>
        <p className='text-xs text-gray-500 mt-1'>Task list and management</p>
        <p className='text-xs text-blue-600 mt-1'>
          {linkingMode ? (
            <span className='text-purple-600 font-medium'>
              🔗 Linking Mode Active - Click tasks to create dependencies
            </span>
          ) : (
            '💡 Tip: Double-click any field to edit • Shift+Click to select multiple tasks for grouping'
          )}
        </p>
      </div>

      {/* Task Table */}
      <div className='flex-1 overflow-auto'>
        {visibleTasks.length === 0 ? (
          <div className='flex items-center justify-center h-full text-gray-500'>
            <div className='text-center'>
              <div className='text-2xl mb-2'>📋</div>
              <div className='text-sm'>No tasks yet</div>
              <div className='text-xs'>
                Click &quot;Add Task&quot; in the ribbon to create your first
                task
              </div>
            </div>
          </div>
        ) : (
          <div className='min-w-full'>
            {/* Table Header */}
            <div className='bg-gray-50 border-b grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-gray-600'>
              <div className='col-span-3'>Task Name</div>
              <div className='col-span-2'>Start Date</div>
              <div className='col-span-2'>End Date</div>
              <div className='col-span-1'>Duration</div>
              <div className='col-span-1'>Type</div>
              <div className='col-span-2'>Status</div>
              <div className='col-span-1'>Actions</div>
            </div>

            {/* Task Rows */}
            <div className='divide-y divide-gray-200'>
              {visibleTasks.map(task => {
                const indentLevel = task.depth || 0;

                return (
                  <div
                    key={task.id}
                    className={`grid grid-cols-12 gap-2 px-3 py-2 text-sm cursor-pointer transition-colors duration-150 ${getRowHighlightClass(task.id)}`}
                    onClick={e => handleRowClick(task.id, e)}
                  >
                    {/* Task Name with Indentation and Group Controls */}
                    <div className='col-span-3 flex items-center'>
                      {/* Indentation */}
                      <div
                        className='flex-shrink-0'
                        style={{ width: `${indentLevel * 20}px` }}
                      />

                      {/* Group Toggle Button */}
                      {task.isGroup && (
                        <button
                          onClick={e => handleGroupToggle(task.id, e)}
                          className='flex-shrink-0 w-4 h-4 mr-1 text-gray-500 hover:text-gray-700 transition-colors'
                        >
                          {task.isExpanded ? (
                            <ChevronDownIcon className='w-4 h-4' />
                          ) : (
                            <ChevronRightIcon className='w-4 h-4' />
                          )}
                        </button>
                      )}

                      {/* Group Icon */}
                      {task.isGroup && (
                        <FolderIcon className='w-4 h-4 mr-1 text-blue-500 flex-shrink-0' />
                      )}

                      {/* Task Name Input */}
                      <div className='flex-1'>
                        {renderEditableField(task, 'name', task.name)}
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className='col-span-2'>
                      {renderEditableField(
                        task,
                        'startDate',
                        task.startDate,
                        'date'
                      )}
                    </div>

                    {/* End Date */}
                    <div className='col-span-2'>
                      {renderEditableField(
                        task,
                        'endDate',
                        task.endDate,
                        'date'
                      )}
                    </div>

                    {/* Duration */}
                    <div className='col-span-1'>
                      {renderEditableField(
                        task,
                        'duration',
                        `${task.duration} days`,
                        'number'
                      )}
                    </div>

                    {/* Type */}
                    <div className='col-span-1'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          task.isMilestone
                            ? 'bg-purple-100 text-purple-800'
                            : task.isGroup
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {task.isMilestone
                          ? 'Milestone'
                          : task.isGroup
                            ? 'Group'
                            : 'Task'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className='col-span-2'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className='col-span-1'>
                      <button
                        onClick={e => handleDeleteTask(task.id, e)}
                        className='text-red-600 hover:text-red-800 text-xs font-medium'
                        title='Delete task'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='bg-gray-50 border-t px-4 py-2'>
        <div className='text-xs text-gray-500'>
          {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''} •{' '}
          {getSelectionStatus()}
        </div>
      </div>
    </div>
  );
};

export default TaskGrid;
