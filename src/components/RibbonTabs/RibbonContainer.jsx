import React, { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '../../modules/ProgrammeManager/context/UserContext';
import { supabase } from '../../supabase/client';
import RibbonTabs from '../../modules/ProgrammeManager/components/RibbonTabs/RibbonTabs';
import GlobalSearch from '../GlobalSearch';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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

  // Load ribbon state from Supabase
  const loadRibbonState = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user settings from Supabase
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('ribbon_state')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.debug('User settings not found, using default ribbon state');
      }

      // Set ribbon state (default to expanded if no settings found)
      const ribbonState = settings?.ribbon_state || { expanded: true };
      setIsExpanded(ribbonState.expanded);
    } catch (err) {
      setError(err.message);
      console.error('Error loading ribbon state:', err);
      // Fallback to expanded state
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save ribbon state to Supabase
  const saveRibbonState = useCallback(
    async expanded => {
      if (!user) return;

      try {
        const ribbonState = { expanded };

        // Upsert user settings
        const { error } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          ribbon_state: ribbonState,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          throw new Error(`Error saving ribbon state: ${error.message}`);
        }

        console.log('Ribbon state saved successfully');
      } catch (err) {
        setError(err.message);
        console.error('Error saving ribbon state:', err);
      }
    },
    [user]
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

      {/* Ribbon Toggle Button */}
      <div className='flex items-center justify-between px-4 py-1 bg-gray-50 border-t border-gray-200'>
        <div className='flex items-center space-x-2'>
          <button
            onClick={toggleRibbon}
            className='inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-150'
            title={`${isExpanded ? 'Collapse' : 'Expand'} ribbon (Ctrl+F1)`}
          >
            {isExpanded ? (
              <ChevronUpIcon className='w-3 h-3 mr-1' />
            ) : (
              <ChevronDownIcon className='w-3 h-3 mr-1' />
            )}
            {isExpanded ? 'Collapse' : 'Expand'} Ribbon
          </button>
          <span className='text-xs text-gray-400'>Ctrl+F1</span>
        </div>

        {error && <div className='text-xs text-red-500'>Error: {error}</div>}
      </div>

      {/* Ribbon Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
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
