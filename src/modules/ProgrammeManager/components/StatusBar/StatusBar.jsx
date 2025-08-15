import React, { useState, useEffect, useMemo } from 'react';
import { usePlannerStore } from '../../state/plannerStore';
import { useTaskContext } from '../../context/TaskContext';
import { useViewContext } from '../../context/ViewContext';
import './StatusBar.css';

const StatusBar = () => {
  const { selectedTaskIds, dataSource } = usePlannerStore();
  const { tasks } = useTaskContext();
  const { viewState } = useViewContext();
  
  // Local state for cursor date and zoom
  const [cursorDate, setCursorDate] = useState(null);
  const [zoomPercentage, setZoomPercentage] = useState(100);

  // Calculate project date range
  const projectDateRange = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { start: null, end: null };
    }

    const startDates = tasks.map(task => new Date(task.start_date || task.startDate));
    const endDates = tasks.map(task => new Date(task.end_date || task.endDate));

    const projectStart = new Date(Math.min(...startDates));
    const projectEnd = new Date(Math.max(...endDates));

    return { start: projectStart, end: projectEnd };
  }, [tasks]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format cursor date
  const formatCursorDate = (date) => {
    if (!date) return 'No date';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate zoom percentage from pixels per day
  const calculateZoomPercentage = (pixelsPerDay) => {
    // Base zoom is typically around 20-30 pixels per day
    const baseZoom = 25;
    const percentage = Math.round((pixelsPerDay / baseZoom) * 100);
    return Math.max(10, Math.min(500, percentage)); // Clamp between 10% and 500%
  };

  // Listen for Gantt events
  useEffect(() => {
    const handleCursorMove = (event) => {
      if (event.detail && event.detail.date) {
        setCursorDate(new Date(event.detail.date));
      }
    };

    const handleZoomChange = (event) => {
      if (event.detail && event.detail.pixelsPerDay) {
        const percentage = calculateZoomPercentage(event.detail.pixelsPerDay);
        setZoomPercentage(percentage);
      }
    };

    // Listen for custom events from Gantt
    document.addEventListener('GANTT_CURSOR_MOVE', handleCursorMove);
    document.addEventListener('GANTT_ZOOM_CHANGE', handleZoomChange);

    // Also listen for view state changes
    if (viewState.pixelsPerDay) {
      const percentage = calculateZoomPercentage(viewState.pixelsPerDay);
      setZoomPercentage(percentage);
    }

    return () => {
      document.removeEventListener('GANTT_CURSOR_MOVE', handleCursorMove);
      document.removeEventListener('GANTT_ZOOM_CHANGE', handleZoomChange);
    };
  }, [viewState.pixelsPerDay]);

  // Selection count
  const selectedCount = selectedTaskIds ? selectedTaskIds.size : 0;
  const totalCount = tasks ? tasks.length : 0;

  return (
    <div className="status-bar">
      <div className="status-bar-content">
        <div className="status-item">
          <span className="status-label">Selected:</span>
          <span className="status-value">
            {selectedCount} of {totalCount}
          </span>
        </div>

        <div className="status-separator" />

        <div className="status-item">
          <span className="status-label">Zoom:</span>
          <span className="status-value">{zoomPercentage}%</span>
        </div>

        <div className="status-separator" />

        <div className="status-item">
          <span className="status-label">Cursor:</span>
          <span className="status-value">{formatCursorDate(cursorDate)}</span>
        </div>

        <div className="status-separator" />

        <div className="status-item">
          <span className="status-label">Project:</span>
          <span className="status-value">
            {formatDate(projectDateRange.start)} - {formatDate(projectDateRange.end)}
          </span>
        </div>

        <div className="status-separator" />

        <div className="status-item">
          <span className="status-label">Data:</span>
          <span className={`status-value status-data-source status-data-${dataSource?.toLowerCase()}`}>
            {dataSource || 'DEMO'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
