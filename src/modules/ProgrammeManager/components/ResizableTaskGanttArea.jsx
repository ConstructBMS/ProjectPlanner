import React, { useState, useRef, useCallback } from 'react';
import TaskGrid from './TaskGrid';
import GanttChart from './GanttChart';

const ResizableTaskGanttArea = ({ 
  minTaskHeight = 100, 
  minGanttHeight = 100, 
  defaultTaskHeight = '50%' 
}) => {
  const [taskHeight, setTaskHeight] = useState(defaultTaskHeight);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = containerRef.current?.offsetHeight || 0;
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Change cursor globally
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerHeight = containerRef.current.offsetHeight;
    const deltaY = e.clientY - startYRef.current;
    const taskHeightPx = Math.max(
      minTaskHeight, 
      Math.min(containerHeight - minGanttHeight, startHeightRef.current + deltaY)
    );
    
    const taskHeightPercent = (taskHeightPx / containerHeight) * 100;
    setTaskHeight(`${taskHeightPercent}%`);
  }, [isDragging, minTaskHeight, minGanttHeight]);

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
    <div ref={containerRef} className="flex flex-col flex-1 overflow-hidden relative">
      {/* Task Grid Area */}
      <div 
        className="overflow-auto border-b border-gray-300"
        style={{ height: taskHeight, minHeight: `${minTaskHeight}px` }}
      >
        <TaskGrid />
      </div>
      
      {/* Resizable Divider - Made more visible */}
      <div
        className="h-2 bg-gray-200 hover:bg-blue-400 cursor-row-resize transition-colors duration-200 relative group border-t border-gray-300"
        onMouseDown={handleMouseDown}
        title="Drag to resize task and Gantt areas"
        style={{ 
          position: 'absolute',
          left: 0,
          right: 0,
          zIndex: 10
        }}
      >
        {/* Hover indicator */}
        <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Drag handle visual - Made more prominent */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1 w-12 bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 rounded-full" />
      </div>
      
      {/* Gantt Chart Area */}
      <div 
        className="flex-1 overflow-auto"
        style={{ minHeight: `${minGanttHeight}px` }}
      >
        <GanttChart />
      </div>
    </div>
  );
};

export default ResizableTaskGanttArea; 