import React, { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '../../modules/ProgrammeManager/context/UserContext';
import { getRibbonPrefs, setRibbonPrefs } from '../../modules/ProgrammeManager/utils/ribbonStorage';
import RibbonTabs from '../../modules/ProgrammeManager/components/RibbonTabs/RibbonTabs';
import GlobalSearch from '../GlobalSearch';


const RibbonContainer = ({
  onExpandAll,
  onCollapseAll,
  contentRef,
  projectId,
  onBackToPortfolio,
}) => {
  const { user, getRoleDescription } = useUserContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load ribbon state from storage
  const loadRibbonState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get ribbon preferences from unified storage
      const ribbonPrefs = await getRibbonPrefs();
      setIsExpanded(!ribbonPrefs.minimised);
    } catch (err) {
      setError(err.message);
      console.error('Error loading ribbon state:', err);
      // Fallback to expanded state
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save ribbon state to storage
  const saveRibbonState = useCallback(
    async expanded => {
      try {
        // Get current preferences and update minimised state
        const currentPrefs = await getRibbonPrefs();
        const updatedPrefs = {
          ...currentPrefs,
          minimised: !expanded
        };
        
        await setRibbonPrefs(updatedPrefs);
      } catch (err) {
        setError(err.message);
        console.error('Error saving ribbon state:', err);
      }
    },
    []
  );

  // Toggle ribbon expand/collapse
  const toggleRibbon = useCallback(async () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    await saveRibbonState(newExpandedState);
  }, [isExpanded, saveRibbonState]);

  // Load ribbon state on mount
  useEffect(() => {
    loadRibbonState();
  }, [loadRibbonState]);

  // Handle keyboard shortcut (Ctrl/Cmd + F1)
  useEffect(() => {
    const handleKeyDown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'F1') {
        event.preventDefault();
        toggleRibbon();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleRibbon]);

  // Show loading state briefly to prevent flashing
  if (isLoading) {
    return (
      <div className='z-10 bg-white border-b border-gray-200'>
        <div className='flex items-center justify-between px-4 py-2'>
          <div className='flex items-center space-x-2'>
            <div className='animate-pulse bg-gray-200 h-4 w-4 rounded' />
            <span className='text-sm text-gray-500'>Loading ribbon...</span>
          </div>
        </div>
        <div className='project-ribbon'>
          <div className='flex border-b border-gray-300'>
            <div className='animate-pulse bg-gray-200 h-8 w-16 rounded m-2' />
            <div className='animate-pulse bg-gray-200 h-8 w-16 rounded m-2' />
            <div className='animate-pulse bg-gray-200 h-8 w-16 rounded m-2' />
          </div>
          <div className='project-ribbon-content min-h-[80px] w-full'>
            <div className='flex items-center justify-center h-full'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='z-10 bg-white border-b border-gray-200'>
      {/* Header with Back to Portfolio Button and Global Search */}
      <div className='flex items-center justify-between px-4 py-2'>
        <button
          onClick={onBackToPortfolio}
          className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        >
          ← Back to Portfolio
        </button>

        {/* Global Search */}
        <GlobalSearch />

        <div className='flex items-center space-x-4 text-sm text-gray-500'>
          <div>
            {projectId ? `Project ID: ${projectId}` : 'Current Project'}
          </div>
          {user && (
            <div className='flex items-center space-x-2'>
              <span>•</span>
              <span className='font-medium'>{user.name}</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getRoleDescription().bgColor} ${getRoleDescription().color}`}
              >
                {getRoleDescription().name}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className='px-4 py-1 bg-red-50 border-t border-red-200'>
          <div className='text-xs text-red-500'>Error: {error}</div>
        </div>
      )}

      {/* Ribbon Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[200px]' : 'max-h-0'
        }`}
      >
        <RibbonTabs
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          contentRef={contentRef}
        />
      </div>
    </div>
  );
};

export default RibbonContainer;
