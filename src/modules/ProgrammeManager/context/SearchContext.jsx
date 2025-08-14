import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useTaskContext } from './TaskContext';
import { useProjectsContext } from './ProjectsContext';
import { supabase } from '../../../supabase/client';

const SearchContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  // Make TaskContext optional - only use it if available
  let tasks = [];
  try {
    const taskContext = useTaskContext();
    tasks = taskContext.tasks || [];
  } catch (error) {
    // TaskContext not available, use empty array
    tasks = [];
  }

  const { projects } = useProjectsContext();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

  // Mock resources for search (in a real app, this would come from a resource context)
  const mockResources = useMemo(
    () => [
      {
        id: 'resource-1',
        name: 'Crane Operator',
        type: 'Equipment',
        capacity: 100,
      },
      {
        id: 'resource-2',
        name: 'Concrete Worker',
        type: 'Labor',
        capacity: 150,
      },
      { id: 'resource-3', name: 'Steel Worker', type: 'Labor', capacity: 120 },
      { id: 'resource-4', name: 'Electrician', type: 'Trade', capacity: 100 },
      { id: 'resource-5', name: 'Plumber', type: 'Trade', capacity: 100 },
      {
        id: 'resource-6',
        name: 'Project Manager',
        type: 'Management',
        capacity: 100,
      },
      {
        id: 'resource-7',
        name: 'Site Engineer',
        type: 'Engineering',
        capacity: 100,
      },
      {
        id: 'resource-8',
        name: 'Safety Officer',
        type: 'Safety',
        capacity: 100,
      },
    ],
    []
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return query => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performSearch(query);
        }, 300);
      };
    })(),
    []
  );

  // Perform the actual search
  const performSearch = useCallback(
    async query => {
      if (!query || query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const searchTerm = query.toLowerCase().trim();

      try {
        // Search in tasks
        const taskResults = tasks
          .filter(task => {
            const nameMatch = task.name?.toLowerCase().includes(searchTerm);
            const descriptionMatch = task.notes
              ?.toLowerCase()
              .includes(searchTerm);
            const assigneeMatch = task.assignee
              ?.toLowerCase()
              .includes(searchTerm);
            const statusMatch = task.status?.toLowerCase().includes(searchTerm);

            return (
              nameMatch || descriptionMatch || assigneeMatch || statusMatch
            );
          })
          .map(task => ({
            id: task.id,
            type: 'task',
            title: task.name,
            description: task.notes || 'No description',
            subtitle: `${task.status} • ${task.assignee || 'Unassigned'}`,
            icon: '📋',
            url: `/project/task/${task.id}`,
            priority: task.priority,
            progress: task.progress,
            startDate: task.startDate,
            endDate: task.endDate,
          }));

        // Search in resources
        const resourceResults = mockResources
          .filter(resource => {
            const nameMatch = resource.name?.toLowerCase().includes(searchTerm);
            const typeMatch = resource.type?.toLowerCase().includes(searchTerm);

            return nameMatch || typeMatch;
          })
          .map(resource => ({
            id: resource.id,
            type: 'resource',
            title: resource.name,
            description: `${resource.type} resource`,
            subtitle: `Capacity: ${resource.capacity}%`,
            icon: '👷',
            url: `/resources/${resource.id}`,
            capacity: resource.capacity,
          }));

        // Search in projects
        const projectResults = projects
          .filter(project => {
            const nameMatch = project.name?.toLowerCase().includes(searchTerm);
            const descriptionMatch = project.description
              ?.toLowerCase()
              .includes(searchTerm);
            const managerMatch = project.manager
              ?.toLowerCase()
              .includes(searchTerm);
            const locationMatch = project.location
              ?.toLowerCase()
              .includes(searchTerm);
            const statusMatch = project.status
              ?.toLowerCase()
              .includes(searchTerm);

            return (
              nameMatch ||
              descriptionMatch ||
              managerMatch ||
              locationMatch ||
              statusMatch
            );
          })
          .map(project => ({
            id: project.id,
            type: 'project',
            title: project.name,
            description: project.description || 'No description',
            subtitle: `${project.status} • ${project.manager} • ${project.location}`,
            icon: '🏗️',
            url: `/project/${project.id}`,
            progress: project.progress,
            budget: project.budget,
            startDate: project.start_date,
            endDate: project.end_date,
          }));

        // Combine and sort results
        const allResults = [
          ...taskResults,
          ...resourceResults,
          ...projectResults,
        ];

        // Sort by relevance (exact matches first, then partial matches)
        const sortedResults = allResults.sort((a, b) => {
          const aExactMatch = a.title.toLowerCase() === searchTerm;
          const bExactMatch = b.title.toLowerCase() === searchTerm;

          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;

          // Then sort by type priority: project > task > resource
          const typePriority = { project: 3, task: 2, resource: 1 };
          const aPriority = typePriority[a.type] || 0;
          const bPriority = typePriority[b.type] || 0;

          if (aPriority !== bPriority) return bPriority - aPriority;

          // Finally sort alphabetically
          return a.title.localeCompare(b.title);
        });

        setSearchResults(sortedResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [tasks, projects, mockResources]
  );

  // Handle search query changes
  const handleSearchQueryChange = useCallback(
    query => {
      setSearchQuery(query);
      setSelectedResultIndex(-1);

      if (query.trim().length >= 2) {
        debouncedSearch(query);
      } else {
        setSearchResults([]);
      }
    },
    [debouncedSearch]
  );

  // Handle search result selection
  const handleResultSelect = useCallback(result => {
    // Navigate to the result
    if (result.type === 'project') {
      // Navigate to project
      window.location.href = result.url;
    } else if (result.type === 'task') {
      // Navigate to task in current project
      // This would need to be handled by the parent component
      console.log('Navigate to task:', result.id);
    } else if (result.type === 'resource') {
      // Navigate to resource
      console.log('Navigate to resource:', result.id);
    }

    // Close search
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    event => {
      if (!isSearchOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedResultIndex(prev =>
            (prev < searchResults.length - 1 ? prev + 1 : prev)
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedResultIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedResultIndex >= 0 && searchResults[selectedResultIndex]) {
            handleResultSelect(searchResults[selectedResultIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsSearchOpen(false);
          setSearchQuery('');
          setSearchResults([]);
          break;
      }
    },
    [isSearchOpen, searchResults, selectedResultIndex, handleResultSelect]
  );

  // Handle search focus
  const handleSearchFocus = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  // Handle search blur
  const handleSearchBlur = useCallback(() => {
    // Delay closing to allow for clicks on results
    setTimeout(() => {
      setIsSearchOpen(false);
    }, 200);
  }, []);

  // Global keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalKeyDown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
        // Focus the search input (this will be handled by the search component)
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      const searchContainer = document.getElementById(
        'global-search-container'
      );
      if (searchContainer && !searchContainer.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    isSearchOpen,
    selectedResultIndex,
    handleSearchQueryChange,
    handleResultSelect,
    handleKeyDown,
    handleSearchFocus,
    handleSearchBlur,
    setIsSearchOpen,
    setSearchQuery,
    setSearchResults,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
