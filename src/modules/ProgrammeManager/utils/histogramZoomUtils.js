/**
 * Histogram Zoom and Pan Utilities
 * Handle zoom and pan controls for resource histograms with D3 integration
 */

/**
 * Default zoom and pan configuration
 */
export const DEFAULT_ZOOM_CONFIG = {
  minZoom: 0.1,
  maxZoom: 10,
  defaultZoom: 1,
  zoomStep: 0.2,
  panStep: 100, // pixels
  smoothTransitions: true,
  transitionDuration: 300,
  syncWithGantt: true,
};

/**
 * Zoom state management
 */
export const createZoomState = () => ({
  scale: 1,
  translateX: 0,
  translateY: 0,
  minDate: null,
  maxDate: null,
  visibleStartDate: null,
  visibleEndDate: null,
  isZooming: false,
  isPanning: false,
});

/**
 * Calculate zoom transform for D3
 * @param {Object} zoomState - Current zoom state
 * @param {number} width - Container width
 * @param {number} height - Container height
 * @returns {Object} D3 transform object
 */
export const calculateZoomTransform = (zoomState, width, height) => {
  return {
    k: zoomState.scale,
    x: zoomState.translateX,
    y: zoomState.translateY,
  };
};

/**
 * Apply zoom transform to D3 selection
 * @param {Object} d3Selection - D3 selection object
 * @param {Object} transform - Zoom transform object
 * @param {boolean} smooth - Whether to use smooth transitions
 * @param {number} duration - Transition duration in milliseconds
 */
export const applyZoomTransform = (
  d3Selection,
  transform,
  smooth = true,
  duration = 300
) => {
  // Note: This function requires D3.js zoom behavior to be available
  // Implementation should be handled in the consuming component
  console.warn('applyZoomTransform requires D3.js zoom behavior to be available');
};

/**
 * Zoom in by a specified factor
 * @param {Object} zoomState - Current zoom state
 * @param {number} factor - Zoom factor (default: 1.2)
 * @param {Object} config - Zoom configuration
 * @returns {Object} Updated zoom state
 */
export const zoomIn = (
  zoomState,
  factor = 1.2,
  config = DEFAULT_ZOOM_CONFIG
) => {
  const newScale = Math.min(zoomState.scale * factor, config.maxZoom);

  return {
    ...zoomState,
    scale: newScale,
    isZooming: true,
  };
};

/**
 * Zoom out by a specified factor
 * @param {Object} zoomState - Current zoom state
 * @param {number} factor - Zoom factor (default: 0.8)
 * @param {Object} config - Zoom configuration
 * @returns {Object} Updated zoom state
 */
export const zoomOut = (
  zoomState,
  factor = 0.8,
  config = DEFAULT_ZOOM_CONFIG
) => {
  const newScale = Math.max(zoomState.scale * factor, config.minZoom);

  return {
    ...zoomState,
    scale: newScale,
    isZooming: true,
  };
};

/**
 * Reset zoom to default
 * @param {Object} zoomState - Current zoom state
 * @param {Object} config - Zoom configuration
 * @returns {Object} Reset zoom state
 */
export const resetZoom = (zoomState, config = DEFAULT_ZOOM_CONFIG) => {
  return {
    ...zoomState,
    scale: config.defaultZoom,
    translateX: 0,
    translateY: 0,
    isZooming: true,
  };
};

/**
 * Pan horizontally by a specified amount
 * @param {Object} zoomState - Current zoom state
 * @param {number} deltaX - Horizontal pan amount in pixels
 * @param {number} containerWidth - Container width
 * @param {Object} config - Zoom configuration
 * @returns {Object} Updated zoom state
 */
export const panHorizontal = (
  zoomState,
  deltaX,
  containerWidth,
  config = DEFAULT_ZOOM_CONFIG
) => {
  const maxTranslateX = containerWidth * (zoomState.scale - 1);
  const newTranslateX = Math.max(
    -maxTranslateX,
    Math.min(maxTranslateX, zoomState.translateX + deltaX)
  );

  return {
    ...zoomState,
    translateX: newTranslateX,
    isPanning: true,
  };
};

/**
 * Pan to a specific date range
 * @param {Object} zoomState - Current zoom state
 * @param {Date} startDate - Start date to pan to
 * @param {Date} endDate - End date to pan to
 * @param {number} containerWidth - Container width
 * @param {Object} timeScale - D3 time scale
 * @returns {Object} Updated zoom state
 */
export const panToDateRange = (
  zoomState,
  startDate,
  endDate,
  containerWidth,
  timeScale
) => {
  const startX = timeScale(startDate);
  const endX = timeScale(endDate);
  const rangeWidth = endX - startX;
  const centerX = startX + rangeWidth / 2;
  const containerCenter = containerWidth / 2;

  const newTranslateX = containerCenter - centerX;

  return {
    ...zoomState,
    translateX: newTranslateX,
    isPanning: true,
  };
};

