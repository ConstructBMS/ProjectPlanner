import React, { useState, useRef, useCallback } from 'react';
import SidebarTree from './SidebarTree';

const ResizableSidebar = ({ minWidth = 150, maxWidth = 400, defaultWidth = 250 }) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
    console.log('Mouse down on sidebar divider');
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Change cursor globally
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    console.log('Resizing sidebar:', { deltaX, newWidth, isDragging });
    setWidth(newWidth);
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    console.log('Mouse up on sidebar divider');
    setIsDragging(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  return (
    <div className="flex h-full">
      {/* Sidebar Content */}
      <div 
        className="bg-white border-r border-gray-300 overflow-hidden"
        style={{ width: `${width}px`, minWidth: `${width}px` }}
      >
        <SidebarTree />
      </div>
      
      {/* Resizable Divider */}
      <div
        className="w-3 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 flex items-center justify-center group"
        onMouseDown={handleMouseDown}
        title="Drag to resize sidebar"
        style={{ 
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Drag handle visual */}
        <div className="w-1 h-8 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full" />
      </div>
    </div>
  );
};

export default ResizableSidebar; 