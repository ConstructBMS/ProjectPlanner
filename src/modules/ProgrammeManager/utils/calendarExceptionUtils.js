/**
 * Calendar Exception Utilities
 * Handle one-off non-working days in project and resource calendars
 */

/**
 * Default calendar exception configuration
 */
export const DEFAULT_EXCEPTION_CONFIG = {
  maxExceptions: 100,
  maxDateRange: 365, // days
  allowOverlapping: false,
  autoAdjustWorkingHours: true,
  validateBusinessRules: true,
  exceptionTypes: {
    HOLIDAY: 'holiday',
    SITE_SHUTDOWN: 'site_shutdown',
    MAINTENANCE: 'maintenance',
    WEATHER: 'weather',
    CUSTOM: 'custom',
  },
  defaultReasons: {
    holiday: 'Public Holiday',
    site_shutdown: 'Site Shutdown',
    maintenance: 'Maintenance Day',
    weather: 'Weather Delay',
    custom: 'Custom Exception',
  },
};

/**
 * Calendar exception data structure
 */
export const createCalendarException = (
  date,
  type,
  reason,
  description = ''
) => {
  return {
    id: `exception-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: typeof date === 'string' ? date : date.toISOString().split('T')[0],
    type: type || DEFAULT_EXCEPTION_CONFIG.exceptionTypes.CUSTOM,
    reason:
      reason ||
      DEFAULT_EXCEPTION_CONFIG.defaultReasons[type] ||
      'Custom Exception',
    description,
    isWorkingDay: false,
    workingHours: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Create a date range exception
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} type - Exception type
 * @param {string} reason - Exception reason
 * @param {string} description - Optional description
 * @returns {Array} Array of exception objects
 */
export const createDateRangeException = (
  startDate,
  endDate,
  type,
  reason,
  description = ''
) => {
  const exceptions = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate date range
  if (start > end) {
    throw new Error('Start date must be before or equal to end date');
  }

  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (daysDiff > DEFAULT_EXCEPTION_CONFIG.maxDateRange) {
    throw new Error(
      `Date range cannot exceed ${DEFAULT_EXCEPTION_CONFIG.maxDateRange} days`
    );
  }

  for (let i = 0; i < daysDiff; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    exceptions.push(
      createCalendarException(currentDate, type, reason, description)
    );
  }

  return exceptions;
};

/**
 * Check if a date has an exception
 * @param {Date|string} date - Date to check
 * @param {Array} exceptions - Array of calendar exceptions
 * @returns {Object|null} Exception object or null
 */
export const getExceptionForDate = (date, exceptions) => {
  if (!exceptions || exceptions.length === 0) return null;

  const dateString =
    typeof date === 'string' ? date : date.toISOString().split('T')[0];

  return exceptions.find(exception => exception.date === dateString) || null;
};

/**
 * Check if a date is a working day considering exceptions
 * @param {Date|string} date - Date to check
 * @param {Object} calendar - Calendar object with exceptions
 * @param {boolean} defaultIsWorkingDay - Default working day status
 * @returns {boolean} Whether the date is a working day
 */
export const isWorkingDayWithExceptions = (
  date,
  calendar,
  defaultIsWorkingDay = true
) => {
  const exception = getExceptionForDate(date, calendar.exceptions || []);

  if (exception) {
    return exception.isWorkingDay;
  }

  return defaultIsWorkingDay;
};

/**
 * Get working hours for a date considering exceptions
 * @param {Date|string} date - Date to check
 * @param {Object} calendar - Calendar object with exceptions
 * @param {number} defaultWorkingHours - Default working hours
 * @returns {number} Working hours for the date
 */
export const getWorkingHoursWithExceptions = (
  date,
  calendar,
  defaultWorkingHours = 8
) => {
  const exception = getExceptionForDate(date, calendar.exceptions || []);

  if (exception) {
    return exception.workingHours;
  }

  return defaultWorkingHours;
};

/**
 * Validate calendar exception
 * @param {Object} exception - Exception object to validate
 * @param {Array} existingExceptions - Existing exceptions for conflict checking
 * @param {Object} config - Configuration
 * @returns {Object} Validation result
 */
export const validateCalendarException = (
  exception,
  existingExceptions = [],
  config = DEFAULT_EXCEPTION_CONFIG
) => {
  const errors = [];
  const warnings = [];

  // Basic validation
  if (!exception.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(exception.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      warnings.push('Exception date is in the past');
    }
  }

  if (!exception.type) {
    errors.push('Exception type is required');
  } else if (!Object.values(config.exceptionTypes).includes(exception.type)) {
    errors.push('Invalid exception type');
  }

  if (!exception.reason || exception.reason.trim() === '') {
    errors.push('Exception reason is required');
  }

  // Check for overlapping exceptions
  if (!config.allowOverlapping && existingExceptions.length > 0) {
    const overlapping = existingExceptions.find(
      existing =>
        existing.date === exception.date && existing.id !== exception.id
    );

    if (overlapping) {
      errors.push(`Exception already exists for ${exception.date}`);
    }
  }

  // Check working hours
  if (exception.workingHours !== undefined) {
    if (exception.workingHours < 0 || exception.workingHours > 24) {
      errors.push('Working hours must be between 0 and 24');
    }
  }

  // Check description length
  if (exception.description && exception.description.length > 500) {
    warnings.push('Description is very long (max 500 characters recommended)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate date range for exceptions
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {Array} existingExceptions - Existing exceptions
 * @param {Object} config - Configuration
 * @returns {Object} Validation result
 */
export const validateDateRange = (
  startDate,
  endDate,
  existingExceptions = [],
  config = DEFAULT_EXCEPTION_CONFIG
) => {
  const errors = [];
  const warnings = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors, warnings };
  }

  if (start > end) {
    errors.push('Start date must be before or equal to end date');
  }

  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (daysDiff > config.maxDateRange) {
    errors.push(`Date range cannot exceed ${config.maxDateRange} days`);
  }

  if (daysDiff > 30) {
    warnings.push(
      'Long date range selected - consider breaking into smaller periods'
    );
  }

  // Check for overlapping exceptions
  if (!config.allowOverlapping && existingExceptions.length > 0) {
    const overlappingDates = [];

    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];

      const overlapping = existingExceptions.find(
        existing => existing.date === dateString
      );
      if (overlapping) {
        overlappingDates.push(dateString);
      }
    }

    if (overlappingDates.length > 0) {
      errors.push(
        `Exceptions already exist for: ${overlappingDates.slice(0, 5).join(', ')}${overlappingDates.length > 5 ? '...' : ''}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    daysInRange: daysDiff,
  };
};

