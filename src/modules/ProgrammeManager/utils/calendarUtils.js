/**
 * Default working calendar configuration
 */
export const DEFAULT_CALENDAR = {
  id: 'global',
  name: 'Global Calendar',
  workingDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  workingHours: {
    monday: 8,
    tuesday: 8,
    wednesday: 8,
    thursday: 8,
    friday: 8,
    saturday: 0,
    sunday: 0,
  },
  holidays: [],
  exceptions: [],
  isGlobal: true,
};

/**
 * Check if a date is a working day according to the calendar
 * @param {Date} date - The date to check
 * @param {Object} calendar - The calendar configuration
 * @returns {boolean} - True if it's a working day
 */
export const isWorkday = (date, calendar = DEFAULT_CALENDAR) => {
  const dayOfWeek = date.getDay();
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const dayName = dayNames[dayOfWeek];

  // Check if the day is marked as working
  if (!calendar.workingDays[dayName]) {
    return false;
  }

  // Check if it's a holiday
  const dateString = date.toISOString().split('T')[0];
  if (calendar.holidays.includes(dateString)) {
    return false;
  }

  // Check for calendar exceptions
  if (calendar.exceptions && calendar.exceptions.length > 0) {
    const exception = calendar.exceptions.find(ex => ex.date === dateString);
    if (exception) {
      return exception.isWorkingDay;
    }
  }

  return true;
};

/**
 * Get working hours for a specific date
 * @param {Date} date - The date to check
 * @param {Object} calendar - The calendar configuration
 * @returns {number} - Working hours for the date
 */
export const getWorkingHours = (date, calendar = DEFAULT_CALENDAR) => {
  const dayOfWeek = date.getDay();
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const dayName = dayNames[dayOfWeek];

  // Check for calendar exceptions first
  const dateString = date.toISOString().split('T')[0];
  if (calendar.exceptions && calendar.exceptions.length > 0) {
    const exception = calendar.exceptions.find(ex => ex.date === dateString);
    if (exception) {
      return exception.workingHours || 0;
    }
  }

  // Return default working hours for the day
  return calendar.workingHours?.[dayName] || 0;
};

/**
 * Check if a date is a working day (alias for isWorkday)
 * @param {Date} date - The date to check
 * @param {Object} calendar - The calendar configuration
 * @returns {boolean} - True if it's a working day
 */
export const isWorkingDay = isWorkday;

/**
 * Get the next working day from a given date
 * @param {Date} date - The starting date
 * @param {Object} calendar - The calendar configuration
 * @returns {Date} - The next working day
 */
export const nextWorkday = (date, calendar = DEFAULT_CALENDAR) => {
  let nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  while (!isWorkday(nextDate, calendar)) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
};

/**
 * Get the previous working day from a given date
 * @param {Date} date - The starting date
 * @param {Object} calendar - The calendar configuration
 * @returns {Date} - The previous working day
 */
export const prevWorkday = (date, calendar = DEFAULT_CALENDAR) => {
  let prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);

  while (!isWorkday(prevDate, calendar)) {
    prevDate.setDate(prevDate.getDate() - 1);
  }

  return prevDate;
};

/**
 * Add working days to a date
 * @param {Date} date - The starting date
 * @param {number} workdays - Number of working days to add
 * @param {Object} calendar - The calendar configuration
 * @returns {Date} - The resulting date
 */
export const addWorkdays = (date, workdays, calendar = DEFAULT_CALENDAR) => {
  let result = new Date(date);

  if (workdays > 0) {
    for (let i = 0; i < workdays; i++) {
      result = nextWorkday(result, calendar);
    }
  } else if (workdays < 0) {
    for (let i = 0; i < Math.abs(workdays); i++) {
      result = prevWorkday(result, calendar);
    }
  }

  return result;
};

/**
 * Calculate the number of working days between two dates
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @param {Object} calendar - The calendar configuration
 * @returns {number} - Number of working days
 */
export const diffWorkdays = (
  startDate,
  endDate,
  calendar = DEFAULT_CALENDAR
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Ensure start is before end
  if (start > end) {
    return -diffWorkdays(end, start, calendar);
  }

  let workdays = 0;
  let current = new Date(start);

  while (current <= end) {
    if (isWorkday(current, calendar)) {
      workdays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workdays;
};

/**
 * Snap a date to the nearest working day
 * @param {Date} date - The date to snap
 * @param {Object} calendar - The calendar configuration
 * @returns {Date} - The snapped date
 */
export const snapToWorkday = (date, calendar = DEFAULT_CALENDAR) => {
  if (isWorkday(date, calendar)) {
    return new Date(date);
  }

  return nextWorkday(date, calendar);
};

/**
 * Get calendar for a specific task
 * @param {string} taskId - The task ID
 * @param {Object} task - The task object
 * @param {Object} globalCalendar - The global calendar
 * @returns {Object} - The calendar to use for this task
 */
export const getCalendarForTask = (
  taskId,
  task,
  globalCalendar = DEFAULT_CALENDAR
) => {
  if (task && task.useTaskCalendar && task.taskCalendar) {
    return task.taskCalendar;
  }

  return globalCalendar;
};

/**
 * Validate calendar configuration
 * @param {Object} calendar - The calendar to validate
 * @returns {Object} - { isValid, errors }
 */
export const validateCalendar = calendar => {
  const errors = [];

  if (!calendar.name || calendar.name.trim() === '') {
    errors.push('Calendar name is required');
  }

  if (!calendar.workingDays) {
    errors.push('Working days configuration is required');
  } else {
    const dayNames = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    dayNames.forEach(day => {
      if (typeof calendar.workingDays[day] !== 'boolean') {
        errors.push(`${day} working day setting is required`);
      }
    });
  }

  if (!Array.isArray(calendar.holidays)) {
    errors.push('Holidays must be an array');
  } else {
    calendar.holidays.forEach((holiday, index) => {
      if (typeof holiday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(holiday)) {
        errors.push(`Holiday at index ${index} must be in YYYY-MM-DD format`);
      }
    });
  }

  // Validate exceptions
  if (calendar.exceptions && !Array.isArray(calendar.exceptions)) {
    errors.push('Exceptions must be an array');
  } else if (calendar.exceptions) {
    calendar.exceptions.forEach((exception, index) => {
      if (!exception.date || !/^\d{4}-\d{2}-\d{2}$/.test(exception.date)) {
        errors.push(`Exception at index ${index} must have a valid date in YYYY-MM-DD format`);
      }
      if (typeof exception.isWorkingDay !== 'boolean') {
        errors.push(`Exception at index ${index} must have a valid isWorkingDay boolean value`);
      }
      if (exception.workingHours !== undefined && (typeof exception.workingHours !== 'number' || exception.workingHours < 0 || exception.workingHours > 24)) {
        errors.push(`Exception at index ${index} working hours must be a number between 0 and 24`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Create a new calendar
 * @param {string} name - Calendar name
 * @param {Object} workingDays - Working days configuration
 * @param {Array} holidays - Array of holiday dates
 * @param {Array} exceptions - Array of calendar exceptions
 * @returns {Object} - New calendar object
 */
export const createCalendar = (name, workingDays = {}, holidays = [], exceptions = []) => {
  return {
    id: `calendar_${Date.now()}`,
    name,
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      ...workingDays,
    },
    workingHours: {
      monday: 8,
      tuesday: 8,
      wednesday: 8,
      thursday: 8,
      friday: 8,
      saturday: 0,
      sunday: 0,
    },
    holidays: [...holidays],
    exceptions: [...exceptions],
    isGlobal: false,
  };
};
