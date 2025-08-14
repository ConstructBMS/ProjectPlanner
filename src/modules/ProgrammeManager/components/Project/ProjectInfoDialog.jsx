 
import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

const ProjectInfoDialog = ({ isOpen, onClose, projectId, initialInfo = {} }) => {
  const [info, setInfo] = useState({
    name: '',
    code: '',
    startDate: '',
    finishDate: '',
    autoFinish: false,
    calendar: 'standard',
    ...initialInfo
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load project info from storage
  const loadProjectInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Import projectStore dynamically to avoid circular dependencies
      const { projectStore } = await import('../../utils/projectStore');
      const savedInfo = await projectStore.getInfo(projectId);
      
      if (savedInfo) {
        setInfo(prev => ({
          ...prev,
          ...savedInfo
        }));
      }
    } catch (err) {
      console.error('Error loading project info:', err);
      setError('Failed to load project information');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Load project info on mount or when projectId changes
  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectInfo();
    }
  }, [isOpen, projectId, loadProjectInfo]);

  // Save project info
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate required fields
      if (!info.name.trim()) {
        setError('Project name is required');
        return;
      }

      if (!info.startDate) {
        setError('Start date is required');
        return;
      }

      // Import projectStore dynamically
      const { projectStore } = await import('../../utils/projectStore');
      await projectStore.setInfo(projectId, info);

      // Emit event for other components to re-read bounds
      window.dispatchEvent(new window.CustomEvent('PROJECT_INFO_UPDATED', {
        detail: { projectId, info }
      }));

      onClose();
    } catch (err) {
      console.error('Error saving project info:', err);
      setError('Failed to save project information');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle auto finish checkbox
  const handleAutoFinishChange = (checked) => {
    setInfo(prev => ({
      ...prev,
      autoFinish: checked,
      finishDate: checked ? '' : prev.finishDate
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => setInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
              disabled={isLoading}
            />
          </div>

          {/* Project Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Code
            </label>
            <input
              type="text"
              value={info.code}
              onChange={(e) => setInfo(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project code"
              disabled={isLoading}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={info.startDate}
                onChange={(e) => setInfo(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Finish Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Finish Date
              </label>
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={info.autoFinish}
                  onChange={(e) => handleAutoFinishChange(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                Auto
              </label>
            </div>
            <div className="relative">
              <input
                type="date"
                value={info.finishDate}
                onChange={(e) => setInfo(prev => ({ ...prev, finishDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Auto-calculated"
                disabled={info.autoFinish || isLoading}
              />
              <CalendarIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Calendar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calendar
            </label>
            <select
              value={info.calendar}
              onChange={(e) => setInfo(prev => ({ ...prev, calendar: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="standard">Standard (Mon–Fri)</option>
              <option value="24x7">24×7</option>
              <option value="custom">Custom...</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoDialog;
