 
import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const DeleteTaskModal = ({ isOpen, onClose, taskId }) => {
  const { tasks, taskLinks, deleteTaskWithCascade } = useTaskContext();
  const [cascade, setCascade] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  // Get dependent tasks (tasks that depend on this task)
  const dependentTasks = taskLinks
    .filter(link => link.fromId === taskId)
    .map(link => {
      const dependentTask = tasks.find(t => t.id === link.toId);
      return dependentTask ? { ...dependentTask, linkId: link.id } : null;
    })
    .filter(Boolean);

  // Get descendant tasks (child tasks)
  const descendantTasks = task?.parentId
    ? []
    : tasks.filter(t => {
        const isDescendant = parentId => {
          if (t.parentId === parentId) return true;
          const parent = tasks.find(task => task.id === t.parentId);
          return parent ? isDescendant(parent.id) : false;
        };
        return isDescendant(taskId);
      });

  const totalTasksToDelete =
    1 + (cascade ? dependentTasks.length : 0) + descendantTasks.length;

  const handleDelete = () => {
    if (taskId) {
      deleteTaskWithCascade(taskId, cascade);
      onClose();
    }
  };

  const handleCancel = () => {
    setCascade(false);
    onClose();
  };

  // Reset cascade state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCascade(false);
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-red-100 rounded-lg'>
              <TrashIcon className='w-6 h-6 text-red-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900'>Delete Task</h2>
          </div>
          <button
            onClick={handleCancel}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            title='Close modal'
          >
            <XMarkIcon className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Body */}
        <div className='p-6 space-y-4'>
          {/* Warning */}
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <ExclamationTriangleIcon className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='text-sm font-medium text-red-800'>
                  Are you sure you want to delete this task?
                </h3>
                <p className='text-sm text-red-700 mt-1'>
                  This action cannot be undone. The task "{task.name}" will be
                  permanently removed.
                </p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <h4 className='font-medium text-gray-900 mb-2'>Task Details</h4>
            <div className='space-y-1 text-sm text-gray-600'>
              <div>
                <span className='font-medium'>Name:</span> {task.name}
              </div>
              <div>
                <span className='font-medium'>Type:</span>{' '}
                {task.type === 'milestone' ? 'Milestone' : 'Task'}
              </div>
              <div>
                <span className='font-medium'>Status:</span> {task.status}
              </div>
              {task.assignee && (
                <div>
                  <span className='font-medium'>Assignee:</span> {task.assignee}
                </div>
              )}
            </div>
          </div>

          {/* Impact Analysis */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900'>Impact Analysis</h4>

            {/* Descendants */}
            {descendantTasks.length > 0 && (
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
                <div className='flex items-start gap-2'>
                  <InformationCircleIcon className='w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm font-medium text-amber-800'>
                      {descendantTasks.length} descendant task
                      {descendantTasks.length !== 1 ? 's' : ''} will be deleted
                    </p>
                    <p className='text-xs text-amber-700 mt-1'>
                      These are child tasks that will be automatically removed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dependents */}
            {dependentTasks.length > 0 && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                <div className='flex items-start gap-2'>
                  <InformationCircleIcon className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm font-medium text-blue-800'>
                      {dependentTasks.length} dependent task
                      {dependentTasks.length !== 1 ? 's' : ''} found
                    </p>
                    <p className='text-xs text-blue-700 mt-1'>
                      These tasks depend on the task you're deleting.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cascade Option */}
          {dependentTasks.length > 0 && (
            <div className='space-y-2'>
              <label className='flex items-start gap-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={cascade}
                  onChange={e => setCascade(e.target.checked)}
                  className='mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <div>
                  <span className='text-sm font-medium text-gray-900'>
                    Also delete dependent tasks?
                  </span>
                  <p className='text-xs text-gray-500 mt-1'>
                    If checked, {dependentTasks.length} dependent task
                    {dependentTasks.length !== 1 ? 's' : ''} will also be
                    deleted.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Summary */}
          <div className='bg-gray-50 rounded-lg p-3'>
            <p className='text-sm text-gray-600'>
              <span className='font-medium'>Total tasks to delete:</span>{' '}
              {totalTasksToDelete}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={handleCancel}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className='px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors'
          >
            Delete{' '}
            {totalTasksToDelete > 1 ? `${totalTasksToDelete} Tasks` : 'Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskModal;
