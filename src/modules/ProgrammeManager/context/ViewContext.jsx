import { createContext, useContext, useState, useEffect } from 'react';

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
    taskFilter: 'Show All', // Task filter setting
    statusHighlighting: false, // Toggle for status-based row highlighting
    showWeekends: true, // Toggle for showing weekend columns in timeline

    // Date markers
    dateMarkers: [],

    // Baseline overlay
    showBaseline: false,

    // Timestamp
    savedAt: null,
  });

  // Load saved view state on mount
  useEffect(() => {
    const savedView = window.localStorage.getItem('plannerView');
    if (savedView) {
      try {
        const parsed = JSON.parse(savedView);
        setViewState(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved view:', error);
      }
    }

    // Load saved date markers
    const savedMarkers = window.localStorage.getItem('dateMarkers');
    if (savedMarkers) {
      try {
        const parsedMarkers = JSON.parse(savedMarkers);
        setViewState(prev => ({ ...prev, dateMarkers: parsedMarkers }));
      } catch (error) {
        console.error('Error loading saved date markers:', error);
      }
    }

    // Load saved showWeekends preference
    const savedShowWeekends = window.localStorage.getItem('gantt.showWeekends');
    if (savedShowWeekends !== null) {
      try {
        const showWeekends = JSON.parse(savedShowWeekends);
        setViewState(prev => ({ ...prev, showWeekends }));
      } catch (error) {
        console.error('Error loading saved showWeekends preference:', error);
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

    window.localStorage.setItem('plannerView', JSON.stringify(currentState));
    console.log('View layout saved');
  };

  const goToToday = () => {
    // This will trigger the Gantt chart to scroll to today
    // The actual scrolling will be handled by the GanttChart component
    const todayHighlight = {
      showTodayHighlight: true,
      todayHighlightTimestamp: Date.now(),
    };
    updateViewState(todayHighlight);
    console.log('Go to Today triggered');

    // Reset the highlight after animation
    window.setTimeout(() => {
      updateViewState({ showTodayHighlight: false });
    }, 1000);
  };

  const toggleWeekends = () => {
    setViewState(prev => {
      const next = !prev.showWeekends;
      window.localStorage.setItem('gantt.showWeekends', JSON.stringify(next));
      return { ...prev, showWeekends: next };
    });
    console.log('Show Weekends toggled');
  };

  const value = {
    viewState,
    updateViewState,
    saveViewLayout,
    goToToday,
    toggleWeekends,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};
