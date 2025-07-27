import React, { useState, useRef, useEffect } from 'react';

const TaskPropertiesPane = () => {
  const [paneHeight, setPaneHeight] = useState(250); // Initial height
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const resizeHandleRef = useRef(null);

  // Mouse event handlers for resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setStartY(e.clientY);
    setStartHeight(paneHeight);
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const deltaY = startY - e.clientY; // Inverted for intuitive dragging
    const newHeight = Math.max(100, Math.min(600, startHeight + deltaY)); // Min 100px, Max 600px
    
    setPaneHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    
    // Remove global mouse event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className="bg-gray-50 border-t border-gray-200 shadow-inner flex flex-col overflow-hidden"
      style={{ height: `${paneHeight}px` }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className="h-1.5 bg-gray-300 hover:bg-blue-400 cursor-row-resize transition-colors duration-200 ease-in-out flex items-center justify-center group"
        onMouseDown={handleMouseDown}
        title="Drag to resize pane"
      >
        {/* Handle indicator dots */}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Pane Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-semibold text-gray-700">Task Properties</h3>
        <p className="text-xs text-gray-500 mt-1">Task details and settings</p>
        <p className="text-xs text-blue-600 mt-1">
          💡 Tip: Drag the handle above to resize this pane
        </p>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="text-center">
          <div className="text-xl text-gray-400 mb-2">⚙️</div>
          <div className="text-sm font-medium text-gray-600 mb-1">Properties Panel</div>
          <div className="text-xs text-gray-500 mb-4">Task details and settings will appear here</div>
          
          {/* Sample content to demonstrate scrolling */}
          <div className="space-y-3 text-left">
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Task Information</div>
              <div className="text-xs text-gray-500">Name, description, and basic details</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Schedule</div>
              <div className="text-xs text-gray-500">Start date, end date, duration</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Resources</div>
              <div className="text-xs text-gray-500">Assigned resources and costs</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Dependencies</div>
              <div className="text-xs text-gray-500">Predecessors and successors</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Progress</div>
              <div className="text-xs text-gray-500">Completion percentage and status</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded p-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Notes</div>
              <div className="text-xs text-gray-500">Additional comments and notes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pane Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-100">
        <div className="text-xs text-gray-500">
          Pane height: {paneHeight}px • Drag handle to resize • Min: 100px • Max: 600px
        </div>
      </div>
    </div>
  );
};

export default TaskPropertiesPane;
