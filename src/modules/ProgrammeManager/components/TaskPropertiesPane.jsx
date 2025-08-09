import { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import DeleteTaskModal from './modals/DeleteTaskModal';
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
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

// Task Properties Pane Component
const TaskPropertiesPane = () => {
  const {
    selectedTaskId,
    tasks,
    updateTask,
    taskLinks,
    linkTasks,
    unlinkTasks,
    updateLink,
  } = useTaskContext();
  const [editingTask, setEditingTask] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddDependencyModal, setShowAddDependencyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalSelectedTaskId, setModalSelectedTaskId] = useState('');
  const [modalLinkType, setModalLinkType] = useState('FS');
  const [modalLag, setModalLag] = useState(0);

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

  // Get task predecessors and successors with link information
  const predecessors = taskLinks
    .filter(link => link.toId === selectedTaskId)
    .map(link => {
      const task = tasks.find(task => task.id === link.fromId);
      return task
        ? { ...task, linkId: link.id, lag: link.lag || 0, linkType: link.type }
        : null;
    })
    .filter(Boolean);

  const successors = taskLinks
    .filter(link => link.fromId === selectedTaskId)
    .map(link => {
      const task = tasks.find(task => task.id === link.toId);
      return task
        ? { ...task, linkId: link.id, lag: link.lag || 0, linkType: link.type }
        : null;
    })
    .filter(Boolean);

  const handleRemoveDependency = linkId => {
    if (linkId) {
      const link = taskLinks.find(l => l.id === linkId);
      if (link) {
        unlinkTasks(link.fromId, link.toId);
        console.log('Removed dependency:', link);
      }
    }
  };

  const handleUpdateLag = (linkId, newLag) => {
    if (linkId) {
      const lag = parseInt(newLag) || 0;
      updateLink(linkId, { lag });
      console.log('Updated lag for link:', linkId, 'to:', lag);
    }
  };

  const handleAddDependency = () => {
    if (!modalSelectedTaskId || !selectedTaskId) return;

    // Validate that we're not creating a self-link
    if (modalSelectedTaskId === selectedTaskId) {
      console.error('Cannot link a task to itself');
      return;
    }

    // Create the link based on the selected task and current task
    linkTasks(modalSelectedTaskId, selectedTaskId, modalLinkType, modalLag);

    // Reset modal state
    setShowAddDependencyModal(false);
    setModalSelectedTaskId('');
    setModalLinkType('FS');
    setModalLag(0);
  };

  // Get available tasks for linking (exclude current task and already linked tasks)
  const availableTasks = tasks.filter(
    task =>
      task.id !== selectedTaskId &&
      !predecessors.some(p => p.id === task.id) &&
      !successors.some(s => s.id === task.id)
  );

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
    <>
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
          <div className='flex gap-2'>
            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className='px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1'
              title='Delete task'
            >
              <TrashIcon className='w-3 h-3' />
              Delete
            </button>
            {hasChanges && (
              <>
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
              </>
            )}
          </div>
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
                value={
                  editingTask.type === 'milestone' || editingTask.isMilestone
                    ? 'Milestone'
                    : 'Task'
                }
                onChange={e => {
                  const isMilestone = e.target.value === 'Milestone';
                  // Update both the new type field and the legacy isMilestone field
                  handleFieldChange('type', isMilestone ? 'milestone' : 'task');
                  handleFieldChange('isMilestone', isMilestone);
                }}
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
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <LinkIcon className='w-4 h-4 text-indigo-600' />
              <h4 className='text-sm font-semibold text-gray-700'>
                Dependencies
              </h4>
            </div>
            <button
              onClick={() => setShowAddDependencyModal(true)}
              className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1'
            >
              <PlusIcon className='w-3 h-3' />
              Add Dependency
            </button>
          </div>

          <div className='space-y-4'>
            {/* Predecessors */}
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-2'>
                Predecessors ({predecessors.length})
              </label>
              {predecessors.length > 0 ? (
                <div className='space-y-2'>
                  {predecessors.map(task => (
                    <div
                      key={task.id}
                      className='text-xs bg-gray-50 px-3 py-2 rounded border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors'
                    >
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-700 truncate'>
                          {task.name}
                        </div>
                        <div className='text-gray-500 text-xs'>
                          {task.linkType} • {task.lag >= 0 ? `${task.lag} days lag` : `${Math.abs(task.lag)} days lead`}
                        </div>
                      </div>
                      <div className='flex items-center gap-2 ml-2'>
                        <div className='flex items-center gap-1'>
                          <input
                            type='number'
                            value={task.lag}
                            onChange={e =>
                              handleUpdateLag(task.linkId, parseInt(e.target.value) || 0)
                            }
                            className='w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                            title='Lag in days (negative for lead)'
                            min='-365'
                            max='365'
                          />
                          <span className='text-xs text-gray-400'>days</span>
                        </div>
                        <button
                          onClick={() => handleRemoveDependency(task.linkId)}
                          className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors'
                          title='Remove dependency'
                        >
                          <TrashIcon className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded border border-gray-200'>
                  No predecessors
                </div>
              )}
            </div>

            {/* Successors */}
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-2'>
                Successors ({successors.length})
              </label>
              {successors.length > 0 ? (
                <div className='space-y-2'>
                  {successors.map(task => (
                    <div
                      key={task.id}
                      className='text-xs bg-gray-50 px-3 py-2 rounded border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors'
                    >
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-gray-700 truncate'>
                          {task.name}
                        </div>
                        <div className='text-gray-500 text-xs'>
                          {task.linkType} • {task.lag >= 0 ? `${task.lag} days lag` : `${Math.abs(task.lag)} days lead`}
                        </div>
                      </div>
                      <div className='flex items-center gap-2 ml-2'>
                        <div className='flex items-center gap-1'>
                          <input
                            type='number'
                            value={task.lag}
                            onChange={e =>
                              handleUpdateLag(task.linkId, parseInt(e.target.value) || 0)
                            }
                            className='w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                            title='Lag in days (negative for lead)'
                            min='-365'
                            max='365'
                          />
                          <span className='text-xs text-gray-400'>days</span>
                        </div>
                        <button
                          onClick={() => handleRemoveDependency(task.linkId)}
                          className='text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors'
                          title='Remove dependency'
                        >
                          <TrashIcon className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded border border-gray-200'>
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

      {/* Add Dependency Modal */}
      {showAddDependencyModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-96 max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Add Dependency</h3>
              <button
                onClick={() => setShowAddDependencyModal(false)}
                className='text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100'
              >
                <XMarkIcon className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Select Task
                </label>
                <select
                  value={modalSelectedTaskId}
                  onChange={e => setModalSelectedTaskId(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Choose a task...</option>
                  {availableTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.name} ({task.startDate ? new Date(task.startDate).toLocaleDateString() : 'No date'})
                    </option>
                  ))}
                </select>
                {availableTasks.length === 0 && (
                  <p className='text-xs text-gray-500 mt-1'>
                    No available tasks to link. All tasks are already linked or this is the only task.
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Link Type
                </label>
                <select
                  value={modalLinkType}
                  onChange={e => setModalLinkType(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='FS'>Finish-to-Start (FS) - Task B starts when Task A finishes</option>
                  <option value='SS'>Start-to-Start (SS) - Task B starts when Task A starts</option>
                  <option value='FF'>Finish-to-Finish (FF) - Task B finishes when Task A finishes</option>
                  <option value='SF'>Start-to-Finish (SF) - Task B finishes when Task A starts</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Lag/Lead (days)
                </label>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    value={modalLag}
                    onChange={e => setModalLag(parseInt(e.target.value) || 0)}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='0'
                    min='-365'
                    max='365'
                  />
                  <span className='text-sm text-gray-500'>
                    {modalLag >= 0 ? 'lag' : 'lead'}
                  </span>
                </div>
                <p className='text-xs text-gray-500 mt-1'>
                  Positive values = lag (delay), Negative values = lead (advance)
                </p>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <button
                onClick={() => setShowAddDependencyModal(false)}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddDependency}
                disabled={!modalSelectedTaskId}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                Add Dependency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Delete Task Modal */}
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        taskId={selectedTaskId}
      />
    </>
  );
};

export default TaskPropertiesPane;
