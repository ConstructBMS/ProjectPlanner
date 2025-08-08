import { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import {
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

// Task Properties Pane Component
const TaskPropertiesPane = () => {
  const { selectedTaskId, tasks, updateTask, taskLinks } = useTaskContext();
  const [editingTask, setEditingTask] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Get the currently selected task
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  // Initialize editing task when selection changes
  useEffect(() => {
    if (selectedTask) {
      setEditingTask({ ...selectedTask });
      setHasChanges(false);
    } else {
      setEditingTask(null);
      setHasChanges(false);
    }
  }, [selectedTask]);

  const handleFieldChange = (field, value) => {
    if (!editingTask) return;

    const updatedTask = { ...editingTask, [field]: value };
    setEditingTask(updatedTask);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!editingTask || !hasChanges) return;

    updateTask(editingTask.id, editingTask);
    setHasChanges(false);
    console.log('Task properties saved:', editingTask);
  };

  const handleCancel = () => {
    if (selectedTask) {
      setEditingTask({ ...selectedTask });
      setHasChanges(false);
    }
  };

  // Get task predecessors and successors
  const predecessors = taskLinks
    .filter(link => link.toId === selectedTaskId)
    .map(link => tasks.find(task => task.id === link.fromId))
    .filter(Boolean);

  const successors = taskLinks
    .filter(link => link.fromId === selectedTaskId)
    .map(link => tasks.find(task => task.id === link.toId))
    .filter(Boolean);

  if (!selectedTask || !editingTask) {
    return (
      <div className='bg-gray-50 border-t border-gray-200 shadow-inner flex flex-col overflow-hidden h-full'>
        <div className='px-4 py-3 border-b border-gray-200 bg-white'>
          <h3 className='text-sm font-semibold text-gray-700'>
            Task Properties
          </h3>
          <p className='text-xs text-gray-500 mt-1'>
            Select a task to view properties
          </p>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <PencilIcon className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <div className='text-sm font-medium text-gray-500 mb-1'>
              No Task Selected
            </div>
            <div className='text-xs text-gray-400'>
              Select a task to edit its properties
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 border-t border-gray-200 shadow-inner flex flex-col overflow-hidden h-full'>
      {/* Header with Save/Cancel buttons */}
      <div className='px-4 py-3 border-b border-gray-200 bg-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-semibold text-gray-700'>
              Task Properties
            </h3>
            <p className='text-xs text-gray-500 mt-1'>
              Editing: {editingTask.name}
            </p>
          </div>
          {hasChanges && (
            <div className='flex gap-2'>
              <button
                onClick={handleCancel}
                className='px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors'
              >
                <XMarkIcon className='w-3 h-3 inline mr-1' />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                <CheckIcon className='w-3 h-3 inline mr-1' />
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Properties Content */}
      <div className='flex-1 overflow-auto p-4 space-y-4'>
        {/* Task Information Section */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <DocumentTextIcon className='w-4 h-4 text-blue-600' />
            <h4 className='text-sm font-semibold text-gray-700'>
              Task Information
            </h4>
          </div>

          <div className='space-y-3'>
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Task Name
              </label>
              <input
                type='text'
                value={editingTask.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Enter task name'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Description
              </label>
              <textarea
                value={editingTask.description || ''}
                onChange={e => handleFieldChange('description', e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                rows={3}
                placeholder='Enter task description'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Notes
              </label>
              <textarea
                value={editingTask.notes || ''}
                onChange={e => handleFieldChange('notes', e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                rows={2}
                placeholder='Additional notes'
              />
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <CalendarIcon className='w-4 h-4 text-green-600' />
            <h4 className='text-sm font-semibold text-gray-700'>Schedule</h4>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Start Date
              </label>
              <input
                type='date'
                value={
                  editingTask.startDate
                    ? new Date(editingTask.startDate)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                onChange={e =>
                  handleFieldChange(
                    'startDate',
                    new Date(e.target.value).toISOString()
                  )
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                End Date
              </label>
              <input
                type='date'
                value={
                  editingTask.endDate
                    ? new Date(editingTask.endDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={e =>
                  handleFieldChange(
                    'endDate',
                    new Date(e.target.value).toISOString()
                  )
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Duration (days)
              </label>
              <input
                type='number'
                value={editingTask.duration || 0}
                onChange={e =>
                  handleFieldChange('duration', parseInt(e.target.value) || 0)
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                min='0'
              />
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                % Complete
              </label>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  value={editingTask.progress || 0}
                  onChange={e =>
                    handleFieldChange(
                      'progress',
                      Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                  className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  min='0'
                  max='100'
                />
                <span className='text-xs text-gray-500'>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Priority Section */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <FlagIcon className='w-4 h-4 text-orange-600' />
            <h4 className='text-sm font-semibold text-gray-700'>
              Status & Priority
            </h4>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Status
              </label>
              <select
                value={editingTask.status || 'Planned'}
                onChange={e => handleFieldChange('status', e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='Planned'>Planned</option>
                <option value='In Progress'>In Progress</option>
                <option value='Complete'>Complete</option>
                <option value='Delayed'>Delayed</option>
                <option value='On Hold'>On Hold</option>
                <option value='Cancelled'>Cancelled</option>
              </select>
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Priority
              </label>
              <select
                value={editingTask.priority || 'Medium'}
                onChange={e => handleFieldChange('priority', e.target.value)}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='Low'>Low</option>
                <option value='Medium'>Medium</option>
                <option value='High'>High</option>
                <option value='Critical'>Critical</option>
              </select>
            </div>

            <div className='col-span-2'>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Task Type
              </label>
              <select
                value={editingTask.isMilestone ? 'Milestone' : 'Task'}
                onChange={e =>
                  handleFieldChange(
                    'isMilestone',
                    e.target.value === 'Milestone'
                  )
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='Task'>Task</option>
                <option value='Milestone'>Milestone</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Assignment Section */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <UserIcon className='w-4 h-4 text-purple-600' />
            <h4 className='text-sm font-semibold text-gray-700'>
              Resource Assignment
            </h4>
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Assignee
            </label>
            <input
              type='text'
              value={editingTask.assignee || ''}
              onChange={e => handleFieldChange('assignee', e.target.value)}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter assignee name'
            />
          </div>
        </div>

        {/* Dependencies Section */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <LinkIcon className='w-4 h-4 text-indigo-600' />
            <h4 className='text-sm font-semibold text-gray-700'>
              Dependencies
            </h4>
          </div>

          <div className='space-y-3'>
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-2'>
                Predecessors
              </label>
              {predecessors.length > 0 ? (
                <div className='space-y-1'>
                  {predecessors.map(task => (
                    <div
                      key={task.id}
                      className='text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded'
                    >
                      {task.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-xs text-gray-400 italic'>
                  No predecessors
                </div>
              )}
            </div>

            <div>
              <label className='block text-xs font-medium text-gray-600 mb-2'>
                Successors
              </label>
              {successors.length > 0 ? (
                <div className='space-y-1'>
                  {successors.map(task => (
                    <div
                      key={task.id}
                      className='text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded'
                    >
                      {task.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-xs text-gray-400 italic'>
                  No successors
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        {hasChanges && (
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
            <div className='flex items-center gap-2'>
              <ExclamationTriangleIcon className='w-4 h-4 text-amber-600' />
              <span className='text-xs font-medium text-amber-800'>
                You have unsaved changes
              </span>
            </div>
            <div className='text-xs text-amber-700 mt-1'>
              Click Save to apply changes or Cancel to discard them.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPropertiesPane;
