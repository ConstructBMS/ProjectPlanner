import React, { useState } from 'react';
import { TaskProvider } from './context/TaskContext';
import { ViewProvider, useViewContext } from './context/ViewContext';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import RibbonTabs from './components/RibbonTabs/RibbonTabs';
import SidebarTree from './components/SidebarTree';
import TaskGrid from './components/TaskGrid';
import GanttChart from './components/GanttChart';
import TaskPropertiesPane from './components/TaskPropertiesPane';

function AppShellContent() {
  const [resourcesVisible, setResourcesVisible] = useState(false);
  const { viewState, updateViewState, saveViewLayout } = useViewContext();

  const toggleResources = () => {
    const newResourcesVisible = !resourcesVisible;
    setResourcesVisible(newResourcesVisible);
    updateViewState({ resourcesVisible: newResourcesVisible });
    console.log('Resources pane visible =', newResourcesVisible);
  };

  const handleSaveView = () => {
    // Update view state with current values before saving
    updateViewState({
      resourcesVisible: resourcesVisible,
      propertiesPaneSize: resourcesVisible ? 20 : 25,
      resourcesPaneSize: resourcesVisible ? 20 : 0,
    });
    saveViewLayout();
  };

  return (
    <TaskProvider>
      <div className='h-screen w-screen flex flex-col overflow-hidden bg-white'>
        {/* Toolbar with Resources Toggle and Save View */}
        <div className='flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            <button
              onClick={toggleResources}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 ${
                resourcesVisible
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              title='Toggle Resources pane'
            >
              <span className='text-base'>👥</span>
              <span>Resources</span>
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleSaveView}
              className='flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-150'
              title='Save current view layout'
            >
              <span className='text-base'>💾</span>
              <span>Save View</span>
            </button>
          </div>
        </div>

        {/* Ribbon Tabs */}
        <div className='z-10'>
          <RibbonTabs />
        </div>

        {/* Main Workspace with Resizable Panels */}
        <PanelGroup direction='vertical' className='flex-1 overflow-hidden'>
          {/* Top Content Area */}
          <Panel
            defaultSize={resourcesVisible ? 60 : 75}
            minSize={resourcesVisible ? 40 : 50}
            maxSize={resourcesVisible ? 80 : 90}
          >
            <PanelGroup direction='horizontal' className='h-full'>
              {/* Sidebar */}
              <Panel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                className='asta-tree overflow-hidden'
              >
                <SidebarTree />
              </Panel>

              {/* Sidebar Resize Handle */}
              <PanelResizeHandle className='asta-resize-handle w-3 flex items-center justify-center group'>
                <div className='w-1 h-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full' />
              </PanelResizeHandle>

              {/* Main Content Area */}
              <Panel className='flex-1'>
                <PanelGroup direction='horizontal' className='h-full'>
                  {/* Task Grid */}
                  <Panel
                    defaultSize={40}
                    minSize={25}
                    maxSize={60}
                    className='asta-grid overflow-auto'
                  >
                    <TaskGrid />
                  </Panel>

                  {/* Task/Gantt Resize Handle */}
                  <PanelResizeHandle className='asta-resize-handle w-3 flex items-center justify-center group'>
                    <div className='w-1 h-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full' />
                  </PanelResizeHandle>

                  {/* Gantt Chart */}
                  <Panel className='asta-timeline overflow-auto'>
                    <GanttChart />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          {/* Resources Pane Resize Handle - Only show when resources are visible */}
          {resourcesVisible && (
            <PanelResizeHandle className='asta-resize-handle h-3 flex items-center justify-center group'>
              <div className='h-1 w-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full' />
            </PanelResizeHandle>
          )}

          {/* Resources Pane - Only show when resources are visible */}
          {resourcesVisible && (
            <Panel
              defaultSize={20}
              minSize={10}
              maxSize={40}
              className='asta-resources overflow-auto bg-gray-50'
            >
              <div className='p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  Resources
                </h3>
                <div className='space-y-3'>
                  <div className='bg-white p-3 rounded border border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-gray-700'>
                        Project Manager
                      </span>
                      <span className='text-sm text-gray-500'>100%</span>
                    </div>
                    <div className='mt-2 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-500 h-2 rounded-full'
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                  </div>
                  <div className='bg-white p-3 rounded border border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-gray-700'>
                        Developer
                      </span>
                      <span className='text-sm text-gray-500'>80%</span>
                    </div>
                    <div className='mt-2 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-green-500 h-2 rounded-full'
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  </div>
                  <div className='bg-white p-3 rounded border border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-gray-700'>
                        Designer
                      </span>
                      <span className='text-sm text-gray-500'>60%</span>
                    </div>
                    <div className='mt-2 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-yellow-500 h-2 rounded-full'
                        style={{ width: '45%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* Properties Pane Resize Handle */}
          <PanelResizeHandle className='asta-resize-handle h-3 flex items-center justify-center group'>
            <div className='h-1 w-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full' />
          </PanelResizeHandle>

          {/* Properties Pane */}
          <Panel
            defaultSize={resourcesVisible ? 20 : 25}
            minSize={10}
            maxSize={resourcesVisible ? 40 : 50}
            className='asta-properties overflow-auto'
          >
            <TaskPropertiesPane />
          </Panel>
        </PanelGroup>
      </div>
    </TaskProvider>
  );
}

export default function AppShell() {
  return (
    <ViewProvider>
      <AppShellContent />
    </ViewProvider>
  );
}
