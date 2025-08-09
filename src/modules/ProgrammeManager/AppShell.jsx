import { useRef } from 'react';
import { TaskProvider } from './context/TaskContext';
import { ViewProvider } from './context/ViewContext';
import { CalendarProvider } from './context/CalendarContext';
import RibbonTabs from './components/RibbonTabs/RibbonTabs';
import SidebarTree from './components/SidebarTree';
import TaskGrid from './components/TaskGrid';
import GanttChart from './components/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';

function AppShellContent() {
  const sidebarRef = useRef();

  const handleExpandAll = () => {
    sidebarRef.current?.expandAll?.();
  };

  const handleCollapseAll = () => {
    sidebarRef.current?.collapseAll?.();
  };
  return (
    <TaskProvider>
      <div className='h-screen w-screen flex flex-col overflow-hidden bg-gray-100'>
        {/* RibbonTabs - Fixed at top, full width */}
        <div className='z-10'>
          <RibbonTabs
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
          />
        </div>

        {/* Main Content Area - Flex row with three panes */}
        <div className='flex-1 flex overflow-hidden'>
          {/* SidebarTree - Left pane (~20%) */}
          <div className='w-1/5 min-w-[200px] max-w-[300px] bg-white border-r border-gray-300 overflow-auto'>
            <SidebarTree ref={sidebarRef} />
          </div>

          {/* TaskGrid - Middle pane (~40%) */}
          <div className='w-2/5 min-w-[300px] bg-white border-r border-gray-300 overflow-auto'>
            <TaskGrid />
          </div>

          {/* GanttChart - Right pane (~40%) */}
          <div className='flex-1 bg-white overflow-auto'>
            <GanttChart />
          </div>
        </div>

        {/* TaskPropertiesPane - Bottom pane, full width */}
        <div className='h-64 min-h-[200px] max-h-[400px] bg-white border-t border-gray-300 overflow-auto'>
          <TaskPropertiesPane />
        </div>
      </div>
    </TaskProvider>
  );
}

export default function AppShell() {
  return (
    <CalendarProvider>
      <ViewProvider>
        <AppShellContent />
      </ViewProvider>
    </CalendarProvider>
  );
}
