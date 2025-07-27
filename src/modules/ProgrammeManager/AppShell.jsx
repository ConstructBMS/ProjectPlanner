import React from "react";
import { TaskProvider } from "./context/TaskContext";
import RibbonTabs from "./components/RibbonTabs/RibbonTabs";
import ResizableSidebar from "./components/ResizableSidebar";
import ResizableTaskGanttArea from "./components/ResizableTaskGanttArea";
import TaskPropertiesPane from "./components/TaskPropertiesPane";

export default function AppShell() {
  return (
    <TaskProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        {/* Ribbon Tabs */}
        <div className="border-b shadow-sm z-10">
          <RibbonTabs />
        </div>
        
        {/* Main Workspace */}
        <div className="flex flex-1 overflow-hidden">
          {/* Resizable Sidebar */}
          <ResizableSidebar 
            minWidth={150}
            maxWidth={400}
            defaultWidth={250}
          />
          
          {/* Resizable Task Grid + Gantt Chart Area */}
          <ResizableTaskGanttArea 
            minTaskHeight={100}
            minGanttHeight={100}
            defaultTaskHeight="50%"
          />
        </div>
        
        {/* Properties Pane */}
        <div className="h-[160px] border-t bg-gray-50 overflow-auto">
          <TaskPropertiesPane />
        </div>
      </div>
    </TaskProvider>
  );
}
