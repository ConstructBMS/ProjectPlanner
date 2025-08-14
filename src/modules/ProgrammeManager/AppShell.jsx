 
import { useRef, useState, useEffect } from 'react';
import { TaskProvider } from './context/TaskContext';
import { ViewProvider } from './context/ViewContext';
import { CalendarProvider } from './context/CalendarContext';
import { SelectionProvider } from './context/SelectionContext';
import { FilterProvider } from './context/FilterContext';
import { LayoutProvider, useLayoutContext } from './context/LayoutContext';
import { UndoRedoProvider } from './context/UndoRedoContext';
import { GanttProvider } from './context/GanttContext';
import { SearchProvider } from './context/SearchContext';
import { UserProvider } from './context/UserContext';
import { ToastContainer } from './components/common/Toast';
import { useNetworkStatus } from './utils/net';
import RibbonContainer from '../../components/RibbonTabs/RibbonContainer';
import ProgrammeTree from './components/ProgrammeTree/ProgrammeTree.tsx';
import TaskGrid from './components/TaskGrid/TaskGrid';
import GanttChart from './components/GanttChart/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';
import ResourcesPane from './components/Resources/ResourcesPane';
import ModelPanel from './components/FourD/ModelPanel';
import Splitter from './components/common/Splitter';
import { getLayoutRatios, saveLayoutRatios, loadAllocationPreferences, setPaneVisible, setPaneWidth, loadFourDPreferences, setFourDPanelVisible, setFourDPanelWidth } from './utils/prefs';
import { usePlannerStore } from './state/plannerStore';
import './styles/projectplanner.css';
import './styles/AppShell.css';

