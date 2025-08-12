import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  XMarkIcon,
  LinkIcon,
  ClockIcon,
  ArrowRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const TaskLinkModal = ({ isOpen, onClose, fromTaskId, toTaskId }) => {
  const { tasks, taskLinks, linkTasks, updateLink, deleteLinkById } =
    useTaskContext();
  const [linkType, setLinkType] = useState('FS');
  const [lag, setLag] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingLinkId, setExistingLinkId] = useState(null);
  const [selectedFromTaskId, setSelectedFromTaskId] = useState(fromTaskId);
  const [selectedToTaskId, setSelectedToTaskId] = useState(toTaskId);

  const fromTask = tasks.find(t => t.id === selectedFromTaskId);
  const toTask = tasks.find(t => t.id === selectedToTaskId);

  // Initialize task selection and reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFromTaskId(fromTaskId);
      setSelectedToTaskId(toTaskId);
    }
  }, [isOpen, fromTaskId, toTaskId]);

  // Check if link already exists
  useEffect(() => {
    if (selectedFromTaskId && selectedToTaskId) {
      const existingLink = taskLinks.find(
        link =>
          link.fromId === selectedFromTaskId && link.toId === selectedToTaskId
      );

      if (existingLink) {
        setIsEditMode(true);
        setExistingLinkId(existingLink.id);
        setLinkType(existingLink.type);
        setLag(existingLink.lag || 0);
      } else {
        setIsEditMode(false);
        setExistingLinkId(null);
        setLinkType('FS');
        setLag(0);
      }
    }
  }, [selectedFromTaskId, selectedToTaskId, taskLinks]);

  const linkTypes = [
    {
      value: 'FS',
      label: 'Finish-to-Start (FS)',
      description: 'Task B starts when Task A finishes',
    },
    {
      value: 'SS',
      label: 'Start-to-Start (SS)',
      description: 'Task B starts when Task A starts',
    },
    {
      value: 'FF',
      label: 'Finish-to-Finish (FF)',
      description: 'Task B finishes when Task A finishes',
    },
    {
      value: 'SF',
      label: 'Start-to-Finish (SF)',
      description: 'Task B finishes when Task A starts',
    },
  ];

  const handleSave = () => {
    if (!selectedFromTaskId || !selectedToTaskId) return;
    if (selectedFromTaskId === selectedToTaskId) {
      console.error('Cannot link a task to itself');
      return;
    }

    if (isEditMode && existingLinkId) {
      updateLink(existingLinkId, { type: linkType, lag });
    } else {
      linkTasks(selectedFromTaskId, selectedToTaskId, linkType, lag);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingLinkId) {
      deleteLinkById(existingLinkId);
      onClose();
    }
  };

  const formatLagDisplay = days => {
    if (days === 0) return 'No lag';
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} lag`;
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} lead`;
  };

  if (!isOpen || !fromTask || !toTask) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-lg mx-4'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <LinkIcon className='w-6 h-6 text-blue-600' />
            <h2 className='text-lg font-semibold text-gray-900'>
              {isEditMode ? 'Edit Task Link' : 'Create Task Link'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <XMarkIcon className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Task Selection */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                From Task (Predecessor)
              </label>
              <select
                value={selectedFromTaskId || ''}
                onChange={e => setSelectedFromTaskId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select a task...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                To Task (Successor)
              </label>
              <select
                value={selectedToTaskId || ''}
                onChange={e => setSelectedToTaskId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Select a task...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Connection Visual */}
          {fromTask && toTask && (
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='text-sm font-medium text-gray-700'>
                    From Task
                  </div>
                  <div className='text-sm text-gray-600 mt-1 truncate' title={fromTask.name}>
                    {fromTask.name}
                  </div>
                </div>

                <div className='flex items-center px-4'>
                  <ArrowRightIcon className='w-5 h-5 text-blue-500' />
                </div>

                <div className='flex-1'>
                  <div className='text-sm font-medium text-gray-700'>
                    To Task
                  </div>
                  <div className='text-sm text-gray-600 mt-1 truncate' title={toTask.name}>
                    {toTask.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Link Type Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Link Type
            </label>
            <div className='space-y-2'>
              {linkTypes.map(type => (
                <label
                  key={type.value}
                  className='flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer'
                >
                  <input
                    type='radio'
                    name='linkType'
                    value={type.value}
                    checked={linkType === type.value}
                    onChange={e => setLinkType(e.target.value)}
                    className='mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500'
                  />
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-gray-900'>
                      {type.label}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {type.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Lag/Lead Time */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Lag/Lead Time
            </label>
            <div className='flex items-center gap-3'>
              <ClockIcon className='w-5 h-5 text-gray-400' />
              <input
                type='number'
                value={lag}
                onChange={e => setLag(parseInt(e.target.value) || 0)}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Enter days'
              />
              <span className='text-sm text-gray-500'>days</span>
            </div>
            <div className='text-xs text-gray-500 mt-2'>
              Positive values = lag (delay), Negative values = lead (overlap)
            </div>
            <div className='text-xs text-blue-600 mt-1'>
              {formatLagDisplay(lag)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t border-gray-200'>
          <div>
            {isEditMode && (
              <button
                onClick={handleDelete}
                className='flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors'
              >
                <TrashIcon className='w-4 h-4' />
                Delete Link
              </button>
            )}
          </div>

          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                !selectedFromTaskId ||
                !selectedToTaskId ||
                selectedFromTaskId === selectedToTaskId
              }
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
            >
              {isEditMode ? 'Update Link' : 'Create Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskLinkModal;
