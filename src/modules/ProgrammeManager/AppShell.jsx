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
  const { loadProjects } = usePlannerStore();

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

  // Initialize planner store on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
    <div
      ref={contentRef}
      className={`pm-app-shell ${isRibbonMinimised ? 'ribbon-minimised' : ''}`}
    >
      {/* Header Section - Fixed height, no scroll */}
      <div className='pm-header-section'>
        <RibbonContainer
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          contentRef={contentRef}
          projectId={projectId}
          onBackToPortfolio={onBackToPortfolio}
        />
      </div>

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
      <div className='pm-properties-pane bg-white border-t border-gray-300'>
        <TaskPropertiesPane />
      </div>

      {/* ResourcesPane - Right dock pane */}
      <ResourcesPane
        isVisible={resourcesPaneVisible}
        onClose={handleResourcesPaneClose}
        width={resourcesPaneWidth}
        onWidthChange={handleResourcesPaneWidthChange}
      />

      {/* ModelPanel - Right dock pane (below ResourcesPane if both open) */}
      <ModelPanel
        isVisible={modelPanelVisible}
        onClose={handleModelPanelClose}
        width={modelPanelWidth}
        onWidthChange={handleModelPanelWidthChange}
        position={resourcesPaneVisible ? 'bottom' : 'full'}
      />
    </div>
  );
}

export default function AppShell({ projectId, onBackToPortfolio }) {
  return (
    <UndoRedoProvider>
      <LayoutProvider>
        <FilterProvider>
          <SelectionProvider>
            <CalendarProvider>
              <ViewProvider>
                <TaskProvider>
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
                </TaskProvider>
              </ViewProvider>
            </CalendarProvider>
          </SelectionProvider>
        </FilterProvider>
      </LayoutProvider>
    </UndoRedoProvider>
  );
}
