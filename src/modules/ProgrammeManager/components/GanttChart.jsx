import React, { useEffect, useRef, useState } from 'react';
import { useTaskContext } from '../context/TaskContext';

const GanttChart = () => {
  const { tasks, taskLinks, selectedTaskId, selectTask } = useTaskContext();
  const chartRef = useRef(null);
  const taskRefs = useRef({});
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });

  // Calculate chart dimensions
  useEffect(() => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setChartDimensions({
        width: rect.width,
        height: rect.height
      });
    }
  }, [tasks]);

  // Handle task bar click
  const handleTaskClick = (taskId, e) => {
    e.stopPropagation(); // Prevent chart background click
    selectTask(taskId);
  };

  // Handle chart background click to clear selection
  const handleChartClick = () => {
    selectTask(null);
  };

  // Helper function to calculate task bar position and dimensions
  const getTaskBarInfo = (taskId) => {
    const taskRef = taskRefs.current[taskId];
    if (!taskRef) return null;

    const rect = taskRef.getBoundingClientRect();
    const chartRect = chartRef.current?.getBoundingClientRect();
    
    if (!chartRect) return null;

    return {
      left: rect.left - chartRect.left,
      top: rect.top - chartRect.top,
      width: rect.width,
      height: rect.height,
      right: rect.left - chartRect.left + rect.width,
      bottom: rect.top - chartRect.top + rect.height
    };
  };

  // Render dependency arrows
  const renderArrows = () => {
    if (!taskLinks.length || !chartRef.current) return null;

    return taskLinks.map((link, index) => {
      const fromTask = getTaskBarInfo(link.fromId);
      const toTask = getTaskBarInfo(link.toId);

      if (!fromTask || !toTask) return null;

      // Calculate arrow path
      const startX = fromTask.right;
      const startY = fromTask.top + fromTask.height / 2;
      const endX = toTask.left;
      const endY = toTask.top + toTask.height / 2;

      // Create elbow-style path
      const midX = startX + (endX - startX) / 2;
      const path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

      return (
        <g key={`arrow-${link.fromId}-${link.toId}-${index}`}>
          {/* Arrow line */}
          <path
            d={path}
            stroke="#6b7280"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          {/* Arrow head */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
        </g>
      );
    });
  };

  // Helper function to calculate task duration in days
  const getTaskDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  // Helper function to get task position from start date
  const getTaskPosition = (startDate) => {
    const today = new Date();
    const taskStart = new Date(startDate);
    const diffTime = taskStart - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays) * 40; // 40px per day
  };

  // Generate timeline headers
  const generateTimeline = () => {
    const days = 30; // Show 30 days
    const headers = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const isToday = i === 0;
      
      headers.push(
        <div
          key={i}
          className={`w-10 h-8 border-r border-gray-200 flex items-center justify-center text-xs ${
            isToday ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
          }`}
        >
          {date.getDate()}
        </div>
      );
    }
    
    return headers;
  };

  if (tasks.length === 0) {
    return (
      <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-400 mb-2">📊</div>
          <div className="text-lg font-medium text-gray-600 mb-1">Gantt Chart</div>
          <div className="text-sm text-gray-500">No tasks to display</div>
          <div className="text-xs text-gray-400 mt-2">Add tasks to see timeline</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">Gantt Chart</h3>
        <p className="text-xs text-gray-500 mt-1">Timeline and dependencies</p>
        <p className="text-xs text-blue-600 mt-1">
          💡 Tip: Click task bars to select • Linked tasks show dependency arrows
        </p>
      </div>

      {/* Chart Container */}
      <div className="flex-1 overflow-auto" ref={chartRef} onClick={handleChartClick}>
        <div className="min-w-full min-h-full relative">
          {/* SVG Overlay for Arrows */}
          <svg
            className="absolute inset-0 pointer-events-none z-10"
            width={chartDimensions.width}
            height={chartDimensions.height}
          >
            {renderArrows()}
          </svg>

          {/* Timeline Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-20">
            <div className="flex">
              <div className="w-48 bg-gray-50 border-r border-gray-200 p-2">
                <div className="text-xs font-semibold text-gray-600">Tasks</div>
              </div>
              <div className="flex">
                {generateTimeline()}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="relative">
            {tasks.map((task, index) => {
              const duration = getTaskDuration(task.startDate, task.endDate);
              const leftPosition = getTaskPosition(task.startDate);
              const width = duration * 40; // 40px per day
              const isSelected = selectedTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className="flex border-b border-gray-100 hover:bg-gray-50"
                  style={{ height: '40px' }}
                >
                  {/* Task Name */}
                  <div className={`w-48 border-r border-gray-200 p-2 flex items-center ${
                    isSelected ? 'bg-blue-50' : 'bg-white'
                  }`}>
                    <div className={`text-sm truncate ${
                      isSelected ? 'font-semibold text-blue-800' : 'text-gray-800'
                    }`}>
                      {task.name}
                    </div>
                  </div>

                  {/* Timeline Area */}
                  <div className="flex-1 relative">
                    {/* Task Bar */}
                    <div
                      ref={(el) => {
                        if (el) taskRefs.current[task.id] = el;
                      }}
                      className={`absolute top-2 h-6 rounded-sm shadow-sm cursor-pointer transition-all duration-150 ${
                        isSelected 
                          ? 'bg-blue-600 border-2 border-blue-400 shadow-lg hover:bg-blue-700' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      style={{
                        left: `${leftPosition}px`,
                        width: `${width}px`,
                        minWidth: '20px'
                      }}
                      title={`${task.name} (${task.startDate} to ${task.endDate})${isSelected ? ' - Selected' : ''}`}
                      onClick={(e) => handleTaskClick(task.id, e)}
                    >
                      {/* Task Bar Label */}
                      <div className="px-2 py-1 text-xs text-white font-medium truncate">
                        {task.name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t px-4 py-2">
        <div className="text-xs text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {taskLinks.length} dependency{taskLinks.length !== 1 ? 'ies' : 'y'} • 
          {selectedTaskId ? ` Selected: ${tasks.find(t => t.id === selectedTaskId)?.name || 'Unknown'}` : ' No task selected'} • 
          Blue bars show task duration • Gray arrows show dependencies
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