/**
 * Add exception to calendar
 * @param {Object} calendar - Calendar object
 * @param {Object} exception - Exception to add
 * @param {Object} config - Configuration
 * @returns {Object} Updated calendar
 */
export const addExceptionToCalendar = (
  calendar,
  exception,
  config = DEFAULT_EXCEPTION_CONFIG
) => {
  const updatedCalendar = { ...calendar };

  if (!updatedCalendar.exceptions) {
    updatedCalendar.exceptions = [];
  }

  // Validate exception
  const validation = validateCalendarException(
    exception,
    updatedCalendar.exceptions,
    config
  );
  if (!validation.isValid) {
    throw new Error(`Invalid exception: ${validation.errors.join(', ')}`);
  }

  // Check maximum exceptions limit
  if (updatedCalendar.exceptions.length >= config.maxExceptions) {
    throw new Error(
      `Maximum number of exceptions (${config.maxExceptions}) reached`
    );
  }

  // Add exception
  updatedCalendar.exceptions.push({
    ...exception,
    updatedAt: new Date().toISOString(),
  });

  // Sort exceptions by date
  updatedCalendar.exceptions.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return updatedCalendar;
};

/**
 * Add date range exceptions to calendar
 * @param {Object} calendar - Calendar object
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} type - Exception type
 * @param {string} reason - Exception reason
 * @param {string} description - Optional description
 * @param {Object} config - Configuration
 * @returns {Object} Updated calendar
 */
export const addDateRangeExceptionsToCalendar = (
  calendar,
  startDate,
  endDate,
  type,
  reason,
  description = '',
  config = DEFAULT_EXCEPTION_CONFIG
) => {
  const updatedCalendar = { ...calendar };

  if (!updatedCalendar.exceptions) {
    updatedCalendar.exceptions = [];
  }

  // Validate date range
  const rangeValidation = validateDateRange(
    startDate,
    endDate,
    updatedCalendar.exceptions,
    config
  );
  if (!rangeValidation.isValid) {
    throw new Error(`Invalid date range: ${rangeValidation.errors.join(', ')}`);
  }

  // Check if adding exceptions would exceed limit
  if (
    updatedCalendar.exceptions.length + rangeValidation.daysInRange >
    config.maxExceptions
  ) {
    throw new Error(
      `Adding ${rangeValidation.daysInRange} exceptions would exceed maximum limit of ${config.maxExceptions}`
    );
  }

  // Create exceptions for the date range
  const exceptions = createDateRangeException(
    startDate,
    endDate,
    type,
    reason,
    description
  );

  // Add each exception
  exceptions.forEach(exception => {
    updatedCalendar.exceptions.push({
      ...exception,
      updatedAt: new Date().toISOString(),
    });
  });

  // Sort exceptions by date
  updatedCalendar.exceptions.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return updatedCalendar;
};

