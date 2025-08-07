import React, { useState, useMemo, useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsVerticalIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const AdvancedSearch = ({ onResultsChange }) => {
  const { tasks, taskLinks } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    text: '',
    status: '',
    priority: '',
    assignee: '',
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
    progressMin: '',
    progressMax: '',
    hasPredecessors: false,
    hasSuccessors: false,
    isMilestone: false,
    tags: [],
  });

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const statuses = [...new Set(tasks.map(t => t.status).filter(Boolean))];
    const priorities = [...new Set(tasks.map(t => t.priority).filter(Boolean))];
    const assignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))];

    return {
      statuses: statuses.sort(),
      priorities: priorities.sort(),
      assignees: assignees.sort(),
    };
  }, [tasks]);

  // Apply search and filter logic
  const filteredTasks = useMemo(() => {
    let results = tasks;

    // Text search (name, description, notes)
    if (searchCriteria.text) {
      const searchText = searchCriteria.text.toLowerCase();
      results = results.filter(
        task =>
          task.name.toLowerCase().includes(searchText) ||
          (task.description &&
            task.description.toLowerCase().includes(searchText)) ||
          (task.notes && task.notes.toLowerCase().includes(searchText))
      );
    }

    // Status filter
    if (searchCriteria.status) {
      results = results.filter(task => task.status === searchCriteria.status);
    }

    // Priority filter
    if (searchCriteria.priority) {
      results = results.filter(
        task => task.priority === searchCriteria.priority
      );
    }

    // Assignee filter
    if (searchCriteria.assignee) {
      results = results.filter(
        task => task.assignee === searchCriteria.assignee
      );
    }

    // Date range filters
    if (searchCriteria.startDateFrom) {
      const fromDate = new Date(searchCriteria.startDateFrom);
      results = results.filter(task => new Date(task.startDate) >= fromDate);
    }

    if (searchCriteria.startDateTo) {
      const toDate = new Date(searchCriteria.startDateTo);
      results = results.filter(task => new Date(task.startDate) <= toDate);
    }

    if (searchCriteria.endDateFrom) {
      const fromDate = new Date(searchCriteria.endDateFrom);
      results = results.filter(task => new Date(task.endDate) >= fromDate);
    }

    if (searchCriteria.endDateTo) {
      const toDate = new Date(searchCriteria.endDateTo);
      results = results.filter(task => new Date(task.endDate) <= toDate);
    }

    // Progress range filters
    if (searchCriteria.progressMin !== '') {
      results = results.filter(
        task => task.progress >= parseInt(searchCriteria.progressMin)
      );
    }

    if (searchCriteria.progressMax !== '') {
      results = results.filter(
        task => task.progress <= parseInt(searchCriteria.progressMax)
      );
    }

    // Dependency filters
    if (searchCriteria.hasPredecessors) {
      const tasksWithPredecessors = new Set(taskLinks.map(link => link.toId));
      results = results.filter(task => tasksWithPredecessors.has(task.id));
    }

    if (searchCriteria.hasSuccessors) {
      const tasksWithSuccessors = new Set(taskLinks.map(link => link.fromId));
      results = results.filter(task => tasksWithSuccessors.has(task.id));
    }

    // Milestone filter
    if (searchCriteria.isMilestone) {
      results = results.filter(task => task.isMilestone);
    }

    return results;
  }, [tasks, taskLinks, searchCriteria]);

  // Notify parent component of results
  React.useEffect(() => {
    if (onResultsChange) {
      onResultsChange(filteredTasks);
    }
  }, [filteredTasks, onResultsChange]);

  const updateCriteria = useCallback((field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchCriteria({
      text: '',
      status: '',
      priority: '',
      assignee: '',
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
      progressMin: '',
      progressMax: '',
      hasPredecessors: false,
      hasSuccessors: false,
      isMilestone: false,
      tags: [],
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(searchCriteria).some(([key, value]) => {
      if (key === 'tags') return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== '';
    });
  }, [searchCriteria]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(searchCriteria).reduce((count, [key, value]) => {
      if (key === 'tags') return count + (value.length > 0 ? 1 : 0);
      if (typeof value === 'boolean') return count + (value ? 1 : 0);
      return count + (value !== '' ? 1 : 0);
    }, 0);
  }, [searchCriteria]);

  return (
    <div className='bg-white border border-gray-200 rounded-lg'>
      {/* Search Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <MagnifyingGlassIcon className='w-6 h-6 text-blue-600' />
          <h2 className='text-lg font-semibold text-gray-900'>
            Advanced Search & Filter
          </h2>
          {activeFilterCount > 0 && (
            <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full'>
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}{' '}
              active
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className='flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors'
            >
              <XMarkIcon className='w-4 h-4' />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
          >
            <AdjustmentsVerticalIcon className='w-4 h-4' />
            {isExpanded ? 'Hide' : 'Show'} Filters
            <ChevronDownIcon
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className='p-4 border-b border-gray-200'>
        <div className='relative'>
          <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            value={searchCriteria.text}
            onChange={e => updateCriteria('text', e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='Search tasks by name, description, or notes...'
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className='p-4 space-y-6'>
          {/* Basic Filters */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              Basic Filters
            </h3>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  Status
                </label>
                <select
                  value={searchCriteria.status}
                  onChange={e => updateCriteria('status', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Statuses</option>
                  {filterOptions.statuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  Priority
                </label>
                <select
                  value={searchCriteria.priority}
                  onChange={e => updateCriteria('priority', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Priorities</option>
                  {filterOptions.priorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  Assignee
                </label>
                <select
                  value={searchCriteria.assignee}
                  onChange={e => updateCriteria('assignee', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Assignees</option>
                  {filterOptions.assignees.map(assignee => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Range Filters */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              Date Ranges
            </h3>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-2'>
                  Start Date Range
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='date'
                    value={searchCriteria.startDateFrom}
                    onChange={e =>
                      updateCriteria('startDateFrom', e.target.value)
                    }
                    className='px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                    placeholder='From'
                  />
                  <input
                    type='date'
                    value={searchCriteria.startDateTo}
                    onChange={e =>
                      updateCriteria('startDateTo', e.target.value)
                    }
                    className='px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                    placeholder='To'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-medium text-gray-600 mb-2'>
                  End Date Range
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='date'
                    value={searchCriteria.endDateFrom}
                    onChange={e =>
                      updateCriteria('endDateFrom', e.target.value)
                    }
                    className='px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                    placeholder='From'
                  />
                  <input
                    type='date'
                    value={searchCriteria.endDateTo}
                    onChange={e => updateCriteria('endDateTo', e.target.value)}
                    className='px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                    placeholder='To'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Range */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              Progress Range (%)
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  Minimum
                </label>
                <input
                  type='number'
                  min='0'
                  max='100'
                  value={searchCriteria.progressMin}
                  onChange={e => updateCriteria('progressMin', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  placeholder='0'
                />
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>
                  Maximum
                </label>
                <input
                  type='number'
                  min='0'
                  max='100'
                  value={searchCriteria.progressMax}
                  onChange={e => updateCriteria('progressMax', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  placeholder='100'
                />
              </div>
            </div>
          </div>

          {/* Special Filters */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              Special Filters
            </h3>
            <div className='space-y-3'>
              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  checked={searchCriteria.hasPredecessors}
                  onChange={e =>
                    updateCriteria('hasPredecessors', e.target.checked)
                  }
                  className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>Has Predecessors</span>
              </label>

              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  checked={searchCriteria.hasSuccessors}
                  onChange={e =>
                    updateCriteria('hasSuccessors', e.target.checked)
                  }
                  className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>Has Successors</span>
              </label>

              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  checked={searchCriteria.isMilestone}
                  onChange={e =>
                    updateCriteria('isMilestone', e.target.checked)
                  }
                  className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>Milestones Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className='px-4 py-3 bg-gray-50 border-t border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-600'>
            Found{' '}
            <span className='font-medium text-gray-900'>
              {filteredTasks.length}
            </span>{' '}
            of {tasks.length} tasks
          </div>
          {filteredTasks.length !== tasks.length && (
            <div className='text-xs text-blue-600'>
              {tasks.length - filteredTasks.length} tasks hidden by filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
