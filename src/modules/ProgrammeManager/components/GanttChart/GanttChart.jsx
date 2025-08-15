// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { usePlannerStore } from '../../state/plannerStore';
import {
  layoutBars,
  layoutLinks,
  calculateTimescale,
  getWorkingDayShading,
  getTodayPosition,
  formatDate
} from './ganttMath';
import {
  calculateFitProject,
  calculateFitSelection,
  getTodayDate,
  isDateInRange,
  getDateAtPixel,
  calculateZoomAtCursor
} from './timescale';
import './GanttChart.css';

const GanttChart = () => {
  const { tasks, links, selectedTaskIds, selectOne, toggleSelection, selectRange, lastSelectedTaskId, currentProjectId } = usePlannerStore();
  const containerRef = useRef(null);
  const chartAreaRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [scrollLeft, setScrollLeft] = useState(0);
  const [pxPerDay, setPxPerDay] = useState(20);
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());

  // Calculate timescale based on tasks and container size
  const scale = useMemo(() => {
    return calculateTimescale(tasks, containerSize.width);
  }, [tasks, containerSize.width]);

  // Calculate bar positions
  const bars = useMemo(() => {
    return layoutBars(tasks, scale);
  }, [tasks, scale]);

  // Calculate link positions
  const linkPositions = useMemo(() => {
    return layoutLinks(links, bars, scale);
  }, [links, bars, scale]);

  // Calculate working day shading
  const weekendShading = useMemo(() => {
    return getWorkingDayShading(scale);
  }, [scale]);

  // Get today's position
  const todayPosition = useMemo(() => {
    return getTodayPosition(scale);
  }, [scale]);

  // Handle container resize
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({
        width: rect.width,
        height: rect.height
      });
    }
  }, []);

  // Handle task bar click for selection
  const handleTaskClick = useCallback((e, taskId) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey && lastSelectedTaskId) {
      // Range selection
      selectRange(lastSelectedTaskId, taskId);
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      toggleSelection(taskId);
    } else {
      // Single selection
      selectOne(taskId);
    }
  }, [selectOne, toggleSelection, selectRange, lastSelectedTaskId]);

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    
    const rect = chartAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const cursorX = e.clientX - rect.left;
    const currentDate = getDateAtPixel(cursorX, {
      minDate,
      maxDate,
      pxPerDay,
      viewportWidth: containerSize.width,
      scrollLeft
    });
    
    // Calculate zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newPxPerDay = Math.max(5, Math.min(100, pxPerDay * zoomFactor));
    
    // Calculate new scroll position to keep cursor date in same position
    const { newScrollLeft } = calculateZoomAtCursor(
      cursorX,
      currentDate,
      newPxPerDay,
      { minDate, maxDate, pxPerDay, viewportWidth: containerSize.width, scrollLeft }
    );
    
    setPxPerDay(newPxPerDay);
    setScrollLeft(newScrollLeft);
  }, [pxPerDay, minDate, maxDate, scrollLeft, containerSize.width]);

  // Fit project function
  const fitProject = useCallback(() => {
    if (!currentProjectId || tasks.length === 0) return;
    
    console.log('Fitting project to show all tasks:', currentProjectId);
    
    const { minDate: newMinDate, maxDate: newMaxDate, pxPerDay: newPxPerDay } = calculateFitProject(
      tasks,
      containerSize.width,
      30
    );
    
    setMinDate(newMinDate);
    setMaxDate(newMaxDate);
    setPxPerDay(newPxPerDay);
    setScrollLeft(0);
  }, [currentProjectId, tasks, containerSize.width]);

  // Fit selection function
  const fitSelection = useCallback(() => {
    if (selectedTaskIds.size === 0) return;
    
    console.log('Fitting selection to show selected tasks');
    
    const selectedTasks = tasks.filter(task => selectedTaskIds.has(task.id));
    const { minDate: newMinDate, maxDate: newMaxDate, pxPerDay: newPxPerDay } = calculateFitSelection(
      selectedTasks,
      containerSize.width,
      15
    );
    
    setMinDate(newMinDate);
    setMaxDate(newMaxDate);
    setPxPerDay(newPxPerDay);
    setScrollLeft(0);
  }, [selectedTaskIds, tasks, containerSize.width]);

  // Expose fit functions globally
  useEffect(() => {
    window.__PP_GANTT__ = {
      fitProject,
      fitSelection
    };
    
    return () => {
      delete window.__PP_GANTT__;
    };
  }, [fitProject, fitSelection]);

  // Listen for fit project events
  useEffect(() => {
    const handleFitProject = (event) => {
      const { projectId, tasksCount } = event.detail;
      if (projectId === currentProjectId) {
        console.log('Received FIT_PROJECT event for current project:', projectId, 'with', tasksCount, 'tasks');
        // Small delay to ensure DOM is ready
        setTimeout(() => fitProject(), 100);
      }
    };

    window.addEventListener('FIT_PROJECT', handleFitProject);
    return () => window.removeEventListener('FIT_PROJECT', handleFitProject);
  }, [currentProjectId, fitProject]);

  // Set up resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new window.ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Initial size calculation
  useEffect(() => {
    handleResize();
  }, [handleResize]);

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    setScrollLeft(e.target.scrollLeft);
  }, []);

  // Render today line
  const renderTodayLine = () => {
    const today = getTodayDate();
    const isTodayInRange = isDateInRange(today, {
      minDate,
      maxDate,
      pxPerDay,
      viewportWidth: containerSize.width,
      scrollLeft
    });
    
    if (!isTodayInRange) return null;
    
    const todayX = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pxPerDay - scrollLeft;
    
    return (
      <div
        className="gantt-today-line"
        style={{
          position: 'absolute',
          left: todayX,
          top: 0,
          width: '1px',
          height: '100%',
          backgroundColor: 'var(--rbn-accent, #3b82f6)',
          zIndex: 100,
          pointerEvents: 'none'
        }}
      >
        {/* Top marker */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-4px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--rbn-accent, #3b82f6)',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    );
  };

  // Generate timescale headers (2 rows: Month and Day)
  const renderTimescaleHeaders = () => {
    const headers = [];
    const currentDate = new Date(scale.startDate);
    let currentMonth = null;
    
    while (currentDate <= scale.endDate) {
      const daysFromStart = Math.floor((currentDate.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const x = daysFromStart * scale.pixelsPerDay;
      
      // Check if we need a new month header
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      if (monthKey !== currentMonth) {
        currentMonth = monthKey;
        
        // Calculate month width (span multiple days)
        const monthEndDate = new Date(currentDate);
        monthEndDate.setMonth(monthEndDate.getMonth() + 1);
        monthEndDate.setDate(0); // Last day of current month
        
        const monthEndDaysFromStart = Math.floor((monthEndDate.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const monthWidth = Math.min((monthEndDaysFromStart - daysFromStart + 1) * scale.pixelsPerDay, scale.containerWidth - x);
        
        headers.push(
          <div
            key={`month-${monthKey}`}
            className="gantt-header-month"
            style={{
              left: x,
              width: monthWidth,
              position: 'absolute',
              top: 0,
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              color: '#374151',
              borderRight: '1px solid var(--rbn-border, #e5e7eb)',
              backgroundColor: '#f9fafb'
            }}
          >
            {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </div>
        );
      }
      
      // Day header
      headers.push(
        <div
          key={`day-${currentDate.toISOString()}`}
          className="gantt-header-day"
          style={{
            left: x,
            width: scale.pixelsPerDay,
            position: 'absolute',
            top: '30px',
            height: '30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            color: '#6b7280',
            borderRight: '1px solid var(--rbn-border, #e5e7eb)',
            backgroundColor: '#f9fafb'
          }}
        >
          <div style={{ fontWeight: '600', color: '#374151' }}>
            {currentDate.getDate()}
          </div>
          <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>
            {currentDate.toLocaleDateString('en-GB', { weekday: 'short' })}
          </div>
        </div>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return headers;
  };

  // Render task bars with selection styling
  const renderTaskBars = () => {
    return tasks.map((task, index) => {
      const bar = bars.find(b => b.taskId === task.id);
      if (!bar) return null;

      const y = index * scale.rowHeight;
      const isSelected = selectedTaskIds.has(task.id);
      
      return (
        <div
          key={task.id}
          className={`gantt-task-bar ${isSelected ? 'selected' : ''}`}
          style={{
            left: bar.x,
            top: y + 5, // 5px padding from top of row
            width: bar.width,
            height: scale.rowHeight - 10, // 10px total padding
            position: 'absolute',
            backgroundColor: isSelected ? '#3b82f6' : '#6b7280',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 2,
            minWidth: '4px'
          }}
          title={`${task.name} (${formatDate(bar.start)} - ${formatDate(bar.end)})`}
          onClick={(e) => handleTaskClick(e, task.id)}
        >
          {bar.width > 60 && (
            <div 
              className="gantt-bar-label"
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 'calc(100% - 8px)',
                pointerEvents: 'none'
              }}
            >
              {task.name}
            </div>
          )}
        </div>
      );
    });
  };

  // Render dependency links
  const renderLinks = () => {
    return linkPositions.map((link, index) => {
      const fromTask = tasks.find(t => t.id === link.fromTaskId);
      const toTask = tasks.find(t => t.id === link.toTaskId);
      
      if (!fromTask || !toTask) return null;

      const fromIndex = tasks.findIndex(t => t.id === link.fromTaskId);
      const toIndex = tasks.findIndex(t => t.id === link.toTaskId);
      
      const fromY = fromIndex * scale.rowHeight + scale.rowHeight / 2;
      const toY = toIndex * scale.rowHeight + scale.rowHeight / 2;

      // Calculate path for the link
      const midX = (link.fromX + link.toX) / 2;
      
      return (
        <svg
          key={`${link.fromTaskId}-${link.toTaskId}`}
          className="gantt-link"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <path
            d={`M ${link.fromX} ${fromY} Q ${midX} ${fromY} ${midX} ${toY} Q ${midX} ${toY} ${link.toX} ${toY}`}
            stroke="#666"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      );
    });
  };

  // Render weekend shading
  const renderWeekendShading = () => {
    return weekendShading.map((shade, index) => (
      <div
        key={index}
        className="gantt-weekend-shading"
        style={{
          left: shade.x,
          width: shade.width,
          position: 'absolute',
          top: 0,
          height: '100%',
          backgroundColor: '#f3f4f6',
          opacity: 0.5,
          pointerEvents: 'none'
        }}
      />
    ));
  };

  // Render today line (using new timescale logic)
  const renderTodayLineNew = () => {
    const today = getTodayDate();
    const isTodayInRange = isDateInRange(today, {
      minDate,
      maxDate,
      pxPerDay,
      viewportWidth: containerSize.width,
      scrollLeft
    });
    
    if (!isTodayInRange) return null;
    
    const todayX = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pxPerDay - scrollLeft;
    
    return (
      <div
        className="gantt-today-line"
        style={{
          position: 'absolute',
          left: todayX,
          top: 0,
          width: '1px',
          height: '100%',
          backgroundColor: 'var(--rbn-accent, #3b82f6)',
          zIndex: 100,
          pointerEvents: 'none'
        }}
      >
        {/* Top marker */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-4px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--rbn-accent, #3b82f6)',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    );
  };

  // Render vertical grid lines
  const renderVerticalGridLines = () => {
    const lines = [];
    const currentDate = new Date(scale.startDate);
    
    while (currentDate <= scale.endDate) {
      const daysFromStart = Math.floor((currentDate.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const x = daysFromStart * scale.pixelsPerDay;
      
      lines.push(
        <div
          key={`grid-${currentDate.toISOString()}`}
          className="gantt-grid-line"
          style={{
            left: x,
            position: 'absolute',
            top: 0,
            height: '100%',
            width: '1px',
            backgroundColor: 'var(--rbn-border, #e5e7eb)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return lines;
  };

  // Empty state
  if (tasks.length === 0) {
    return (
      <div 
        className="gantt-empty-state"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: '#f9fafb',
          color: '#6b7280'
        }}
      >
        <div 
          className="gantt-empty-message"
          style={{
            textAlign: 'center'
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            No tasks found
          </h3>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Select a project to view its Gantt chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="gantt-container" 
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'white',
        border: '1px solid var(--rbn-border, #e5e7eb)',
        borderRadius: '0.375rem',
        overflow: 'hidden'
      }}
    >
      {/* Gantt Chart */}
      <div 
        className="gantt-chart"
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          backgroundColor: 'white'
        }}
      >
        {/* Header */}
        <div 
          className="gantt-header" 
          style={{ 
            height: '60px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid var(--rbn-border, #e5e7eb)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            overflow: 'hidden'
          }}
        >
          {renderTimescaleHeaders()}
        </div>

        {/* Chart Area */}
        <div 
          className="gantt-chart-area" 
          style={{ 
            height: scale.containerHeight - 60,
            position: 'relative',
            overflow: 'auto'
          }}
          ref={chartAreaRef}
          onWheel={handleWheel}
          onScroll={handleScroll}
        >
          {/* Background Grid */}
          <div 
            className="gantt-grid"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {renderWeekendShading()}
            {renderVerticalGridLines()}
            {renderTodayLineNew()}
          </div>

          {/* Links (behind bars) */}
          {renderLinks()}

          {/* Task Bars */}
          {renderTaskBars()}

          {/* Arrow marker definition */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
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
                  fill="#666"
                />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
