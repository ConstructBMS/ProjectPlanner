import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

// Diamond icon component for milestones
const DiamondIcon = ({ className = 'w-4 h-4', color = 'text-purple-600' }) => (
  <svg
    className={`${className} ${color}`}
    viewBox='0 0 24 24'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    {/* Diamond shape - rotated square */}
    <path d='M12 2L22 12L12 22L2 12L12 2Z' />
  </svg>
);
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';
import DateMarkersOverlay from './DateMarkersOverlay';
import { calculateCriticalPath } from '../utils/criticalPath';
import { addDays, snapToWeekday, calculateDuration } from '../utils/dateUtils';
import '../styles/gantt.css';

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
    updateTask,
    linkTasks,
  } = useTaskContext();

  const { viewState, updateViewState } = useViewContext();

  const taskRefs = useRef({});
  const svgContainerRef = useRef(null);
  const timelineContainerRef = useRef(null);

  // Tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    task: null,
  });

  // Drag state
  const [dragging, setDragging] = useState({
    taskId: null,
    startX: 0,
    originalStartDate: null,
    originalEndDate: null,
  });

  // Drag-to-link state
  const [dragToLink, setDragToLink] = useState({
    isActive: false,
    fromTaskId: null,
    fromTask: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const tasks = getVisibleTasks(viewState.taskFilter);

  // Calculate critical path when tasks or links change
  const criticalPathTasks = useMemo(() => {
    return calculateCriticalPath(tasks, taskLinks);
  }, [tasks, taskLinks]);

  // Calculate task floats for slack visualization
  const taskFloats = useMemo(() => {
    if (!viewState.showSlack) return {};

    const floats = {};
    tasks.forEach(task => {
      // For now, use a simple calculation - in a real implementation,
      // this would use the critical path calculation results
      const duration = task.duration || 1;

      // Calculate float based on dependencies
      // This is a simplified version - in practice, you'd use the full CPM calculation
      const float = Math.max(0, duration * 0.2); // 20% of duration as float
      floats[task.id] = float;
    });

    return floats;
  }, [tasks, viewState.showSlack]);

  // Calculate date range for grid lines
  const dateRange = useMemo(() => {
    if (tasks.length === 0) {
      return { start: new Date('2024-01-01'), end: new Date('2024-12-31') };
    }

    const taskDates = tasks.flatMap(task => [
      new Date(task.startDate),
      new Date(task.endDate),
    ]);

    const minDate = new Date(Math.min(...taskDates));
    const maxDate = new Date(Math.max(...taskDates));

    // Add some padding (30 days on each side)
    const padding = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    return {
      start: new Date(minDate.getTime() - padding),
      end: new Date(maxDate.getTime() + padding),
    };
  }, [tasks]);

  // Generate vertical grid lines
  const gridLines = useMemo(() => {
    if (!viewState.showGridlines) return [];

    const lines = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const baseDayWidth = 2;
    const scaledDayWidth = baseDayWidth * viewState.timelineZoom;

    // Calculate start position offset
    const startOfYear = new Date('2024-01-01');
    const getDateIndex = date => {
      const daysFromStart = Math.floor(
        (date - startOfYear) / (1000 * 60 * 60 * 24)
      );

      if (viewState.showWeekends) {
        return daysFromStart;
      } else {
        // Count only weekdays
        let weekdayCount = 0;
        for (
          let d = new Date(startOfYear);
          d <= date;
          d.setDate(d.getDate() + 1)
        ) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            weekdayCount++;
          }
          if (d >= date) break;
        }
        return weekdayCount;
      }
    };

    switch (viewState.viewScale) {
      case 'Day':
        // Daily grid lines
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (!viewState.showWeekends) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;
          }

          const left = getDateIndex(d) * scaledDayWidth;
          const isMonthStart = d.getDate() === 1;
          const isWeekStart = d.getDay() === 1;

          let className = 'grid-day';
          if (isMonthStart) className = 'grid-month';
          else if (isWeekStart) className = 'grid-week';

          lines.push(
            <div
              key={d.toISOString()}
              className={`absolute top-0 bottom-0 ${className}`}
              style={{
                left: `${left}px`,
                width: '1px',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          );
        }
        break;

      case 'Week':
        // Weekly grid lines
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
          const left = getDateIndex(d) * scaledDayWidth;
          lines.push(
            <div
              key={`week-${d.toISOString()}`}
              className='absolute top-0 bottom-0 grid-week'
              style={{
                left: `${left}px`,
                width: '1px',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          );
        }
        break;

      case 'Month':
        // Monthly grid lines
        for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
          const left = getDateIndex(d) * scaledDayWidth;
          lines.push(
            <div
              key={`month-${d.toISOString()}`}
              className='absolute top-0 bottom-0 grid-month'
              style={{
                left: `${left}px`,
                width: '1px',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          );
        }
        break;

      default:
        // Default to daily grid lines
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (!viewState.showWeekends) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;
          }

          const left = getDateIndex(d) * scaledDayWidth;
          const isMonthStart = d.getDate() === 1;
          const isWeekStart = d.getDay() === 1;

          let className = 'grid-day';
          if (isMonthStart) className = 'grid-month';
          else if (isWeekStart) className = 'grid-week';

          lines.push(
            <div
              key={d.toISOString()}
              className={`absolute top-0 bottom-0 ${className}`}
              style={{
                left: `${left}px`,
                width: '1px',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          );
        }
    }

    return lines;
  }, [
    dateRange,
    viewState.showGridlines,
    viewState.showWeekends,
    viewState.timelineZoom,
    viewState.viewScale,
  ]);

  // Calculate today marker position
  const todayMarker = useMemo(() => {
    if (!viewState.showGridlines) return null;

    const today = new Date();
    const startOfYear = new Date('2024-01-01');
    const baseDayWidth = 2;
    const scaledDayWidth = baseDayWidth * viewState.timelineZoom;

    // Calculate days from start of year
    const daysFromStart = Math.floor(
      (today - startOfYear) / (1000 * 60 * 60 * 24)
    );

    // Calculate left position
    let left;
    if (viewState.showWeekends) {
      left = daysFromStart * scaledDayWidth;
    } else {
      // Count only weekdays
      let weekdayCount = 0;
      for (
        let d = new Date(startOfYear);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          weekdayCount++;
        }
        if (d >= today) break;
      }
      left = weekdayCount * scaledDayWidth;
    }

    // Check if today is within the visible date range
    if (today < dateRange.start || today > dateRange.end) {
      return null;
    }

    return (
      <div
        className="today-marker absolute top-0 bottom-0 z-30"
        style={{
          left: `${left}px`,
          width: '2px',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    );
  }, [
    dateRange,
    viewState.showGridlines,
    viewState.showWeekends,
    viewState.timelineZoom,
  ]);

  // Generate today line indicator
  const todayLineIndicator = useMemo(() => {
    if (!viewState.showGridlines) return null;

    const today = new Date();
    const startOfYear = new Date('2024-01-01');
    const baseDayWidth = 2;
    const scaledDayWidth = baseDayWidth * viewState.timelineZoom;

    // Calculate days from start of year
    const daysFromStart = Math.floor(
      (today - startOfYear) / (1000 * 60 * 60 * 24)
    );

    // Calculate left position
    let left;
    if (viewState.showWeekends) {
      left = daysFromStart * scaledDayWidth;
    } else {
      // Count only weekdays
      let weekdayCount = 0;
      for (
        let d = new Date(startOfYear);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          weekdayCount++;
        }
        if (d >= today) break;
      }
      left = weekdayCount * scaledDayWidth;
    }

    // Check if today is within the visible date range
    if (today < dateRange.start || today > dateRange.end) {
      return null;
    }

    return (
      <div
        className="gantt-today-line absolute top-0 bottom-0 w-[1px] bg-red-500 z-20"
        style={{
          left: `${left}px`,
          pointerEvents: 'none',
        }}
      />
    );
  }, [
    dateRange,
    viewState.showGridlines,
    viewState.showWeekends,
    viewState.timelineZoom,
  ]);

  // Generate horizontal row grid lines
  const rowLines = useMemo(() => {
    if (!viewState.showGridlines) return [];

    const rowHeight = 32; // h-8 = 32px
    const lines = [];

    tasks.forEach((task, index) => {
      lines.push(
        <div
          key={`row-line-${task.id}`}
          className='gantt-row-line absolute left-0 right-0'
          style={{
            top: `${(index + 1) * rowHeight}px`,
            height: '1px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      );
    });

    return lines;
  }, [tasks, viewState.showGridlines]);

  // Generate weekend highlighting blocks
  const weekendBlocks = useMemo(() => {
    const blocks = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const baseDayWidth = 2;
    const scaledDayWidth = baseDayWidth * viewState.timelineZoom;

    // Calculate start position offset
    const startOfYear = new Date('2024-01-01');
    const getDateIndex = date => {
      const daysFromStart = Math.floor(
        (date - startOfYear) / (1000 * 60 * 60 * 24)
      );

      if (viewState.showWeekends) {
        return daysFromStart;
      } else {
        // Count only weekdays
        let weekdayCount = 0;
        for (
          let d = new Date(startOfYear);
          d <= date;
          d.setDate(d.getDate() + 1)
        ) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            weekdayCount++;
          }
          if (d >= date) break;
        }
        return weekdayCount;
      }
    };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        // Saturday or Sunday
        const left = getDateIndex(d) * scaledDayWidth;

        blocks.push(
          <div
            key={`weekend-${d.toISOString()}`}
            className='absolute top-0 bottom-0 bg-gray-200 opacity-60'
            style={{
              left: `${left}px`,
              width: `${scaledDayWidth}px`,
              zIndex: 0,
            }}
          />
        );
      }
    }

    return blocks;
  }, [dateRange, viewState.showWeekends, viewState.timelineZoom]);

  // Update task refs when tasks change or view settings change
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
  }, [
    tasks,
    viewState.showWeekends,
    viewState.showGridlines,
    viewState.showCriticalPath,
    viewState.showSlack,
    criticalPathTasks,
    taskFloats,
  ]);

  // Handle "Go to Today" functionality
  useEffect(() => {
    if (viewState.showTodayHighlight && timelineContainerRef.current) {
      const today = new Date();
      const startOfYear = new Date('2024-01-01');

      // Calculate today's position in the timeline based on showWeekends setting
      const getDateIndex = date => {
        const daysFromStart = Math.floor(
          (date - startOfYear) / (1000 * 60 * 60 * 24)
        );

        if (viewState.showWeekends) {
          return daysFromStart;
        } else {
          // Count only weekdays
          let weekdayCount = 0;
          for (
            let d = new Date(startOfYear);
            d <= date;
            d.setDate(d.getDate() + 1)
          ) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              weekdayCount++;
            }
            if (d >= date) break;
          }
          return weekdayCount;
        }
      };

      const daysFromStart = getDateIndex(today);
      const baseDayWidth = 2;
      const scaledDayWidth = baseDayWidth * viewState.timelineZoom;
      const todayPosition = daysFromStart * scaledDayWidth;

      // Get container width and calculate offset to center today
      const containerWidth = timelineContainerRef.current.clientWidth;
      const scrollPosition = Math.max(0, todayPosition - containerWidth / 2);

      // Smooth scroll to today's position
      timelineContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });

      console.log('Scrolled to today:', {
        daysFromStart,
        todayPosition,
        scrollPosition,
        showWeekends: viewState.showWeekends,
      });
    }
  }, [
    viewState.showTodayHighlight,
    viewState.timelineZoom,
    viewState.showWeekends,
  ]);

  // Handle "Zoom to Fit" functionality
  useEffect(() => {
    if (
      viewState.zoomToFit &&
      timelineContainerRef.current &&
      tasks.length > 0
    ) {
      // Calculate the date range of all tasks
      const taskDates = tasks.flatMap(task => [
        new Date(task.startDate),
        new Date(task.endDate),
      ]);

      const minDate = new Date(Math.min(...taskDates));
      const maxDate = new Date(Math.max(...taskDates));

      // Add some padding (10% on each side)
      const totalRange = maxDate - minDate;
      const padding = totalRange * 0.1;
      const paddedMinDate = new Date(minDate.getTime() - padding);
      const paddedMaxDate = new Date(maxDate.getTime() + padding);

      // Calculate the total date range in days
      const totalDays = Math.ceil(
        (paddedMaxDate - paddedMinDate) / (1000 * 60 * 60 * 24)
      );

      // Get container width (subtract task name column width)
      const containerWidth = timelineContainerRef.current.clientWidth - 256; // 256px for task name column

      // Calculate optimal zoom level
      const baseDayWidth = 2; // Base width per day
      const optimalZoom = Math.max(
        0.3,
        Math.min(3.0, containerWidth / (totalDays * baseDayWidth))
      );

      // Update zoom level
      updateViewState({ timelineZoom: optimalZoom });

      // Reset the zoom to fit flag
      window.setTimeout(() => {
        updateViewState({ zoomToFit: false });
      }, 100);

      console.log('Zoom to Fit applied:', {
        minDate: minDate.toISOString(),
        maxDate: maxDate.toISOString(),
        totalDays,
        containerWidth,
        optimalZoom,
      });
    }
  }, [viewState.zoomToFit, tasks, updateViewState]);

  // Draw dependency arrows
  useEffect(() => {
    if (!svgContainerRef.current) return;

    const svg = svgContainerRef.current;
    const containerRect = svg.getBoundingClientRect();

    // Clear existing arrows
    const existingArrows = svg.querySelectorAll('.dependency-arrow');
    existingArrows.forEach(arrow => arrow.remove());

    // Draw new arrows with enhanced link type visualization
    taskLinks.forEach(link => {
      const fromRef = taskRefs.current[link.fromId];
      const toRef = taskRefs.current[link.toId];

      if (fromRef?.current && toRef?.current) {
        const fromRect = fromRef.current.getBoundingClientRect();
        const toRect = toRef.current.getBoundingClientRect();

        // Calculate connection points based on link type
        let fromX, fromY, toX, toY;
        const linkType = link.type || 'FS';

        switch (linkType) {
          case 'FS': // Finish-to-Start
            fromX = fromRect.right - containerRect.left;
            fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
            toX = toRect.left - containerRect.left;
            toY = toRect.top + toRect.height / 2 - containerRect.top;
            break;
          case 'SS': // Start-to-Start
            fromX = fromRect.left - containerRect.left;
            fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
            toX = toRect.left - containerRect.left;
            toY = toRect.top + toRect.height / 2 - containerRect.top;
            break;
          case 'FF': // Finish-to-Finish
            fromX = fromRect.right - containerRect.left;
            fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
            toX = toRect.right - containerRect.left;
            toY = toRect.top + toRect.height / 2 - containerRect.top;
            break;
          case 'SF': // Start-to-Finish
            fromX = fromRect.left - containerRect.left;
            fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
            toX = toRect.right - containerRect.left;
            toY = toRect.top + toRect.height / 2 - containerRect.top;
            break;
          default:
            fromX = fromRect.right - containerRect.left;
            fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
            toX = toRect.left - containerRect.left;
            toY = toRect.top + toRect.height / 2 - containerRect.top;
        }

        // Create arrow path with steps for better visualization
        const midX = (fromX + toX) / 2;

        let pathData;
        if (Math.abs(fromY - toY) < 5) {
          // Horizontal line for same level tasks
          pathData = `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else {
          // Stepped path for different level tasks
          pathData = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
        }

        // Create arrow path
        const arrow = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        arrow.setAttribute('d', pathData);
        arrow.setAttribute(
          'stroke',
          linkType === 'FS'
            ? '#3B82F6'
            : linkType === 'SS'
              ? '#10B981'
              : linkType === 'FF'
                ? '#F59E0B'
                : '#EF4444'
        );
        arrow.setAttribute('stroke-width', '2');
        arrow.setAttribute('marker-end', 'url(#arrowhead)');
        arrow.setAttribute('class', 'dependency-arrow');
        arrow.style.pointerEvents = 'auto';
        arrow.style.cursor = 'pointer';

        // Add title for tooltip
        const title = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'title'
        );
        title.textContent = `${linkType} link: ${link.lag > 0 ? `+${link.lag} days lag` : link.lag < 0 ? `${link.lag} days lead` : 'No lag'}`;
        arrow.appendChild(title);

        // Add click handler to edit link
        arrow.addEventListener('click', () => {
          console.log('Link clicked:', link);
          // Could open edit modal here
        });

        svg.appendChild(arrow);
      }
    });

    // Draw predecessor-based dependency arrows (Prompt 098)
    tasks.forEach(task => {
      if (task.predecessors && Array.isArray(task.predecessors)) {
        task.predecessors.forEach(predecessorId => {
          const predecessorTask = tasks.find(t => t.id === predecessorId);
          if (!predecessorTask) return;

          const fromRef = taskRefs.current[predecessorId];
          const toRef = taskRefs.current[task.id];

          if (fromRef?.current && toRef?.current) {
            const fromRect = fromRef.current.getBoundingClientRect();
            const toRect = toRef.current.getBoundingClientRect();

            // Calculate positions for Finish-to-Start logic
            const fromX = fromRect.right - containerRect.left;
            const fromY =
              fromRect.top + fromRect.height / 2 - containerRect.top;
            const toX = toRect.left - containerRect.left;
            const toY = toRect.top + toRect.height / 2 - containerRect.top;

            // Create arrow line
            const arrow = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'line'
            );
            arrow.setAttribute('x1', fromX);
            arrow.setAttribute('y1', fromY);
            arrow.setAttribute('x2', toX);
            arrow.setAttribute('y2', toY);
            arrow.setAttribute('stroke', 'black');
            arrow.setAttribute('stroke-width', '1');
            arrow.setAttribute('marker-end', 'url(#arrowhead)');
            arrow.setAttribute('class', 'predecessor-arrow');
            arrow.style.pointerEvents = 'auto';
            arrow.style.cursor = 'pointer';

            // Add title for tooltip
            const title = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'title'
            );
            title.textContent = `Predecessor: ${predecessorTask.name} → ${task.name}`;
            arrow.appendChild(title);

            svg.appendChild(arrow);
          }
        });
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
    setTooltip({ visible: false, x: 0, y: 0, task: null });
  };

  // Grid snapping helper functions
  const snapToGrid = x => {
    const baseDayWidth = 2;
    const scaledDayWidth = baseDayWidth * viewState.timelineZoom;
    const index = Math.round(x / scaledDayWidth);
    return index * scaledDayWidth;
  };

  // Drag event handlers
  const handleTaskDragStart = (e, task) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging({
      taskId: task.id,
      startX: e.clientX,
      originalStartDate: new Date(task.startDate),
      originalEndDate: new Date(task.endDate),
    });

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleTaskDragMove);
    document.addEventListener('mouseup', handleTaskDragEnd);
  };

  const handleTaskDragMove = e => {
    if (!dragging.taskId) return;

    const deltaX = e.clientX - dragging.startX;

    // Snap the delta to the grid
    const snappedDeltaX = snapToGrid(deltaX);
    const baseDayWidth = 2;
    const scaledDayWidth = baseDayWidth * viewState.timelineZoom;
    const dayOffset = Math.round(snappedDeltaX / scaledDayWidth);

    // Find the task being dragged
    const task = tasks.find(t => t.id === dragging.taskId);
    if (!task) return;

    // Calculate new dates using snapped values
    let newStartDate = addDays(dragging.originalStartDate, dayOffset);
    let newEndDate = addDays(dragging.originalEndDate, dayOffset);

    // Snap both dates to weekdays (skip weekends)
    newStartDate = snapToWeekday(newStartDate);
    newEndDate = snapToWeekday(newEndDate);

    // Ensure end date is not before start date
    if (newEndDate < newStartDate) {
      newEndDate = new Date(newStartDate);
    }

    // Update task dates temporarily (for visual feedback)
    task.startDate = newStartDate.toISOString();
    task.endDate = newEndDate.toISOString();
  };

  const handleTaskDragEnd = async () => {
    if (!dragging.taskId) return;

    const task = tasks.find(t => t.id === dragging.taskId);
    if (task) {
      try {
        // Update task dates via TaskContext
        updateTask(dragging.taskId, {
          startDate: task.startDate,
          endDate: task.endDate,
        });

        console.log('Task dragged successfully:', {
          taskId: dragging.taskId,
          newStartDate: task.startDate,
          newEndDate: task.endDate,
        });
      } catch (error) {
        console.error('Error updating task dates:', error);
        // Revert to original dates on error
        task.startDate = dragging.originalStartDate.toISOString();
        task.endDate = dragging.originalEndDate.toISOString();
      }
    }

    // Clean up
    setDragging({
      taskId: null,
      startX: 0,
      originalStartDate: null,
      originalEndDate: null,
    });

    // Remove global event listeners
    document.removeEventListener('mousemove', handleTaskDragMove);
    document.removeEventListener('mouseup', handleTaskDragEnd);
  };

  // Drag-to-link handlers
  const handleDragToLinkStart = (e, task) => {
    e.preventDefault();
    e.stopPropagation();

    setDragToLink({
      isActive: true,
      fromTaskId: task.id,
      fromTask: task,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleDragToLinkMove);
    document.addEventListener('mouseup', handleDragToLinkEnd);
  };

  const handleDragToLinkMove = e => {
    if (!dragToLink.isActive) return;

    setDragToLink(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY,
    }));
  };

  const handleDragToLinkEnd = e => {
    if (!dragToLink.isActive) return;

    // Find the task under the cursor
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    const taskElement = elementUnderCursor?.closest('[data-task-id]');

    if (taskElement) {
      const toTaskId = taskElement.getAttribute('data-task-id');
      const toTask = tasks.find(t => t.id === toTaskId);

      if (toTask && toTask.id !== dragToLink.fromTaskId) {
        // Create the dependency
        linkTasks(dragToLink.fromTaskId, toTask.id, 'FS', 0);
        console.log('Created dependency:', {
          from: dragToLink.fromTaskId,
          to: toTaskId,
        });
      }
    }

    // Clean up
    setDragToLink({
      isActive: false,
      fromTaskId: null,
      fromTask: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });

    // Remove global event listeners
    document.removeEventListener('mousemove', handleDragToLinkMove);
    document.removeEventListener('mouseup', handleDragToLinkEnd);
  };

  // Combined drag handler for both task dragging and drag-to-link
  const handleTaskMouseDown = (e, task) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is a drag-to-link operation (click on right side of task)
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const taskWidth = rect.width;

    // If click is on the right side of the task (last 20% of the task), start drag-to-link
    if (clickX >= taskWidth * 0.8) {
      handleDragToLinkStart(e, task);
    } else {
      // Otherwise, start normal task dragging
      handleTaskDragStart(e, task);
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeek = date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  };

  const generateTimelineHeaders = () => {
    const headers = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const baseDayWidth = 2;
    const scaledDayWidth = baseDayWidth * viewState.timelineZoom;

    switch (viewState.viewScale) {
      case 'Day':
        // Daily headers - show each day
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const dayOfWeek = d.getDay();
          if (!viewState.showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
            continue;
          }
          headers.push(
            <div
              key={d.toISOString()}
              className='text-xs text-gray-600 py-1 border-r border-gray-200 flex items-center justify-center font-medium'
              style={{ width: `${scaledDayWidth}px` }}
            >
              {formatDate(d)}
            </div>
          );
        }
        break;

      case 'Week':
        // Weekly headers - show week numbers
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 7)
        ) {
          const weekNumber = getWeek(d);
          headers.push(
            <div
              key={`week-${d.toISOString()}`}
              className='text-xs text-gray-600 bg-gray-100 py-1 border-r border-gray-200 flex items-center justify-center font-medium'
              style={{ width: `${7 * scaledDayWidth}px` }}
            >
              W{weekNumber}
            </div>
          );
        }
        break;

      case 'Month':
        // Monthly headers - show month names
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setMonth(d.getMonth() + 1)
        ) {
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
          const year = d.getFullYear();
          headers.push(
            <div
              key={`month-${d.toISOString()}`}
              className='text-xs text-gray-600 bg-gray-100 py-1 border-r border-gray-200 flex items-center justify-center font-medium'
              style={{ width: `${30 * scaledDayWidth}px` }}
            >
              {monthName} {year}
            </div>
          );
        }
        break;

      default:
        // Default to daily view
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const dayOfWeek = d.getDay();
          if (!viewState.showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
            continue;
          }
          headers.push(
            <div
              key={d.toISOString()}
              className='text-xs text-gray-600 py-1 border-r border-gray-200 flex items-center justify-center font-medium'
              style={{ width: `${scaledDayWidth}px` }}
            >
              {formatDate(d)}
            </div>
          );
        }
    }

    return headers;
  };

  const getTaskBarStyle = task => {
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;
    const isLinkStart = linkingMode && linkStartTaskId === task.id;
    const isCritical =
      task.isCritical ||
      (viewState.showCriticalPath && criticalPathTasks.includes(task.id));
    const isDragging = dragging.taskId === task.id;
    const isMilestone =
      task.type === 'milestone' ||
      task.isMilestone ||
      (task.duration || 1) === 0;

    let baseClasses =
      'rounded-sm transition-all duration-200 cursor-move border';

    if (isMilestone) {
      baseClasses = 'transition-all duration-200 cursor-move'; // Remove border and rounded for diamond
    } else if (task.isGroup) {
      baseClasses += ' bg-green-100 border-green-400 text-green-800';
    } else if (isCritical) {
      baseClasses += ' bg-red-500 opacity-70 border-red-600 text-white';
    } else {
      baseClasses += ' bg-blue-100 border-blue-400 text-blue-800';
    }

    if (isDragging) {
      baseClasses +=
        ' ring-2 ring-orange-500 border-orange-600 shadow-lg opacity-80';
    } else if (isSelected && !isCritical) {
      baseClasses += ' border-2 border-yellow-400 shadow-md shadow-yellow-300';
    } else if (isHovered && !isCritical) {
      baseClasses += ' ring-1 ring-blue-300 border-blue-500 shadow-sm';
    } else if (isLinkStart) {
      baseClasses += ' bg-purple-100 border-purple-400 ring-2 ring-purple-500';
    } else if (isCritical) {
      baseClasses += ' ring-2 ring-red-500 border-red-600 shadow-md opacity-70';
    }

    return baseClasses;
  };

  const getTaskNameStyle = task => {
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;
    const isLinkStart = linkingMode && linkStartTaskId === task.id;

    let baseClasses = 'text-sm font-medium truncate';

    if (isSelected) {
      baseClasses += ' text-yellow-700 font-semibold';
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
              : dragToLink.isActive
                ? '🔗 Drag to link mode active'
                : selectedTaskId
                  ? `Selected: ${tasks.find(t => t.id === selectedTaskId)?.name || 'Unknown'}`
                  : 'No task selected'}
          </div>
        </div>
      </div>

      {/* Timeline Headers */}
      <div className='border-b border-gray-300 bg-gray-50'>
        {/* Dynamic Headers based on View Scale */}
        <div className='flex border-b border-gray-200'>
          {generateTimelineHeaders()}
        </div>
      </div>

      {/* Asta-style Timeline Grid */}
      <div
        ref={timelineContainerRef}
        className={`flex-1 overflow-auto relative ${
          viewState.showGridlines ? 'divide-y divide-gray-300' : ''
        }`}
        onClick={handleChartClick}
      >
        {/* Background Grid */}
        <div className='absolute inset-0 pointer-events-none'>
          {viewState.showGridlines && (
            <>
              {/* Vertical Grid Lines */}
              {gridLines}
              {/* Horizontal Row Grid Lines */}
              {rowLines}
              {/* Today Line Indicator */}
              {todayLineIndicator}
            </>
          )}
        </div>

        {/* Today Marker */}
        {todayMarker}

        {/* Drag-to-link connector line */}
        {dragToLink.isActive && (
          <svg
            className='absolute inset-0 pointer-events-none z-50'
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <marker
                id='drag-arrowhead'
                markerWidth='8'
                markerHeight='8'
                refX='8'
                refY='4'
                orient='auto'
              >
                <path d='M0,0 L8,4 L0,8 Z' fill='#3B82F6' />
              </marker>
            </defs>
            {(() => {
              const containerRect =
                timelineContainerRef.current?.getBoundingClientRect();
              if (!containerRect) return null;

              const x1 = dragToLink.startX - containerRect.left;
              const y1 = dragToLink.startY - containerRect.top;
              const x2 = dragToLink.currentX - containerRect.left;
              const y2 = dragToLink.currentY - containerRect.top;

              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke='#3B82F6'
                  strokeWidth='2'
                  strokeDasharray='5,5'
                  markerEnd='url(#drag-arrowhead)'
                />
              );
            })()}
          </svg>
        )}

        {/* Dependency Arrows */}
        <svg
          ref={svgContainerRef}
          className='absolute inset-0 pointer-events-none z-10'
          style={{ width: '100%', height: '100%' }}
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
              {tasks.map(task => {
                const startDate = new Date(task.startDate);
                const endDate = new Date(task.endDate);
                const duration = task.duration || 1;

                // Calculate position based on filtered timeline dates
                const getDateIndex = date => {
                  const startOfYear = new Date('2024-01-01');
                  const daysFromStart = Math.floor(
                    (date - startOfYear) / (1000 * 60 * 60 * 24)
                  );

                  if (viewState.showWeekends) {
                    return daysFromStart;
                  } else {
                    // Count only weekdays
                    let weekdayCount = 0;
                    for (
                      let d = new Date(startOfYear);
                      d <= date;
                      d.setDate(d.getDate() + 1)
                    ) {
                      const dayOfWeek = d.getDay();
                      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        weekdayCount++;
                      }
                      if (d >= date) break;
                    }
                    return weekdayCount;
                  }
                };

                const daysFromStart = getDateIndex(startDate);
                const baseDayWidth = 2; // Base width per day
                const baseDurationWidth = 20; // Base width per duration unit
                const scaledDayWidth = baseDayWidth * viewState.timelineZoom;
                const scaledDurationWidth =
                  baseDurationWidth * viewState.timelineZoom;

                const left = `${Math.max(daysFromStart * scaledDayWidth, 0)}px`;
                const width =
                  task.type === 'milestone' ||
                  task.isMilestone ||
                  duration === 0
                    ? `${20 * viewState.timelineZoom}px`
                    : `${Math.max(duration * scaledDurationWidth, 40 * viewState.timelineZoom)}px`;

                // Check if task is a milestone (zero duration or isMilestone flag)
                const isMilestone =
                  task.type === 'milestone' ||
                  task.isMilestone ||
                  duration === 0;

                return (
                  <div
                    key={task.id}
                    ref={taskRefs.current[task.id]}
                    className={`flex items-center h-8 hover:bg-gray-50 ${
                      viewState.showGridlines
                        ? 'border-b border-gray-300'
                        : 'border-b border-gray-100'
                    }`}
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
                      {isMilestone ? (
                        <div
                          className={`${getTaskBarStyle(task)} flex items-center justify-center`}
                          style={{
                            left: `${Math.max(daysFromStart * scaledDayWidth - 8, 0)}px`, // center diamond
                            width: '16px',
                            position: 'absolute',
                            top: '4px',
                            height: '16px',
                          }}
                          data-task-id={task.id}
                          onMouseDown={e => handleTaskMouseDown(e, task)}
                          onClick={e => {
                            e.stopPropagation();
                            handleTaskClick(task.id);
                          }}
                          onMouseEnter={e => {
                            handleTaskHover(task.id);
                            setTooltip({
                              visible: true,
                              x: e.clientX,
                              y: e.clientY,
                              task,
                            });
                          }}
                          onMouseLeave={() => {
                            handleTaskLeave();
                            setTooltip({
                              visible: false,
                              x: 0,
                              y: 0,
                              task: null,
                            });
                          }}
                        >
                          <DiamondIcon
                            className='w-4 h-4'
                            color={
                              task.isCritical
                                ? 'text-red-600'
                                : selectedTaskId === task.id
                                  ? 'text-blue-600'
                                  : hoveredTaskId === task.id
                                    ? 'text-blue-500'
                                    : 'text-purple-600'
                            }
                          />
                        </div>
                      ) : (
                        <div
                          className={getTaskBarStyle(task)}
                          style={{
                            left,
                            width,
                            position: 'absolute',
                            top: '2px',
                            height: 'calc(100% - 4px)',
                          }}
                          data-task-id={task.id}
                          onMouseDown={e => handleTaskMouseDown(e, task)}
                          onClick={e => {
                            e.stopPropagation();
                            handleTaskClick(task.id);
                          }}
                          onMouseEnter={e => {
                            handleTaskHover(task.id);
                            setTooltip({
                              visible: true,
                              x: e.clientX,
                              y: e.clientY,
                              task,
                            });
                          }}
                          onMouseLeave={() => {
                            handleTaskLeave();
                            setTooltip({
                              visible: false,
                              x: 0,
                              y: 0,
                              task: null,
                            });
                          }}
                        >
                          {/* Progress indicator */}
                          {task.progress > 0 && (
                            <div
                              className='h-full bg-green-400 rounded-l transition-all duration-300'
                              style={{ width: `${task.progress}%` }}
                            />
                          )}

                          {/* Task Name Label */}
                          {width !== '0px' && parseFloat(width) > 60 && (
                            <div className='absolute inset-0 flex items-center justify-center px-1 pointer-events-none'>
                              <span className='text-white text-xs font-medium truncate'>
                                {task.name}
                              </span>
                            </div>
                          )}

                          {/* Resize Handles */}
                          {(selectedTaskId === task.id ||
                            hoveredTaskId === task.id) && (
                            <>
                              <div
                                className='absolute left-0 top-0 bottom-0 w-2 bg-white cursor-ew-resize border border-gray-300 rounded-l'
                                title='Drag to resize start date'
                              />
                              <div
                                className='absolute right-0 top-0 bottom-0 w-2 bg-white cursor-ew-resize border border-gray-300 rounded-r'
                                title='Drag to resize end date'
                              />
                            </>
                          )}
                        </div>
                      )}

                      {/* Baseline Bar Overlay */}
                      {viewState.showBaseline &&
                        task.baselineStart &&
                        task.baselineEnd && (
                          <div
                            className='h-[6px] bg-gray-300 rounded opacity-50 absolute bottom-0'
                            style={{
                              left: `${Math.max(
                                getDateIndex(new Date(task.baselineStart)) *
                                  scaledDayWidth,
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

                      {/* Slack Overlay */}
                      {viewState.showSlack && taskFloats[task.id] > 0 && (
                        <div
                          className='h-full bg-yellow-400 opacity-40 absolute top-0 rounded-r'
                          style={{
                            left: `${Math.max(daysFromStart * scaledDayWidth + duration * scaledDurationWidth, 0)}px`,
                            width: `${Math.max(taskFloats[task.id] * scaledDurationWidth, 0)}px`,
                          }}
                          title={`Slack: ${taskFloats[task.id].toFixed(1)} days`}
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

      {/* Task Tooltip */}
      {tooltip.visible && tooltip.task && (
        <div
          className='fixed bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-[9999] pointer-events-none border border-gray-700 transition-opacity duration-200'
          style={{
            top: tooltip.y - 80,
            left: tooltip.x + 10,
            maxWidth: '250px',
          }}
        >
          <div className='font-semibold mb-2 text-blue-300'>
            {tooltip.task.name}
          </div>
          <div className='space-y-1 text-gray-200'>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Start:</span>
              <span>{formatDate(tooltip.task.startDate)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>End:</span>
              <span>{formatDate(tooltip.task.endDate)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-400'>Duration:</span>
              <span>{calculateDuration(tooltip.task.startDate, tooltip.task.endDate)} days</span>
            </div>
            {(tooltip.task.type === 'milestone' ||
              tooltip.task.isMilestone) && (
              <div className='text-purple-300 font-medium mt-2 pt-1 border-t border-gray-700'>
                Milestone
              </div>
            )}
            {(tooltip.task.isCritical ||
              (viewState.showCriticalPath &&
                criticalPathTasks.includes(tooltip.task.id))) && (
              <div className='text-red-300 font-medium mt-2 pt-1 border-t border-gray-700'>
                Critical Task
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
