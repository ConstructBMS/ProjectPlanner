import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  splitTask,
  mergeTaskSegments,
  validateSegments,
  getSegmentSummary,
} from '../../utils/taskSegmentUtils';

const TaskSplitModal = ({ isOpen, onClose, task, onSplitTask }) => {
  const [segments, setSegments] = useState([]);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
  const [summary, setSummary] = useState(null);

  // Initialize segments when modal opens
  useEffect(() => {
    if (isOpen && task) {
      if (task.segments && task.segments.length > 0) {
        setSegments(task.segments);
      } else {
        // Create initial segment from task
        setSegments([{
          id: 'initial',
          startDate: task.startDate,
          endDate: task.endDate,
          duration: task.duration || 1,
          progress: task.progress || 0,
          isActive: true,
        }]);
      }
    }
  }, [isOpen, task]);

  // Update validation and summary when segments change
  useEffect(() => {
    if (segments.length > 0) {
      const validationResult = validateSegments(segments);
      setValidation(validationResult);
      
      const summaryData = getSegmentSummary({ ...task, segments });
      setSummary(summaryData);
    }
  }, [segments, task]);

  const handleAddSegment = () => {
    const newSegment = {
      id: `segment_${Date.now()}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: 7,
      progress: 0,
      isActive: true,
    };
    setSegments([...segments, newSegment]);
  };

  const handleRemoveSegment = (segmentId) => {
    setSegments(segments.filter(segment => segment.id !== segmentId));
  };

  const handleSegmentChange = (segmentId, field, value) => {
    setSegments(segments.map(segment => {
      if (segment.id === segmentId) {
        const updatedSegment = { ...segment, [field]: value };
        
        // Auto-calculate duration if dates change
        if (field === 'startDate' || field === 'endDate') {
          const startDate = new Date(updatedSegment.startDate);
          const endDate = new Date(updatedSegment.endDate);
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          updatedSegment.duration = Math.max(1, duration);
        }
        
        return updatedSegment;
      }
      return segment;
    }));
  };

  const handleSplitTask = () => {
    if (!validation.isValid) return;
    
    const segmentRanges = segments.map(segment => ({
      startDate: segment.startDate,
      endDate: segment.endDate,
      duration: segment.duration,
    }));
    
    const splitTaskData = splitTask(task, segmentRanges);
    onSplitTask(splitTaskData);
    onClose();
  };

  const handleMergeTask = () => {
    const mergedTask = mergeTaskSegments(task);
    onSplitTask(mergedTask);
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Split Task: {task.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Break this task into multiple segments with gaps
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Summary */}
          {summary && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900">Segments:</span>
                  <span className="ml-2 text-blue-700">{summary.segmentCount}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Total Duration:</span>
                  <span className="ml-2 text-blue-700">{summary.totalDuration} days</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Total Progress:</span>
                  <span className="ml-2 text-blue-700">{summary.totalProgress.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Gaps:</span>
                  <span className="ml-2 text-blue-700">{summary.gapCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {!validation.isValid && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Validation Errors</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Validation Warnings */}
          {validation.warnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Warnings</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Segments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Task Segments</h3>
              <button
                onClick={handleAddSegment}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add Segment
              </button>
            </div>

            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Segment {index + 1}
                  </h4>
                  {segments.length > 1 && (
                    <button
                      onClick={() => handleRemoveSegment(segment.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Remove segment"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={segment.startDate}
                      onChange={(e) => handleSegmentChange(segment.id, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={segment.endDate}
                      onChange={(e) => handleSegmentChange(segment.id, 'endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={segment.duration}
                      onChange={(e) => handleSegmentChange(segment.id, 'duration', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={segment.progress || 0}
                      onChange={(e) => handleSegmentChange(segment.id, 'progress', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {task.isSplit && (
              <button
                onClick={handleMergeTask}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Merge Segments
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSplitTask}
              disabled={!validation.isValid}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {task.isSplit ? 'Update Segments' : 'Split Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSplitModal;
