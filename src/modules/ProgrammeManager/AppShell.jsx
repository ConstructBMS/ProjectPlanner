import { useRef } from 'react';
import { TaskProvider } from './context/TaskContext';
import { ViewProvider } from './context/ViewContext';
import { CalendarProvider } from './context/CalendarContext';
import { SelectionProvider } from './context/SelectionContext';
import { FilterProvider } from './context/FilterContext';
import { LayoutProvider } from './context/LayoutContext';
import RibbonTabs from './components/RibbonTabs/RibbonTabs';
import SidebarTree from './components/SidebarTree';
import TaskGrid from './components/TaskGrid';
import GanttChart from './components/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';

function AppShellContent() {
  const sidebarRef = useRef();
  const contentRef = useRef();
  const { getPaneSize } = useLayoutContext();

  const handleExpandAll = () => {
    sidebarRef.current?.expandAll?.();
  };

  const handleCollapseAll = () => {
    sidebarRef.current?.collapseAll?.();
  };
  return (
    <TaskProvider>
      <div ref={contentRef} className='h-screen w-screen flex flex-col overflow-hidden bg-gray-100'>
        {/* RibbonTabs - Fixed at top, full width */}
        <div className='z-10'>
          <RibbonTabs
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            contentRef={contentRef}
          />
        </div>

        {/* Main Content Area - Flex row with three panes */}
        <div className='flex-1 flex overflow-hidden'>
          {/* SidebarTree - Left pane */}
          <div
            className='bg-white border-r border-gray-300 overflow-auto'
            style={{
              width:
                getPaneSize('sidebar') === 'flex-1'
                  ? '300px'
                  : getPaneSize('sidebar'),
              minWidth: '200px',
              maxWidth: '400px',
            }}
          >
            <SidebarTree ref={sidebarRef} />
          </div>

          {/* TaskGrid - Middle pane */}
          <div className='flex-1 bg-white border-r border-gray-300 overflow-auto'>
            <TaskGrid />
          </div>

          {/* GanttChart - Right pane */}
          <div className='flex-1 bg-white overflow-auto'>
            <GanttChart />
          </div>
        </div>

        {/* TaskPropertiesPane - Bottom pane, full width */}
        <div
          className='bg-white border-t border-gray-300 overflow-auto'
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
    </TaskProvider>
  );
}

export default function AppShell() {
  return (
    <LayoutProvider>
      <FilterProvider>
        <SelectionProvider>
          <CalendarProvider>
            <ViewProvider>
              <AppShellContent />
            </ViewProvider>
          </CalendarProvider>
        </SelectionProvider>
      </FilterProvider>
    </LayoutProvider>
  );
}
