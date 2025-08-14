// eslint-disable-next-line no-unused-vars
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { getStorage, setStorage } from '../utils/persistentStorage.js';

const FilterContext = createContext();

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    status: 'All',
    resource: 'All',
    dateRange: {
      start: null,
      end: null,
    },
  });

  // Load filters from persistent storage on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await getStorage('gantt.filters');
        if (savedFilters) {
          setFilters(savedFilters);
        }
      } catch (error) {
        console.error('Error loading filters from storage:', error);
      }
    };
    loadFilters();
  }, []);

  // Save filters to persistent storage when they change
  useEffect(() => {
    const saveFilters = async () => {
      try {
        await setStorage('gantt.filters', filters);
      } catch (error) {
        console.error('Error saving filters to storage:', error);
      }
    };
    saveFilters();
  }, [filters]);

  // Set status filter
  const setStatusFilter = useCallback(status => {
    setFilters(prev => ({
      ...prev,
      status,
    }));
  }, []);

  // Set resource filter
  const setResourceFilter = useCallback(resource => {
    setFilters(prev => ({
      ...prev,
      resource,
    }));
  }, []);

  // Set date range filter
  const setDateRangeFilter = useCallback((start, end) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        start: start ? new Date(start).toISOString() : null,
        end: end ? new Date(end).toISOString() : null,
      },
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
      status: 'All',
      resource: 'All',
      dateRange: {
        start: null,
        end: null,
      },
    });
  }, []);

  // Clear specific filter
  const clearFilter = useCallback(filterType => {
    setFilters(prev => ({
      ...prev,
      [filterType]:
        filterType === 'dateRange' ? { start: null, end: null } : 'All',
    }));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return (
      filters.status !== 'All' ||
      filters.resource !== 'All' ||
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null
    );
  }, [filters]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.status !== 'All') count++;
    if (filters.resource !== 'All') count++;
    if (filters.dateRange.start !== null || filters.dateRange.end !== null)
      count++;
    return count;
  }, [filters]);

  // Apply filters to tasks
  const applyFilters = useCallback(
    tasks => {
      return tasks.filter(task => {
        // Status filter
        if (filters.status !== 'All') {
          const taskStatus = task.status || 'Not Started';
          if (taskStatus !== filters.status) {
            return false;
          }
        }

        // Resource filter
        if (filters.resource !== 'All') {
          const taskResource = task.resource || task.assignedTo || '';
          if (taskResource !== filters.resource) {
            return false;
          }
        }

        // Date range filter
        if (filters.dateRange.start || filters.dateRange.end) {
          const taskStart = new Date(task.startDate);
          const taskEnd = new Date(task.endDate);

          if (filters.dateRange.start) {
            const filterStart = new Date(filters.dateRange.start);
            if (taskEnd < filterStart) {
              return false;
            }
          }

          if (filters.dateRange.end) {
            const filterEnd = new Date(filters.dateRange.end);
            if (taskStart > filterEnd) {
              return false;
            }
          }
        }

        return true;
      });
    },
    [filters]
  );

  // Get available resources from tasks
  const getAvailableResources = useCallback(tasks => {
    const resources = new Set();
    tasks.forEach(task => {
      const resource = task.resource || task.assignedTo;
      if (resource && resource.trim()) {
        resources.add(resource.trim());
      }
    });
    return Array.from(resources).sort();
  }, []);

  // Get available statuses
  const getAvailableStatuses = useCallback(() => {
    return [
      'All',
      'Not Started',
      'In Progress',
      'Completed',
      'Delayed',
      'On Hold',
      'Cancelled',
    ];
  }, []);

  const value = {
    // State
    filters,

    // Filter setters
    setStatusFilter,
    setResourceFilter,
    setDateRangeFilter,

    // Filter management
    clearAllFilters,
    clearFilter,

    // Filter utilities
    hasActiveFilters,
    getActiveFilterCount,
    applyFilters,

    // Available options
    getAvailableResources,
    getAvailableStatuses,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
