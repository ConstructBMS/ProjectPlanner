 
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
import SidebarTree from './components/SidebarTree';
import TaskGrid from './components/TaskGrid/TaskGrid';
import GanttChart from './components/GanttChart/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';
import ResourcesPane from './components/Resources/ResourcesPane';
import ModelPanel from './components/FourD/ModelPanel';
import Splitter from './components/common/Splitter';
import { getLayoutRatios, saveLayoutRatios, loadAllocationPreferences, setPaneVisible, setPaneWidth, loadFourDPreferences, setFourDPanelVisible, setFourDPanelWidth } from './utils/prefs';
import { usePlannerStore } from './state/plannerStore';
import './styles/projectplanner.css';

function AppShellContent({ projectId, onBackToPortfolio }) {
  const sidebarRef = useRef();
  const contentRef = useRef();
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

  const handleExpandAll = () => {
    sidebarRef.current?.expandAll?.();
  };

  const handleCollapseAll = () => {
    sidebarRef.current?.collapseAll?.();
  };

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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Ribbon */}
      <RibbonContainer 
        isMinimised={isRibbonMinimised} 
        onToggleMinimise={() => setIsRibbonMinimised(!isRibbonMinimised)}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />
      
      {/* Loading State */}
      {hydrationState === 'loadingProjects' && (
        <div className="flex items-center justify-center p-8 flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
      )}
      
      {hydrationState === 'hydrating' && (
        <div className="flex items-center justify-center p-8 flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading project data...</p>
          </div>
        </div>
      )}
      
      {hydrationState === 'error' && (
        <div className="flex items-center justify-center p-8 flex-1">
          <div className="text-center">
            <div className="text-red-600 text-2xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium mb-2">Failed to load project data</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{hydrationError}</p>
            <button 
              onClick={() => init()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {hydrationState === 'ready' && (
        <div
          ref={contentRef}
          className={`pm-app-shell flex-1 ${isRibbonMinimised ? 'ribbon-minimised' : ''}`}
        >
          {/* Main Scroll Area - Single scroll container */}
          <div className='pm-main-scroll-area'>
            <div className='pm-pane-container'>
              <Splitter
                orientation="vertical"
                defaultRatios={[0.2, 0.4, 0.4]}
                minSizes={[220, 420, 480]}
                storageKey="main-panes"
                onRatiosChange={handleMainPaneRatiosChange}
              >
                {/* SidebarTree - Left pane */}
                <div className='pm-pane bg-white border-r border-gray-300'>
                  <SidebarTree ref={sidebarRef} />
                </div>

                {/* TaskGrid - Middle pane */}
                <div className='pm-pane bg-white border-r border-gray-300'>
                  <TaskGrid />
                </div>

                {/* GanttChart - Right pane */}
                <div className='pm-pane bg-white'>
                  <GanttChart />
                </div>
              </Splitter>
            </div>
          </div>

          {/* TaskPropertiesPane - Bottom pane, fixed height outside scroll area */}
          <TaskPropertiesPane />

          {/* Resources Pane - Right side panel */}
          {resourcesPaneVisible && (
            <div
              className="fixed right-0 top-0 h-full bg-white border-l border-gray-300 shadow-lg z-40"
              style={{ width: resourcesPaneWidth }}
            >
              <ResourcesPane
                onClose={() => setResourcesPaneVisible(false)}
                onWidthChange={setResourcesPaneWidth}
              />
            </div>
          )}

          {/* Model Panel - Right side panel */}
          {modelPanelVisible && (
            <div
              className="fixed right-0 top-0 h-full bg-white border-l border-gray-300 shadow-lg z-40"
              style={{ 
                width: modelPanelWidth,
                right: resourcesPaneVisible ? resourcesPaneWidth : 0
              }}
            >
              <ModelPanel
                onClose={() => setModelPanelVisible(false)}
                onWidthChange={setModelPanelWidth}
              />
            </div>
          )}
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
