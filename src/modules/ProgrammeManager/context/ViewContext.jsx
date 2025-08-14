 
import { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/persistentStorage.js';

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
    showProgressLine: false, // Toggle for showing progress line overlay

    // Timestamp
    savedAt: null,
  });

  // Load saved view state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        // Load saved view state
        const savedView = await getStorage('plannerView');
        if (savedView) {
          setViewState(prev => ({ ...prev, ...savedView }));
        }

        // Load saved date markers
        const savedMarkers = await getStorage('dateMarkers');
        if (savedMarkers) {
          setViewState(prev => ({ ...prev, dateMarkers: savedMarkers }));
        }

        // Load saved showWeekends preference
        const savedShowWeekends = await getStorage('gantt.showWeekends');
        if (savedShowWeekends !== null) {
          setViewState(prev => ({ ...prev, showWeekends: savedShowWeekends }));
        }

        // Load saved showGridlines preference
        const savedShowGridlines = await getStorage('gantt.showGridlines');
        if (savedShowGridlines !== null) {
          try {
            const showGridlines = savedShowGridlines;
            setViewState(prev => ({ ...prev, showGridlines }));
          } catch (error) {
            console.error('Error loading saved showGridlines preference:', error);
          }
        }

        // Load saved showCriticalPath preference
        const savedShowCriticalPath = await getStorage('gantt.showCriticalPath');
        if (savedShowCriticalPath !== null) {
          try {
            const showCriticalPath = savedShowCriticalPath;
            setViewState(prev => ({ ...prev, showCriticalPath }));
          } catch (error) {
            console.error(
              'Error loading saved showCriticalPath preference:',
              error
            );
          }
        }

        // Load saved showSlack preference
        const savedShowSlack = await getStorage('gantt.showSlack');
        if (savedShowSlack !== null) {
          try {
            const showSlack = savedShowSlack;
            setViewState(prev => ({ ...prev, showSlack }));
          } catch (error) {
            console.error('Error loading saved showSlack preference:', error);
          }
        }

        // Load saved showProgressLine preference
        const savedShowProgressLine = await getStorage('gantt.showProgressLine');
        if (savedShowProgressLine !== null) {
          try {
            const showProgressLine = savedShowProgressLine;
            setViewState(prev => ({ ...prev, showProgressLine }));
          } catch (error) {
            console.error('Error loading saved showProgressLine preference:', error);
          }
        }

        // Load saved time unit preference
        const savedTimeUnit = await getStorage('gantt.timeUnit');
        if (savedTimeUnit !== null) {
          try {
            const timeUnit = savedTimeUnit;
            setViewState(prev => ({ ...prev, timeUnit }));
          } catch (error) {
            console.error('Error loading saved time unit preference:', error);
          }
        }

        // Load saved time scale preference
        const savedTimeScale = await getStorage('gantt.timeScale');
        if (savedTimeScale !== null) {
          try {
            const timeScale = savedTimeScale;
            setViewState(prev => ({ ...prev, timeScale }));
          } catch (error) {
            console.error('Error loading saved time scale preference:', error);
          }
        }

        // Load saved primary time unit preference
        const savedPrimaryTimeUnit = await getStorage('gantt.primaryTimeUnit');
        if (savedPrimaryTimeUnit !== null) {
          try {
            const primaryTimeUnit = savedPrimaryTimeUnit;
            setViewState(prev => ({ ...prev, primaryTimeUnit }));
          } catch (error) {
            console.error(
              'Error loading saved primary time unit preference:',
              error
            );
          }
        }

        // Load saved secondary time unit preference
        const savedSecondaryTimeUnit = await getStorage('gantt.secondaryTimeUnit');
        if (savedSecondaryTimeUnit !== null) {
          try {
            const secondaryTimeUnit = savedSecondaryTimeUnit;
            setViewState(prev => ({ ...prev, secondaryTimeUnit }));
          } catch (error) {
            console.error(
              'Error loading saved secondary time unit preference:',
              error
            );
          }
        }

        // Load saved activeBaselineId preference
        const savedActiveBaselineId = await getStorage('gantt.activeBaselineId');
        if (savedActiveBaselineId !== null) {
          try {
            const activeBaselineId = savedActiveBaselineId;
            setViewState(prev => ({ ...prev, activeBaselineId }));
          } catch (error) {
            console.error(
              'Error loading saved activeBaselineId preference:',
              error
            );
          }
        }

        // Load saved globalMilestoneShape preference
        const savedGlobalMilestoneShape = await getStorage('gantt.globalMilestoneShape');
        if (savedGlobalMilestoneShape !== null) {
          try {
            const globalMilestoneShape = savedGlobalMilestoneShape;
            setViewState(prev => ({ ...prev, globalMilestoneShape }));
          } catch (error) {
            console.error(
              'Error loading saved globalMilestoneShape preference:',
              error
            );
          }
        }
      } catch (error) {
        console.error('Error loading saved view state:', error);
      }
    };

    loadSavedState();
  }, []);

  const updateViewState = updates => {
    setViewState(prev => ({ ...prev, ...updates }));
  };

  const saveViewLayout = async () => {
    const currentState = {
      ...viewState,
      savedAt: new Date().toISOString(),
    };

    await setStorage('plannerView', currentState);
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

  const toggleWeekends = async () => {
    setViewState(prev => {
      const next = !prev.showWeekends;
      setStorage('gantt.showWeekends', next);
      return { ...prev, showWeekends: next };
    });
    console.log('Show Weekends toggled');
  };

  const toggleGridlines = async () => {
    setViewState(prev => {
      const next = !prev.showGridlines;
      setStorage('gantt.showGridlines', next);
      return { ...prev, showGridlines: next };
    });
    console.log('Show Gridlines toggled');
  };

  const toggleCriticalPath = async () => {
    setViewState(prev => {
      const next = !prev.showCriticalPath;
      setStorage('gantt.showCriticalPath', next);
      return { ...prev, showCriticalPath: next };
    });
    console.log('Show Critical Path toggled');
  };

  const toggleProgressLine = async () => {
    setViewState(prev => {
      const next = !prev.showProgressLine;
      setStorage('gantt.showProgressLine', next);
      return { ...prev, showProgressLine: next };
    });
    console.log('Show Progress Line toggled');
  };

  const toggleSlack = async () => {
    setViewState(prev => {
      const next = !prev.showSlack;
      setStorage('gantt.showSlack', next);
      return { ...prev, showSlack: next };
    });
    console.log('Show Slack toggled');
  };

  const toggleBaseline = async () => {
    setViewState(prev => {
      const next = !prev.showBaseline;
      setStorage('gantt.showBaseline', next);
      return { ...prev, showBaseline: next };
    });
    console.log('Show Baseline toggled');
  };

  const setActiveBaseline = async (baselineId) => {
    setViewState(prev => {
      const next = {
        ...prev,
        activeBaselineId: baselineId,
        showBaseline: baselineId !== null, // Auto-show baseline when one is selected
      };
      setStorage('gantt.activeBaselineId', baselineId);
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

  const setGlobalMilestoneShape = async (shapeKey) => {
    setViewState(prev => {
      const next = {
        ...prev,
        globalMilestoneShape: shapeKey,
      };
      setStorage('gantt.globalMilestoneShape', shapeKey);
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

  const updateTimeUnit = async (timeUnit) => {
    setViewState(prev => {
      const newState = { ...prev, timeUnit };
      setStorage('gantt.timeUnit', timeUnit);
      return newState;
    });
    console.log('Time unit updated to:', timeUnit);
  };

  const updateTimeScale = async (timeScale) => {
    setViewState(prev => {
      const newState = { ...prev, timeScale };
      setStorage('gantt.timeScale', timeScale);
      return newState;
    });
    console.log('Time scale updated to:', timeScale);
  };

  const updatePrimaryTimeUnit = async (primaryTimeUnit) => {
    setViewState(prev => {
      const newState = { ...prev, primaryTimeUnit };
      setStorage('gantt.primaryTimeUnit', primaryTimeUnit);
      return newState;
    });
    console.log('Primary time unit updated to:', primaryTimeUnit);
  };

  const updateSecondaryTimeUnit = async (secondaryTimeUnit) => {
    setViewState(prev => {
      const newState = { ...prev, secondaryTimeUnit };
      setStorage('gantt.secondaryTimeUnit', secondaryTimeUnit);
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
    toggleProgressLine,
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
