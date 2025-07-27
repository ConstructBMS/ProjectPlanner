import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useTaskContext } from '../context/TaskContext';

const GanttChart = () => {
  const {
    getVisibleTasks,
    selectedTaskId,
    hoveredTaskId,
    selectTask,
    setHoveredTask,
    clearHoveredTask,
    linkingMode,
    linkStartTaskId,
    handleTaskClickForLinking,
    taskLinks
  } = useTaskContext();

  const [taskRefs, setTaskRefs] = useState({});
  const [svgContainerRef, setSvgContainerRef] = useState(null);

  const tasks = getVisibleTasks();

  // Update task refs when tasks change
  useEffect(() => {
    const newRefs = {};
    tasks.forEach(task => {
      newRefs[task.id] = React.createRef();
    });
    setTaskRefs(newRefs);
  }, [tasks]);

  // Draw dependency arrows
  useEffect(() => {
    if (!svgContainerRef) return;

    const svg = svgContainerRef;
    const containerRect = svg.getBoundingClientRect();

    // Clear existing arrows
    const existingArrows = svg.querySelectorAll('.dependency-arrow');
    existingArrows.forEach(arrow => arrow.remove());

    // Draw new arrows
    taskLinks.forEach(link => {
      const fromRef = taskRefs[link.fromId];
      const toRef = taskRefs[link.toId];

      if (fromRef?.current && toRef?.current) {
        const fromRect = fromRef.current.getBoundingClientRect();
        const toRect = toRef.current.getBoundingClientRect();

        const fromX = fromRect.right - containerRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toX = toRect.left - containerRect.left;
        const toY = toRect.top + toRect.height / 2 - containerRect.top;

        // Create arrow path
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow.setAttribute('d', `M ${fromX} ${fromY} L ${toX} ${toY}`);
        arrow.setAttribute('stroke', '#6B7280');
        arrow.setAttribute('stroke-width', '2');
        arrow.setAttribute('marker-end', 'url(#arrowhead)');
        arrow.setAttribute('class', 'dependency-arrow');
        arrow.style.pointerEvents = 'none';

        svg.appendChild(arrow);
      }
    });
  }, [taskLinks, taskRefs, svgContainerRef]);

  const handleTaskClick = (taskId) => {
    if (linkingMode) {
      handleTaskClickForLinking(taskId);
    } else {
      selectTask(taskId);
    }
  };

  const handleChartClick = (e) => {
    // Only clear selection if clicking on empty space and not in linking mode
    if (e.target === e.currentTarget && !linkingMode) {
      selectTask(null);
    }
  };

  const handleTaskHover = (taskId) => {
    setHoveredTask(taskId);
  };

  const handleTaskLeave = () => {
    clearHoveredTask();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTaskBarStyle = (task) => {
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;
    const isLinkStart = linkingMode && linkStartTaskId === task.id;

    let baseClasses = 'h-6 rounded transition-all duration-200 cursor-pointer';
    
    if (task.isGroup) {
      baseClasses += ' bg-green-500';
    } else {
      baseClasses += ' bg-blue-500';
    }

    if (isSelected) {
      baseClasses += ' stroke-blue-500 fill-blue-200 ring-2 ring-blue-500';
    } else if (isHovered) {
      baseClasses += ' stroke-blue-300 fill-blue-50 ring-1 ring-blue-300';
    } else if (isLinkStart) {
      baseClasses += ' bg-purple-500 ring-2 ring-purple-500';
    }

    return baseClasses;
  };

  const getTaskNameStyle = (task) => {
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;
    const isLinkStart = linkingMode && linkStartTaskId === task.id;

    let baseClasses = 'text-sm font-medium truncate';
    
    if (isSelected) {
      baseClasses += ' text-blue-700 font-semibold';
    } else if (isHovered) {
      baseClasses += ' text-blue-600';
    } else if (isLinkStart) {
      baseClasses += ' text-purple-700 font-semibold';
    } else {
      baseClasses += ' text-gray-700';
    }

    return baseClasses;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">Gantt Chart</h3>
        <p className="text-xs text-gray-500 mt-1">Task timeline and dependencies</p>
      </div>

      {/* Chart Content */}
      <div className="flex-1 overflow-auto relative" onClick={handleChartClick}>
        {/* SVG Container for Dependency Arrows */}
        <svg
          ref={setSvgContainerRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="#6B7280" />
            </marker>
          </defs>
        </svg>

        {/* Task Bars */}
        <div className="relative z-20 p-4 space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No tasks available
            </div>
          ) : (
            tasks.map((task, index) => {
              const startDate = new Date(task.startDate);
              const endDate = new Date(task.endDate);
              const duration = task.duration || 1;
              
              // Calculate position (simplified for demo)
              const left = `${(index * 20) + (task.depth || 0) * 20}%`;
              const width = `${Math.max(duration * 5, 10)}%`;

              return (
                <div
                  key={task.id}
                  ref={taskRefs[task.id]}
                  className="flex items-center gap-4 py-1"
                  style={{ paddingLeft: `${(task.depth || 0) * 20}px` }}
                >
                  {/* Task Name */}
                  <div className="w-48 flex items-center gap-2">
                    {task.isGroup && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement group toggle
                        }}
                        className="w-4 h-4 flex items-center justify-center"
                      >
                        {task.isExpanded ? (
                          <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    )}
                    
                    {task.isGroup && <FolderIcon className="w-4 h-4 text-green-500" />}
                    
                    <span className={getTaskNameStyle(task)}>
                      {task.name}
                    </span>
                  </div>

                  {/* Task Bar */}
                  <div className="flex-1 relative">
                    <div
                      className={getTaskBarStyle(task)}
                      style={{
                        left,
                        width,
                        position: 'absolute'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task.id);
                      }}
                      onMouseEnter={() => handleTaskHover(task.id)}
                      onMouseLeave={handleTaskLeave}
                      title={`${task.name} (${formatDate(startDate)} - ${formatDate(endDate)})`}
                    >
                      {/* Progress indicator */}
                      {task.progress > 0 && (
                        <div
                          className="h-full bg-green-400 rounded-l transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="w-32 text-xs text-gray-500">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t px-4 py-2">
        <div className="text-xs text-gray-500">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} • 
          {taskLinks.length} link{taskLinks.length !== 1 ? 's' : ''} • 
          {linkingMode ? '🔗 Linking mode active - click tasks to create links' : 
           selectedTaskId ? ` Selected: ${tasks.find(t => t.id === selectedTaskId)?.name || 'Unknown'}` : ' No task selected'} •
          💡 Click to select • Hover to highlight • Drag to resize (coming soon)
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