/**
 * Fit zoom to show all data
 * @param {Object} zoomState - Current zoom state
 * @param {Array} data - Histogram data
 * @param {number} containerWidth - Container width
 * @param {number} containerHeight - Container height
 * @param {Object} timeScale - D3 time scale
 * @param {Object} config - Zoom configuration
 * @returns {Object} Updated zoom state
 */
export const fitToData = (
  zoomState,
  data,
  containerWidth,
  containerHeight,
  timeScale,
  config = DEFAULT_ZOOM_CONFIG
) => {
  if (!data || data.length === 0) return zoomState;

  const dates = data.flatMap(d => [d.startDate, d.endDate]).filter(Boolean);
  if (dates.length === 0) return zoomState;

  const minDate = new Date(Math.min(...dates.map(d => new Date(d))));
  const maxDate = new Date(Math.max(...dates.map(d => new Date(d))));

  const dataWidth = timeScale(maxDate) - timeScale(minDate);
  const padding = 50; // pixels
  const availableWidth = containerWidth - padding * 2;

  const newScale = Math.min(availableWidth / dataWidth, config.maxZoom);
  const centerX = (timeScale(minDate) + timeScale(maxDate)) / 2;
  const containerCenter = containerWidth / 2;

  return {
    ...zoomState,
    scale: newScale,
    translateX: containerCenter - centerX * newScale,
    translateY: 0,
    minDate,
    maxDate,
    isZooming: true,
  };
};

/**
 * Update visible date range based on zoom state
 * @param {Object} zoomState - Current zoom state
 * @param {number} containerWidth - Container width
 * @param {Object} timeScale - D3 time scale
 * @returns {Object} Updated zoom state with visible date range
 */
export const updateVisibleDateRange = (
  zoomState,
  containerWidth,
  timeScale
) => {
  const transform = calculateZoomTransform(zoomState, containerWidth, 0);
  const invertedScale = timeScale
    .copy()
    .domain(timeScale.range().map(x => (x - transform.x) / transform.k));

  const visibleStartDate = invertedScale(0);
  const visibleEndDate = invertedScale(containerWidth);

  return {
    ...zoomState,
    visibleStartDate,
    visibleEndDate,
  };
};

/**
 * Create D3 zoom behavior
 * @param {Object} config - Zoom configuration
 * @param {Function} onZoomChange - Callback for zoom changes
 * @returns {Object} D3 zoom behavior
 */
export const createD3ZoomBehavior = (
  config = DEFAULT_ZOOM_CONFIG,
  onZoomChange = null
) => {
  // Note: This function requires D3.js to be available
  // Implementation should be handled in the consuming component
  console.warn('createD3ZoomBehavior requires D3.js to be available');
  return null;
};

/**
 * Sync zoom state with Gantt time scale
 * @param {Object} zoomState - Current zoom state
 * @param {Object} ganttTimeScale - Gantt time scale
 * @param {number} containerWidth - Container width
 * @returns {Object} Synchronized zoom state
 */
export const syncWithGanttTimeScale = (
  zoomState,
  ganttTimeScale,
  containerWidth
) => {
  if (
    !ganttTimeScale ||
    !zoomState.visibleStartDate ||
    !zoomState.visibleEndDate
  ) {
    return zoomState;
  }

  // Calculate the scale factor needed to match Gantt time scale
  const ganttRange = ganttTimeScale.range();
  const ganttDomain = ganttTimeScale.domain();

  const histogramRange = [0, containerWidth];
  const histogramDomain = [
    zoomState.visibleStartDate,
    zoomState.visibleEndDate,
  ];

  const ganttScale =
    (ganttRange[1] - ganttRange[0]) / (ganttDomain[1] - ganttDomain[0]);
  const histogramScale =
    (histogramRange[1] - histogramRange[0]) /
    (histogramDomain[1] - histogramDomain[0]);

  const scaleRatio = ganttScale / histogramScale;

  return {
    ...zoomState,
    scale: zoomState.scale * scaleRatio,
  };
};

/**
 * Get zoom controls configuration
 * @param {Object} zoomState - Current zoom state
 * @param {Object} config - Zoom configuration
 * @returns {Object} Zoom controls state
 */
export const getZoomControlsState = (
  zoomState,
  config = DEFAULT_ZOOM_CONFIG
) => {
  return {
    canZoomIn: zoomState.scale < config.maxZoom,
    canZoomOut: zoomState.scale > config.minZoom,
    canReset:
      zoomState.scale !== config.defaultZoom ||
      zoomState.translateX !== 0 ||
      zoomState.translateY !== 0,
    canFitToData: true,
    currentZoom: Math.round(zoomState.scale * 100),
    isZooming: zoomState.isZooming,
    isPanning: zoomState.isPanning,
  };
};

