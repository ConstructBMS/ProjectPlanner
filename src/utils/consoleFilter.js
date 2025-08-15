// Console Filter Utility for ProjectPlanner
// Suppresses expected warnings and errors that are part of normal operation

(function () {
  // Store original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  // Expected warnings/errors that should be suppressed
  const SUPPRESSED_PATTERNS = [
    /No data available, using demo/i,
    /Demo mode detected, using demo/i,
    /server connection lost/i,
    /Multiple GoTrueClient instances detected/i,
    /Hydration already in progress/i,
    /Planner already initialized/i
  ];

  // Create a filtered console
  const filteredConsole = {
    log (...args) {
      const message = args.join(' ');
      
      // Check if this is a suppressed message
      if (SUPPRESSED_PATTERNS.some(pattern => pattern.test(message))) {
        return; // Suppress this message
      }
      
      // Show relevant logs
      if (
        message.includes('[PP][adapter]') ||
        message.includes('Hydration pipeline') ||
        message.includes('Project selected') ||
        message.includes('Projects loaded')
      ) {
        originalLog.apply(console, args);
      }
    },
    error (...args) {
      const message = args.join(' ');
      
      // Check if this is a suppressed error
      if (SUPPRESSED_PATTERNS.some(pattern => pattern.test(message))) {
        return; // Suppress this error
      }
      
      originalError.apply(console, args);
    },
    warn (...args) {
      const message = args.join(' ');
      
      // Check if this is a suppressed warning
      if (SUPPRESSED_PATTERNS.some(pattern => pattern.test(message))) {
        return; // Suppress this warning
      }
      
      originalWarn.apply(console, args);
    },
  };

  // Replace console methods
  console.log = filteredConsole.log;
  console.error = filteredConsole.error;
  console.warn = filteredConsole.warn;

  console.log('🔍 ProjectPlanner console filter applied - suppressing expected warnings');
  console.log('🔍 To restore full console, run: restoreConsole()');

  // Function to restore original console
  window.restoreConsole = function () {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.log('🔍 Console restored to original state');
  };
})();
