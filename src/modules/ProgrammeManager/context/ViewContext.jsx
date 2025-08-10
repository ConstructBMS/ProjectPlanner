import { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
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
    viewScale: 'Day', // View scale: Day, Week, Month
    timeUnit: 'day', // Time unit: day, week, month
    timelineZoom: 20, // Pixels per day (10-100 range)
    taskFilter: 'Show All', // Task filter setting
    statusHighlighting: false, // Toggle for status-based row highlighting
    showWeekends: true, // Toggle for showing weekend columns in timeline
    showGridlines: true, // Toggle for showing gridlines in timeline
    showCriticalPath: false, // Toggle for showing critical path highlighting
    showSlack: false, // Toggle for showing slack overlays

    // Date markers
    dateMarkers: [],

    // Baseline overlay
    showBaseline: false,

    // Progress line
    statusDate: null, // Status date for progress line (defaults to today)

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

    // Load saved showGridlines preference
    const savedShowGridlines = window.localStorage.getItem(
      'gantt.showGridlines'
    );
    if (savedShowGridlines !== null) {
      try {
        const showGridlines = JSON.parse(savedShowGridlines);
        setViewState(prev => ({ ...prev, showGridlines }));
      } catch (error) {
        console.error('Error loading saved showGridlines preference:', error);
      }
    }

    // Load saved showCriticalPath preference
    const savedShowCriticalPath = window.localStorage.getItem(
      'gantt.showCriticalPath'
    );
    if (savedShowCriticalPath !== null) {
      try {
        const showCriticalPath = JSON.parse(savedShowCriticalPath);
        setViewState(prev => ({ ...prev, showCriticalPath }));
      } catch (error) {
        console.error(
          'Error loading saved showCriticalPath preference:',
          error
        );
      }
    }

    // Load saved showSlack preference
    const savedShowSlack = window.localStorage.getItem('gantt.showSlack');
    if (savedShowSlack !== null) {
      try {
        const showSlack = JSON.parse(savedShowSlack);
        setViewState(prev => ({ ...prev, showSlack }));
      } catch (error) {
        console.error('Error loading saved showSlack preference:', error);
      }
    }

    // Load saved time unit preference
    const savedTimeUnit = window.localStorage.getItem('gantt.timeUnit');
    if (savedTimeUnit !== null) {
      try {
        const timeUnit = JSON.parse(savedTimeUnit);
        setViewState(prev => ({ ...prev, timeUnit }));
      } catch (error) {
        console.error('Error loading saved time unit preference:', error);
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

  const toggleGridlines = () => {
    setViewState(prev => {
      const next = !prev.showGridlines;
      window.localStorage.setItem('gantt.showGridlines', JSON.stringify(next));
      return { ...prev, showGridlines: next };
    });
    console.log('Show Gridlines toggled');
  };

  const toggleCriticalPath = () => {
    setViewState(prev => {
      const next = !prev.showCriticalPath;
      window.localStorage.setItem(
        'gantt.showCriticalPath',
        JSON.stringify(next)
      );
      return { ...prev, showCriticalPath: next };
    });
    console.log('Show Critical Path toggled');
  };

  const toggleSlack = () => {
    setViewState(prev => {
      const next = !prev.showSlack;
      window.localStorage.setItem('gantt.showSlack', JSON.stringify(next));
      return { ...prev, showSlack: next };
    });
    console.log('Show Slack toggled');
  };

  const toggleBaseline = () => {
    setViewState(prev => {
      const next = !prev.showBaseline;
      window.localStorage.setItem('gantt.showBaseline', JSON.stringify(next));
      return { ...prev, showBaseline: next };
    });
    console.log('Show Baseline toggled');
  };

  const zoomToFit = () => {
    // This will trigger the Gantt chart to zoom to fit all tasks
    const zoomToFitAction = {
      zoomToFit: true,
      zoomToFitTimestamp: Date.now(),
    };
    updateViewState(zoomToFitAction);
    console.log('Zoom to Fit triggered');
  };

  const zoomIn = () => {
    setViewState(prev => {
      const newZoom = Math.min(prev.timelineZoom + 10, 100);
      return { ...prev, timelineZoom: newZoom };
    });
    console.log(
      'Zoom In triggered - New zoom:',
      Math.min(viewState.timelineZoom + 10, 100)
    );
  };

  const zoomOut = () => {
    setViewState(prev => {
      const newZoom = Math.max(prev.timelineZoom - 10, 10);
      return { ...prev, timelineZoom: newZoom };
    });
    console.log(
      'Zoom Out triggered - New zoom:',
      Math.max(viewState.timelineZoom - 10, 10)
    );
  };

  const updateViewScale = scale => {
    setViewState(prev => ({ ...prev, viewScale: scale }));
    console.log('View scale updated to:', scale);
  };

  const updateTimeUnit = timeUnit => {
    setViewState(prev => {
      const newState = { ...prev, timeUnit };
      window.localStorage.setItem('gantt.timeUnit', JSON.stringify(timeUnit));
      return newState;
    });
    console.log('Time unit updated to:', timeUnit);
  };

  const value = {
    viewState,
    updateViewState,
    saveViewLayout,
    goToToday,
    toggleWeekends,
    toggleGridlines,
    toggleCriticalPath,
    toggleSlack,
    toggleBaseline,
    zoomToFit,
    zoomIn,
    zoomOut,
    updateViewScale,
    updateTimeUnit,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};
