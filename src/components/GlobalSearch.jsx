// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect } from 'react';
import { useSearchContext } from '../modules/ProgrammeManager/context/SearchContext';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

const GlobalSearch = () => {
  const {
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
  } = useSearchContext();

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Focus search input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle global keyboard events
  useEffect(() => {
    const handleGlobalKeyDown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setIsSearchOpen]);

  // Handle search input key events
  const handleInputKeyDown = event => {
    handleKeyDown(event);
  };

  // Handle search input change
  const handleInputChange = event => {
    handleSearchQueryChange(event.target.value);
  };

  // Handle search input focus
  const handleInputFocus = () => {
    handleSearchFocus();
  };

  // Handle search input blur
  const handleInputBlur = () => {
    handleSearchBlur();
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle result click
  const handleResultClick = result => {
    handleResultSelect(result);
  };

  // Get result item styling
  const getResultItemStyle = index => {
    const baseStyle =
      'flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150';
    const selectedStyle =
      index === selectedResultIndex
        ? 'bg-blue-50 border-l-4 border-blue-500'
        : '';
    return `${baseStyle} ${selectedStyle}`;
  };

  // Get type badge styling
  const getTypeBadgeStyle = type => {
    const styles = {
      project: 'bg-blue-100 text-blue-800',
      task: 'bg-green-100 text-green-800',
      resource: 'bg-purple-100 text-purple-800',
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[type] || 'bg-gray-100 text-gray-800'}`;
  };

  // Get priority badge styling
  const getPriorityBadgeStyle = priority => {
    const styles = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800',
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[priority] || 'bg-gray-100 text-gray-800'}`;
  };

  // Get progress bar styling
  const getProgressBarStyle = progress => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = amount => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      id='global-search-container'
      ref={searchContainerRef}
      className='relative flex-1 max-w-2xl mx-4'
    >
      {/* Search Input */}
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
        </div>
        <input
          ref={searchInputRef}
          type='text'
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder='Search tasks, resources, projects...'
          className='block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm'
        />
        <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className='text-gray-400 hover:text-gray-600 transition-colors duration-150'
            >
              <XMarkIcon className='h-4 w-4' />
            </button>
          )}
          {!searchQuery && (
            <div className='flex items-center space-x-1 text-gray-400'>
              <CommandLineIcon className='h-3 w-3' />
              <span className='text-xs'>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isSearchOpen &&
        (searchQuery.trim().length >= 2 || searchResults.length > 0) && (
          <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
            {/* Loading State */}
            {isSearching && (
              <div className='p-4 text-center text-gray-500'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2' />
                <p className='text-sm'>Searching...</p>
              </div>
            )}

            {/* No Results */}
            {!isSearching &&
              searchResults.length === 0 &&
              searchQuery.trim().length >= 2 && (
                <div className='p-4 text-center text-gray-500'>
                  <MagnifyingGlassIcon className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                  <p className='text-sm'>
                    No results found for "{searchQuery}"
                  </p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Try searching for tasks, resources, or projects
                  </p>
                </div>
              )}

            {/* Search Results */}
            {!isSearching && searchResults.length > 0 && (
              <div>
                {/* Results Header */}
                <div className='px-3 py-2 bg-gray-50 border-b border-gray-200'>
                  <p className='text-xs font-medium text-gray-700'>
                    {searchResults.length} result
                    {searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                </div>

                {/* Results List */}
                <div>
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={getResultItemStyle(index)}
                      onClick={() => handleResultClick(result)}
                    >
                      {/* Result Icon */}
                      <div className='flex-shrink-0 mr-3'>
                        <span className='text-lg'>{result.icon}</span>
                      </div>

                      {/* Result Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium text-gray-900 truncate' title={result.name}>
                            {result.title}
                          </h4>
                          <div className='flex items-center space-x-2 ml-2'>
                            {/* Type Badge */}
                            <span className={getTypeBadgeStyle(result.type)}>
                              {result.type}
                            </span>

                            {/* Priority Badge (for tasks) */}
                            {result.type === 'task' && result.priority && (
                              <span
                                className={getPriorityBadgeStyle(
                                  result.priority
                                )}
                              >
                                {result.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className='text-sm text-gray-600 truncate mt-1' title={result.description || ''}>
                          {result.description}
                        </p>

                        <p className='text-xs text-gray-500 mt-1'>
                          {result.subtitle}
                        </p>

                        {/* Additional Details */}
                        <div className='flex items-center space-x-4 mt-2'>
                          {/* Progress Bar (for tasks and projects) */}
                          {(result.type === 'task' ||
                            result.type === 'project') &&
                            result.progress !== undefined && (
                              <div className='flex items-center space-x-2'>
                                <div className='w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                                  <div
                                    className={`h-full ${getProgressBarStyle(result.progress)}`}
                                    style={{ width: `${result.progress}%` }}
                                  />
                                </div>
                                <span className='text-xs text-gray-500'>
                                  {result.progress}%
                                </span>
                              </div>
                            )}

                          {/* Budget (for projects) */}
                          {result.type === 'project' && result.budget && (
                            <span className='text-xs text-gray-500'>
                              {formatCurrency(result.budget)}
                            </span>
                          )}

                          {/* Capacity (for resources) */}
                          {result.type === 'resource' && result.capacity && (
                            <span className='text-xs text-gray-500'>
                              {result.capacity}% capacity
                            </span>
                          )}

                          {/* Dates */}
                          {result.startDate && (
                            <span className='text-xs text-gray-500'>
                              {formatDate(result.startDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className='flex-shrink-0 ml-2'>
                        <svg
                          className='h-4 w-4 text-gray-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Results Footer */}
                <div className='px-3 py-2 bg-gray-50 border-t border-gray-200'>
                  <p className='text-xs text-gray-500'>
                    Use ↑↓ to navigate, Enter to select, Esc to close
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default GlobalSearch;
