// Debugging utilities for development

// Debug logger with environment check
export const debugLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 [DEBUG] ${message}`, data);
  }
};

// Performance debug logger
export const debugPerformance = (operation, startTime) => {
  if (process.env.NODE_ENV === 'development') {
    const duration = performance.now() - startTime;
    if (duration > 16) {
      // 60fps threshold
      console.warn(`⚠️ [PERF] ${operation} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`⚡ [PERF] ${operation} took ${duration.toFixed(2)}ms`);
    }
  }
};

// State change debugger
export const debugStateChange = (componentName, prevState, nextState) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 [STATE] ${componentName} state changed:`, {
      prev: prevState,
      next: nextState,
    });
  }
};

// Props change debugger
export const debugPropsChange = (componentName, prevProps, nextProps) => {
  if (process.env.NODE_ENV === 'development') {
    const changedProps = {};
    const allKeys = new Set([
      ...Object.keys(prevProps),
      ...Object.keys(nextProps),
    ]);

    allKeys.forEach(key => {
      if (prevProps[key] !== nextProps[key]) {
        changedProps[key] = {
          prev: prevProps[key],
          next: nextProps[key],
        };
      }
    });

    if (Object.keys(changedProps).length > 0) {
      console.log(`📦 [PROPS] ${componentName} props changed:`, changedProps);
    }
  }
};

// Render debugger
export const debugRender = componentName => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎨 [RENDER] ${componentName} rendered`);
  }
};

// Error debugger
export const debugError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [ERROR] ${context}:`, error);
  }
};

// Memory usage debugger
export const debugMemory = () => {
  if (process.env.NODE_ENV === 'development' && performance.memory) {
    const memory = performance.memory;
    console.log(`💾 [MEMORY]`, {
      used: `${Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100} MB`,
      total: `${Math.round((memory.totalJSHeapSize / 1024 / 1024) * 100) / 100} MB`,
      limit: `${Math.round((memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100} MB`,
    });
  }
};

// Component lifecycle debugger
export const debugLifecycle = (componentName, phase, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 [LIFECYCLE] ${componentName} ${phase}`, data);
  }
};

// Network request debugger
export const debugNetwork = (url, method, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 [NETWORK] ${method} ${url}`, data);
  }
};

// Local storage debugger
export const debugStorage = (key, value, operation = 'get') => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`💾 [STORAGE] ${operation} ${key}:`, value);
  }
};

// Event debugger
export const debugEvent = (eventName, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 [EVENT] ${eventName}`, data);
  }
};

// Debug hook for component debugging
export const useDebug = componentName => {
  const debug = {
    log: (message, data) => debugLog(`[${componentName}] ${message}`, data),
    render: () => debugRender(componentName),
    state: (prev, next) => debugStateChange(componentName, prev, next),
    props: (prev, next) => debugPropsChange(componentName, prev, next),
    error: error => debugError(error, componentName),
    lifecycle: (phase, data) => debugLifecycle(componentName, phase, data),
    event: (eventName, data) =>
      debugEvent(`[${componentName}] ${eventName}`, data),
  };

  return debug;
};

// Debug context for React DevTools
export const createDebugContext = (name, data) => {
  if (process.env.NODE_ENV === 'development') {
    return {
      __debug: {
        name,
        data,
        timestamp: Date.now(),
      },
    };
  }
  return {};
};