function AppShellContent({ projectId, onBackToPortfolio }) {
  const [mainPaneRatios, setMainPaneRatios] = useState([0.2, 0.4, 0.4]);
  
  // Resources pane state
  const [resourcesPaneVisible, setResourcesPaneVisible] = useState(false);
  const [resourcesPaneWidth, setResourcesPaneWidth] = useState(320);
  
  // Model panel state
  const [modelPanelVisible, setModelPanelVisible] = useState(false);
  const [modelPanelWidth, setModelPanelWidth] = useState(320);
  
  // Ribbon minimise state
  const [isRibbonMinimised, setIsRibbonMinimised] = useState(false);

  // Planner store
  const { loadProjects, flushOfflineQueue, syncPending, init, hydrationState, hydrationError } = usePlannerStore();
  
  // Network status
  const networkStatus = useNetworkStatus();

  // Note: ProgrammeTree handles its own expand/collapse functionality

  // Load saved layout ratios and allocation preferences on mount
  useEffect(() => {
    const savedRatios = getLayoutRatios('main-panes');
    if (savedRatios) {
      setMainPaneRatios(savedRatios);
    }
    
    // Load allocation preferences
    const allocationPrefs = loadAllocationPreferences();
    setResourcesPaneVisible(allocationPrefs.paneVisible);
    setResourcesPaneWidth(allocationPrefs.paneWidth);
    
    // Load 4D preferences
    const fourDPrefs = loadFourDPreferences();
    setModelPanelVisible(fourDPrefs.panelVisible);
    setModelPanelWidth(fourDPrefs.panelWidth);
  }, []);

  // Initialize hydration pipeline on mount
  useEffect(() => {
    console.log('AppShell: Initializing hydration pipeline...');
    init().catch(error => {
      console.error('AppShell: Failed to initialize hydration pipeline:', error);
    });
  }, [init]);

  // Initialize planner store on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Auto-flush offline queue when network comes back online
  useEffect(() => {
    if (networkStatus.isOnline && syncPending) {
      console.log('Network back online, flushing offline queue...');
      flushOfflineQueue().catch(error => {
        console.error('Failed to flush offline queue:', error);
      });
    }
  }, [networkStatus.isOnline, syncPending, flushOfflineQueue]);

  // Set up realtime event listeners
  useEffect(() => {
    const handleTaskRealtimeUpdate = (event) => {
      const { handleRealtimeUpdate } = usePlannerStore.getState();
      handleRealtimeUpdate(event);
    };

    const handleTaskLinkRealtimeUpdate = (event) => {
      const { handleRealtimeLinkUpdate } = usePlannerStore.getState();
      handleRealtimeLinkUpdate(event);
    };

    // Add event listeners
    window.addEventListener('TASK_REALTIME_UPDATE', handleTaskRealtimeUpdate);
    window.addEventListener('TASK_LINK_REALTIME_UPDATE', handleTaskLinkRealtimeUpdate);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('TASK_REALTIME_UPDATE', handleTaskRealtimeUpdate);
      window.removeEventListener('TASK_LINK_REALTIME_UPDATE', handleTaskLinkRealtimeUpdate);
    };
  }, []);

  // Handle main pane ratios change
  const handleMainPaneRatiosChange = (ratios) => {
    setMainPaneRatios(ratios);
    saveLayoutRatios('main-panes', ratios);
  };

  // Handle resources pane events
  useEffect(() => {
    const handleResourcesPaneToggle = (event) => {
      const { visible } = event.detail;
      setResourcesPaneVisible(visible);
      setPaneVisible(visible);
    };

    window.addEventListener('RESOURCES_PANE_TOGGLE', handleResourcesPaneToggle);
    
    return () => {
      window.removeEventListener('RESOURCES_PANE_TOGGLE', handleResourcesPaneToggle);
    };
  }, []);

  // Handle resources pane width changes
  const handleResourcesPaneWidthChange = (width) => {
    setResourcesPaneWidth(width);
    setPaneWidth(width);
  };

  // Handle model panel events
  useEffect(() => {
    const handleModelPanelToggle = (event) => {
      const { visible } = event.detail;
      setModelPanelVisible(visible);
      setFourDPanelVisible(visible);
    };

    window.addEventListener('MODEL_PANEL_TOGGLE', handleModelPanelToggle);
    
    return () => {
      window.removeEventListener('MODEL_PANEL_TOGGLE', handleModelPanelToggle);
    };
  }, []);

  // Handle ribbon minimise state changes
  useEffect(() => {
    const handleRibbonMinimiseChange = (event) => {
      const { minimised } = event.detail;
      setIsRibbonMinimised(minimised);
    };

    window.addEventListener('RIBBON_MINIMISE_CHANGE', handleRibbonMinimiseChange);
    
    return () => {
      window.removeEventListener('RIBBON_MINIMISE_CHANGE', handleRibbonMinimiseChange);
    };
  }, []);

  const handleResourcesPaneClose = () => {
    setResourcesPaneVisible(false);
    setPaneVisible(false);
  };



  const handleModelPanelClose = () => {
    setModelPanelVisible(false);
    setFourDPanelVisible(false);
  };

  const handleModelPanelWidthChange = (width) => {
    setModelPanelWidth(width);
    setFourDPanelWidth(width);
  };

  // Loading and error states
  if (hydrationState === 'loadingProjects') {
    return (
      <div className="pm-app-shell">
        <div className="pm-loading-container">
          <div className="pm-loading-spinner">
            <div className="spinner" />
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (hydrationState === 'hydrating') {
    return (
      <div className="pm-app-shell">
        <div className="pm-loading-container">
          <div className="pm-loading-spinner">
            <div className="spinner" />
            <p className="text-gray-600 dark:text-gray-400">Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (hydrationState === 'error') {
    return (
      <div className="pm-app-shell">
        <div className="pm-error-container">
          <div className="pm-error-content">
            <div className="pm-error-icon">⚠️</div>
            <div className="pm-error-title">Failed to load project data</div>
            <div className="pm-error-message">{hydrationError}</div>
            <button 
              onClick={() => init()}
              className="pm-error-retry"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pm-app-shell ${isRibbonMinimised ? 'ribbon-minimised' : ''}`}>
      {/* Fixed Header Container - wraps search/breadcrumb/ribbon */}
      <div className="pm-header-container">
        <RibbonContainer 
          isMinimised={isRibbonMinimised} 
          onToggleMinimise={() => setIsRibbonMinimised(!isRibbonMinimised)}
          projectId={projectId}
          onBackToPortfolio={onBackToPortfolio}
        />
      </div>
      
      {/* Main Content Area - Single Scroll Container */}
      {hydrationState === 'ready' && (
        <div className="pm-main-content">
          {/* Pane Row - Tree | Grid | Gantt */}
          <div className="pm-pane-row">
            <Splitter
              orientation="vertical"
              defaultRatios={[0.2, 0.4, 0.4]}
              minSizes={[220, 420, 480]}
              storageKey="main-panes"
              onRatiosChange={handleMainPaneRatiosChange}
            >
              {/* ProgrammeTree - Left pane */}
              <div className='pm-pane pm-pane-tree'>
                <ProgrammeTree />
              </div>

              {/* TaskGrid - Middle pane */}
              <div className='pm-pane pm-pane-grid'>
                <TaskGrid />
              </div>

              {/* GanttChart - Right pane */}
              <div className='pm-pane pm-pane-gantt'>
                <GanttChart />
              </div>
            </Splitter>
          </div>

          {/* TaskPropertiesPane - Bottom pane, fixed height outside scroll area */}
          <TaskPropertiesPane />
        </div>
      )}

      {/* Resources Pane - Right side panel */}
      {resourcesPaneVisible && (
        <div
          className="pm-side-panel"
          style={{ width: resourcesPaneWidth }}
        >
          <ResourcesPane
            onClose={handleResourcesPaneClose}
            onWidthChange={setResourcesPaneWidth}
          />
        </div>
      )}

      {/* Model Panel - Right side panel */}
      {modelPanelVisible && (
        <div
          className="pm-side-panel"
          style={{ 
            width: modelPanelWidth,
            right: resourcesPaneVisible ? resourcesPaneWidth : 0
          }}
        >
          <ModelPanel
            onClose={handleModelPanelClose}
            onWidthChange={handleModelPanelWidthChange}
          />
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default function AppShell({ projectId, onBackToPortfolio }) {
  return (
    <UndoRedoProvider>
      <LayoutProvider>
        <FilterProvider>
          <CalendarProvider>
            <ViewProvider>
              <TaskProvider>
                <SelectionProvider>
                  <GanttProvider>
                    <SearchProvider>
                      <UserProvider>
                        <AppShellContent
                          projectId={projectId}
                          onBackToPortfolio={onBackToPortfolio}
                        />
                      </UserProvider>
                    </SearchProvider>
                  </GanttProvider>
                </SelectionProvider>
              </TaskProvider>
            </ViewProvider>
          </CalendarProvider>
        </FilterProvider>
      </LayoutProvider>
    </UndoRedoProvider>
  );
}
