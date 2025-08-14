 
import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const TaskModal = ({ task, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    duration: '',
    notes: '',
    color: '#3B82F6',
    type: 'task',
    isMilestone: false,
    status: 'Planned',
    priority: 'Medium',
    assignee: '',
    progress: 0,
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        startDate: task.startDate
          ? new Date(task.startDate).toISOString().split('T')[0]
          : '',
        endDate: task.endDate
          ? new Date(task.endDate).toISOString().split('T')[0]
          : '',
        duration: task.duration || '',
        notes: task.notes || '',
        color: task.color || '#3B82F6',
        type: task.type || 'task',
        isMilestone: task.isMilestone || false,
        status: task.status || 'Planned',
        priority: task.priority || 'Medium',
        assignee: task.assignee || '',
        progress: task.progress || 0,
      });
    }
  }, [task]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate duration when dates change
    if (
      (field === 'startDate' || field === 'endDate') &&
      formData.startDate &&
      formData.endDate
    ) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({
        ...prev,
        [field]: value,
        duration: diffDays.toString(),
      }));
    }

    // Auto-calculate end date when duration changes
    if (field === 'duration' && formData.startDate) {
      const start = new Date(formData.startDate);
      const duration = parseInt(value) || 0;
      const end = new Date(start);
      end.setDate(start.getDate() + duration - 1);
      setFormData(prev => ({
        ...prev,
        [field]: value,
        endDate: end.toISOString().split('T')[0],
      }));
    }
  };

  const handleSave = () => {
    const updatedTask = {
      ...task,
      ...formData,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : null,
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : null,
      duration: parseInt(formData.duration) || 1,
      progress: parseInt(formData.progress) || 0,
    };

    console.log('Saving task:', updatedTask);
    onSave(updatedTask);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-[500px] w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <DocumentTextIcon className='w-6 h-6 text-blue-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Task Properties
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            title='Close modal'
          >
            <XMarkIcon className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Body */}
        <div className='p-6 space-y-4 max-h-[60vh] overflow-y-auto'>
          {/* Task Name */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Task Name *
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter task name'
              title='Enter the name of the task'
            />
          </div>

          {/* Date Range */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <CalendarIcon className='w-4 h-4 inline mr-1' />
                Start Date
              </label>
              <input
                type='date'
                value={formData.startDate}
                onChange={e => handleInputChange('startDate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                title='Set the start date for this task'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <CalendarIcon className='w-4 h-4 inline mr-1' />
                End Date
              </label>
              <input
                type='date'
                value={formData.endDate}
                onChange={e => handleInputChange('endDate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                title='Set the end date for this task'
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <ClockIcon className='w-4 h-4 inline mr-1' />
              Duration (days)
            </label>
            <input
              type='number'
              value={formData.duration}
              onChange={e => handleInputChange('duration', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              min='1'
              title='Set task duration in working days'
            />
          </div>

          {/* Status and Priority */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                title='Set the current status of the task'
              >
                <option value='Planned'>Planned</option>
                <option value='In Progress'>In Progress</option>
                <option value='Completed'>Completed</option>
                <option value='On Hold'>On Hold</option>
                <option value='Cancelled'>Cancelled</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                title='Set the priority level of the task'
              >
                <option value='Low'>Low</option>
                <option value='Medium'>Medium</option>
                <option value='High'>High</option>
                <option value='Critical'>Critical</option>
              </select>
            </div>
          </div>

          {/* Assignee and Progress */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Assignee
              </label>
              <input
                type='text'
                value={formData.assignee}
                onChange={e => handleInputChange('assignee', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Enter assignee name'
                title='Assign this task to a team member'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Progress (%)
              </label>
              <input
                type='number'
                value={formData.progress}
                onChange={e => handleInputChange('progress', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                min='0'
                max='100'
                title='Set the completion percentage (0-100)'
              />
            </div>
          </div>

          {/* Color and Milestone */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <PaintBrushIcon className='w-4 h-4 inline mr-1' />
                Color
              </label>
              <div className='flex items-center gap-2'>
                <input
                  type='color'
                  value={formData.color}
                  onChange={e => handleInputChange('color', e.target.value)}
                  className='w-12 h-10 border border-gray-300 rounded-lg cursor-pointer'
                  title='Choose a color for the task'
                />
                <span className='text-sm text-gray-500'>Task color</span>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <StarIcon className='w-4 h-4 inline mr-1' />
                Milestone
              </label>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  checked={
                    formData.type === 'milestone' || formData.isMilestone
                  }
                  onChange={e => {
                    const isMilestone = e.target.checked;
                    handleInputChange(
                      'type',
                      isMilestone ? 'milestone' : 'task'
                    );
                    handleInputChange('isMilestone', isMilestone);
                  }}
                  className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                  title='Mark this task as a milestone'
                />
                <span className='ml-2 text-sm text-gray-700'>
                  Mark as milestone
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <DocumentTextIcon className='w-4 h-4 inline mr-1' />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              rows='3'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
              placeholder='Add notes or description for this task...'
              title='Add additional notes or description for the task'
            />
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
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
