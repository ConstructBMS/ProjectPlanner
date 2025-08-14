import React, { useState, useEffect } from 'react';
import { usePlannerStore } from '../../../state/plannerStore';
import { useToast } from '../../common/Toast';
import {
  XMarkIcon,
  LinkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const LinkEditor = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' or 'edit'
  linkId = null, // For edit mode
  predecessorId = null, // For create mode
  successorId = null, // For create mode
  initialType = 'FS',
  initialLag = 0
}) => {
  const { createTaskLink, updateTaskLink, createChainLinks, selectedTaskIds, getSelectedTasks } = usePlannerStore();
  const { showSuccess, showError } = useToast();
  
  const [linkType, setLinkType] = useState(initialType);
  const [lagDays, setLagDays] = useState(initialLag);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLinkType(initialType);
      setLagDays(initialLag);
      setIsSubmitting(false);
    }
  }, [isOpen, initialType, initialLag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let success = false;
      let message = '';

      if (mode === 'create') {
        if (selectedTaskIds.size >= 2) {
          // Multi-select: create chain links
          const taskIds = Array.from(selectedTaskIds);
          success = await createChainLinks(taskIds, linkType, lagDays);
          message = success 
            ? `Created ${taskIds.length - 1} chain links successfully` 
            : 'Failed to create chain links';
        } else if (predecessorId && successorId) {
          // Single link creation
          success = await createTaskLink(predecessorId, successorId, linkType, lagDays);
          message = success 
            ? 'Link created successfully' 
            : 'Failed to create link';
        } else {
          showError('Invalid Selection', 'Please select at least 2 tasks or provide predecessor and successor');
          setIsSubmitting(false);
          return;
        }
      } else if (mode === 'edit' && linkId) {
        // Edit existing link
        success = await updateTaskLink(linkId, linkType, lagDays);
        message = success 
          ? 'Link updated successfully' 
          : 'Failed to update link';
      }

      if (success) {
        showSuccess('Success', message);
        onClose();
      } else {
        showError('Error', message);
      }
    } catch (error) {
      console.error('Error in link operation:', error);
      showError('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const getSelectedTasksInfo = () => {
    const selectedTasks = getSelectedTasks();
    if (selectedTasks.length >= 2) {
      return `Creating chain links for ${selectedTasks.length} selected tasks`;
    }
    return null;
  };

  const getSingleLinkInfo = () => {
    if (predecessorId && successorId) {
      const selectedTasks = getSelectedTasks();
      const predTask = selectedTasks.find(t => t.id === predecessorId);
      const succTask = selectedTasks.find(t => t.id === successorId);
      return `Creating link from "${predTask?.name || predecessorId}" to "${succTask?.name || successorId}"`;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Create Link' : 'Edit Link'}
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Link Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
            {getSelectedTasksInfo() || getSingleLinkInfo() || 'Select tasks to create links'}
          </div>

          {/* Link Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Link Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'FS', label: 'Finish-Start', description: 'Successor starts after predecessor finishes' },
                { value: 'SS', label: 'Start-Start', description: 'Successor starts after predecessor starts' },
                { value: 'FF', label: 'Finish-Finish', description: 'Successor finishes after predecessor finishes' },
                { value: 'SF', label: 'Start-Finish', description: 'Successor finishes after predecessor starts' }
              ].map((type) => (
                <label
                  key={type.value}
                  className={`relative flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                    linkType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="linkType"
                    value={type.value}
                    checked={linkType === type.value}
                    onChange={(e) => setLinkType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      linkType === type.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {linkType === type.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                    {type.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Lag Days */}
          <div>
            <label htmlFor="lagDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lag/Lead Days
            </label>
            <div className="relative">
              <input
                type="number"
                id="lagDays"
                value={lagDays}
                onChange={(e) => setLagDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
                min="-365"
                max="365"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">days</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Positive = lag (delay), Negative = lead (overlap)
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                {mode === 'create' ? 'Create Link' : 'Update Link'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkEditor;
