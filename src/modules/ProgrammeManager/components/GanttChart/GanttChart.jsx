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
import './GanttChart.css';

const GanttChart = () => {
  const { tasks, links } = usePlannerStore();
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [showCriticalPath, setShowCriticalPath] = useState(false);

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

  // Generate timescale headers
  const renderTimescaleHeaders = () => {
    const headers = [];
    const currentDate = new Date(scale.startDate);
    
    while (currentDate <= scale.endDate) {
      const daysFromStart = Math.floor((currentDate.getTime() - scale.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const x = daysFromStart * scale.pixelsPerDay;
      
      headers.push(
        <div
          key={currentDate.toISOString()}
          className="gantt-header-cell"
          style={{
            left: x,
            width: scale.pixelsPerDay,
            position: 'absolute'
          }}
        >
          <div className="gantt-header-date">
            {currentDate.getDate()}
          </div>
          <div className="gantt-header-month">
            {currentDate.toLocaleDateString('en-GB', { month: 'short' })}
          </div>
        </div>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return headers;
  };

  // Render task bars
  const renderTaskBars = () => {
    return tasks.map((task, index) => {
      const bar = bars.find(b => b.taskId === task.id);
      if (!bar) return null;

      const y = index * scale.rowHeight;
      
      return (
        <div
          key={task.id}
          className={`gantt-task-bar ${showCriticalPath ? 'critical-path' : ''}`}
          style={{
            left: bar.x,
            top: y + 5, // 5px padding from top of row
            width: bar.width,
            height: scale.rowHeight - 10, // 10px total padding
            position: 'absolute'
          }}
          title={`${task.name} (${formatDate(bar.start)} - ${formatDate(bar.end)})`}
        >
          <div className="gantt-bar-label">
            {task.name}
          </div>
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
          height: '100%'
        }}
      />
    ));
  };

  // Render today line
  const renderTodayLine = () => {
    if (!todayPosition) return null;

    return (
      <div
        className="gantt-today-line"
        style={{
          left: todayPosition,
          position: 'absolute',
          top: 0,
          height: '100%'
        }}
      />
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="gantt-empty-state">
        <div className="gantt-empty-message">
          <h3>No tasks found</h3>
          <p>Select a project to view its Gantt chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gantt-container" ref={containerRef}>
      {/* Controls */}
      <div className="gantt-controls">
        <label className="gantt-control">
          <input
            type="checkbox"
            checked={showCriticalPath}
            onChange={(e) => setShowCriticalPath(e.target.checked)}
          />
          Show Critical Path
        </label>
      </div>

      {/* Gantt Chart */}
      <div 
        className="gantt-chart"
        style={{
          width: scale.containerWidth,
          height: scale.containerHeight
        }}
      >
        {/* Header */}
        <div className="gantt-header" style={{ height: 60 }}>
          {renderTimescaleHeaders()}
        </div>

        {/* Chart Area */}
        <div className="gantt-chart-area" style={{ height: scale.containerHeight - 60 }}>
          {/* Background Grid */}
          <div className="gantt-grid">
            {renderWeekendShading()}
            {renderTodayLine()}
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

      {/* Legend */}
      <div className="gantt-legend">
        <div className="gantt-legend-item">
          <div className="gantt-legend-color task-bar" />
          <span>Task</span>
        </div>
        <div className="gantt-legend-item">
          <div className="gantt-legend-color link-line" />
          <span>Dependency (FS)</span>
        </div>
        <div className="gantt-legend-item">
          <div className="gantt-legend-color today-line" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
