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
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
        {/* Ribbon Tabs */}
        <div className="z-10">
          <RibbonTabs />
        </div>
        
        {/* Main Workspace with Resizable Panels */}
        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          {/* Sidebar */}
          <Panel 
            defaultSize={20} 
            minSize={15} 
            maxSize={30}
            className="asta-tree overflow-hidden"
          >
            <SidebarTree />
          </Panel>
          
          {/* Sidebar Resize Handle */}
          <PanelResizeHandle className="asta-resize-handle w-3 flex items-center justify-center group">
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
                className="asta-grid overflow-auto"
              >
                <TaskGrid />
              </Panel>
              
              {/* Task/Gantt Resize Handle */}
              <PanelResizeHandle className="asta-resize-handle h-3 flex items-center justify-center group">
                <div className="h-1 w-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full" />
              </PanelResizeHandle>
              
              {/* Gantt Chart */}
              <Panel className="asta-timeline overflow-auto">
                <GanttChart />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
        
        {/* Properties Pane */}
        <div className="asta-properties h-[160px] overflow-auto">
          <TaskPropertiesPane />
        </div>
      </div>
    </TaskProvider>
  );
}