/**
 * Calculate zoom level percentage
 * @param {number} scale - Current zoom scale
 * @returns {number} Zoom percentage
 */
export const getZoomPercentage = scale => {
  return Math.round(scale * 100);
};

/**
 * Format zoom level for display
 * @param {number} scale - Current zoom scale
 * @returns {string} Formatted zoom level
 */
export const formatZoomLevel = scale => {
  const percentage = getZoomPercentage(scale);
  return `${percentage}%`;
};

/**
 * Get zoom tooltip text
 * @param {Object} zoomState - Current zoom state
 * @param {Object} config - Zoom configuration
 * @returns {string} Tooltip text
 */
export const getZoomTooltip = (zoomState, config = DEFAULT_ZOOM_CONFIG) => {
  const percentage = formatZoomLevel(zoomState.scale);

  if (zoomState.isZooming) {
    return `Zoom: ${percentage} - Zooming...`;
  }

  if (zoomState.isPanning) {
    return `Zoom: ${percentage} - Panning...`;
  }

  return `Zoom: ${percentage}`;
};

/**
 * Validate zoom state
 * @param {Object} zoomState - Zoom state to validate
 * @param {Object} config - Zoom configuration
 * @returns {Object} Validation result
 */
export const validateZoomState = (zoomState, config = DEFAULT_ZOOM_CONFIG) => {
  const errors = [];
  const warnings = [];

  if (zoomState.scale < config.minZoom) {
    errors.push(`Zoom scale cannot be less than ${config.minZoom}`);
  }

  if (zoomState.scale > config.maxZoom) {
    errors.push(`Zoom scale cannot be greater than ${config.maxZoom}`);
  }

  if (typeof zoomState.translateX !== 'number') {
    errors.push('TranslateX must be a number');
  }

  if (typeof zoomState.translateY !== 'number') {
    errors.push('TranslateY must be a number');
  }

  if (zoomState.scale < 0.5) {
    warnings.push('Very low zoom level may affect performance');
  }

  if (zoomState.scale > 5) {
    warnings.push('Very high zoom level may affect performance');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Export zoom state
 * @param {Object} zoomState - Zoom state to export
 * @returns {Object} Exportable zoom state
 */
export const exportZoomState = zoomState => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    zoomState: {
      scale: zoomState.scale,
      translateX: zoomState.translateX,
      translateY: zoomState.translateY,
      minDate: zoomState.minDate?.toISOString(),
      maxDate: zoomState.maxDate?.toISOString(),
    },
    metadata: {
      description: 'Resource histogram zoom state export',
      zoomPercentage: getZoomPercentage(zoomState.scale),
    },
  };
};

/**
 * Import zoom state
 * @param {Object} importData - Import data object
 * @returns {Object} Import result
 */
export const importZoomState = importData => {
  const errors = [];
  const warnings = [];

  if (!importData.zoomState) {
    errors.push('No zoom state found in import data');
    return { success: false, errors, warnings, zoomState: null };
  }

  const zoomState = importData.zoomState;

  // Validate zoom state structure
  if (typeof zoomState.scale !== 'number') {
    errors.push('Invalid zoom scale');
  }

  if (typeof zoomState.translateX !== 'number') {
    errors.push('Invalid translateX value');
  }

  if (typeof zoomState.translateY !== 'number') {
    errors.push('Invalid translateY value');
  }

  // Convert date strings back to Date objects
  const importedZoomState = {
    scale: zoomState.scale,
    translateX: zoomState.translateX,
    translateY: zoomState.translateY,
    minDate: zoomState.minDate ? new Date(zoomState.minDate) : null,
    maxDate: zoomState.maxDate ? new Date(zoomState.maxDate) : null,
    isZooming: false,
    isPanning: false,
  };

  const validation = validateZoomState(importedZoomState);
  errors.push(...validation.errors);
  warnings.push(...validation.warnings);

  return {
    success: errors.length === 0,
    errors,
    warnings,
    zoomState: errors.length === 0 ? importedZoomState : null,
  };
};

/**
 * Get zoom animation configuration
 * @param {Object} config - Zoom configuration
 * @returns {Object} Animation configuration
 */
export const getZoomAnimationConfig = (config = DEFAULT_ZOOM_CONFIG) => {
  return {
    duration: config.smoothTransitions ? config.transitionDuration : 0,
    ease: 'cubic-out', // Note: d3.easeCubicOut requires D3.js
    delay: 0,
  };
};

/**
 * Create zoom animation
 * @param {Object} d3Selection - D3 selection object
 * @param {Object} targetTransform - Target transform
 * @param {Object} animationConfig - Animation configuration
 */
export const animateZoom = (d3Selection, targetTransform, animationConfig) => {
  // Note: This function requires D3.js zoom behavior to be available
  // Implementation should be handled in the consuming component
  console.warn('animateZoom requires D3.js zoom behavior to be available');
};
