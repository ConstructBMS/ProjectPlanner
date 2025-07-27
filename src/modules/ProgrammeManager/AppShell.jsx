import React from 'react';
import RibbonTabs from './components/RibbonTabs/RibbonTabs';
import SidebarTree from './components/SidebarTree';
import TaskGrid from './components/TaskGrid';
import GanttChart from './components/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';

export default function AppShell() {
  return (
    <div className='h-screen w-screen flex flex-col overflow-hidden'>
      {/* Ribbon Tabs */}
      <div className='border-b shadow-sm z-10'>
        <RibbonTabs />
      </div>

      {/* Main Workspace */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar Tree */}
        <div className='w-[250px] bg-white border-r overflow-auto'>
          <SidebarTree />
        </div>

        {/* Task Grid + Gantt */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          <div className='flex flex-1 overflow-hidden'>
            <div className='w-[400px] border-r overflow-auto'>
              <TaskGrid />
            </div>
            <div className='flex-1 overflow-auto'>
              <GanttChart />
            </div>
          </div>

          {/* Properties Pane */}
          <div className='h-[160px] border-t bg-gray-50 overflow-auto'>
            <TaskPropertiesPane />
          </div>
        </div>
      </div>
    </div>
  );
}
