 
import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,

} from '@heroicons/react/24/outline';
import {
  createBaseline,
  validateBaseline,
  compareWithBaseline,
  getBaselineStatistics,
  getBaselineComparisonSummary,
  formatBaselineChanges,
  exportBaseline,
  importBaseline,
  generateBaselineNameSuggestions,
  calculateBaselinePerformance,
} from '../utils/baselineManagerUtils';

const BaselineManagerDialog = ({
  isOpen,
  onClose,
  tasks,
  baselines = [],
  activeBaselineId,
  onSaveBaseline,
  onDeleteBaseline,
  onSetActiveBaseline,
  onImportBaseline,
}) => {
  const [newBaseline, setNewBaseline] = useState({ name: '', description: '' });
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [selectedBaseline, setSelectedBaseline] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  // Generate name suggestions
  const nameSuggestions = generateBaselineNameSuggestions(baselines);

  // Validate new baseline when it changes
  useEffect(() => {
    if (newBaseline.name) {
      const tempBaseline = createBaseline(
        tasks,
        newBaseline.name,
        newBaseline.description
      );
      const validationResult = validateBaseline(tempBaseline);
      setValidation(validationResult);
    } else {
      setValidation({
        isValid: false,
        errors: ['Baseline name is required'],
        warnings: [],
      });
    }
  }, [newBaseline, tasks]);

  // Calculate comparison when selected baseline changes
  useEffect(() => {
    if (selectedBaseline && showComparison) {
      const comparison = compareWithBaseline(tasks, selectedBaseline);
      setComparisonResults(comparison);
    }
  }, [selectedBaseline, showComparison, tasks]);

  const handleCreateBaseline = () => {
    if (!validation.isValid) return;

    const baseline = createBaseline(
      tasks,
      newBaseline.name,
      newBaseline.description
    );
    onSaveBaseline(baseline);
    setNewBaseline({ name: '', description: '' });
    setSelectedBaseline(baseline);
  };

  const handleDeleteBaseline = baselineId => {
    if (
      window.confirm(
        'Are you sure you want to delete this baseline? This action cannot be undone.'
      )
    ) {
      onDeleteBaseline(baselineId);
      if (selectedBaseline?.id === baselineId) {
        setSelectedBaseline(null);
      }
    }
  };

  const handleExportBaseline = baseline => {
    const exportData = exportBaseline(baseline);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baseline-${baseline.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBaseline = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importData = JSON.parse(e.target.result);
        const importResult = importBaseline(importData);

        if (importResult.success) {
          onImportBaseline(importResult.baseline);
        } else {
          console.error('Import failed:', importResult.errors);
          alert(`Import failed: ${importResult.errors.join(', ')}`);
        }
      } catch (error) {
        console.error('Error parsing import file:', error);
        alert('Error parsing import file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const getBaselineStats = baseline => {
    return getBaselineStatistics(baseline);
  };

  const getPerformanceMetrics = baseline => {
    return calculateBaselinePerformance(tasks, baseline);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <ChartBarIcon className='w-6 h-6 text-blue-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Baseline Manager
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
          >
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        <div className='flex-1 flex overflow-hidden'>
          {/* Left Panel - Baseline List */}
          <div className='w-1/3 border-r border-gray-200 flex flex-col'>
            {/* Create New Baseline */}
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Create New Baseline
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Baseline Name
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      value={newBaseline.name}
                      onChange={e =>
                        setNewBaseline(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      onFocus={() => setShowNameSuggestions(true)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter baseline name'
                    />
                    {showNameSuggestions && nameSuggestions.length > 0 && (
                      <div className='absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto'>
                        {nameSuggestions.map((suggestion, index) => (
                          <button
                            key={`suggestion-${index}`}
                            onClick={() => {
                              setNewBaseline(prev => ({
                                ...prev,
                                name: suggestion,
                              }));
                              setShowNameSuggestions(false);
                            }}
                            className='w-full px-3 py-2 text-sm text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0'
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Description (Optional)
                  </label>
                  <textarea
                    value={newBaseline.description}
                    onChange={e =>
                      setNewBaseline(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Describe this baseline'
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleCreateBaseline}
                  disabled={!validation.isValid}
                  className='w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  <PlusIcon className='w-4 h-4' />
                  Create Baseline
                </button>
                {!validation.isValid && (
                  <div className='text-xs text-red-600'>
                    {validation.errors.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Baseline List */}
            <div className='flex-1 overflow-y-auto'>
              <div className='p-4'>
                <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                  Saved Baselines
                </h3>
                <div className='space-y-2'>
                  {baselines.map(baseline => {
                    const stats = getBaselineStats(baseline);
                    const isActive = activeBaselineId === baseline.id;

                    return (
                      <div
                        key={baseline.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedBaseline?.id === baseline.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isActive ? 'ring-2 ring-green-500' : ''}`}
                        onClick={() => setSelectedBaseline(baseline)}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='text-sm font-medium text-gray-900 truncate' title={baseline.name}>
                                {baseline.name}
                              </h4>
                              {isActive && (
                                <span className='px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded'>
                                  Active
                                </span>
                              )}
                            </div>
                            {baseline.description && (
                              <p className='text-xs text-gray-600 mb-2 line-clamp-2'>
                                {baseline.description}
                              </p>
                            )}
                            <div className='flex items-center gap-4 text-xs text-gray-500'>
                              <span>{stats.taskCount} tasks</span>
                              <span>{stats.totalDuration} days</span>
                              <span>
                                {Math.round(stats.averageProgress)}% complete
                              </span>
                            </div>
                            <div className='text-xs text-gray-400 mt-1'>
                              {new Date(
                                baseline.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className='flex items-center gap-1'>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleExportBaseline(baseline);
                              }}
                              className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
                              title='Export baseline'
                            >
                              <DocumentArrowDownIcon className='w-4 h-4' />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteBaseline(baseline.id);
                              }}
                              className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                              title='Delete baseline'
                            >
                              <TrashIcon className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {baselines.length === 0 && (
                    <div className='text-center text-gray-500 py-8'>
                      <ChartBarIcon className='w-12 h-12 mx-auto mb-2 text-gray-400' />
                      <p className='text-sm'>No baselines saved yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Import/Export Controls */}
            <div className='p-4 border-t border-gray-200'>
              <div className='flex gap-2'>
                <label className='flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer'>
                  <DocumentArrowUpIcon className='w-3 h-3' />
                  Import
                  <input
                    type='file'
                    accept='.json'
                    onChange={handleImportBaseline}
                    className='hidden'
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel - Baseline Details */}
          <div className='flex-1 flex flex-col'>
            {selectedBaseline ? (
              <>
                {/* Baseline Header */}
                <div className='p-4 border-b border-gray-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        {selectedBaseline.name}
                      </h3>
                      {selectedBaseline.description && (
                        <p className='text-sm text-gray-600 mt-1'>
                          {selectedBaseline.description}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                          showComparison
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showComparison ? (
                          <EyeIcon className='w-3 h-3' />
                        ) : (
                          <EyeSlashIcon className='w-3 h-3' />
                        )}
                        {showComparison ? 'Hide' : 'Show'} Comparison
                      </button>
                      <button
                        onClick={() => onSetActiveBaseline(selectedBaseline.id)}
                        className='px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
                      >
                        Set Active
                      </button>
                    </div>
                  </div>
                </div>

                {/* Baseline Content */}
                <div className='flex-1 overflow-y-auto'>
                  <div className='p-4 space-y-6'>
                    {/* Statistics */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      {(() => {
                        const stats = getBaselineStats(selectedBaseline);
                        return (
                          <>
                            <div className='bg-blue-50 p-3 rounded-lg'>
                              <div className='text-xs text-blue-600 font-medium'>
                                Tasks
                              </div>
                              <div className='text-lg font-bold text-blue-900'>
                                {stats.taskCount}
                              </div>
                            </div>
                            <div className='bg-green-50 p-3 rounded-lg'>
                              <div className='text-xs text-green-600 font-medium'>
                                Duration
                              </div>
                              <div className='text-lg font-bold text-green-900'>
                                {stats.totalDuration} days
                              </div>
                            </div>
                            <div className='bg-purple-50 p-3 rounded-lg'>
                              <div className='text-xs text-purple-600 font-medium'>
                                Progress
                              </div>
                              <div className='text-lg font-bold text-purple-900'>
                                {Math.round(stats.averageProgress)}%
                              </div>
                            </div>
                            <div className='bg-orange-50 p-3 rounded-lg'>
                              <div className='text-xs text-orange-600 font-medium'>
                                Date Range
                              </div>
                              <div className='text-sm font-bold text-orange-900'>
                                {stats.dateRange.start
                                  ? new Date(
                                      stats.dateRange.start
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Comparison Results */}
                    {showComparison && comparisonResults && (
                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='text-sm font-semibold text-gray-700 mb-3'>
                          Comparison with Current State
                        </h4>
                        {(() => {
                          const summary =
                            getBaselineComparisonSummary(comparisonResults);
                          const performance =
                            getPerformanceMetrics(selectedBaseline);

                          return (
                            <div className='space-y-4'>
                              {/* Summary */}
                              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                <div className='bg-white p-3 rounded border'>
                                  <div className='text-xs text-gray-600'>
                                    Added
                                  </div>
                                  <div className='text-lg font-bold text-green-600'>
                                    {summary.added}
                                  </div>
                                </div>
                                <div className='bg-white p-3 rounded border'>
                                  <div className='text-xs text-gray-600'>
                                    Removed
                                  </div>
                                  <div className='text-lg font-bold text-red-600'>
                                    {summary.removed}
                                  </div>
                                </div>
                                <div className='bg-white p-3 rounded border'>
                                  <div className='text-xs text-gray-600'>
                                    Modified
                                  </div>
                                  <div className='text-lg font-bold text-yellow-600'>
                                    {summary.modified}
                                  </div>
                                </div>
                                <div className='bg-white p-3 rounded border'>
                                  <div className='text-xs text-gray-600'>
                                    Unchanged
                                  </div>
                                  <div className='text-lg font-bold text-blue-600'>
                                    {summary.unchanged}
                                  </div>
                                </div>
                              </div>

                              {/* Performance Metrics */}
                              <div className='bg-white p-4 rounded border'>
                                <h5 className='text-sm font-semibold text-gray-700 mb-3'>
                                  Performance Metrics
                                </h5>
                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                  <div>
                                    <div className='text-xs text-gray-600'>
                                      Schedule Performance
                                    </div>
                                    <div className='text-lg font-bold text-blue-600'>
                                      {performance.schedulePerformance.toFixed(
                                        1
                                      )}
                                      %
                                    </div>
                                  </div>
                                  <div>
                                    <div className='text-xs text-gray-600'>
                                      Cost Performance
                                    </div>
                                    <div className='text-lg font-bold text-green-600'>
                                      {performance.costPerformance.toFixed(1)}%
                                    </div>
                                  </div>
                                  <div>
                                    <div className='text-xs text-gray-600'>
                                      Scope Performance
                                    </div>
                                    <div className='text-lg font-bold text-purple-600'>
                                      {performance.scopePerformance.toFixed(1)}%
                                    </div>
                                  </div>
                                  <div>
                                    <div className='text-xs text-gray-600'>
                                      Overall Performance
                                    </div>
                                    <div className='text-lg font-bold text-orange-600'>
                                      {performance.overallPerformance.toFixed(
                                        1
                                      )}
                                      %
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Changes List */}
                              {comparisonResults.changes.length > 0 && (
                                <div className='bg-white p-4 rounded border'>
                                  <h5 className='text-sm font-semibold text-gray-700 mb-3'>
                                    Detailed Changes
                                  </h5>
                                  <div className='space-y-2 max-h-64 overflow-y-auto'>
                                    {formatBaselineChanges(
                                      comparisonResults
                                    ).map((change, index) => (
                                      <div
                                        key={`change-${index}`}
                                        className='flex items-start gap-2 p-2 bg-gray-50 rounded'
                                      >
                                        <span className='text-lg'>
                                          {change.icon}
                                        </span>
                                        <div className='flex-1 min-w-0'>
                                          <div className='text-sm font-medium text-gray-900'>
                                            {change.taskName}
                                          </div>
                                          <div className='text-xs text-gray-600'>
                                            {change.description}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Baseline Metadata */}
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='text-sm font-semibold text-gray-700 mb-3'>
                        Baseline Information
                      </h4>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-600'>Created:</span>
                          <div className='font-medium text-gray-900'>
                            {new Date(
                              selectedBaseline.createdAt
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Created By:</span>
                          <div className='font-medium text-gray-900'>
                            {selectedBaseline.createdBy}
                          </div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Version:</span>
                          <div className='font-medium text-gray-900'>
                            {selectedBaseline.version}
                          </div>
                        </div>
                        <div>
                          <span className='text-gray-600'>ID:</span>
                          <div className='font-medium text-gray-900 font-mono text-xs'>
                            {selectedBaseline.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <ChartBarIcon className='w-16 h-16 mx-auto mb-4 text-gray-400' />
                  <p className='text-lg font-medium'>
                    Select a baseline to view details
                  </p>
                  <p className='text-sm'>
                    Choose a baseline from the list to see its statistics and
                    comparison data
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaselineManagerDialog;
