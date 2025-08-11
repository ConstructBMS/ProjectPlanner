import React, { useState, useEffect } from 'react';
import { useFilterContext } from '../context/FilterContext';
import { useTaskContext } from '../context/TaskContext';
import {
  FunnelIcon,
  XMarkIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const ResourceFilter = () => {
  const { filters, setResourceFilter, getAvailableResources } =
    useFilterContext();
  const { tasks } = useTaskContext();
  const [isOpen, setIsOpen] = useState(false);
  const [availableResources, setAvailableResources] = useState([]);

  // Get available resources from tasks
  useEffect(() => {
    const resources = getAvailableResources(tasks);
    setAvailableResources(resources);
  }, [tasks, getAvailableResources]);

  const handleResourceSelect = resource => {
    setResourceFilter(resource);
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setResourceFilter('All');
    setIsOpen(false);
  };

  const getCurrentLabel = () => {
    if (filters.resource === 'All') {
      return 'All Resources';
    }
    return filters.resource;
  };

  const getFilterBadge = () => {
    if (filters.resource === 'All') return null;
    return (
      <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
        {filters.resource}
      </span>
    );
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        title='Filter tasks by resource assignment'
      >
        <UserGroupIcon className='w-4 h-4 text-gray-500' />
        <span className='text-gray-700'>{getCurrentLabel()}</span>
        {getFilterBadge()}
        <FunnelIcon className='w-4 h-4 text-gray-400' />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 min-w-64'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-900'>
                Filter by Resource
              </h3>
              {filters.resource !== 'All' && (
                <button
                  onClick={handleClearFilter}
                  className='text-xs text-gray-500 hover:text-gray-700 flex items-center'
                >
                  <XMarkIcon className='w-3 h-3 mr-1' />
                  Clear
                </button>
              )}
            </div>

            <div className='space-y-1'>
              <button
                onClick={() => handleResourceSelect('All')}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  filters.resource === 'All'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className='font-medium'>All Resources</div>
                <div className='text-xs text-gray-500'>Show all tasks</div>
              </button>

              {availableResources.length === 0 ? (
                <div className='px-3 py-2 text-xs text-gray-500'>
                  No resources assigned to tasks
                </div>
              ) : (
                availableResources.map(resource => (
                  <button
                    key={resource}
                    onClick={() => handleResourceSelect(resource)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      filters.resource === resource
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className='font-medium'>{resource}</div>
                    <div className='text-xs text-gray-500'>
                      Show tasks assigned to {resource}
                    </div>
                  </button>
                ))
              )}
            </div>

            {availableResources.length > 0 && (
              <div className='border-t border-gray-200 pt-3'>
                <div className='text-xs text-gray-500'>
                  <div className='font-medium mb-1'>Filter Status:</div>
                  <div>
                    {filters.resource === 'All'
                      ? `Showing all ${tasks.length} tasks`
                      : `Showing tasks assigned to "${filters.resource}"`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceFilter;
