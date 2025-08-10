import { useRef } from 'react';
import { TaskProvider } from './context/TaskContext';
import { ViewProvider } from './context/ViewContext';
import { CalendarProvider } from './context/CalendarContext';
import { SelectionProvider } from './context/SelectionContext';
import { FilterProvider } from './context/FilterContext';
import { LayoutProvider } from './context/LayoutContext';
import { UndoRedoProvider } from './context/UndoRedoContext';
import { GanttProvider } from './context/GanttContext';
import RibbonTabs from './components/RibbonTabs/RibbonTabs';
import SidebarTree from './components/SidebarTree';
import TaskGrid from './components/TaskGrid';
import GanttChart from './components/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';

function AppShellContent({ projectId, onBackToPortfolio }) {
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
      <div
        ref={contentRef}
        className='h-screen w-screen flex flex-col overflow-hidden bg-gray-100'
      >
        {/* Header with Back to Portfolio Button */}
        <div className='z-10 bg-white border-b border-gray-200'>
          <div className='flex items-center justify-between px-4 py-2'>
            <button
              onClick={onBackToPortfolio}
              className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              ← Back to Portfolio
            </button>
            <div className='text-sm text-gray-500'>
              {projectId ? `Project ID: ${projectId}` : 'Current Project'}
            </div>
          </div>
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

export default function AppShell({ projectId, onBackToPortfolio }) {
  return (
    <UndoRedoProvider>
      <LayoutProvider>
        <FilterProvider>
          <SelectionProvider>
            <CalendarProvider>
              <ViewProvider>
                <GanttProvider>
                  <AppShellContent projectId={projectId} onBackToPortfolio={onBackToPortfolio} />
                </GanttProvider>
              </ViewProvider>
            </CalendarProvider>
          </SelectionProvider>
        </FilterProvider>
      </LayoutProvider>
    </UndoRedoProvider>
  );
}
