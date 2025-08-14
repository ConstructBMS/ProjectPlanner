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
import TaskGrid from './components/TaskGrid';
import GanttChart from './components/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';
import ResourcesPane from './components/Resources/ResourcesPane';
import Splitter from './components/common/Splitter';
import { getLayoutRatios, saveLayoutRatios, loadAllocationPreferences, setPaneVisible, setPaneWidth } from './utils/prefs';
import './styles/projectplanner.css';

function AppShellContent({ projectId, onBackToPortfolio }) {
  const sidebarRef = useRef();
  const contentRef = useRef();
  const { getPaneSize } = useLayoutContext();
  const [mainPaneRatios, setMainPaneRatios] = useState([0.2, 0.4, 0.4]);
  
  // Resources pane state
  const [resourcesPaneVisible, setResourcesPaneVisible] = useState(false);
  const [resourcesPaneWidth, setResourcesPaneWidth] = useState(320);

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

    const handleResourcesPaneWidthChange = (width) => {
      setResourcesPaneWidth(width);
      setPaneWidth(width);
    };

    window.addEventListener('RESOURCES_PANE_TOGGLE', handleResourcesPaneToggle);
    
    return () => {
      window.removeEventListener('RESOURCES_PANE_TOGGLE', handleResourcesPaneToggle);
    };
  }, []);

  const handleResourcesPaneClose = () => {
    setResourcesPaneVisible(false);
    setPaneVisible(false);
  };

  const handleResourcesPaneWidthChange = (width) => {
    setResourcesPaneWidth(width);
    setPaneWidth(width);
  };

  return (
    <div
      ref={contentRef}
              className='pm-app-shell'
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
            storageKey="pm.layout.main-panes"
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
