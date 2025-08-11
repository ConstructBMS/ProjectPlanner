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
import Splitter from './components/common/Splitter';
import { getLayoutRatios, saveLayoutRatios } from './utils/prefs';
import './styles/projectplanner.css';

function AppShellContent({ projectId, onBackToPortfolio }) {
  const sidebarRef = useRef();
  const contentRef = useRef();
  const { getPaneSize } = useLayoutContext();
  const [mainPaneRatios, setMainPaneRatios] = useState([0.2, 0.4, 0.4]);
  const [propertiesPaneHeight, setPropertiesPaneHeight] = useState(0.25);

  const handleExpandAll = () => {
    sidebarRef.current?.expandAll?.();
  };

  const handleCollapseAll = () => {
    sidebarRef.current?.collapseAll?.();
  };

  // Load saved layout ratios on mount
  useEffect(() => {
    const savedRatios = getLayoutRatios('main-panes');
    if (savedRatios) {
      setMainPaneRatios(savedRatios);
    }
  }, []);

  // Handle main pane ratios change
  const handleMainPaneRatiosChange = (ratios) => {
    setMainPaneRatios(ratios);
    saveLayoutRatios('main-panes', ratios);
  };

  return (
    <div
      ref={contentRef}
      className='h-screen w-screen flex flex-col overflow-hidden bg-gray-100'
    >
      {/* Ribbon Container with persistent state */}
      <RibbonContainer
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        contentRef={contentRef}
        projectId={projectId}
        onBackToPortfolio={onBackToPortfolio}
      />

      {/* Main Content Area - Resizable panes */}
      <div className='flex-1 overflow-hidden'>
        <Splitter
          orientation="vertical"
          defaultRatios={[0.2, 0.4, 0.4]}
          minSizes={[220, 420, 480]}
          storageKey="pm.layout.main-panes"
          onRatiosChange={handleMainPaneRatiosChange}
        >
          {/* SidebarTree - Left pane */}
          <div className='bg-white border-r border-gray-300 tree-scroll-container'>
            <SidebarTree ref={sidebarRef} />
          </div>

          {/* TaskGrid - Middle pane */}
          <div className='bg-white border-r border-gray-300 grid-scroll-container'>
            <TaskGrid />
          </div>

          {/* GanttChart - Right pane */}
          <div className='bg-white gantt-scroll-container'>
            <GanttChart />
          </div>
        </Splitter>
      </div>

      {/* TaskPropertiesPane - Bottom pane, full width */}
      <div
        className='bg-white border-t border-gray-300 properties-scroll-container'
        style={{
          height:
            getPaneSize('properties') === 'flex-1'
              ? '256px'
              : getPaneSize('properties'),
          minHeight: '200px',
          maxHeight: '400px',
        }}
      >
        <TaskPropertiesPane />
      </div>
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
