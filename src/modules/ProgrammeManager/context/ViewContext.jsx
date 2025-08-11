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
    timeScale: 'single', // Time scale: single, dual
    primaryTimeUnit: 'day', // Primary time unit for dual scale
    secondaryTimeUnit: 'week', // Secondary time unit for dual scale
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
    activeBaselineId: null, // ID of the currently selected baseline for overlay
    baselines: [], // Array of available baselines

    // Milestone shapes
    globalMilestoneShape: 'diamond', // Default milestone shape for all milestones

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

    // Load saved time scale preference
    const savedTimeScale = window.localStorage.getItem('gantt.timeScale');
    if (savedTimeScale !== null) {
      try {
        const timeScale = JSON.parse(savedTimeScale);
        setViewState(prev => ({ ...prev, timeScale }));
      } catch (error) {
        console.error('Error loading saved time scale preference:', error);
      }
    }

    // Load saved primary time unit preference
    const savedPrimaryTimeUnit = window.localStorage.getItem(
      'gantt.primaryTimeUnit'
    );
    if (savedPrimaryTimeUnit !== null) {
      try {
        const primaryTimeUnit = JSON.parse(savedPrimaryTimeUnit);
        setViewState(prev => ({ ...prev, primaryTimeUnit }));
      } catch (error) {
        console.error(
          'Error loading saved primary time unit preference:',
          error
        );
      }
    }

    // Load saved secondary time unit preference
    const savedSecondaryTimeUnit = window.localStorage.getItem(
      'gantt.secondaryTimeUnit'
    );
    if (savedSecondaryTimeUnit !== null) {
      try {
        const secondaryTimeUnit = JSON.parse(savedSecondaryTimeUnit);
        setViewState(prev => ({ ...prev, secondaryTimeUnit }));
      } catch (error) {
        console.error(
          'Error loading saved secondary time unit preference:',
          error
        );
      }
    }

    // Load saved activeBaselineId preference
    const savedActiveBaselineId = window.localStorage.getItem(
      'gantt.activeBaselineId'
    );
    if (savedActiveBaselineId !== null) {
      try {
        const activeBaselineId = JSON.parse(savedActiveBaselineId);
        setViewState(prev => ({ ...prev, activeBaselineId }));
      } catch (error) {
        console.error(
          'Error loading saved activeBaselineId preference:',
          error
        );
      }
    }

    // Load saved globalMilestoneShape preference
    const savedGlobalMilestoneShape = window.localStorage.getItem(
      'gantt.globalMilestoneShape'
    );
    if (savedGlobalMilestoneShape !== null) {
      try {
        const globalMilestoneShape = JSON.parse(savedGlobalMilestoneShape);
        setViewState(prev => ({ ...prev, globalMilestoneShape }));
      } catch (error) {
        console.error(
          'Error loading saved globalMilestoneShape preference:',
          error
        );
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

  const setActiveBaseline = baselineId => {
    setViewState(prev => {
      const next = {
        ...prev,
        activeBaselineId: baselineId,
        showBaseline: baselineId !== null, // Auto-show baseline when one is selected
      };
      window.localStorage.setItem(
        'gantt.activeBaselineId',
        JSON.stringify(baselineId)
      );
      return next;
    });
    console.log('Active baseline set to:', baselineId);
  };

  const updateBaselines = baselines => {
    setViewState(prev => ({
      ...prev,
      baselines,
    }));
    console.log('Baselines updated:', baselines.length);
  };

  const setGlobalMilestoneShape = shapeKey => {
    setViewState(prev => {
      const next = {
        ...prev,
        globalMilestoneShape: shapeKey,
      };
      window.localStorage.setItem(
        'gantt.globalMilestoneShape',
        JSON.stringify(shapeKey)
      );
      return next;
    });
    console.log('Global milestone shape set to:', shapeKey);
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

  const updateTimeScale = timeScale => {
    setViewState(prev => {
      const newState = { ...prev, timeScale };
      window.localStorage.setItem('gantt.timeScale', JSON.stringify(timeScale));
      return newState;
    });
    console.log('Time scale updated to:', timeScale);
  };

  const updatePrimaryTimeUnit = primaryTimeUnit => {
    setViewState(prev => {
      const newState = { ...prev, primaryTimeUnit };
      window.localStorage.setItem(
        'gantt.primaryTimeUnit',
        JSON.stringify(primaryTimeUnit)
      );
      return newState;
    });
    console.log('Primary time unit updated to:', primaryTimeUnit);
  };

  const updateSecondaryTimeUnit = secondaryTimeUnit => {
    setViewState(prev => {
      const newState = { ...prev, secondaryTimeUnit };
      window.localStorage.setItem(
        'gantt.secondaryTimeUnit',
        JSON.stringify(secondaryTimeUnit)
      );
      return newState;
    });
    console.log('Secondary time unit updated to:', secondaryTimeUnit);
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
    setActiveBaseline,
    updateBaselines,
    setGlobalMilestoneShape,
    zoomToFit,
    zoomIn,
    zoomOut,
    updateViewScale,
    updateTimeUnit,
    updateTimeScale,
    updatePrimaryTimeUnit,
    updateSecondaryTimeUnit,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};
