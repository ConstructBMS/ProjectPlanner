// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const DependencyLagModal = ({ link, position, onClose, onSave }) => {
  const { tasks, updateLink } = useTaskContext();
  const [lagValue, setLagValue] = useState(link?.lag || 0);
  const [linkType, setLinkType] = useState(link?.type || 'FS');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  // Get task names for display
  const fromTask = tasks.find(t => t.id === link?.fromId);
  const toTask = tasks.find(t => t.id === link?.toId);

  // Link type options
  const linkTypes = [
    {
      value: 'FS',
      label: 'Finish-to-Start',
      description: 'Task B starts after Task A finishes',
    },
    {
      value: 'SS',
      label: 'Start-to-Start',
      description: 'Task B starts after Task A starts',
    },
    {
      value: 'FF',
      label: 'Finish-to-Finish',
      description: 'Task B finishes after Task A finishes',
    },
    {
      value: 'SF',
      label: 'Start-to-Finish',
      description: 'Task B finishes after Task A starts',
    },
  ];

  // Handle save
  const handleSave = async () => {
    if (!link) return;

    try {
      setIsSaving(true);
      setError('');

      // Validate lag value
      const lag = parseInt(lagValue);
      if (isNaN(lag)) {
        setError('Lag value must be a number');
        return;
      }

      // Update the link
      const updates = {
        type: linkType,
        lag,
      };

      updateLink(link.id, updates);

      if (onSave) {
        onSave({ ...link, ...updates });
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update dependency');
      console.error('Error updating dependency:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  // Handle reset
  const handleReset = () => {
    setLagValue(0);
    setLinkType('FS');
    setError('');
  };

  // Handle keyboard events
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Focus input on mount
  useEffect(() => {
    const input = modalRef.current?.querySelector('input[type="number"]');
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  if (!link || !fromTask || !toTask) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      className='fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]'
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px',
      }}
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Edit Dependency</h3>
        <button
          onClick={handleCancel}
          className='text-gray-400 hover:text-gray-600 transition-colors'
        >
          <XMarkIcon className='w-5 h-5' />
        </button>
      </div>

      {/* Task Information */}
      <div className='mb-4 p-3 bg-gray-50 rounded-md'>
        <div className='text-sm text-gray-600 mb-2'>Dependency Link:</div>
        <div className='text-sm font-medium'>
          <span className='text-blue-600'>{fromTask.name}</span>
          <span className='mx-2 text-gray-400'>→</span>
          <span className='text-green-600'>{toTask.name}</span>
        </div>
      </div>

      {/* Link Type Selection */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Link Type
        </label>
        <select
          value={linkType}
          onChange={e => setLinkType(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          {linkTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <div className='mt-1 text-xs text-gray-500'>
          {linkTypes.find(t => t.value === linkType)?.description}
        </div>
      </div>

      {/* Lag/Lead Input */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Lag/Lead Time (days)
        </label>
        <div className='relative'>
          <input
            type='number'
            value={lagValue}
            onChange={e => setLagValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='0'
            min='-365'
            max='365'
          />
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400'>
            {lagValue > 0 ? 'lag' : lagValue < 0 ? 'lead' : 'none'}
          </div>
        </div>
        <div className='mt-1 text-xs text-gray-500'>
          Positive values = lag (delay), Negative values = lead (overlap)
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className='mb-4 p-2 bg-red-50 border border-red-200 rounded-md'>
          <div className='text-sm text-red-600'>{error}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex items-center justify-between'>
        <div className='flex space-x-2'>
          <button
            onClick={handleReset}
            className='inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          >
            <ArrowPathIcon className='w-4 h-4 mr-1' />
            Reset
          </button>
        </div>

        <div className='flex space-x-2'>
          <button
            onClick={handleCancel}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className='mt-3 text-xs text-gray-400 text-center'>
        Press Enter to save, Escape to cancel
      </div>
    </div>
  );
};

export default DependencyLagModal;
