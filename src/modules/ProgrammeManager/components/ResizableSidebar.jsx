import React, { useState, useRef, useCallback } from 'react';
import SidebarTree from './SidebarTree';

const ResizableSidebar = ({ minWidth = 150, maxWidth = 400, defaultWidth = 250 }) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
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
    setWidth(newWidth);
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Reset cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  return (
    <div 
      className="flex h-full bg-white border-r border-gray-300 relative"
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        <SidebarTree />
      </div>
      
      {/* Resizable Divider - Made more visible */}
      <div
        className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 relative group border-l border-gray-300"
        onMouseDown={handleMouseDown}
        title="Drag to resize sidebar"
        style={{ 
          position: 'absolute',
          right: '-1px',
          top: 0,
          bottom: 0,
          zIndex: 10
        }}
      >
        {/* Hover indicator */}
        <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Drag handle visual - Made more prominent */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full" />
      </div>
    </div>
  );
};

export default ResizableSidebar; 