/**
 * Remove exception from calendar
 * @param {Object} calendar - Calendar object
 * @param {string} exceptionId - Exception ID to remove
 * @returns {Object} Updated calendar
 */
export const removeExceptionFromCalendar = (calendar, exceptionId) => {
  const updatedCalendar = { ...calendar };

  if (!updatedCalendar.exceptions) {
    return updatedCalendar;
  }

  updatedCalendar.exceptions = updatedCalendar.exceptions.filter(
    exception => exception.id !== exceptionId
  );

  return updatedCalendar;
};

/**
 * Update exception in calendar
 * @param {Object} calendar - Calendar object
 * @param {string} exceptionId - Exception ID to update
 * @param {Object} updates - Updates to apply
 * @param {Object} config - Configuration
 * @returns {Object} Updated calendar
 */
export const updateExceptionInCalendar = (
  calendar,
  exceptionId,
  updates,
  config = DEFAULT_EXCEPTION_CONFIG
) => {
  const updatedCalendar = { ...calendar };

  if (!updatedCalendar.exceptions) {
    throw new Error('No exceptions found in calendar');
  }

  const exceptionIndex = updatedCalendar.exceptions.findIndex(
    exception => exception.id === exceptionId
  );

  if (exceptionIndex === -1) {
    throw new Error('Exception not found');
  }

  const updatedException = {
    ...updatedCalendar.exceptions[exceptionIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Validate updated exception
  const otherExceptions = updatedCalendar.exceptions.filter(
    exception => exception.id !== exceptionId
  );
  const validation = validateCalendarException(
    updatedException,
    otherExceptions,
    config
  );

  if (!validation.isValid) {
    throw new Error(
      `Invalid exception update: ${validation.errors.join(', ')}`
    );
  }

  updatedCalendar.exceptions[exceptionIndex] = updatedException;

  // Sort exceptions by date
  updatedCalendar.exceptions.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return updatedCalendar;
};

/**
 * Get exceptions in date range
 * @param {Array} exceptions - Array of exceptions
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Exceptions in the date range
 */
export const getExceptionsInDateRange = (exceptions, startDate, endDate) => {
  if (!exceptions || exceptions.length === 0) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  return exceptions.filter(exception => {
    const exceptionDate = new Date(exception.date);
    return exceptionDate >= start && exceptionDate <= end;
  });
};

/**
 * Get exceptions by type
 * @param {Array} exceptions - Array of exceptions
 * @param {string} type - Exception type to filter by
 * @returns {Array} Exceptions of the specified type
 */
export const getExceptionsByType = (exceptions, type) => {
  if (!exceptions || exceptions.length === 0) return [];

  return exceptions.filter(exception => exception.type === type);
};

/**
 * Get exception statistics
 * @param {Array} exceptions - Array of exceptions
 * @returns {Object} Statistics about exceptions
 */
export const getExceptionStatistics = exceptions => {
  if (!exceptions || exceptions.length === 0) {
    return {
      total: 0,
      byType: {},
      byMonth: {},
      workingDays: 0,
      nonWorkingDays: 0,
    };
  }

  const stats = {
    total: exceptions.length,
    byType: {},
    byMonth: {},
    workingDays: 0,
    nonWorkingDays: 0,
  };

  exceptions.forEach(exception => {
    // Count by type
    stats.byType[exception.type] = (stats.byType[exception.type] || 0) + 1;

    // Count by month
    const date = new Date(exception.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;

    // Count working vs non-working days
    if (exception.isWorkingDay) {
      stats.workingDays++;
    } else {
      stats.nonWorkingDays++;
    }
  });

  return stats;
};

/**
 * Export exceptions to various formats
 * @param {Array} exceptions - Array of exceptions
 * @param {string} format - Export format ('json', 'csv', 'ics')
 * @returns {string} Exported data
 */
export const exportExceptions = (exceptions, format = 'json') => {
  if (!exceptions || exceptions.length === 0) {
    return '';
  }

  switch (format.toLowerCase()) {
    case 'json':
      return JSON.stringify(exceptions, null, 2);

    case 'csv': {
      const headers = [
        'Date',
        'Type',
        'Reason',
        'Description',
        'Working Hours',
        'Is Working Day',
      ];
      const rows = exceptions.map(exception => [
        exception.date,
        exception.type,
        exception.reason,
        exception.description || '',
        exception.workingHours || 0,
        exception.isWorkingDay ? 'Yes' : 'No',
      ]);

      return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    }

    case 'ics': {
      const icsEvents = exceptions.map(exception => {
        const date = new Date(exception.date);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        return [
          'BEGIN:VEVENT',
          `DTSTART;VALUE=DATE:${date.toISOString().split('T')[0].replace(/-/g, '')}`,
          `DTEND;VALUE=DATE:${nextDate.toISOString().split('T')[0].replace(/-/g, '')}`,
          `SUMMARY:${exception.reason}`,
          `DESCRIPTION:${exception.description || ''}`,
          'END:VEVENT',
        ].join('\r\n');
      });

      return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Calendar Exceptions//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        ...icsEvents,
        'END:VCALENDAR',
      ].join('\r\n');
    }

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Import exceptions from various formats
 * @param {string} data - Import data
 * @param {string} format - Import format ('json', 'csv')
 * @returns {Array} Array of exception objects
 */
export const importExceptions = (data, format = 'json') => {
  if (!data || data.trim() === '') {
    return [];
  }

  switch (format.toLowerCase()) {
    case 'json': {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
    }

    case 'csv': {
      try {
        const lines = data.trim().split('\n');
        const headers = lines[0]
          .split(',')
          .map(h => h.replace(/"/g, '').trim());
        const exceptions = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(',')
            .map(v => v.replace(/"/g, '').trim());
          const exception = {};

          headers.forEach((header, index) => {
            const value = values[index] || '';
            switch (header.toLowerCase()) {
              case 'date':
                exception.date = value;
                break;
              case 'type':
                exception.type = value;
                break;
              case 'reason':
                exception.reason = value;
                break;
              case 'description':
                exception.description = value;
                break;
              case 'working hours':
                exception.workingHours = parseFloat(value) || 0;
                break;
              case 'is working day':
                exception.isWorkingDay = value.toLowerCase() === 'yes';
                break;
            }
          });

          if (exception.date && exception.type && exception.reason) {
            exceptions.push(
              createCalendarException(
                exception.date,
                exception.type,
                exception.reason,
                exception.description
              )
            );
          }
        }

        return exceptions;
      } catch (error) {
        throw new Error(`Invalid CSV format: ${error.message}`);
      }
    }

    default:
      throw new Error(`Unsupported import format: ${format}`);
  }
};

/**
 * Check if scheduling should skip a date due to exceptions
 * @param {Date|string} date - Date to check
 * @param {Object} calendar - Calendar object with exceptions
 * @param {boolean} defaultIsWorkingDay - Default working day status
 * @returns {boolean} Whether to skip the date
 */
export const shouldSkipDateForScheduling = (
  date,
  calendar,
  defaultIsWorkingDay = true
) => {
  return !isWorkingDayWithExceptions(date, calendar, defaultIsWorkingDay);
};

/**
 * Get next working day considering exceptions
 * @param {Date|string} date - Starting date
 * @param {Object} calendar - Calendar object with exceptions
 * @param {boolean} defaultIsWorkingDay - Default working day status
 * @param {number} maxDays - Maximum days to look ahead
 * @returns {Date|null} Next working day or null if not found
 */
export const getNextWorkingDayWithExceptions = (
  date,
  calendar,
  defaultIsWorkingDay = true,
  maxDays = 30
) => {
  const startDate = new Date(date);

  for (let i = 1; i <= maxDays; i++) {
    const testDate = new Date(startDate);
    testDate.setDate(startDate.getDate() + i);

    if (isWorkingDayWithExceptions(testDate, calendar, defaultIsWorkingDay)) {
      return testDate;
    }
  }

  return null;
};

/**
 * Get previous working day considering exceptions
 * @param {Date|string} date - Starting date
 * @param {Object} calendar - Calendar object with exceptions
 * @param {boolean} defaultIsWorkingDay - Default working day status
 * @param {number} maxDays - Maximum days to look back
 * @returns {Date|null} Previous working day or null if not found
 */
export const getPreviousWorkingDayWithExceptions = (
  date,
  calendar,
  defaultIsWorkingDay = true,
  maxDays = 30
) => {
  const startDate = new Date(date);

  for (let i = 1; i <= maxDays; i++) {
    const testDate = new Date(startDate);
    testDate.setDate(startDate.getDate() - i);

    if (isWorkingDayWithExceptions(testDate, calendar, defaultIsWorkingDay)) {
      return testDate;
    }
  }

  return null;
};
