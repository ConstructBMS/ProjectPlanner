import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TaskGrid from './TaskGrid';
import GanttChart from './GanttChart';

const ResizableTaskGanttArea = () => {
  return (
    <PanelGroup direction='vertical' className='flex-1 overflow-hidden'>
      {/* Task Grid Area */}
      <Panel
        defaultSize={50}
        minSize={20}
        maxSize={80}
        className='overflow-auto border-b border-gray-300'
      >
        <TaskGrid />
      </Panel>

      {/* Resizable Divider */}
      <PanelResizeHandle className='h-3 bg-gray-200 hover:bg-blue-400 transition-colors duration-200 flex items-center justify-center group'>
        <div className='h-1 w-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full' />
      </PanelResizeHandle>

      {/* Gantt Chart Area */}
      <Panel className='overflow-auto'>
        <GanttChart />
      </Panel>
    </PanelGroup>
  );
};

export default ResizableTaskGanttArea;
