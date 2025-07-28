import React, { useRef, useEffect } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';
import DateMarkersOverlay from './DateMarkersOverlay';

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
    taskLinks,
  } = useTaskContext();

  const { viewState } = useViewContext();

  const taskRefs = useRef({});
  const svgContainerRef = useRef(null);

  const tasks = getVisibleTasks();

  // Update task refs when tasks change
  useEffect(() => {
    const newRefs = {};
    tasks.forEach(task => {
      if (!taskRefs.current[task.id]) {
        newRefs[task.id] = React.createRef();
      } else {
        newRefs[task.id] = taskRefs.current[task.id];
      }
    });
    taskRefs.current = newRefs;
  }, [tasks]);

  // Draw dependency arrows
  useEffect(() => {
    if (!svgContainerRef.current) return;

    const svg = svgContainerRef.current;
    const containerRect = svg.getBoundingClientRect();

    // Clear existing arrows
    const existingArrows = svg.querySelectorAll('.dependency-arrow');
    existingArrows.forEach(arrow => arrow.remove());

    // Draw new arrows
    taskLinks.forEach(link => {
      const fromRef = taskRefs.current[link.fromId];
      const toRef = taskRefs.current[link.toId];

      if (fromRef?.current && toRef?.current) {
        const fromRect = fromRef.current.getBoundingClientRect();
        const toRect = toRef.current.getBoundingClientRect();

        const fromX = fromRect.right - containerRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toX = toRect.left - containerRect.left;
        const toY = toRect.top + toRect.height / 2 - containerRect.top;

        // Create arrow path
        const arrow = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        arrow.setAttribute('d', `M ${fromX} ${fromY} L ${toX} ${toY}`);
        arrow.setAttribute('stroke', '#6B7280');
        arrow.setAttribute('stroke-width', '2');
        arrow.setAttribute('marker-end', 'url(#arrowhead)');
        arrow.setAttribute('class', 'dependency-arrow');
        arrow.style.pointerEvents = 'none';

        svg.appendChild(arrow);
      }
    });
  }, [taskLinks, tasks]);

  const handleTaskClick = taskId => {
    if (linkingMode) {
      handleTaskClickForLinking(taskId);
    } else {
      selectTask(taskId);
    }
  };

  const handleChartClick = e => {
    // Only clear selection if clicking on empty space and not in linking mode
    if (e.target === e.currentTarget && !linkingMode) {
      selectTask(null);
    }
  };

  const handleTaskHover = taskId => {
    setHoveredTask(taskId);
  };

  const handleTaskLeave = () => {
    clearHoveredTask();
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTaskBarStyle = task => {
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;
    const isLinkStart = linkingMode && linkStartTaskId === task.id;

    let baseClasses =
      'rounded-sm transition-all duration-200 cursor-pointer border';

    if (task.isGroup) {
      baseClasses += ' bg-green-100 border-green-400 text-green-800';
    } else {
      baseClasses += ' bg-blue-100 border-blue-400 text-blue-800';
    }

    if (isSelected) {
      baseClasses += ' ring-2 ring-blue-500 border-blue-600 shadow-md';
    } else if (isHovered) {
      baseClasses += ' ring-1 ring-blue-300 border-blue-500 shadow-sm';
    } else if (isLinkStart) {
      baseClasses += ' bg-purple-100 border-purple-400 ring-2 ring-purple-500';
    }

    return baseClasses;
  };

  const getTaskNameStyle = task => {
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
    <div className='h-full flex flex-col bg-white'>
      {/* Asta-style Timeline Header */}
      <div className='asta-timeline-header border-b border-gray-300 bg-gray-50 px-4 py-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <h3 className='text-sm font-semibold text-gray-700'>Timeline</h3>
            <div className='text-xs text-gray-500'>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} •{' '}
              {taskLinks.length} link{taskLinks.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className='text-xs text-gray-500'>
            {linkingMode
              ? '🔗 Linking mode active'
              : selectedTaskId
                ? `Selected: ${tasks.find(t => t.id === selectedTaskId)?.name || 'Unknown'}`
                : 'No task selected'}
          </div>
        </div>
      </div>

      {/* Asta-style Timeline Grid */}
      <div className='flex-1 overflow-auto relative' onClick={handleChartClick}>
        {/* Background Grid */}
        <div className='asta-timeline-grid absolute inset-0 opacity-20'></div>

        {/* Date Markers Overlay */}
        <DateMarkersOverlay />

        {/* SVG Container for Dependency Arrows */}
        <svg
          ref={svgContainerRef}
          className='absolute inset-0 w-full h-full pointer-events-none z-10'
        >
          <defs>
            <marker
              id='arrowhead'
              markerWidth='8'
              markerHeight='8'
              refX='8'
              refY='4'
              orient='auto'
            >
              <path d='M0,0 L8,4 L0,8 Z' fill='#2e5aa0' />
            </marker>
          </defs>
        </svg>

        {/* Timeline Content */}
        <div className='relative z-20'>
          {tasks.length === 0 ? (
            <div className='text-center text-gray-500 py-8'>
              No tasks available
            </div>
          ) : (
            <div className='space-y-1 p-2'>
              {tasks.map((task) => {
                const startDate = new Date(task.startDate);
                const endDate = new Date(task.endDate);
                const duration = task.duration || 1;

                // Asta-style positioning - more realistic timeline with zoom scaling
                const daysFromStart = Math.floor(
                  (startDate - new Date('2024-01-01')) / (1000 * 60 * 60 * 24)
                );
                const baseDayWidth = 2; // Base width per day
                const baseDurationWidth = 20; // Base width per duration unit
                const scaledDayWidth = baseDayWidth * viewState.timelineZoom;
                const scaledDurationWidth =
                  baseDurationWidth * viewState.timelineZoom;

                const left = `${Math.max(daysFromStart * scaledDayWidth, 0)}px`;
                const width = `${Math.max(duration * scaledDurationWidth, 40 * viewState.timelineZoom)}px`;

                return (
                  <div
                    key={task.id}
                    ref={taskRefs.current[task.id]}
                    className='flex items-center h-8 border-b border-gray-100 hover:bg-gray-50'
                    style={{ paddingLeft: `${(task.depth || 0) * 20}px` }}
                  >
                    {/* Task Name Column (fixed width) */}
                    <div className='w-64 flex items-center gap-2 px-2'>
                      {task.isGroup && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            // TODO: Implement group toggle
                          }}
                          className='w-4 h-4 flex items-center justify-center hover:bg-gray-200 rounded'
                        >
                          {task.isExpanded ? (
                            <ChevronDownIcon className='w-3 h-3 text-gray-600' />
                          ) : (
                            <ChevronRightIcon className='w-3 h-3 text-gray-600' />
                          )}
                        </button>
                      )}

                      {task.isGroup && (
                        <FolderIcon className='w-4 h-4 text-green-600' />
                      )}

                      <span className={getTaskNameStyle(task)}>
                        {task.name}
                      </span>
                    </div>

                    {/* Timeline Bar Area */}
                    <div className='flex-1 relative h-full'>
                      <div
                        className={getTaskBarStyle(task)}
                        style={{
                          left,
                          width,
                          position: 'absolute',
                          top: '2px',
                          height: 'calc(100% - 4px)',
                        }}
                        onClick={e => {
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
                            className='h-full bg-green-400 rounded-l transition-all duration-300'
                            style={{ width: `${task.progress}%` }}
                          />
                        )}
                      </div>

                      {/* Baseline Bar Overlay */}
                      {viewState.showBaseline &&
                        task.baselineStart &&
                        task.baselineEnd && (
                          <div
                            className='h-[6px] bg-gray-300 rounded opacity-50 absolute bottom-0'
                            style={{
                              left: `${Math.max(
                                Math.floor(
                                  (new Date(task.baselineStart) -
                                    new Date('2024-01-01')) /
                                    (1000 * 60 * 60 * 24)
                                ) * scaledDayWidth,
                                0
                              )}px`,
                              width: `${Math.max(
                                Math.floor(
                                  (new Date(task.baselineEnd) -
                                    new Date(task.baselineStart)) /
                                    (1000 * 60 * 60 * 24)
                                ) * scaledDurationWidth,
                                40 * viewState.timelineZoom
                              )}px`,
                            }}
                            title={`Baseline: ${formatDate(new Date(task.baselineStart))} - ${formatDate(new Date(task.baselineEnd))}`}
                          />
                        )}
                    </div>

                    {/* Task Info Column (fixed width) */}
                    <div className='w-32 text-xs text-gray-500 px-2'>
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
