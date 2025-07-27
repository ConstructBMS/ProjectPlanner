import React from "react";
import { TaskProvider } from "./context/TaskContext";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import RibbonTabs from "./components/RibbonTabs/RibbonTabs";
import SidebarTree from "./components/SidebarTree";
import TaskGrid from "./components/TaskGrid";
import GanttChart from "./components/GanttChart";
import TaskPropertiesPane from "./components/TaskPropertiesPane";

export default function AppShell() {
  return (
    <TaskProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        {/* Ribbon Tabs */}
        <div className="border-b shadow-sm z-10">
          <RibbonTabs />
        </div>
        
        {/* Main Workspace with Resizable Panels */}
        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          {/* Sidebar */}
          <Panel 
            defaultSize={20} 
            minSize={15} 
            maxSize={30}
            className="bg-white border-r border-gray-300 overflow-hidden"
          >
            <SidebarTree />
          </Panel>
          
          {/* Sidebar Resize Handle */}
          <PanelResizeHandle className="w-3 bg-gray-200 hover:bg-blue-400 transition-colors duration-200 flex items-center justify-center group">
            <div className="w-1 h-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full" />
          </PanelResizeHandle>
          
          {/* Main Content Area */}
          <Panel className="flex-1">
            <PanelGroup direction="vertical" className="h-full">
              {/* Task Grid */}
              <Panel 
                defaultSize={50} 
                minSize={20} 
                maxSize={80}
                className="overflow-auto border-b border-gray-300"
              >
                <TaskGrid />
              </Panel>
              
              {/* Task/Gantt Resize Handle */}
              <PanelResizeHandle className="h-3 bg-gray-200 hover:bg-blue-400 transition-colors duration-200 flex items-center justify-center group">
                <div className="h-1 w-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full" />
              </PanelResizeHandle>
              
              {/* Gantt Chart */}
              <Panel className="overflow-auto">
                <GanttChart />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
        
        {/* Properties Pane */}
        <div className="h-[160px] border-t bg-gray-50 overflow-auto">
          <TaskPropertiesPane />
        </div>
      </div>
    </TaskProvider>
  );
}
