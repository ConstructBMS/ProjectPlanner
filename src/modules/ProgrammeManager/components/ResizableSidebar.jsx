import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import SidebarTree from './SidebarTree';

const ResizableSidebar = () => {
  return (
    <PanelGroup direction='horizontal' className='h-full'>
      <Panel
        defaultSize={25}
        minSize={15}
        maxSize={40}
        className='bg-white border-r border-gray-300 overflow-hidden'
      >
        <SidebarTree />
      </Panel>

      <PanelResizeHandle className='w-3 bg-gray-200 hover:bg-blue-400 transition-colors duration-200 flex items-center justify-center group'>
        <div className='w-1 h-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full' />
      </PanelResizeHandle>

      <Panel className='flex-1'>
        {/* This panel will be used by the parent component */}
      </Panel>
    </PanelGroup>
  );
};

export default ResizableSidebar;
