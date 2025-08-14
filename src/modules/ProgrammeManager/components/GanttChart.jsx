import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

// Import milestone shape utilities
import {
  getTaskMilestoneShape,
  getMilestoneColor,
  createMilestoneShapeComponent,
} from '../utils/milestoneShapeUtils.jsx';
import { useTaskContext } from '../context/TaskContext';
import { useViewContext } from '../context/ViewContext';
import { useFilterContext } from '../context/FilterContext';
import { useCalendarContext } from '../context/CalendarContext';
import { usePlannerStore } from '../state/plannerStore';
import DateMarkersOverlay from './DateMarkersOverlay';
import GanttHeader from './GanttHeader';
import { calculateCriticalPath } from '../utils/criticalPath';
import {
  addDays,
  snapToWeekday,
  calculateDuration,
  getWeek,
} from '../utils/dateUtils';
import { validateTaskDates, getPredecessors } from '../utils/scheduleUtils';
import { isWorkday, snapToWorkday } from '../utils/calendarUtils';
import { isWorkingDay } from './GanttChart/calendar';
import {
  hasBaselineData,
  getBaselineTooltip,
  calculateBaselinePerformance,
  formatVariance,
} from '../utils/baselineUtils';
import {
  calculateProgressLinePosition,
  calculateTaskProgressStatus,
  calculateProgressIndicator,
} from '../utils/progressLineUtils';
import {
  getConstraintStyling,
  getConstraintTooltip,
  formatConstraint,
} from '../utils/constraintUtils';
import {
  calculateDeadlineStatus,
  getDeadlineStatusStyling,
  calculateDeadlinePosition,
  getDeadlineTooltip,
  hasDeadlineWarning,
  getDeadlineWarningLevel,
} from '../utils/deadlineUtils';
import {
  getCriticalPathStyling,
  getCriticalPathTooltip,
  isCriticalPathHighlightingEnabled,
} from '../utils/criticalPathUtils';
import {
  formatFloat,
  getFloatStyling,
  getFloatTooltip,
  getFloatDisplayPosition,
  isFloatDisplayEnabled,
} from '../utils/floatUtils';
import {
  isTaskSplit,
  getTaskSegments,
  getSegmentStyling,
  getSegmentTooltip,
  calculateSegmentGaps,
} from '../utils/taskSegmentUtils';
import { getTaskBarStyle, createBarStyleObject } from '../utils/barStyleUtils';
import {
  getBaselineById,
  compareWithBaseline,
  getBaselineComparisonMode,
} from '../utils/baselineManagerUtils';
import { getTaskBarLabels, getLabelTooltip } from '../utils/barLabelUtils';
import {
  createProgressEditState,
  updateProgressEditState,
  getProgressEditStyles,
  getProgressBarStyles,
  getDragHandleStyles,
  getTooltipStyles,
  getProgressEditHandlers,
  createProgressUpdateHandler,
  formatProgress,
  DEFAULT_PROGRESS_EDIT_CONFIG,
} from '../utils/progressEditUtils';
import TaskSplitModal from './modals/TaskSplitModal';
import DependencyLagModal from './modals/DependencyLagModal';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
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
  const { getCalendarForTask, globalCalendar } = useCalendarContext();
  
  // Use unified selection from plannerStore
  const {
    selectedTaskIds,
    selectOne,
    toggleSelection,
    selectRange,
    clearSelection,
  } = usePlannerStore();
  
  const { applyFilters } = useFilterContext();

  // Calculate scaled width based on time unit
  const getScaledWidth = useMemo(() => {
    const baseZoom = viewState.timelineZoom;
    const timeUnit = viewState.timeUnit || 'day';

    switch (timeUnit) {
      case 'day':
        return baseZoom; // Pixels per day
      case 'week':
        return baseZoom * 7; // Pixels per week
      case 'month':
        return baseZoom * 30; // Pixels per month (approximate)
      default:
        return baseZoom;
    }
  }, [viewState.timelineZoom, viewState.timeUnit]);

  // Get date increment based on time unit
  const getDateIncrement = useMemo(() => {
    const timeUnit = viewState.timeUnit || 'day';

    switch (timeUnit) {
      case 'day':
        return 1; // 1 day
      case 'week':
        return 7; // 1 week
      case 'month':
        return 30; // 1 month (approximate)
      default:
        return 1;
    }
  }, [viewState.timeUnit]);

  const taskRefs = useRef({});
  const svgContainerRef = useRef(null);
  const timelineContainerRef = useRef(null);

  // Smooth scrolling hook for Gantt chart
  const { scrollRef: smoothScrollRef } = useSmoothScroll({
    horizontalMultiplier: 0.8,
    verticalMultiplier: 1.0,
    throttleMs: 16,
    enableShiftWheel: true
  });

  // Scroll state for header synchronization
  const [scrollLeft, setScrollLeft] = useState(0);

  // Constraint state for visual feedback
  const [constraintWarning, setConstraintWarning] = useState({
    taskId: null,
    message: '',
    timestamp: 0,
  });
  const [taskSplitModal, setTaskSplitModal] = useState({
    isOpen: false,
    task: null,
  });

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

  // Resize state
  const [resizing, setResizing] = useState({
    taskId: null,
    handle: null, // 'start' or 'end'
    startX: 0,
    originalStartDate: null,
    originalEndDate: null,
    lastDayOffset: 0,
  });

  // Marquee selection state
  const [marquee, setMarquee] = useState({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Progress edit state
  const [progressEditState, setProgressEditState] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const allTasks = getVisibleTasks(viewState.taskFilter);
  const tasks = applyFilters(allTasks);

  // Progress update handler
  const progressUpdateHandler = useMemo(() => {
    return createProgressUpdateHandler(
      updateTask,
      DEFAULT_PROGRESS_EDIT_CONFIG
    );
  }, [updateTask]);

  // Handle progress change
  const handleProgressChange = useCallback(
    (taskId, newProgress) => {
      progressUpdateHandler(taskId, newProgress);
    },
    [progressUpdateHandler]
  );

  // Global mouse event handlers for progress editing
  useEffect(() => {
    const handleGlobalMouseMove = e => {
      if (progressEditState && progressEditState.isEditing) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseUp = () => {
      if (progressEditState && progressEditState.isEditing) {
        setProgressEditState(null);
      }
    };

    if (progressEditState && progressEditState.isEditing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [progressEditState]);

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
    const scaledDayWidth = getScaledWidth; // Use time unit-based scaling

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

    // Generate grid lines based on time unit
    const timeUnit = viewState.timeUnit || 'day';

    switch (timeUnit) {
      case 'day':
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

      case 'week':
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

      case 'month':
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
    const scaledDayWidth = getScaledWidth; // Use time unit-based scaling

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
        className='today-marker absolute top-0 bottom-0 z-30'
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
    getScaledWidth,
  ]);

  // Generate today line indicator
  const todayLineIndicator = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date('2024-01-01');
    const scaledDayWidth = getScaledWidth; // Use time unit-based scaling

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
        className='absolute top-0 bottom-0 w-[2px] bg-red-600 z-50'
        style={{
          left: `${left}px`,
          pointerEvents: 'none',
        }}
      />
    );
  }, [dateRange, viewState.showWeekends, getScaledWidth]);

  // Generate horizontal row grid lines
  const rowLines = useMemo(() => {
    if (!viewState.showGridlines) return [];

    const rowHeight = 32; // h-8 = 32px
    const lines = [];

    tasks.forEach((task, index) => {
      lines.push(
        <div
          key={`row-line-${task.id}`}
          className='absolute left-0 right-0 border-b border-gray-200'
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

  // Generate working time shading blocks with perfect header alignment
  const nonWorkingDayBlocks = useMemo(() => {
    const blocks = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const scaledDayWidth = getScaledWidth; // Use time unit-based scaling

    // Calculate start position offset - same logic as header
    const startOfYear = new Date('2024-01-01');
    const getDateIndex = date => {
      const daysFromStart = Math.floor(
        (date - startOfYear) / (1000 * 60 * 60 * 24)
      );

      if (viewState.showWeekends) {
        return daysFromStart;
      } else {
        // Count only weekdays - same logic as header
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
      // Use new calendar utility for working day determination
      if (!isWorkingDay(d)) {
        const left = getDateIndex(d) * scaledDayWidth;

        blocks.push(
          <div
            key={`nonworking-${d.toISOString()}`}
            className='absolute top-0 bottom-0 z-0'
            style={{
              left: `${left}px`,
              width: `${scaledDayWidth}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.035)', // Dark theme shading
            }}
          />
        );
      }
    }

    return blocks;
  }, [dateRange, viewState.showWeekends, getScaledWidth]);

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
        arrow.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();

          // Calculate modal position
          const rect = event.target.getBoundingClientRect();
          const position = {
            x: rect.left + rect.width / 2,
            y: rect.top,
          };

          setSelectedLink(link);
          setModalPosition(position);
          setShowDependencyModal(true);
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

  // Handle Gantt re-layout events from realtime updates
  useEffect(() => {
    const handleGanttRelayout = () => {
      // Force a re-render of the Gantt chart
      // This will trigger recalculation of task positions and layout
      if (svgContainerRef.current) {
        // Trigger a small DOM change to force re-render
        const currentScrollLeft = svgContainerRef.current.scrollLeft;
        svgContainerRef.current.scrollLeft = currentScrollLeft;
      }
    };

    window.addEventListener('GANTT_RELAYOUT', handleGanttRelayout);

    return () => {
      window.removeEventListener('GANTT_RELAYOUT', handleGanttRelayout);
    };
  }, []);

  // Handle task click in Gantt chart
  const handleGanttTaskClick = useCallback((taskId, e) => {
    // If in linking mode, handle linking logic
    if (linkingMode) {
      handleTaskClickForLinking(taskId);
      return;
    }

    // Handle modifiers for multi-select
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + click: toggle selection
      toggleSelection(taskId);
    } else if (e.shiftKey && selectedTaskIds.size > 0) {
      // Shift + click: range selection
      const lastSelected = Array.from(selectedTaskIds).pop();
      if (lastSelected) {
        selectRange(lastSelected, taskId);
      } else {
        selectOne(taskId);
      }
    } else {
      // Regular click: select one
      selectOne(taskId);
    }
  }, [linkingMode, handleTaskClickForLinking, toggleSelection, selectOne, selectRange, selectedTaskIds]);

  // Handle chart click to clear selection
  const handleChartClick = useCallback((e) => {
    // Only clear selection if clicking on empty space
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle task hover
  const handleTaskHover = taskId => {
    setHoveredTask(taskId);
  };

  // Handle task leave
  const handleTaskLeave = () => {
    clearHoveredTask();
  };

  // Grid snapping helper functions
  const snapToGrid = x => {
    const scaledDayWidth = getScaledWidth; // Use time unit-based scaling
    const index = Math.round(x / scaledDayWidth);
    return index * scaledDayWidth;
  };

  // Enhanced day-based snapping for task dragging
  const snapToDayGrid = deltaX => {
    const scaledDayWidth = getScaledWidth; // Use time unit-based scaling
    const dayOffset = Math.round(deltaX / scaledDayWidth);
    return {
      dayOffset,
      snappedDeltaX: dayOffset * scaledDayWidth,
    };
  };

  // Helper functions for date conversion
  const getDateFromX = x => {
    const startOfYear = new Date('2024-01-01');
    const scaledDayWidth = getScaledWidth;
    const dayIndex = Math.round(x / scaledDayWidth);

    if (viewState.showWeekends) {
      return addDays(startOfYear, dayIndex);
    } else {
      // Count only weekdays
      const currentDate = new Date(startOfYear);
      let weekdayCount = 0;

      while (weekdayCount < dayIndex) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          weekdayCount++;
        }
      }

      return currentDate;
    }
  };

  const getXFromDate = date => {
    const startOfYear = new Date('2024-01-01');
    const scaledDayWidth = getScaledWidth;

    if (viewState.showWeekends) {
      const daysFromStart = Math.floor(
        (date - startOfYear) / (1000 * 60 * 60 * 24)
      );
      return daysFromStart * scaledDayWidth;
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
      return weekdayCount * scaledDayWidth;
    }
  };

  // Drag event handlers
  const handleTaskDragStart = (e, task) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging({
      taskId: task.id,
      startX: e.clientX,
      originalStartDate: new Date(task.startDate),
    });

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleTaskDragMove);
    document.addEventListener('mouseup', handleTaskDragEnd);
  };

  const handleTaskDragMove = e => {
    if (!dragging.taskId) return;

    const deltaX = e.clientX - dragging.startX;

    // Snap to 1-day grid using enhanced snapping function
    const { dayOffset, snappedDeltaX } = snapToDayGrid(deltaX);

    // Only update task position if day offset has changed (prevents partial-pixel updates)
    if (dayOffset !== dragging.lastDayOffset) {
      // Find the task being dragged
      const task = tasks.find(t => t.id === dragging.taskId);
      if (!task) return;

      // Calculate new dates using snapped values
      const newStartDate = addDays(dragging.originalStartDate, dayOffset);

      // Get predecessor constraints
      const predecessors = getPredecessors(task.id, taskLinks, tasks);

      // Get calendar for this task
      const taskCalendar = getCalendarForTask(task.id, task);

      // Validate dates with constraints
      const validation = validateTaskDates(
        task,
        newStartDate,
        task.endDate,
        predecessors,
        taskCalendar
      );

      // Update task dates with validated values
      task.startDate = validation.startDate.toISOString();

      // Show constraint warning if needed
      if (validation.wasConstrained) {
        setConstraintWarning({
          taskId: task.id,
          message: 'Task position adjusted due to constraints',
          timestamp: Date.now(),
        });
      } else {
        setConstraintWarning({
          taskId: null,
          message: '',
          timestamp: 0,
        });
      }

      // Update drag state with new day offset
      setDragging(prev => ({
        ...prev,
        lastDayOffset: dayOffset,
      }));

      console.log('Task dragged with constraints:', {
        taskId: task.id,
        dayOffset,
        snappedDeltaX,
        newStartDate: validation.startDate.toISOString(),
        wasConstrained: validation.wasConstrained,
      });
    }
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
      }
    }

    // Clear constraint warning
    setConstraintWarning({
      taskId: null,
      message: '',
      timestamp: 0,
    });

    // Clean up
    setDragging({
      taskId: null,
      startX: 0,
      originalStartDate: null,
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

  // Resize handlers
  const handleResizeStart = (e, task, handle) => {
    e.preventDefault();
    e.stopPropagation();

    setResizing({
      taskId: task.id,
      handle, // 'start' or 'end'
      startX: e.clientX,
      originalStartDate: new Date(task.startDate),
      originalEndDate: new Date(task.endDate),
      lastDayOffset: 0,
    });

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = e => {
    if (!resizing.taskId) return;

    const deltaX = e.clientX - resizing.startX;
    const scaledDayWidth = viewState.timelineZoom;
    const dayOffset = Math.round(deltaX / scaledDayWidth);

    // Only update if day offset has changed
    if (dayOffset !== resizing.lastDayOffset) {
      const task = tasks.find(t => t.id === resizing.taskId);
      if (!task) return;

      let newStartDate = new Date(resizing.originalStartDate);
      let newEndDate = new Date(resizing.originalEndDate);

      if (resizing.handle === 'start') {
        newStartDate = addDays(resizing.originalStartDate, dayOffset);
      } else if (resizing.handle === 'end') {
        newEndDate = addDays(resizing.originalEndDate, dayOffset);
      }

      // Get predecessor constraints (only for start handle)
      const predecessors =
        resizing.handle === 'start'
          ? getPredecessors(task.id, taskLinks, tasks)
          : [];

      // Get calendar for this task
      const taskCalendar = getCalendarForTask(task.id, task);

      // Validate dates with constraints
      const validation = validateTaskDates(
        task,
        newStartDate,
        newEndDate,
        predecessors,
        taskCalendar
      );

      // Update task dates with validated values
      task.startDate = validation.startDate.toISOString();
      task.endDate = validation.endDate.toISOString();

      // Show constraint warning if needed
      if (validation.wasConstrained) {
        setConstraintWarning({
          taskId: task.id,
          message: `Task ${resizing.handle} adjusted due to constraints`,
          timestamp: Date.now(),
        });
      } else {
        setConstraintWarning({
          taskId: null,
          message: '',
          timestamp: 0,
        });
      }

      // Update resize state
      setResizing(prev => ({
        ...prev,
        lastDayOffset: dayOffset,
      }));

      console.log('Task resized with constraints:', {
        taskId: task.id,
        handle: resizing.handle,
        dayOffset,
        newStartDate: validation.startDate.toISOString(),
        newEndDate: validation.endDate.toISOString(),
        wasConstrained: validation.wasConstrained,
      });
    }
  };

  const handleResizeEnd = async () => {
    if (!resizing.taskId) return;

    const task = tasks.find(t => t.id === resizing.taskId);
    if (task) {
      try {
        // Update task dates via TaskContext
        updateTask(resizing.taskId, {
          startDate: task.startDate,
          endDate: task.endDate,
        });

        console.log('Task resized successfully:', {
          taskId: resizing.taskId,
          handle: resizing.handle,
          newStartDate: task.startDate,
          newEndDate: task.endDate,
        });
      } catch (error) {
        console.error('Error updating task dates:', error);
        // Revert to original dates on error
        task.startDate = resizing.originalStartDate.toISOString();
        task.endDate = resizing.originalEndDate.toISOString();
      }
    }

    // Clear constraint warning
    setConstraintWarning({
      taskId: null,
      message: '',
      timestamp: 0,
    });

    // Clean up
    setResizing({
      taskId: null,
      handle: null,
      startX: 0,
      originalStartDate: null,
      originalEndDate: null,
      lastDayOffset: 0,
    });

    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
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

  // Handle horizontal scroll synchronization
  const handleTimelineScroll = e => {
    setScrollLeft(e.target.scrollLeft);
  };

  // Marquee selection handlers
  const handleMarqueeStart = e => {
    // Only start marquee if clicking on empty space (not on a task)
    if (
      e.target === timelineContainerRef.current ||
      e.target.closest('.task-row') === null
    ) {
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      setMarquee({
        isActive: true,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
      });

      // Clear selection if not holding Shift/Ctrl
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        clearSelection();
      }
    }
  };

  const handleMarqueeMove = e => {
    if (marquee.isActive) {
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setMarquee(prev => ({
        ...prev,
        currentX,
        currentY,
      }));
    }
  };

  const handleMarqueeEnd = e => {
    if (marquee.isActive) {
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      // Calculate marquee bounds
      const left = Math.min(marquee.startX, endX);
      const top = Math.min(marquee.startY, endY);
      const width = Math.abs(endX - marquee.startX);
      const height = Math.abs(endY - marquee.startY);

      // Find tasks that intersect with the marquee
      const intersectingTasks = tasks.filter(task => {
        const taskElement = taskRefs.current[task.id];
        if (!taskElement) return false;

        const taskRect = taskElement.getBoundingClientRect();
        const taskLeft = taskRect.left - rect.left;
        const taskTop = taskRect.top - rect.top;
        const taskRight = taskLeft + taskRect.width;
        const taskBottom = taskTop + taskRect.height;

        // Check if task intersects with marquee
        return !(
          taskLeft > left + width ||
          taskRight < left ||
          taskTop > top + height ||
          taskBottom < top
        );
      });

      // Update selection based on modifier keys
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        // Add to existing selection
        intersectingTasks.forEach(task => {
          addToSelection(task.id);
        });
      } else {
        // Replace selection
        if (intersectingTasks.length > 0) {
          selectAll(intersectingTasks.map(task => task.id));
        }
      }

      // Clear marquee
      setMarquee({
        isActive: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      });
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
    const scaledDayWidth = getScaledWidth; // Use time unit-based scaling

    // Check if dual scale is enabled
    if (viewState.timeScale === 'dual') {
      return generateDualScaleHeaders();
    }

    // Generate headers based on time unit
    const timeUnit = viewState.timeUnit || 'day';

    switch (timeUnit) {
      case 'day':
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

      case 'week':
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
              style={{ width: `${scaledDayWidth}px` }}
            >
              W{weekNumber}
            </div>
          );
        }
        break;

      case 'month':
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
              style={{ width: `${scaledDayWidth}px` }}
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

  const generateDualScaleHeaders = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const scaledDayWidth = getScaledWidth;
    const primaryTimeUnit = viewState.primaryTimeUnit || 'day';
    const secondaryTimeUnit = viewState.secondaryTimeUnit || 'week';

    // Generate primary scale headers (top row)
    const primaryHeaders = [];
    const secondaryHeaders = [];

    // Generate headers based on primary time unit
    switch (primaryTimeUnit) {
      case 'month':
        // Monthly headers - show month names
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setMonth(d.getMonth() + 1)
        ) {
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
          const year = d.getFullYear();
          primaryHeaders.push(
            <div
              key={`primary-month-${d.toISOString()}`}
              className='text-xs text-gray-800 bg-blue-50 py-1 border-r border-gray-200 flex items-center justify-center font-semibold'
              style={{ width: `${scaledDayWidth * 30}px` }}
            >
              {monthName} {year}
            </div>
          );
        }
        break;

      case 'week':
        // Weekly headers - show week numbers
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 7)
        ) {
          const weekNumber = getWeek(d);
          primaryHeaders.push(
            <div
              key={`primary-week-${d.toISOString()}`}
              className='text-xs text-gray-800 bg-blue-50 py-1 border-r border-gray-200 flex items-center justify-center font-semibold'
              style={{ width: `${scaledDayWidth * 7}px` }}
            >
              W{weekNumber}
            </div>
          );
        }
        break;

      case 'day':
      default:
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
          primaryHeaders.push(
            <div
              key={`primary-day-${d.toISOString()}`}
              className='text-xs text-gray-800 bg-blue-50 py-1 border-r border-gray-200 flex items-center justify-center font-semibold'
              style={{ width: `${scaledDayWidth}px` }}
            >
              {formatDate(d)}
            </div>
          );
        }
        break;
    }

    // Generate secondary scale headers (bottom row)
    switch (secondaryTimeUnit) {
      case 'month':
        // Monthly headers - show month names
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setMonth(d.getMonth() + 1)
        ) {
          const monthName = d.toLocaleDateString('en-US', { month: 'short' });
          const year = d.getFullYear();
          secondaryHeaders.push(
            <div
              key={`secondary-month-${d.toISOString()}`}
              className='text-xs text-gray-600 bg-gray-100 py-1 border-r border-gray-200 flex items-center justify-center font-medium'
              style={{ width: `${scaledDayWidth * 30}px` }}
            >
              {monthName} {year}
            </div>
          );
        }
        break;

      case 'week':
        // Weekly headers - show week numbers
        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 7)
        ) {
          const weekNumber = getWeek(d);
          secondaryHeaders.push(
            <div
              key={`secondary-week-${d.toISOString()}`}
              className='text-xs text-gray-600 bg-gray-100 py-1 border-r border-gray-200 flex items-center justify-center font-medium'
              style={{ width: `${scaledDayWidth * 7}px` }}
            >
              W{weekNumber}
            </div>
          );
        }
        break;

      case 'day':
      default:
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
          secondaryHeaders.push(
            <div
              key={`secondary-day-${d.toISOString()}`}
              className='text-xs text-gray-600 bg-gray-100 py-1 border-r border-gray-200 flex items-center justify-center font-medium'
              style={{ width: `${scaledDayWidth}px` }}
            >
              {formatDate(d)}
            </div>
          );
        }
        break;
    }

    // Return dual-scale header structure
    return (
      <div className='flex flex-col'>
        {/* Primary scale row */}
        <div className='flex border-b border-gray-300'>{primaryHeaders}</div>
        {/* Secondary scale row */}
        <div className='flex'>{secondaryHeaders}</div>
      </div>
    );
  };

  const generateWeekHeaders = () => {
    const weekHeaders = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const scaledDayWidth = viewState.timelineZoom;

    // Only show week headers for Day view
    if (viewState.viewScale !== 'Day') {
      return null;
    }

    let currentWeek = null;
    let weekStartX = 0;
    let weekWidth = 0;
    let dayIndex = 0;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dayOfWeek = d.getDay();
      if (!viewState.showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      const weekNumber = getWeek(d);

      if (currentWeek !== weekNumber) {
        // Save previous week header if exists
        if (currentWeek !== null && weekWidth > 0) {
          weekHeaders.push(
            <div
              key={`week-header-${currentWeek}`}
              className='text-xs text-gray-600 bg-gray-100 py-1 border-b border-gray-200 flex items-center justify-center font-medium'
              style={{
                left: `${weekStartX}px`,
                width: `${weekWidth}px`,
                position: 'absolute',
              }}
            >
              W{currentWeek}
            </div>
          );
        }

        // Start new week
        currentWeek = weekNumber;
        weekStartX = dayIndex * scaledDayWidth;
        weekWidth = scaledDayWidth;
      } else {
        weekWidth += scaledDayWidth;
      }

      dayIndex++;
    }

    // Add the last week header
    if (currentWeek !== null && weekWidth > 0) {
      weekHeaders.push(
        <div
          key={`week-header-${currentWeek}`}
          className='text-xs text-gray-600 bg-gray-100 py-1 border-b border-gray-200 flex items-center justify-center font-medium'
          style={{
            left: `${weekStartX}px`,
            width: `${weekWidth}px`,
            position: 'absolute',
          }}
        >
          W{currentWeek}
        </div>
      );
    }

    return weekHeaders;
  };

  const getTaskBarStyle = task => {
    const isTaskSelected = selectedTaskIds.has(task.id);
    const isHovered = hoveredTaskId === task.id;
    const isLinkStart = linkingMode && linkStartTaskId === task.id;
    const isMultiSelected = selectedTaskIds.size > 1;

    let baseClasses = 'gantt-task-bar';
    if (isTaskSelected) {
      baseClasses += isMultiSelected ? ' multi-selected' : ' selected';
    }
    if (isHovered) {
      baseClasses += ' hovered';
    }
    if (isLinkStart) {
      baseClasses += ' link-start';
    }

    const isCritical =
      task.isCritical && isCriticalPathHighlightingEnabled(viewState);
    const isDragging = dragging.taskId === task.id;
    const isMilestone =
      task.type === 'milestone' ||
      task.isMilestone ||
      (task.duration || 1) === 0;
    const isConstrained =
      constraintWarning.taskId === task.id &&
      Date.now() - constraintWarning.timestamp < 2000; // Show for 2 seconds
    const hasConstraint =
      task.constraints &&
      task.constraints.type &&
      task.constraints.type !== 'ASAP';

    // Get custom bar style from user settings
    const customBarStyle = getTaskBarStyle(task, viewState.userSettings);
    const customStyleObject = createBarStyleObject(customBarStyle);

    // Get default color based on task type
    const getDefaultColor = task => {
      if (task.type === 'milestone' || task.isMilestone) {
        return '#8B5CF6'; // Purple for milestones
      } else if (task.isGroup) {
        return '#10B981'; // Green for groups
      } else {
        return '#3B82F6'; // Blue for regular tasks
      }
    };

    // Use custom color if available, otherwise use default
    const taskColor = task.color || getDefaultColor(task);

    // Get critical path styling if enabled
    const criticalPathStyling = isCritical
      ? getCriticalPathStyling(true)
      : null;

    if (isMilestone) {
      baseClasses += ' transition-all duration-200 cursor-move'; // Remove border and rounded for diamond
    } else if (isCritical) {
      baseClasses += ' bg-red-600 border-red-600 text-white shadow-md';
    } else {
      // Use custom color for background and border
      baseClasses += ` bg-opacity-20 border-opacity-60`;
    }

    if (isDragging) {
      baseClasses +=
        ' ring-2 ring-orange-500 border-orange-600 shadow-lg opacity-80';
    } else if (isTaskSelected && !isCritical) {
      baseClasses += ' ring-2 ring-blue-400 border-blue-500 shadow-md';
    } else if (isHovered && !isCritical) {
      baseClasses += ' ring-1 ring-blue-300 border-blue-500 shadow-sm';
    } else if (isLinkStart) {
      baseClasses += ' bg-purple-100 border-purple-400 ring-2 ring-purple-500';
    } else if (isCritical) {
      baseClasses += ' ring-2 ring-red-500 border-red-600 shadow-md';
    }

    // Add constraint warning styling
    if (isConstrained) {
      baseClasses += ' animate-pulse border-red-500 ring-2 ring-red-400';
    }

    // Add constraint styling
    if (hasConstraint) {
      const constraintStyling = getConstraintStyling(task.constraints.type);
      baseClasses += ` border-2 ${constraintStyling.borderColor}`;
    }

    // Merge custom styles with default styles
    const mergedStyle = {
      backgroundColor: isCritical
        ? criticalPathStyling.backgroundColor
        : customStyleObject.backgroundColor || `${taskColor}20`,
      borderColor: isCritical
        ? criticalPathStyling.borderColor
        : customStyleObject.borderColor || `${taskColor}60`,
      color: isCritical ? criticalPathStyling.color : customStyleObject.color,
      opacity: customStyleObject.opacity,
      borderRadius: customStyleObject.borderRadius,
      border: customStyleObject.border,
      transition: customStyleObject.transition,
    };

    return {
      className: baseClasses,
      style: mergedStyle,
    };
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

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      clearSelection();
    }
  }, [clearSelection]);

  return (
    <div className='gantt-viewport pm-content-dark'>
      {/* Asta-style Timeline Header */}
      <div className='asta-timeline-header px-4 py-2'>
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

      {/* Dual-Row Timeline Header */}
      <GanttHeader
        startDate={dateRange.start}
        endDate={dateRange.end}
        zoomScale={viewState.timelineZoom}
        showWeekends={viewState.showWeekends}
        viewScale={viewState.viewScale}
        timeScale={viewState.timeScale}
        primaryTimeUnit={viewState.primaryTimeUnit}
        secondaryTimeUnit={viewState.secondaryTimeUnit}
        scrollLeft={scrollLeft}
      />

      {/* Asta-style Timeline Grid */}
      <div
        ref={(el) => {
          timelineContainerRef.current = el;
          smoothScrollRef.current = el;
        }}
        className={`gantt-timeline-container ${
          viewState.showGridlines ? 'divide-y divide-gray-300' : ''
        }`}
        onClick={handleChartClick}
        onScroll={handleTimelineScroll}
        onMouseDown={handleMarqueeStart}
        onMouseMove={handleMarqueeMove}
        onMouseUp={handleMarqueeEnd}
      >
        {/* Background Grid */}
        <div className='absolute inset-0 pointer-events-none'>
          {/* Working Time Shading - Always visible */}
          {nonWorkingDayBlocks}

          {viewState.showGridlines && (
            <>
              {/* Vertical Grid Lines */}
              {gridLines}
              {/* Horizontal Row Grid Lines */}
              {rowLines}
            </>
          )}
        </div>

        {/* Today Line Indicator - Always visible */}
        {todayLineIndicator}

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

        {/* Marquee Selection Box */}
        {marquee.isActive && (
          <div
            className='absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 pointer-events-none z-40'
            style={{
              left: Math.min(marquee.startX, marquee.currentX),
              top: Math.min(marquee.startY, marquee.currentY),
              width: Math.abs(marquee.currentX - marquee.startX),
              height: Math.abs(marquee.currentY - marquee.startY),
            }}
          />
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

        {/* Progress Line */}
        {viewState.showProgressLine && viewState.statusDate &&
          (() => {
            const statusDate = new Date(viewState.statusDate);
            const projectStart = new Date('2024-01-01'); // Use same start as timeline
            const progressLinePosition = calculateProgressLinePosition(
              statusDate,
              projectStart,
              getScaledWidth
            );

            return (
              <div
                className='absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none'
                style={{
                  left: `${progressLinePosition}px`,
                }}
                title={`Progress Line: ${statusDate.toLocaleDateString()}`}
              />
            );
          })()}

        {/* Deadline Markers */}
        {tasks
          .filter(task => task.deadline)
          .map(task => {
            const deadline = new Date(task.deadline);
            const projectStart = new Date('2024-01-01'); // Use same start as timeline
            const deadlinePosition = calculateDeadlinePosition(
              deadline,
              projectStart,
              getScaledWidth
            );
            const deadlineStatus = calculateDeadlineStatus(task);
            const styling = getDeadlineStatusStyling(deadlineStatus.status);

            return (
              <div
                key={`deadline-${task.id}`}
                className='absolute top-0 bottom-0 w-0.5 z-25 pointer-events-none'
                style={{
                  left: `${deadlinePosition}px`,
                  backgroundColor: deadlineStatus.isOverdue
                    ? '#ef4444'
                    : '#f59e0b',
                }}
                title={getDeadlineTooltip(task)}
              />
            );
          })}

        {/* Timeline Content */}
        <div className='relative z-20'>
          {tasks.length === 0 ? (
            <div className='gantt-empty-state'>
              <div className='gantt-empty-state-title'>No tasks available</div>
              <div className='gantt-empty-state-subtitle'>Add tasks to see them in the timeline</div>
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
                const scaledDayWidth = getScaledWidth; // Use time unit-based scaling
                const scaledDurationWidth = getScaledWidth; // Use time unit-based scaling

                const left = `${Math.max(daysFromStart * scaledDayWidth, 0)}px`;
                const width =
                  task.type === 'milestone' ||
                  task.isMilestone ||
                  duration === 0
                    ? `${20 * getScaledWidth}px`
                    : `${Math.max(duration * scaledDurationWidth, 40 * getScaledWidth)}px`;

                // Check if task is a milestone (zero duration or isMilestone flag)
                const isMilestone =
                  task.type === 'milestone' ||
                  task.isMilestone ||
                  duration === 0;

                return (
                  <div
                    key={task.id}
                    ref={taskRefs.current[task.id]}
                    className={`task-row flex items-center h-8 hover:bg-gray-50 ${
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

                      {/* Deadline Warning Icon */}
                      {hasDeadlineWarning(task) && (
                        <div
                          className='ml-1 flex items-center'
                          title={getDeadlineTooltip(task)}
                        >
                          {(() => {
                            const deadlineStatus =
                              calculateDeadlineStatus(task);
                            const styling = getDeadlineStatusStyling(
                              deadlineStatus.status
                            );
                            return (
                              <span
                                className={`text-xs ${styling.color}`}
                                title={styling.tooltip}
                              >
                                {styling.icon}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Timeline Bar Area */}
                    <div className='flex-1 relative h-full'>
                      {isMilestone ? (
                        <div
                          className={`${getTaskBarStyle(task).className} flex items-center justify-center`}
                          style={{
                            left: `${Math.max(daysFromStart * scaledDayWidth - 8, 0)}px`, // center diamond
                            width: '16px',
                            position: 'absolute',
                            top: '4px',
                            height: '16px',
                            ...getTaskBarStyle(task).style,
                          }}
                          data-task-id={task.id}
                          onMouseDown={e => handleTaskMouseDown(e, task)}
                          onClick={e => {
                            e.stopPropagation();
                            handleGanttTaskClick(task.id, e);
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
                          {createMilestoneShapeComponent(
                            getTaskMilestoneShape(
                              task,
                              viewState.globalMilestoneShape
                            ),
                            'w-4 h-4',
                            getMilestoneColor(
                              {
                                ...task,
                                selected: selectedTaskIds.has(task.id),
                                hovered: hoveredTaskId === task.id,
                              },
                              getTaskMilestoneShape(
                                task,
                                viewState.globalMilestoneShape
                              )
                            )
                          )}
                        </div>
                      ) : isTaskSplit(task) ? (
                        // Render split task segments
                        getTaskSegments(task).map((segment, segmentIndex) => {
                          const segmentStartDate = new Date(segment.startDate);
                          const segmentDaysFromStart = Math.ceil(
                            (segmentStartDate.getTime() -
                              new Date('2024-01-01').getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          const segmentWidth = `${Math.max(segment.duration * scaledDayWidth, 40)}px`;
                          const segmentLeft = `${Math.max(segmentDaysFromStart * scaledDayWidth, 0)}px`;

                          return (
                            <div
                              key={segment.id}
                              className={
                                getSegmentStyling(segment, task).className
                              }
                              style={{
                                left: segmentLeft,
                                width: segmentWidth,
                                height: 'calc(100% - 4px)',
                                position: 'absolute',
                                top: '2px',
                                ...getSegmentStyling(segment, task).style,
                              }}
                              data-task-id={task.id}
                              data-segment-id={segment.id}
                              onMouseDown={e => handleTaskMouseDown(e, task)}
                              onClick={e => {
                                e.stopPropagation();
                                handleGanttTaskClick(task.id, e);
                              }}
                              onMouseEnter={e => {
                                handleTaskHover(task.id);
                                setTooltip({
                                  visible: true,
                                  x: e.clientX,
                                  y: e.clientY,
                                  task,
                                  segment,
                                });
                              }}
                              onMouseLeave={() => {
                                handleTaskLeave();
                                setTooltip({
                                  visible: false,
                                  x: 0,
                                  y: 0,
                                  task: null,
                                  segment: null,
                                });
                              }}
                            >
                              {/* Progress indicator for segment */}
                              {segment.progress > 0 && (
                                <div
                                  className={`h-full rounded-l transition-all duration-300 ${
                                    task.isCritical
                                      ? 'bg-red-400'
                                      : 'bg-green-400'
                                  }`}
                                  style={{ width: `${segment.progress}%` }}
                                />
                              )}

                              {/* Segment label */}
                              {parseFloat(segmentWidth) > 60 && (
                                <div className='absolute inset-0 flex items-center justify-center px-1 pointer-events-none'>
                                  <span className='text-white text-xs font-medium truncate' title={`${task.name} (${segmentIndex + 1})`}>
                                    {task.name} ({segmentIndex + 1})
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className={getTaskBarStyle(task).className}
                          style={{
                            left,
                            width,
                            position: 'absolute',
                            top: '2px',
                            height: 'calc(100% - 4px)',
                            ...getTaskBarStyle(task).style,
                          }}
                          data-task-id={task.id}
                          onMouseDown={e => handleTaskMouseDown(e, task)}
                          onClick={e => {
                            e.stopPropagation();
                            handleGanttTaskClick(task.id, e);
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
                          {/* Progress indicator with inline editing */}
                          {(() => {
                            const isEditing =
                              progressEditState &&
                              progressEditState.taskId === task.id;
                            const currentProgress = isEditing
                              ? progressEditState.currentProgress
                              : task.progress || 0;

                            return (
                              <div
                                className='h-full rounded-l relative'
                                style={getProgressEditStyles(
                                  isEditing
                                    ? progressEditState
                                    : { isEditing: false, isDragging: false },
                                  DEFAULT_PROGRESS_EDIT_CONFIG
                                )}
                                onMouseDown={e => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  const rect =
                                    e.currentTarget.getBoundingClientRect();
                                  const startX = e.clientX - rect.left;
                                  const newState = createProgressEditState(
                                    task,
                                    DEFAULT_PROGRESS_EDIT_CONFIG
                                  );

                                  setProgressEditState({
                                    ...newState,
                                    isEditing: true,
                                    isDragging: false,
                                    startX,
                                    currentX: startX,
                                    barWidth: rect.width,
                                  });
                                }}
                                onMouseMove={e => {
                                  if (!isEditing) return;

                                  const rect =
                                    e.currentTarget.getBoundingClientRect();
                                  const currentX = e.clientX - rect.left;

                                  if (
                                    !progressEditState.isDragging &&
                                    Math.abs(
                                      currentX - progressEditState.startX
                                    ) >= 3
                                  ) {
                                    setProgressEditState(prev => ({
                                      ...prev,
                                      isDragging: true,
                                    }));
                                  }

                                  if (progressEditState.isDragging) {
                                    const newProgress = Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        (currentX / rect.width) * 100
                                      )
                                    );
                                    setProgressEditState(prev => ({
                                      ...prev,
                                      currentX,
                                      currentProgress: newProgress,
                                    }));
                                    handleProgressChange(task.id, newProgress);
                                  }
                                }}
                              >
                                {/* Progress bar */}
                                <div
                                  style={getProgressBarStyles(
                                    currentProgress,
                                    task.isCritical ||
                                      criticalPathTasks.includes(task.id),
                                    DEFAULT_PROGRESS_EDIT_CONFIG
                                  )}
                                />

                                {/* Drag handle */}
                                {currentProgress > 0 && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      left: `${(currentProgress / 100) * 100}%`,
                                      top: '0',
                                      width: '4px',
                                      height: '100%',
                                      backgroundColor: isEditing
                                        ? '#3B82F6'
                                        : '#6B7280',
                                      cursor: 'col-resize',
                                      borderRadius: '2px',
                                      transform: 'translateX(-50%)',
                                      zIndex: 10,
                                      transition: isEditing
                                        ? 'none'
                                        : 'left 0.1s ease-out',
                                      boxShadow: isEditing
                                        ? '0 0 0 2px rgba(59, 130, 246, 0.3)'
                                        : 'none',
                                    }}
                                    className='progress-drag-handle'
                                  />
                                )}
                              </div>
                            );
                          })()}

                          {/* Custom Bar Labels */}
                          {(() => {
                            const barWidth = parseFloat(width);
                            const labels = getTaskBarLabels(
                              task,
                              viewState.userSettings,
                              barWidth
                            );

                            return labels.map((label, index) => (
                              <div
                                key={label.id}
                                className={`absolute pointer-events-none ${label.className}`}
                                style={label.style}
                                title={getLabelTooltip(label, task)}
                              >
                                {label.value}
                              </div>
                            ));
                          })()}

                          {/* Fallback Task Name Label */}
                          {width !== '0px' &&
                            parseFloat(width) > 60 &&
                            (() => {
                              const barWidth = parseFloat(width);
                              const labels = getTaskBarLabels(
                                task,
                                viewState.userSettings,
                                barWidth
                              );

                              // Only show fallback if no custom labels are configured or enabled
                              if (labels.length === 0) {
                                return (
                                  <div className='absolute inset-0 flex items-center justify-center px-1 pointer-events-none'>
                                    <span className='text-white text-xs font-medium truncate' title={task.name}>
                                      {task.name}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                          {/* Float Labels */}
                          {isFloatDisplayEnabled(viewState) &&
                            (() => {
                              const floatDisplay = getFloatDisplayPosition(
                                task,
                                parseFloat(width)
                              );
                              if (!floatDisplay) return null;

                              return (
                                <div className='absolute top-0 right-0 pointer-events-none'>
                                  {floatDisplay.showTotalFloat && (
                                    <div
                                      className='bg-red-600 text-white text-xs px-1 rounded-sm mb-0.5'
                                      title={getFloatTooltip(task, 'total')}
                                    >
                                      {floatDisplay.totalFloatText}
                                    </div>
                                  )}
                                  {floatDisplay.showFreeFloat && (
                                    <div
                                      className='bg-blue-600 text-white text-xs px-1 rounded-sm'
                                      title={getFloatTooltip(task, 'free')}
                                    >
                                      {floatDisplay.freeFloatText}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                          {/* Resize Handles */}
                          {(selectedTaskIds.has(task.id) ||
                            hoveredTaskId === task.id) && (
                            <>
                              <div
                                className='absolute left-0 top-0 bottom-0 w-2 bg-white cursor-ew-resize border border-gray-300 rounded-l'
                                title='Drag to resize start date'
                                onMouseDown={e =>
                                  handleResizeStart(e, task, 'start')
                                }
                              />
                              <div
                                className='absolute right-0 top-0 bottom-0 w-2 bg-white cursor-ew-resize border border-gray-300 rounded-r'
                                title='Drag to resize end date'
                                onMouseDown={e =>
                                  handleResizeStart(e, task, 'end')
                                }
                              />
                            </>
                          )}
                        </div>
                      )}

                      {/* Baseline Bar Overlay */}
                      {viewState.showBaseline &&
                        (() => {
                          // Check for active baseline from context
                          const activeBaseline = viewState.activeBaselineId
                            ? getBaselineById(
                                viewState.baselines || [],
                                viewState.activeBaselineId
                              )
                            : null;

                          if (activeBaseline) {
                            const baselineTask = activeBaseline.data.tasks.find(
                              bt => bt.id === task.id
                            );
                            if (baselineTask) {
                              const baselineStart = new Date(
                                baselineTask.startDate
                              );
                              const baselineEnd = new Date(
                                baselineTask.endDate
                              );
                              const actualEnd = new Date(task.endDate);
                              const variance = Math.ceil(
                                (actualEnd - baselineEnd) /
                                  (1000 * 60 * 60 * 24)
                              );

                              return (
                                <>
                                  {/* Baseline bar - rendered underneath current task */}
                                  <div
                                    className='h-[8px] bg-blue-200 rounded opacity-60 absolute bottom-0 border border-blue-300'
                                    style={{
                                      left: `${Math.max(
                                        getDateIndex(baselineStart) *
                                          scaledDayWidth,
                                        0
                                      )}px`,
                                      width: `${Math.max(
                                        Math.floor(
                                          (baselineEnd - baselineStart) /
                                            (1000 * 60 * 60 * 24)
                                        ) * scaledDurationWidth,
                                        40
                                      )}px`,
                                    }}
                                    title={`${activeBaseline.name}: ${formatDate(baselineStart)} - ${formatDate(baselineEnd)}`}
                                  />

                                  {/* Variance indicator */}
                                  {Math.abs(variance) > 0 && (
                                    <div
                                      className={`h-[3px] absolute bottom-1 ${
                                        variance > 0
                                          ? 'bg-red-500'
                                          : 'bg-green-500'
                                      } opacity-80`}
                                      style={{
                                        left: `${Math.min(
                                          getDateIndex(baselineEnd) *
                                            scaledDayWidth,
                                          getDateIndex(actualEnd) *
                                            scaledDayWidth
                                        )}px`,
                                        width: `${Math.max(
                                          Math.abs(
                                            getDateIndex(actualEnd) *
                                              scaledDayWidth -
                                              getDateIndex(baselineEnd) *
                                                scaledDayWidth
                                          ),
                                          3
                                        )}px`,
                                      }}
                                      title={`Variance: ${variance > 0 ? '+' : ''}${variance} days`}
                                    />
                                  )}
                                </>
                              );
                            }
                          }

                          // Fallback to original baseline data
                          if (hasBaselineData(task)) {
                            const baselineEnd = new Date(task.baselineEnd);
                            const actualEnd = new Date(task.endDate);
                            const variance = Math.ceil(
                              (actualEnd - baselineEnd) / (1000 * 60 * 60 * 24)
                            );

                            return (
                              <>
                                {/* Baseline bar */}
                                <div
                                  className='h-[8px] bg-blue-200 rounded opacity-60 absolute bottom-0 border border-blue-300'
                                  style={{
                                    left: `${Math.max(
                                      getDateIndex(
                                        new Date(task.baselineStart)
                                      ) * scaledDayWidth,
                                      0
                                    )}px`,
                                    width: `${Math.max(
                                      Math.floor(
                                        (new Date(task.baselineEnd) -
                                          new Date(task.baselineStart)) /
                                          (1000 * 60 * 60 * 24)
                                      ) * scaledDurationWidth,
                                      40
                                    )}px`,
                                  }}
                                  title={`Baseline: ${formatDate(new Date(task.baselineStart))} - ${formatDate(new Date(task.baselineEnd))}`}
                                />

                                {/* Variance indicator */}
                                {Math.abs(variance) > 0 && (
                                  <div
                                    className={`h-[3px] absolute bottom-1 ${
                                      variance > 0
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                    } opacity-80`}
                                    style={{
                                      left: `${Math.min(
                                        getDateIndex(baselineEnd) *
                                          scaledDayWidth,
                                        getDateIndex(actualEnd) * scaledDayWidth
                                      )}px`,
                                      width: `${Math.max(
                                        Math.abs(
                                          getDateIndex(actualEnd) *
                                            scaledDayWidth -
                                            getDateIndex(baselineEnd) *
                                              scaledDayWidth
                                        ),
                                        3
                                      )}px`,
                                    }}
                                    title={`Variance: ${variance > 0 ? '+' : ''}${variance} days`}
                                  />
                                )}
                              </>
                            );
                          }

                          return null;
                        })()}

                      {/* Progress Line Indicators */}
                      {viewState.statusDate &&
                        (() => {
                          const statusDate = new Date(viewState.statusDate);
                          const progressStatus = calculateTaskProgressStatus(
                            task,
                            statusDate,
                            globalCalendar
                          );
                          const indicator = calculateProgressIndicator(
                            task,
                            progressStatus,
                            statusDate,
                            getScaledWidth
                          );

                          if (indicator.type === 'behind') {
                            return (
                              <div
                                className='h-full bg-red-500 opacity-60 absolute top-0'
                                style={{
                                  left: `${Math.max(daysFromStart * getScaledWidth + indicator.position, 0)}px`,
                                  width: `${Math.max(indicator.width, 2)}px`,
                                }}
                                title={`Behind schedule: ${progressStatus.status}`}
                              />
                            );
                          } else if (indicator.type === 'ahead') {
                            return (
                              <div
                                className='h-full bg-green-500 opacity-80 absolute top-0'
                                style={{
                                  left: `${Math.max(daysFromStart * getScaledWidth + indicator.position, 0)}px`,
                                  width: `${Math.max(indicator.width, 2)}px`,
                                }}
                                title={`Ahead of schedule: ${progressStatus.status}`}
                              />
                            );
                          } else if (indicator.type === 'on-track') {
                            return (
                              <div
                                className='h-full bg-blue-500 opacity-60 absolute top-0'
                                style={{
                                  left: `${Math.max(daysFromStart * getScaledWidth + indicator.position, 0)}px`,
                                  width: `${Math.max(indicator.width, 2)}px`,
                                }}
                                title={`On track: ${progressStatus.status}`}
                              />
                            );
                          }
                          return null;
                        })()}

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

      {/* Progress Edit Tooltip */}
      {progressEditState && progressEditState.isDragging && (
        <div
          className='fixed bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg z-[10000] pointer-events-none progress-tooltip'
          style={{
            position: 'fixed',
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y - 30}px`,
            backgroundColor: '#1F2937',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {formatProgress(progressEditState.currentProgress)}
        </div>
      )}

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
              <span>
                {calculateDuration(
                  tooltip.task.startDate,
                  tooltip.task.endDate
                )}{' '}
                days
              </span>
            </div>
            {hasBaselineData(tooltip.task) && (
              <>
                <div className='text-gray-400 mt-2 pt-1 border-t border-gray-700'>
                  Baseline:
                </div>
                <div className='flex justify-between text-gray-300'>
                  <span className='text-gray-400'>Start:</span>
                  <span>{formatDate(tooltip.task.baselineStart)}</span>
                </div>
                <div className='flex justify-between text-gray-300'>
                  <span className='text-gray-400'>End:</span>
                  <span>{formatDate(tooltip.task.baselineEnd)}</span>
                </div>
                <div className='flex justify-between text-gray-300'>
                  <span className='text-gray-400'>Duration:</span>
                  <span>
                    {calculateDuration(
                      tooltip.task.baselineStart,
                      tooltip.task.baselineEnd
                    )}{' '}
                    days
                  </span>
                </div>
                <div className='text-gray-400 mt-2 pt-1 border-t border-gray-700'>
                  Variance:
                </div>
                {(() => {
                  const performance = calculateBaselinePerformance(
                    tooltip.task
                  );
                  return (
                    <>
                      <div className='flex justify-between text-gray-300'>
                        <span className='text-gray-400'>Start:</span>
                        <span className={performance.startStatus.color}>
                          {formatVariance(performance.startVariance)}
                        </span>
                      </div>
                      <div className='flex justify-between text-gray-300'>
                        <span className='text-gray-400'>Finish:</span>
                        <span className={performance.finishStatus.color}>
                          {formatVariance(performance.finishVariance)}
                        </span>
                      </div>
                      <div className='flex justify-between text-gray-300'>
                        <span className='text-gray-400'>Duration:</span>
                        <span className={performance.durationStatus.color}>
                          {formatVariance(performance.durationVariance)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
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
            {tooltip.task.constraints &&
              tooltip.task.constraints.type &&
              tooltip.task.constraints.type !== 'ASAP' && (
                <div className='text-blue-300 font-medium mt-2 pt-1 border-t border-gray-700'>
                  <div className='flex justify-between'>
                    <span>Constraint:</span>
                    <span>{formatConstraint(tooltip.task.constraints)}</span>
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>
                    {getConstraintTooltip(tooltip.task.constraints)}
                  </div>
                </div>
              )}
            {tooltip.task.deadline && (
              <div className='text-red-300 font-medium mt-2 pt-1 border-t border-gray-700'>
                <div className='flex justify-between'>
                  <span>Deadline:</span>
                  <span>
                    {new Date(tooltip.task.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className='text-xs text-gray-400 mt-1'>
                  {getDeadlineTooltip(tooltip.task)}
                </div>
              </div>
            )}
            {tooltip.task.isCritical && (
              <div className='text-red-300 font-medium mt-2 pt-1 border-t border-gray-700'>
                <div className='flex justify-between'>
                  <span>Critical Path:</span>
                  <span>Yes</span>
                </div>
                <div className='text-xs text-gray-400 mt-1'>
                  {getCriticalPathTooltip(tooltip.task)}
                </div>
              </div>
            )}
            {(tooltip.task.totalFloat !== undefined ||
              tooltip.task.freeFloat !== undefined) && (
              <div className='text-blue-300 font-medium mt-2 pt-1 border-t border-gray-700'>
                <div className='flex justify-between'>
                  <span>Total Float:</span>
                  <span>{formatFloat(tooltip.task.totalFloat)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Free Float:</span>
                  <span>{formatFloat(tooltip.task.freeFloat)}</span>
                </div>
                <div className='text-xs text-gray-400 mt-1'>
                  {getFloatTooltip(tooltip.task, 'total')}
                </div>
              </div>
            )}
            {tooltip.segment && (
              <div className='text-purple-300 font-medium mt-2 pt-1 border-t border-gray-700'>
                <div className='flex justify-between'>
                  <span>Segment:</span>
                  <span>{tooltip.segment.duration} days</span>
                </div>
                <div className='flex justify-between'>
                  <span>Progress:</span>
                  <span>{tooltip.segment.progress || 0}%</span>
                </div>
                <div className='text-xs text-gray-400 mt-1'>
                  {getSegmentTooltip(tooltip.segment, tooltip.task)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Split Modal */}
      <TaskSplitModal
        isOpen={taskSplitModal.isOpen}
        task={taskSplitModal.task}
        onClose={() => setTaskSplitModal({ isOpen: false, task: null })}
        onSplitTask={updatedTask => {
          updateTask(updatedTask.id, updatedTask);
          setTaskSplitModal({ isOpen: false, task: null });
        }}
      />

      {/* Dependency Lag/Lead Modal */}
      {showDependencyModal && selectedLink && (
        <DependencyLagModal
          link={selectedLink}
          position={modalPosition}
          onClose={() => {
            setShowDependencyModal(false);
            setSelectedLink(null);
            setModalPosition({ x: 0, y: 0 });
          }}
          onSave={updatedLink => {
            console.log('Dependency updated:', updatedLink);
            setShowDependencyModal(false);
            setSelectedLink(null);
            setModalPosition({ x: 0, y: 0 });
          }}
        />
      )}
    </div>
  );
};

export default GanttChart;
