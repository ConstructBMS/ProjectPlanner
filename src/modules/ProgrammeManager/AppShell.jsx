import React, { useRef } from "react";
import RibbonTabs from "./components/RibbonTabs/RibbonTabs";
import SidebarTree from "./components/SidebarTree";
import TaskGrid from "./components/TaskGrid";
import GanttChart from "./components/GanttChart";
import TaskPropertiesPane from "./components/TaskPropertiesPane";

export default function AppShell() {
  const sidebarTreeRef = useRef();

  // Handler for ribbon button actions
  const handleRibbonAction = (actionName) => {
    console.log(`AppShell Action: ${actionName}`);

    // Handle expand/collapse actions
    if (actionName === 'Expand All' && sidebarTreeRef.current) {
      sidebarTreeRef.current.expandAll();
    } else if (actionName === 'Collapse All' && sidebarTreeRef.current) {
      sidebarTreeRef.current.collapseAll();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden z-0">
      {/* Ribbon Tabs - Fixed height with proper z-index */}
      <div className="border-b shadow-sm z-10 h-[156px] relative">
        <RibbonTabs onAction={handleRibbonAction} />
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden z-0">
        {/* Sidebar Tree - Fixed width */}
        <SidebarTree ref={sidebarTreeRef} />

        {/* Main Content Area - Flexible */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <div className="w-[400px] border-r overflow-auto">
              <TaskGrid />
            </div>
            <div className="flex-1 overflow-auto">
              <GanttChart />
            </div>
          </div>

          {/* Properties Pane - Fixed height */}
          <div className="h-[160px] border-t bg-gray-50 overflow-auto">
            <TaskPropertiesPane />
          </div>
        </div>
      </div>
    </div>
  );
}
