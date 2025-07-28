import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
};

export const ViewProvider = ({ children }) => {
  const [viewState, setViewState] = useState({
    // Panel sizes
    sidebarWidth: 20,
    taskGanttSplit: 40,
    propertiesPaneSize: 25,
    resourcesPaneSize: 0,
    resourcesVisible: false,

    // Ribbon tab
    activeTab: 'Home',

    // View settings
    zoomLevel: 'Week',
    calendarView: 'Workweek',
    timelineZoom: 1.0, // Scaling factor for timeline zoom

    // Date markers
    dateMarkers: [],

    // Baseline overlay
    showBaseline: false,

    // Timestamp
    savedAt: null,
  });

  // Load saved view state on mount
  useEffect(() => {
    const savedView = localStorage.getItem('plannerView');
    if (savedView) {
      try {
        const parsed = JSON.parse(savedView);
        setViewState(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved view:', error);
      }
    }

    // Load saved date markers
    const savedMarkers = localStorage.getItem('dateMarkers');
    if (savedMarkers) {
      try {
        const parsedMarkers = JSON.parse(savedMarkers);
        setViewState(prev => ({ ...prev, dateMarkers: parsedMarkers }));
      } catch (error) {
        console.error('Error loading saved date markers:', error);
      }
    }
  }, []);

  const updateViewState = updates => {
    setViewState(prev => ({ ...prev, ...updates }));
  };

  const saveViewLayout = () => {
    const currentState = {
      ...viewState,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('plannerView', JSON.stringify(currentState));
    console.log('View layout saved');
  };

  const value = {
    viewState,
    updateViewState,
    saveViewLayout,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};
