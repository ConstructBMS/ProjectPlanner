import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  createZoomState,
  zoomIn,
  zoomOut,
  resetZoom,
  fitToData,
  updateVisibleDateRange,
  createD3ZoomBehavior,
  getZoomControlsState,
  formatZoomLevel,
  getZoomTooltip,
  getZoomAnimationConfig,
  animateZoom,
  DEFAULT_ZOOM_CONFIG,
} from '../utils/histogramZoomUtils';

const ResourceHistogram = ({
  tasks,
  resources,
  timeScale,
  containerWidth,
  containerHeight = 300,
  onZoomChange = null,
  syncWithGantt = true,
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomState, setZoomState] = useState(createZoomState());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [histogramData, setHistogramData] = useState([]);
  const [timeScaleD3, setTimeScaleD3] = useState(null);
  const [yScale, setYScale] = useState(null);
  const [zoomBehavior, setZoomBehavior] = useState(null);

  // Calculate histogram data from tasks
  useEffect(() => {
    if (!tasks || !resources) return;

    const data = [];
    const resourceMap = new Map(resources.map(r => [r.id, r.name]));

    tasks.forEach(task => {
      if (task.resourceId && task.startDate && task.endDate) {
        const resourceName = resourceMap.get(task.resourceId) || 'Unknown';
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const duration = Math.ceil(
          (endDate - startDate) / (1000 * 60 * 60 * 24)
        );

        data.push({
          id: task.id,
          resourceId: task.resourceId,
          resourceName,
          startDate,
          endDate,
          duration,
          progress: task.progress || 0,
          status: task.status || 'Not Started',
          priority: task.priority || 'Medium',
        });
      }
    });

    setHistogramData(data);
  }, [tasks, resources]);

  // Create D3 time scale
  useEffect(() => {
    if (!containerWidth || !histogramData.length) return;

    const dates = histogramData.flatMap(d => [d.startDate, d.endDate]);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const scale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([0, containerWidth]);

    setTimeScaleD3(scale);
  }, [containerWidth, histogramData]);

  // Create Y scale for resource allocation
  useEffect(() => {
    if (!containerHeight || !resources) return;

    const resourceNames = resources.map(r => r.name);
    const scale = d3
      .scaleBand()
      .domain(resourceNames)
      .range([0, containerHeight])
      .padding(0.1);

    setYScale(scale);
  }, [containerHeight, resources]);

  // Create zoom behavior
  useEffect(() => {
    if (!svgRef.current || !timeScaleD3) return;

    const zoom = createD3ZoomBehavior(DEFAULT_ZOOM_CONFIG, newZoomState => {
      setZoomState(prev => ({
        ...prev,
        ...newZoomState,
        isZooming: false,
      }));

      if (onZoomChange) {
        onZoomChange(newZoomState);
      }
    });

    setZoomBehavior(zoom);

    const svg = d3.select(svgRef.current);
    svg.call(zoom);
  }, [timeScaleD3, onZoomChange]);

  // Update visible date range when zoom state changes
  useEffect(() => {
    if (!zoomState || !timeScaleD3 || !containerWidth) return;

    const updatedZoomState = updateVisibleDateRange(
      zoomState,
      containerWidth,
      timeScaleD3
    );
    setZoomState(prev => ({
      ...prev,
      visibleStartDate: updatedZoomState.visibleStartDate,
      visibleEndDate: updatedZoomState.visibleEndDate,
    }));
  }, [zoomState.scale, zoomState.translateX, timeScaleD3, containerWidth]);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoomState = zoomIn(zoomState, 1.2, DEFAULT_ZOOM_CONFIG);
    setZoomState(newZoomState);

    if (zoomBehavior && svgRef.current) {
      const transform = {
        k: newZoomState.scale,
        x: newZoomState.translateX,
        y: newZoomState.translateY,
      };

      const animationConfig = getZoomAnimationConfig(DEFAULT_ZOOM_CONFIG);
      animateZoom(d3.select(svgRef.current), transform, animationConfig);
    }
  }, [zoomState, zoomBehavior]);

  const handleZoomOut = useCallback(() => {
    const newZoomState = zoomOut(zoomState, 0.8, DEFAULT_ZOOM_CONFIG);
    setZoomState(newZoomState);

    if (zoomBehavior && svgRef.current) {
      const transform = {
        k: newZoomState.scale,
        x: newZoomState.translateX,
        y: newZoomState.translateY,
      };

      const animationConfig = getZoomAnimationConfig(DEFAULT_ZOOM_CONFIG);
      animateZoom(d3.select(svgRef.current), transform, animationConfig);
    }
  }, [zoomState, zoomBehavior]);

  const handleResetZoom = useCallback(() => {
    const newZoomState = resetZoom(zoomState, DEFAULT_ZOOM_CONFIG);
    setZoomState(newZoomState);

    if (zoomBehavior && svgRef.current) {
      const transform = {
        k: newZoomState.scale,
        x: newZoomState.translateX,
        y: newZoomState.translateY,
      };

      const animationConfig = getZoomAnimationConfig(DEFAULT_ZOOM_CONFIG);
      animateZoom(d3.select(svgRef.current), transform, animationConfig);
    }
  }, [zoomState, zoomBehavior]);

  const handleFitToData = useCallback(() => {
    if (!histogramData.length || !timeScaleD3) return;

    const newZoomState = fitToData(
      zoomState,
      histogramData,
      containerWidth,
      containerHeight,
      timeScaleD3,
      DEFAULT_ZOOM_CONFIG
    );
    setZoomState(newZoomState);

    if (zoomBehavior && svgRef.current) {
      const transform = {
        k: newZoomState.scale,
        x: newZoomState.translateX,
        y: newZoomState.translateY,
      };

      const animationConfig = getZoomAnimationConfig(DEFAULT_ZOOM_CONFIG);
      animateZoom(d3.select(svgRef.current), transform, animationConfig);
    }
  }, [
    zoomState,
    histogramData,
    timeScaleD3,
    containerWidth,
    containerHeight,
    zoomBehavior,
  ]);

  // Handle mouse drag for panning
  const handleMouseDown = useCallback(e => {
    if (e.button !== 0) return; // Only left mouse button

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    e => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Update drag start position
      setDragStart({ x: e.clientX, y: e.clientY });

      // Apply pan transformation
      if (zoomBehavior && svgRef.current) {
        const svg = d3.select(svgRef.current);
        const currentTransform = d3.zoomTransform(svg.node());

        const newTransform = {
          k: currentTransform.k,
          x: currentTransform.x + deltaX,
          y: currentTransform.y + deltaY,
        };

        const animationConfig = getZoomAnimationConfig(DEFAULT_ZOOM_CONFIG);
        animateZoom(svg, newTransform, animationConfig);
      }
    },
    [isDragging, dragStart, zoomBehavior]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for panning
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Render histogram bars
  const renderHistogramBars = () => {
    if (!histogramData.length || !timeScaleD3 || !yScale) return null;

    return histogramData.map(task => {
      const x = timeScaleD3(task.startDate);
      const width = timeScaleD3(task.endDate) - timeScaleD3(task.startDate);
      const y = yScale(task.resourceName);
      const height = yScale.bandwidth();

      // Color based on task status
      const getBarColor = status => {
        switch (status) {
          case 'Complete':
            return '#10B981';
          case 'In Progress':
            return '#3B82F6';
          case 'Delayed':
            return '#EF4444';
          case 'On Hold':
            return '#F59E0B';
          default:
            return '#6B7280';
        }
      };

      return (
        <g key={task.id}>
          {/* Background bar */}
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={getBarColor(task.status)}
            opacity={0.8}
            rx={2}
            ry={2}
          />

          {/* Progress bar overlay */}
          {task.progress > 0 && (
            <rect
              x={x}
              y={y}
              width={width * (task.progress / 100)}
              height={height}
              fill={getBarColor(task.status)}
              opacity={1}
              rx={2}
              ry={2}
            />
          )}

          {/* Task label */}
          {width > 60 && (
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor='middle'
              dominantBaseline='middle'
              fill='white'
              fontSize='10px'
              fontWeight='500'
              pointerEvents='none'
            >
              {task.resourceName}
            </text>
          )}
        </g>
      );
    });
  };

  // Render time axis
  const renderTimeAxis = () => {
    if (!timeScaleD3) return null;

    const timeAxis = d3
      .axisBottom(timeScaleD3)
      .tickFormat(d3.timeFormat('%b %d'))
      .tickSize(5);

    return (
      <g className='time-axis'>
        <g
          ref={node => {
            if (node) {
              d3.select(node).call(timeAxis);
            }
          }}
          transform={`translate(0, ${containerHeight})`}
        />
      </g>
    );
  };

  // Render resource axis
  const renderResourceAxis = () => {
    if (!yScale) return null;

    const resourceAxis = d3.axisLeft(yScale);

    return (
      <g className='resource-axis'>
        <g
          ref={node => {
            if (node) {
              d3.select(node).call(resourceAxis);
            }
          }}
        />
      </g>
    );
  };

  // Get zoom controls state
  const zoomControls = getZoomControlsState(zoomState, DEFAULT_ZOOM_CONFIG);

  return (
    <div className='resource-histogram bg-white border border-gray-200 rounded-lg'>
      {/* Header with zoom controls */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200'>
        <div className='flex items-center gap-2'>
          <UserGroupIcon className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Resource Allocation
          </h3>
        </div>

        <div className='flex items-center gap-2'>
          {/* Zoom level display */}
          <div className='text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded'>
            {formatZoomLevel(zoomState.scale)}
          </div>

          {/* Zoom controls */}
          <div className='flex items-center gap-1'>
            <button
              onClick={handleZoomOut}
              disabled={!zoomControls.canZoomOut}
              className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title='Zoom Out'
            >
              <MagnifyingGlassMinusIcon className='w-4 h-4' />
            </button>

            <button
              onClick={handleZoomIn}
              disabled={!zoomControls.canZoomIn}
              className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title='Zoom In'
            >
              <MagnifyingGlassPlusIcon className='w-4 h-4' />
            </button>

            <button
              onClick={handleFitToData}
              disabled={!zoomControls.canFitToData}
              className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title='Fit to Data'
            >
              <ArrowsPointingOutIcon className='w-4 h-4' />
            </button>

            <button
              onClick={handleResetZoom}
              disabled={!zoomControls.canReset}
              className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              title='Reset Zoom'
            >
              <ArrowPathIcon className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Histogram container */}
      <div
        ref={containerRef}
        className='relative overflow-hidden'
        style={{
          width: containerWidth,
          height: containerHeight + 60, // Extra space for axes
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        <svg
          ref={svgRef}
          width={containerWidth}
          height={containerHeight + 60}
          className='histogram-svg'
        >
          <defs>
            {/* Gradient definitions for bars */}
            <linearGradient id='barGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='rgba(255,255,255,0.2)' />
              <stop offset='100%' stopColor='rgba(0,0,0,0.1)' />
            </linearGradient>
          </defs>

          {/* Main chart group */}
          <g className='chart-group'>
            {/* Grid lines */}
            <g className='grid-lines'>
              {timeScaleD3 &&
                timeScaleD3
                  .ticks(10)
                  .map(tick => (
                    <line
                      key={tick}
                      x1={timeScaleD3(tick)}
                      y1={0}
                      x2={timeScaleD3(tick)}
                      y2={containerHeight}
                      stroke='#E5E7EB'
                      strokeWidth={1}
                      opacity={0.5}
                    />
                  ))}
            </g>

            {/* Histogram bars */}
            <g className='histogram-bars'>{renderHistogramBars()}</g>

            {/* Axes */}
            {renderTimeAxis()}
            {renderResourceAxis()}
          </g>
        </svg>

        {/* Zoom overlay indicator */}
        {(zoomState.isZooming || zoomState.isPanning) && (
          <div className='absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded shadow-lg'>
            {getZoomTooltip(zoomState, DEFAULT_ZOOM_CONFIG)}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className='p-3 bg-gray-50 border-t border-gray-200'>
        <div className='text-xs text-gray-600'>
          <strong>Navigation:</strong> Drag to pan • Scroll to zoom • Use
          buttons for precise control
        </div>
      </div>
    </div>
  );
};

export default ResourceHistogram;
