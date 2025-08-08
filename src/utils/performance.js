// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing an operation
  startTimer(operationName) {
    if (!this.isEnabled) return;

    this.metrics.set(operationName, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    });
  }

  // End timing an operation
  endTimer(operationName) {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(operationName);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;

      // Log slow operations
      if (metric.duration > 16) {
        // 16ms = 60fps threshold
        console.warn(
          `⚠️ Slow operation detected: ${operationName} took ${metric.duration.toFixed(2)}ms`
        );
      }
    }
  }

  // Measure render performance
  measureRender(componentName, renderFn) {
    if (!this.isEnabled) return renderFn();

    this.startTimer(`render-${componentName}`);
    const result = renderFn();
    this.endTimer(`render-${componentName}`);

    return result;
  }

  // Get performance summary
  getSummary() {
    if (!this.isEnabled) return {};

    const summary = {};
    for (const [operation, metric] of this.metrics) {
      if (metric.duration !== null) {
        summary[operation] = {
          duration: metric.duration,
          average: this.getAverage(operation),
        };
      }
    }
    return summary;
  }

  // Get average duration for an operation
  getAverage(operationName) {
    const durations = Array.from(this.metrics.values())
      .filter(m => m.duration !== null)
      .map(m => m.duration);

    if (durations.length === 0) return 0;
    return (
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    );
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React performance hooks
export const usePerformanceMonitor = componentName => {
  const measureRender = renderFn => {
    return performanceMonitor.measureRender(componentName, renderFn);
  };

  return { measureRender };
};

// Debounce utility for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      window.clearTimeout(timeout);
      func(...args);
    };
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
};

// Throttle utility for performance optimization
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      window.setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      used:
        Math.round((performance.memory.usedJSHeapSize / 1048576) * 100) / 100,
      total:
        Math.round((performance.memory.totalJSHeapSize / 1048576) * 100) / 100,
      limit:
        Math.round((performance.memory.jsHeapSizeLimit / 1048576) * 100) / 100,
    };
  }
  return null;
};

// Component render counter
export const createRenderCounter = componentName => {
  let renderCount = 0;

  return {
    increment: () => {
      renderCount++;
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 ${componentName} rendered ${renderCount} times`);
      }
    },
    getCount: () => renderCount,
    reset: () => {
      renderCount = 0;
    },
  };
};
